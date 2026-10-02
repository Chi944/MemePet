import { afterEach, describe, expect, it, vi } from "vitest";
import { readWithBudget, RPC_READ_BUDGET_MS } from "./read-budget";

afterEach(() => vi.useRealTimers());

describe("bounded RPC snapshots", () => {
  it("ends a stalled snapshot and prevents its late continuation from starting another request", async () => {
    vi.useFakeTimers();
    let release!: () => void;
    const stalled = new Promise<void>((resolve) => { release = resolve; });
    const nextRequest = vi.fn();
    const outcome = readWithBudget(async (canRead) => {
      await stalled;
      if (!canRead()) return;
      return nextRequest();
    }).catch((error: Error) => error);

    await vi.advanceTimersByTimeAsync(RPC_READ_BUDGET_MS);
    expect(await outcome).toBeInstanceOf(Error);
    release();
    await Promise.resolve();
    expect(nextRequest).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("allows only three temporary attempts including bounded retry delays", async () => {
    vi.useFakeTimers();
    const failure = Object.assign(new Error("timeout"), { name: "TimeoutError" });
    const read = vi.fn().mockRejectedValue(failure);
    const outcome = readWithBudget(read).catch((error: Error) => error);
    await vi.advanceTimersByTimeAsync(1_500);
    expect(await outcome).toBe(failure);
    expect(read).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not retry a superseded scope", async () => {
    vi.useFakeTimers();
    let current = true;
    const read = vi.fn().mockRejectedValue({ name: "TimeoutError" });
    const outcome = readWithBudget(read, () => current);
    await vi.advanceTimersByTimeAsync(0);
    current = false;
    await vi.advanceTimersByTimeAsync(500);
    expect(await outcome).toBeUndefined();
    expect(read).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("does not retry a terminal contract failure", async () => {
    const failure = { name: "ContractFunctionRevertedError", reason: "Invalid pet" };
    const read = vi.fn().mockRejectedValue(failure);
    await expect(readWithBudget(read)).rejects.toBe(failure);
    expect(read).toHaveBeenCalledOnce();
  });
});
