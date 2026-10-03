import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPublicClient, custom, encodeErrorResult, encodeFunctionResult, http, parseAbi, type Hex } from "viem";
import { petRegistryAbi } from "./pet-registry-abi";
import { readReceiptWithRetry, readWithRetry } from "./receipt-read-retry";

const registryAddress = "0x1111111111111111111111111111111111111111";
const confirmedBlock = BigInt(11);
const encodedTotal = encodeFunctionResult({
  abi: petRegistryAbi, functionName: "communityStats", result: BigInt(4),
});

/** Real viem error wrapping, with an in-memory RPC transport: no wallet/network. */
function setupRead(respond: () => Promise<Hex>, retryCount = 0) {
  const request = vi.fn(async ({ method }: { method: string; params?: unknown }) => {
    expect(method).toBe("eth_call");
    return respond();
  });
  const client = createPublicClient({ transport: custom({ request }, { retryCount }) });
  const read = vi.fn((blockNumber?: bigint) => client.readContract({
    address: registryAddress, abi: petRegistryAbi, functionName: "communityStats",
    args: [1], blockNumber,
  }));
  return { request, read };
}

function expectPinnedCalls(request: ReturnType<typeof setupRead>["request"]) {
  for (const [call] of request.mock.calls) {
    expect(call).toMatchObject({ method: "eth_call", params: [expect.any(Object), "0xb"] });
  }
}

/** Match the public RPC's observed HTTP 400 JSON-RPC envelope without network I/O. */
function setupHttpRead(respond: () => { status: number; error?: { code: number; message: string; data?: Hex }; result?: Hex }) {
  const requests: { id: number; method: string; params: unknown[] }[] = [];
  const fetchFn = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(init?.body as string) as typeof requests[number];
    requests.push(body);
    const { status, ...response } = respond();
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: body.id, ...response }), {
      status, headers: { "Content-Type": "application/json" },
    });
  });
  const client = createPublicClient({
    transport: http("https://rpc.invalid", { fetchFn, retryCount: 0 }),
  });
  const read = (blockNumber: bigint) => client.readContract({
    address: registryAddress, abi: petRegistryAbi, functionName: "communityStats",
    args: [1], blockNumber,
  });
  return { client, requests, read };
}

describe("X Layer block visibility retry with real viem HTTP errors", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const outOfRange = { code: -32019, message: "block is out of range" };

  it("recovers a temporarily invisible block from HTTP 400 without changing its height", async () => {
    const respond = vi.fn()
      .mockReturnValueOnce({ status: 400, error: outOfRange })
      .mockReturnValue({ status: 200, result: encodedTotal });
    const { requests, read } = setupHttpRead(respond);
    const outcome = readReceiptWithRetry(confirmedBlock, read, () => true);
    // Attach rejection handling before advancing timers so a regression is not
    // reported as an unrelated unhandled promise rejection.
    const settled = outcome.catch((error: unknown) => error);
    await vi.runAllTimersAsync();

    expect(await settled).toBe(BigInt(4));
    expect(requests).toHaveLength(2);
    for (const request of requests) {
      expect(request).toMatchObject({ method: "eth_call", params: [expect.any(Object), "0xb"] });
    }
  });

  it("stops after three physical reads when the block remains unavailable", async () => {
    const { requests, read } = setupHttpRead(() => ({ status: 400, error: outOfRange }));
    const outcome = readReceiptWithRetry(confirmedBlock, read, () => true);
    const rejected = expect(outcome).rejects.toMatchObject({
      name: "ContractFunctionExecutionError", details: "block is out of range",
    });
    await vi.runAllTimersAsync();
    await rejected;

    expect(requests).toHaveLength(3);
    for (const request of requests) expect(request.params[1]).toBe("0xb");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("also bounds the plain RPC error from a header read at the same block", async () => {
    const { client, requests } = setupHttpRead(() => ({ status: 400, error: outOfRange }));
    const outcome = readReceiptWithRetry(confirmedBlock,
      (blockNumber) => client.getBlock({ blockNumber }), () => true);
    const rejected = expect(outcome).rejects.toMatchObject({ name: "RpcRequestError", code: -32019 });
    await vi.runAllTimersAsync();
    await rejected;

    expect(requests).toHaveLength(3);
    for (const request of requests) {
      expect(request).toMatchObject({ method: "eth_getBlockByNumber", params: ["0xb", false] });
    }
  });

  it("does not retry an HTTP 400 without the recognized RPC error", async () => {
    const { requests, read } = setupHttpRead(() => ({ status: 400 }));
    const rejected = expect(readReceiptWithRetry(confirmedBlock, read, () => true))
      .rejects.toMatchObject({ name: "ContractFunctionExecutionError" });
    await vi.runAllTimersAsync();
    await rejected;
    expect(requests).toHaveLength(1);
  });

  it.each([
    { label: "unrelated -32019 message", error: { code: -32019, message: "invalid block argument" } },
    { label: "wrong RPC code", error: { code: -32602, message: "block is out of range" } },
    { label: "explicit revert code", error: { code: 3, message: "block is out of range" } },
    { label: "encoded contract revert", error: { ...outOfRange, data: encodeErrorResult({ abi: petRegistryAbi, errorName: "InvalidCommunity" }) } },
    { label: "empty revert data", error: { ...outOfRange, data: "0x" as Hex } },
    { label: "message containing the phrase", error: { code: -32019, message: "execution reverted: block is out of range" } },
  ])("does not retry $label", async ({ error }) => {
    const { requests, read } = setupHttpRead(() => ({ status: 400, error }));
    const rejected = expect(readReceiptWithRetry(confirmedBlock, read, () => true))
      .rejects.toMatchObject({ name: "ContractFunctionExecutionError" });
    await vi.runAllTimersAsync();
    await rejected;
    expect(requests).toHaveLength(1);
  });

  it("stops a visibility retry when the wallet context changes", async () => {
    let current = true;
    const { requests, read } = setupHttpRead(() => ({ status: 400, error: outOfRange }));
    const outcome = readReceiptWithRetry(confirmedBlock, read, () => current);
    const settled = outcome.catch((error: unknown) => error);
    await vi.advanceTimersByTimeAsync(1);
    current = false;
    await vi.runAllTimersAsync();

    expect(await settled).toBeUndefined();
    expect(requests).toHaveLength(1);
  });

  it("does not let an UnknownRpcError wrapper bypass the -32019 message check", async () => {
    const { request, read } = setupRead(async () => { throw { code: -32019, message: "invalid block argument" }; });
    const rejected = expect(readReceiptWithRetry(confirmedBlock, read, () => true))
      .rejects.toMatchObject({ name: "ContractFunctionExecutionError" });
    await vi.runAllTimersAsync();
    await rejected;
    expect(request).toHaveBeenCalledOnce();
  });
});

describe("latest read retry with real viem error classification", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("recovers resource-unavailable latest state with at most three RPC calls", async () => {
    const respond = vi.fn<() => Promise<Hex>>()
      .mockRejectedValueOnce({ code: -32002, message: "Resource unavailable" })
      .mockResolvedValue(encodedTotal);
    const { request, read } = setupRead(respond);
    const result = readWithRetry(() => read(), () => true);
    await vi.runAllTimersAsync();

    await expect(result).resolves.toBe(BigInt(4));
    expect(request).toHaveBeenCalledTimes(2);
    for (const [call] of request.mock.calls) {
      expect(call).toMatchObject({ method: "eth_call", params: [expect.any(Object), "latest"] });
    }
  });

  it("leaves a persistent latest failure rejected after three physical RPC calls", async () => {
    const { request, read } = setupRead(async () => { throw { code: -32002, message: "Resource unavailable" }; });
    const result = readWithRetry(() => read(), () => true);
    const rejected = expect(result).rejects.toMatchObject({ name: "ContractFunctionExecutionError" });
    await vi.runAllTimersAsync();
    await rejected;
    expect(request).toHaveBeenCalledTimes(3);
  });

  it("does not retry a real contract revert on an unpinned read", async () => {
    const { request, read } = setupRead(async () => { throw {
      code: 3, message: "execution reverted",
      data: encodeErrorResult({ abi: petRegistryAbi, errorName: "InvalidCommunity" }),
    }; });
    await expect(readWithRetry(() => read(), () => true))
      .rejects.toMatchObject({ name: "ContractFunctionExecutionError" });
    expect(request).toHaveBeenCalledTimes(1);
  });
});

describe("receipt read retry with real viem error classification", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("recovers a transient internal RPC error wrapped as a revert at the same receipt block", async () => {
    const respond = vi.fn<() => Promise<Hex>>()
      .mockRejectedValueOnce({ code: -32603, message: "header not found" })
      .mockResolvedValue(encodedTotal);
    const { request, read } = setupRead(respond);
    const result = readReceiptWithRetry(confirmedBlock, read, () => true);
    await vi.runAllTimersAsync();

    await expect(result).resolves.toBe(BigInt(4));
    expect(read).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenCalledTimes(2);
    expectPinnedCalls(request);
  });

  it("recovers after viem's three transport retries are exhausted, without a manual retry", async () => {
    let calls = 0;
    const { request, read } = setupRead(async () => {
      calls += 1;
      if (calls <= 4) throw { code: -32603, message: "header not found" };
      return encodedTotal;
    }, 3);
    const result = readReceiptWithRetry(confirmedBlock, read, () => true);
    await vi.runAllTimersAsync();

    await expect(result).resolves.toBe(BigInt(4));
    expect(read).toHaveBeenCalledTimes(2);
    expect(request).toHaveBeenCalledTimes(5);
    expectPinnedCalls(request);
  });

  const reverts = [
    {
      label: "encoded InvalidCommunity even with a misleading unavailable message",
      error: { code: -32603, message: "header not found", data: encodeErrorResult({ abi: petRegistryAbi, errorName: "InvalidCommunity" }) },
    },
    {
      label: "encoded Solidity reason",
      error: { code: -32603, message: "execution reverted", data: encodeErrorResult({ abi: parseAbi(["error Error(string)"]), errorName: "Error", args: ["Not authorized"] }) },
    },
    {
      label: "encoded Solidity panic",
      error: { code: -32603, message: "execution reverted", data: encodeErrorResult({ abi: parseAbi(["error Panic(uint256)"]), errorName: "Panic", args: [BigInt(17)] }) },
    },
    { label: "unknown encoded error", error: { code: -32603, message: "header not found", data: "0xdeadbeef" } },
    { label: "empty revert data", error: { code: -32603, message: "header not found", data: "0x" } },
    { label: "plain revert reason", error: { code: -32603, message: "execution reverted: Not authorized" } },
    { label: "revert reason containing the provider message", error: { code: -32603, message: "execution reverted: header not found" } },
    { label: "unknown internal error", error: { code: -32603, message: "Unrecognized internal failure" } },
    { label: "actual revert code even with an unavailable message", error: { code: 3, message: "header not found" } },
  ];

  it.each(reverts)("does not retry $label", async ({ error }) => {
    const { request, read } = setupRead(async () => { throw error; });
    await expect(readReceiptWithRetry(confirmedBlock, read, () => true)).rejects.toMatchObject({ name: "ContractFunctionExecutionError" });
    expect(read).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("stops after three failed receipt reads instead of fabricating a total", async () => {
    const { request, read } = setupRead(async () => { throw { code: -32603, message: "header not found" }; });
    const result = readReceiptWithRetry(confirmedBlock, read, () => true);
    const rejected = expect(result).rejects.toMatchObject({ name: "ContractFunctionExecutionError" });
    await vi.runAllTimersAsync();
    await rejected;

    expect(read).toHaveBeenCalledTimes(3);
    expect(request).toHaveBeenCalledTimes(3);
    expectPinnedCalls(request);
  });

  it("does not retry after the wallet session changes during the delay", async () => {
    let current = true;
    const { request, read } = setupRead(async () => { throw { code: -32603, message: "header not found" }; });
    const result = readReceiptWithRetry(confirmedBlock, read, () => current);
    await vi.advanceTimersByTimeAsync(1);
    current = false;
    await vi.runAllTimersAsync();

    await expect(result).resolves.toBeUndefined();
    expect(read).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("discards a successful read that completes after its wallet session changes", async () => {
    let current = true;
    let resolve!: (result: Hex) => void;
    const { read } = setupRead(() => new Promise<Hex>((done) => { resolve = done; }));
    const result = readReceiptWithRetry(confirmedBlock, read, () => current);
    await vi.advanceTimersByTimeAsync(1);
    current = false;
    resolve(encodedTotal);

    await expect(result).resolves.toBeUndefined();
    expect(read).toHaveBeenCalledTimes(1);
  });
});
