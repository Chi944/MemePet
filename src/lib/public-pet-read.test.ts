import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAddress } from "viem";
import { readPublicPet } from "./public-pet";
import { RPC_READ_BUDGET_MS, RPC_READ_HTTP_OPTIONS } from "./read-budget";

const rpc = vi.hoisted(() => ({ readContract: vi.fn(), http: vi.fn() }));
vi.mock("viem", async (importOriginal) => {
  const actual = await importOriginal<typeof import("viem")>();
  return { ...actual, http: rpc.http, createPublicClient: vi.fn(() => rpc) };
});

const owner = getAddress("0x1111111111111111111111111111111111111111");

beforeEach(() => vi.resetAllMocks());
afterEach(() => vi.useRealTimers());

describe("public pet RPC failures", () => {
  it("uses the explicit transport limits and recovers a temporary failure", async () => {
    vi.useFakeTimers();
    rpc.readContract.mockRejectedValueOnce({ name: "TimeoutError" })
      .mockResolvedValue([true, 1, 2, BigInt(20_000)]);
    const outcome = readPublicPet(owner);
    await vi.advanceTimersByTimeAsync(500);
    expect(await outcome).toMatchObject({ kind: "pet", pet: { growthPoints: 20 } });
    expect(rpc.readContract).toHaveBeenCalledTimes(2);
    expect(rpc.http).toHaveBeenCalledWith(expect.any(String), RPC_READ_HTTP_OPTIONS);
  });

  it("returns an honest error after temporary retries are exhausted", async () => {
    vi.useFakeTimers();
    rpc.readContract.mockRejectedValue({ name: "TimeoutError" });
    const outcome = readPublicPet(owner);
    await vi.advanceTimersByTimeAsync(1_500);
    expect(await outcome).toMatchObject({ kind: "error" });
    expect(rpc.readContract).toHaveBeenCalledTimes(3);
  });

  it("bounds a stalled read and never turns its failure into no-pet", async () => {
    vi.useFakeTimers();
    rpc.readContract.mockReturnValue(new Promise(() => {}));
    const outcome = readPublicPet(owner);
    await vi.advanceTimersByTimeAsync(RPC_READ_BUDGET_MS);
    const snapshot = await outcome;
    expect(snapshot.kind).toBe("error");
    expect(snapshot).not.toHaveProperty("pet");
    expect(rpc.readContract).toHaveBeenCalledOnce();
  });
});
