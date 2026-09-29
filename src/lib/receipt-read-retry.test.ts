import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPublicClient, custom, encodeErrorResult, encodeFunctionResult, parseAbi, type Hex } from "viem";
import { petRegistryAbi } from "./pet-registry-abi";
import { readReceiptWithRetry } from "./receipt-read-retry";

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
  const read = vi.fn((blockNumber: bigint) => client.readContract({
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
