import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEPLOYMENT } from "../deployment";
import { readCompanionFacts } from "./read-facts";

const rpc = vi.hoisted(() => ({
  getChainId: vi.fn(),
  getBlock: vi.fn(),
  readContract: vi.fn(),
  createPublicClient: vi.fn(),
  http: vi.fn(),
}));

vi.mock("viem", async (importOriginal) => ({
  ...await importOriginal<typeof import("viem")>(),
  createPublicClient: rpc.createPublicClient,
  http: rpc.http,
}));

const address = "0x1111111111111111111111111111111111111111" as const;
const block = {
  number: BigInt(42),
  hash: `0x${"ab".repeat(32)}`,
  timestamp: BigInt(Date.parse("2026-09-29T09:00:00.000Z") / 1000),
};
const day = block.timestamp / BigInt(86_400);
const pet = [true, 1, 2, day] as const;
const read = (blockNumber?: bigint) => readCompanionFacts({ deployment: DEPLOYMENT, address, blockNumber });

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime("2026-09-30T12:00:00.000Z");
  rpc.createPublicClient.mockReturnValue(rpc);
  rpc.http.mockReturnValue("bounded transport");
  rpc.getChainId.mockResolvedValue(1952);
  rpc.getBlock.mockResolvedValue(block);
  rpc.readContract.mockImplementation(async ({ functionName }) => functionName === "petOf" ? pet : BigInt(8));
});

afterEach(() => vi.useRealTimers());

describe("readCompanionFacts", () => {
  it("pins both reads to one source block and retains chain time separately from observation time", async () => {
    const facts = await read();
    expect(facts.kind).toBe("ready");
    if (facts.kind !== "ready") throw new Error("Expected ready facts");
    expect(facts.snapshot).toMatchObject({
      chainId: 1952,
      walletAddress: address,
      blockNumber: "42",
      blockTimestampIso: "2026-09-29T09:00:00.000Z",
      observedAtIso: "2026-09-30T12:00:00.000Z",
      careCount: 2,
      growthPoints: 20,
      stage: "buddy",
      nextStageAt: 50,
      nextCareAtIso: "2026-09-30T00:00:00.000Z",
      communityTotalCares: 8,
    });
    expect(facts.snapshot.contextKey).toContain(block.hash);
    expect(facts.snapshot.contextKey).toContain(facts.snapshot.observedAtIso);
    expect(() => JSON.stringify(facts)).not.toThrow();
    expect(rpc.readContract.mock.calls.map(([request]) => [request.functionName, request.blockNumber])).toEqual([
      ["petOf", BigInt(42)], ["communityStats", BigInt(42)],
    ]);
    expect(rpc.getBlock.mock.calls).toEqual([[{ blockTag: "latest" }], [{ blockNumber: BigInt(42) }]]);
    expect(rpc.http).toHaveBeenCalledWith(DEPLOYMENT.rpcUrl, { timeout: 4_000, retryCount: 0 });
  });

  it("uses an explicitly requested receipt block without falling back to latest", async () => {
    expect((await read(BigInt(42))).kind).toBe("ready");
    expect(rpc.getBlock.mock.calls).toEqual([[{ blockNumber: BigInt(42) }], [{ blockNumber: BigInt(42) }]]);
  });

  it("stops before contract reads if the RPC chain differs from the configured chain", async () => {
    rpc.getChainId.mockResolvedValue(1);
    expect((await read()).kind).toBe("unavailable");
    expect(rpc.getBlock).not.toHaveBeenCalled();
    expect(rpc.readContract).not.toHaveBeenCalled();
  });

  it("requires a complete valid deployment and address before contacting RPC", async () => {
    expect((await readCompanionFacts({ deployment: { ...DEPLOYMENT, status: "not-deployed" }, address })).kind).toBe("unavailable");
    expect((await readCompanionFacts({ deployment: { ...DEPLOYMENT, chainId: 1.5 }, address })).kind).toBe("unavailable");
    expect((await readCompanionFacts({ deployment: DEPLOYMENT, address: "0xBAD" })).kind).toBe("unavailable");
    expect((await read(-BigInt(1))).kind).toBe("unavailable");
    expect(rpc.createPublicClient).not.toHaveBeenCalled();
  });

  it("recognizes no pet only after a successful empty read and stable source block", async () => {
    rpc.readContract.mockResolvedValue([false, 0, 0, BigInt(0)]);
    expect(await read()).toEqual({ kind: "no-pet", dataMode: "live" });
    expect(rpc.readContract).toHaveBeenCalledTimes(1);
    expect(rpc.getBlock).toHaveBeenCalledTimes(2);
  });

  it("sanitizes read failures instead of interpreting them as no pet", async () => {
    rpc.readContract.mockRejectedValue(new Error("https://provider.example/private-token secret request body"));
    const facts = await read();
    expect(facts.kind).toBe("unavailable");
    expect(JSON.stringify(facts)).not.toMatch(/private-token|request body|provider\.example/);
  });

  it("rejects a reorg instead of combining facts across two blocks at the same height", async () => {
    rpc.getBlock.mockResolvedValueOnce(block).mockResolvedValueOnce({ ...block, hash: `0x${"cd".repeat(32)}` });
    expect((await read()).kind).toBe("unavailable");
  });

  it("also rejects a reorganized no-pet response", async () => {
    rpc.readContract.mockResolvedValue([false, 0, 0, BigInt(0)]);
    rpc.getBlock.mockResolvedValueOnce(block).mockResolvedValueOnce({ ...block, hash: `0x${"cd".repeat(32)}` });
    expect((await read()).kind).toBe("unavailable");
  });

  it.each([
    { ...block, number: null },
    { ...block, hash: null },
    { ...block, hash: "0x01" },
    { ...block, timestamp: -BigInt(1) },
    { ...block, timestamp: BigInt(8_640_000_000_001) },
  ])("rejects an invalid or unconfirmed source block %#", async (invalidBlock) => {
    rpc.getBlock.mockResolvedValue(invalidBlock);
    expect((await read()).kind).toBe("unavailable");
    expect(rpc.readContract).not.toHaveBeenCalled();
  });

  it("rejects a block returned at a different height from the requested receipt", async () => {
    expect((await read(BigInt(43))).kind).toBe("unavailable");
    expect(rpc.readContract).not.toHaveBeenCalled();
  });

  it.each([
    [true, 2, 2, day],
    [true, 1, -1, day],
    [true, 1, 1.5, day],
    [true, 1, 2 ** 32, day],
    [true, 1, 2, day + BigInt(1)],
    [true, 1, 2, -BigInt(1)],
    [true, 1, 0, day],
    [true, 1, 2, 42],
    [false, 1, 2, day],
  ])("rejects malformed pet data %#", async (...invalidPet) => {
    rpc.readContract.mockResolvedValue(invalidPet);
    expect((await read()).kind).toBe("unavailable");
    expect(rpc.readContract).toHaveBeenCalledTimes(1);
  });

  it("keeps pet facts when the optional community read fails", async () => {
    rpc.readContract.mockResolvedValueOnce(pet).mockRejectedValueOnce(new Error("community unavailable"));
    const facts = await read();
    expect(facts.kind).toBe("ready");
    if (facts.kind === "ready") expect(facts.snapshot.communityTotalCares).toBeNull();
  });

  it.each([BigInt(-1), BigInt(Number.MAX_SAFE_INTEGER) + BigInt(1), BigInt(0), 8, "8"])(
    "keeps unsafe or inconsistent community total %s unknown", async (total) => {
      rpc.readContract.mockResolvedValueOnce(pet).mockResolvedValueOnce(total);
      const facts = await read();
      expect(facts.kind).toBe("ready");
      if (facts.kind === "ready") expect(facts.snapshot.communityTotalCares).toBeNull();
    },
  );

  it("preserves genuinely verified zero and care availability for a newly adopted pet", async () => {
    rpc.readContract.mockResolvedValueOnce([true, 1, 0, BigInt(0)]).mockResolvedValueOnce(BigInt(0));
    const facts = await read();
    expect(facts.kind).toBe("ready");
    if (facts.kind === "ready") expect(facts.snapshot).toMatchObject({
      communityTotalCares: 0, careCount: 0, growthPoints: 0,
      nextCareAtIso: "2026-09-29T09:00:00.000Z",
    });
  });

  it("reports eligibility at source time when the last care was on an earlier UTC day", async () => {
    rpc.readContract.mockResolvedValueOnce([true, 1, 2, day - BigInt(1)]).mockResolvedValueOnce(BigInt(2));
    const facts = await read();
    expect(facts.kind).toBe("ready");
    if (facts.kind === "ready") expect(facts.snapshot.nextCareAtIso).toBe("2026-09-29T09:00:00.000Z");
  });

  it("retries unavailable pinned state at the same height without reading latest again", async () => {
    rpc.readContract.mockRejectedValueOnce({ name: "TimeoutError" }).mockResolvedValueOnce(pet).mockResolvedValueOnce(BigInt(8));
    const result = read();
    await vi.runAllTimersAsync();
    expect((await result).kind).toBe("ready");
    expect(rpc.readContract.mock.calls.map(([request]) => request.blockNumber)).toEqual([BigInt(42), BigInt(42), BigInt(42)]);
    expect(rpc.getBlock).toHaveBeenCalledTimes(2);
  });

  it("keeps verified pet facts when slow optional reads exhaust their smaller budget", async () => {
    rpc.readContract.mockResolvedValueOnce(pet).mockImplementationOnce(async () => {
      vi.setSystemTime(Date.now() + 8_000);
      return BigInt(8);
    });
    const facts = await read();
    expect(facts.kind).toBe("ready");
    if (facts.kind === "ready") expect(facts.snapshot.communityTotalCares).toBeNull();
    expect(rpc.getBlock).toHaveBeenCalledTimes(2);
  });

  it("stops starting RPC requests when the overall read budget is spent", async () => {
    rpc.getChainId.mockImplementationOnce(async () => {
      vi.setSystemTime(Date.now() + 15_000);
      return 1952;
    });
    expect((await read()).kind).toBe("unavailable");
    expect(rpc.getBlock).not.toHaveBeenCalled();
  });
});
