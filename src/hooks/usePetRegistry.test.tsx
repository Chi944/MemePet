import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BlockNotFoundError, ResourceUnavailableRpcError, type Address, type WalletClient } from "viem";
import type { Deployment } from "@/lib/deployment";
import { RPC_READ_BUDGET_MS } from "@/lib/read-budget";

const rpc = vi.hoisted(() => ({
  readContract: vi.fn(),
  getBlock: vi.fn(),
  waitForTransactionReceipt: vi.fn(),
  writeContract: vi.fn(),
}));

vi.mock("viem", async (importOriginal) => {
  const actual = await importOriginal<typeof import("viem")>();
  return { ...actual, createPublicClient: vi.fn(() => rpc) };
});

import { usePetRegistry } from "./usePetRegistry";

const walletA = "0x1111111111111111111111111111111111111111" as Address;
const walletB = "0x2222222222222222222222222222222222222222" as Address;
const hashA = `0x${"a".repeat(64)}`;
const hashB = `0x${"b".repeat(64)}`;
const day = BigInt(20_000);
const block = { number: BigInt(10), timestamp: day * BigInt(86400) + BigInt(3600) };
const emptyPet = [false, 0, 0, BigInt(0)] as const;
const adoptedPet = [true, 1, 0, BigInt(0)] as const;
const caredPet = [true, 1, 1, day] as const;
const deployment: Deployment = {
  status: "local",
  networkName: "Anvil",
  registryAddress: "0x3333333333333333333333333333333333333333",
  chainId: 31337,
  rpcUrl: "http://127.0.0.1:8545",
  explorerBaseUrl: null,
  currencySymbol: "ETH",
};
const createWalletClient = () => rpc as unknown as WalletClient;

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((accept, decline) => {
    resolve = accept;
    reject = decline;
  });
  return { promise, resolve, reject };
}

function mountRegistry() {
  return renderHook(
    ({ address }: { address: Address }) =>
      usePetRegistry({ deployment, address, wrongChain: false, createWalletClient }),
    { initialProps: { address: walletA } },
  );
}

describe("usePetRegistry confirmed reads and wallet sessions", () => {
  afterEach(() => vi.useRealTimers());
  beforeEach(() => {
    vi.resetAllMocks();
    rpc.getBlock.mockResolvedValue(block);
    rpc.readContract.mockResolvedValue(emptyPet);
    rpc.writeContract.mockResolvedValue(hashA);
    rpc.waitForTransactionReceipt.mockResolvedValue({
      status: "success",
      blockNumber: block.number,
    });
  });

  it("awards no pet or growth before the receipt and post-receipt read", async () => {
    const receipt = deferred<{ status: string; blockNumber: bigint }>();
    const reread = deferred<typeof adoptedPet>();
    rpc.waitForTransactionReceipt.mockReturnValue(receipt.promise);
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    rpc.readContract.mockReturnValueOnce(reread.promise);

    let write!: Promise<void>;
    act(() => { write = result.current.adopt(); });
    await waitFor(() => expect(result.current.txPhase).toBe("pending"));
    expect(result.current.pet).toBeNull();
    expect(result.current.confirmedBlockNumber).toBeUndefined();

    await act(async () => {
      receipt.resolve({ status: "success", blockNumber: block.number });
      await Promise.resolve();
    });
    expect(result.current.txPhase).toBe("pending");
    expect(result.current.pet).toBeNull();

    rpc.readContract.mockResolvedValue(adoptedPet);
    await act(async () => { reread.resolve(adoptedPet); await write; });
    expect(result.current.txPhase).toBe("success");
    expect(result.current.confirmedBlockNumber).toBe(block.number);
    expect(result.current.pet?.growthPoints).toBe(0);
    expect(rpc.readContract).toHaveBeenLastCalledWith(
      expect.objectContaining({ blockNumber: block.number, args: [walletA] }),
    );
  });

  it("preserves confirmed-on-chain wording when the post-receipt read fails", async () => {
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    rpc.readContract.mockRejectedValueOnce(new Error("RPC unavailable"));
    await act(async () => { await result.current.adopt(); });
    expect(result.current.txPhase).toBe("success");
    expect(result.current.readStatus).toBe("error");
    expect(result.current.readErrorMessage).toMatch(/Adoption confirmed on chain/);
    expect(result.current.confirmedBlockNumber).toBe(block.number);
    expect(result.current.pet).toBeNull();
  });

  it.each(["block", "pet"])("recovers a temporarily unavailable receipt %s read without another write", async (failedRead) => {
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    rpc.readContract.mockResolvedValue(adoptedPet);
    if (failedRead === "block") {
      rpc.getBlock.mockRejectedValueOnce(new BlockNotFoundError({ blockNumber: block.number }));
    } else {
      rpc.readContract.mockRejectedValueOnce(new ResourceUnavailableRpcError(new Error("Receipt state not available yet")));
    }

    let write!: Promise<void>;
    act(() => { write = result.current.adopt(); });
    await waitFor(() => expect(result.current.txPhase).toBe("pending"));
    expect(result.current.pet).toBeNull();
    await act(async () => { await write; });

    expect(result.current.txPhase).toBe("success");
    expect(result.current.readStatus).toBe("ready");
    expect(result.current.pet?.growthPoints).toBe(0);
    expect(rpc.writeContract).toHaveBeenCalledOnce();
    const receiptReads = rpc.getBlock.mock.calls.filter(([args]) => args.blockNumber !== undefined);
    expect(receiptReads).toHaveLength(2);
    for (const [args] of receiptReads) expect(args.blockNumber).toBe(block.number);
    for (const [args] of rpc.readContract.mock.calls) expect(args.blockNumber).toBe(block.number);
  });

  it("stops after three unavailable receipt reads and keeps confirmed-but-stale wording", async () => {
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    rpc.getBlock.mockRejectedValue(new BlockNotFoundError({ blockNumber: block.number }));
    await act(async () => { await result.current.adopt(); });

    expect(rpc.getBlock.mock.calls.filter(([args]) => args.blockNumber !== undefined)).toHaveLength(3);
    expect(rpc.writeContract).toHaveBeenCalledOnce();
    expect(result.current.txPhase).toBe("success");
    expect(result.current.readStatus).toBe("error");
    expect(result.current.readErrorMessage).toMatch(/Adoption confirmed on chain/);
    expect(result.current.pet).toBeNull();
  });

  it("cancels the delayed receipt retry when the connected account changes", async () => {
    const { result, rerender } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    rpc.getBlock.mockRejectedValueOnce(new BlockNotFoundError({ blockNumber: block.number }));
    let write!: Promise<void>;
    act(() => { write = result.current.adopt(); });
    await waitFor(() => expect(rpc.getBlock).toHaveBeenCalledWith({ blockNumber: block.number }));

    rerender({ address: walletB });
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    await act(async () => { await write; });

    expect(rpc.getBlock.mock.calls.filter(([args]) => args.blockNumber !== undefined)).toHaveLength(1);
    expect(rpc.writeContract).toHaveBeenCalledOnce();
    expect(result.current.txPhase).toBe("idle");
    expect(result.current.confirmedBlockNumber).toBeUndefined();
    expect(result.current.pet).toBeNull();
  });

  it("does not let a background refresh award growth while the receipt is pending", async () => {
    rpc.readContract.mockResolvedValue(adoptedPet);
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));

    const backgroundRead = deferred<typeof caredPet>();
    const receipt = deferred<{ status: string; blockNumber: bigint }>();
    rpc.readContract.mockReturnValueOnce(backgroundRead.promise);
    rpc.waitForTransactionReceipt.mockReturnValue(receipt.promise);
    await act(async () => { await result.current.refreshPet(); });
    await waitFor(() => expect(rpc.readContract).toHaveBeenCalledTimes(2));

    let write!: Promise<void>;
    act(() => { write = result.current.care(); });
    await waitFor(() => expect(result.current.txPhase).toBe("pending"));
    await act(async () => { backgroundRead.resolve(caredPet); });
    expect(result.current.pet?.growthPoints).toBe(0);
    await act(async () => { await result.current.refreshPet(); });
    expect(rpc.readContract).toHaveBeenCalledTimes(2);

    rpc.readContract.mockResolvedValue(caredPet);
    await act(async () => {
      receipt.resolve({ status: "success", blockNumber: block.number });
      await write;
    });
    expect(result.current.pet?.growthPoints).toBe(10);
    expect(result.current.txPhase).toBe("success");
  });

  it("does not submit care when no pet is confirmed", async () => {
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    await act(async () => { await result.current.care(); });
    expect(rpc.writeContract).not.toHaveBeenCalled();
  });

  it("ignores an old signature result and cannot unlock the new account's write", async () => {
    const signatureA = deferred<string>();
    const signatureB = deferred<string>();
    rpc.writeContract.mockReturnValueOnce(signatureA.promise).mockReturnValueOnce(signatureB.promise);
    const { result, rerender } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    let writeA!: Promise<void>;
    act(() => { writeA = result.current.adopt(); });

    rerender({ address: walletB });
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    let writeB!: Promise<void>;
    act(() => { writeB = result.current.adopt(); });
    await act(async () => { signatureA.resolve(hashA); await writeA; });

    expect(result.current.txPhase).toBe("awaiting-signature");
    expect(result.current.transactionHash).toBeUndefined();
    await act(async () => { await result.current.adopt(); });
    expect(rpc.writeContract).toHaveBeenCalledTimes(2);
    await act(async () => {
      signatureB.reject(new Error("User rejected request"));
      await writeB;
    });
  });

  it.each(["success", "reverted"])(
    "ignores an old %s receipt after A → B → A",
    async (status) => {
      const receipt = deferred<{ status: string; blockNumber: bigint }>();
      rpc.waitForTransactionReceipt.mockReturnValue(receipt.promise);
      const { result, rerender } = mountRegistry();
      await waitFor(() => expect(result.current.readStatus).toBe("ready"));
      let write!: Promise<void>;
      act(() => { write = result.current.adopt(); });
      await waitFor(() => expect(result.current.txPhase).toBe("pending"));
      rerender({ address: walletB });
      await waitFor(() => expect(result.current.readStatus).toBe("ready"));
      rerender({ address: walletA });
      await waitFor(() => expect(result.current.readStatus).toBe("ready"));
      await act(async () => { receipt.resolve({ status, blockNumber: block.number }); await write; });
      expect(result.current.txPhase).toBe("idle");
      expect(result.current.transactionHash).toBeUndefined();
      expect(result.current.confirmedBlockNumber).toBeUndefined();
      expect(result.current.txErrorMessage).toBeNull();
      expect(result.current.pet).toBeNull();
    },
  );

  it("clears cooldown when Anvil advances a UTC day while the browser clock is unchanged", async () => {
    rpc.readContract.mockResolvedValue(caredPet);
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    expect(result.current.cooldownAvailableAtIso).not.toBeNull();
    await act(async () => { await result.current.care(); });
    expect(rpc.writeContract).not.toHaveBeenCalled();

    rpc.getBlock.mockResolvedValue({ number: BigInt(11), timestamp: block.timestamp + BigInt(86400) });
    await act(async () => { await result.current.refreshPet(); });
    await waitFor(() => expect(result.current.cooldownAvailableAtIso).toBeNull());
    expect(rpc.readContract).toHaveBeenLastCalledWith(
      expect.objectContaining({ blockNumber: BigInt(11) }),
    );

    rpc.writeContract.mockResolvedValue(hashB);
    rpc.readContract.mockResolvedValue([true, 1, 2, day + BigInt(1)]);
    await act(async () => { await result.current.care(); });
    expect(rpc.writeContract).toHaveBeenCalledOnce();
    expect(result.current.pet?.growthPoints).toBe(20);
    expect(result.current.cooldownAvailableAtIso).not.toBeNull();
  });

  it("does not fall back to the browser clock when the block timestamp cannot be read", async () => {
    rpc.getBlock.mockRejectedValue(new Error("Block read failed"));
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("error"));
    await act(async () => { await result.current.care(); });
    expect(rpc.writeContract).not.toHaveBeenCalled();
    expect(result.current.pet).toBeNull();
  });

  it("ends a stalled initial block read without allowing late pet reads", async () => {
    vi.useFakeTimers();
    const stalled = deferred<typeof block>();
    rpc.getBlock.mockReturnValue(stalled.promise);
    const { result } = mountRegistry();

    await act(async () => { await vi.advanceTimersByTimeAsync(RPC_READ_BUDGET_MS); });
    expect(result.current.readStatus).toBe("error");
    expect(result.current.pet).toBeNull();
    await act(async () => { stalled.resolve(block); });
    expect(rpc.readContract).not.toHaveBeenCalled();
    expect(result.current.readStatus).toBe("error");
  });

  it("allows a manual read-only recovery after the initial retry budget is exhausted", async () => {
    vi.useFakeTimers();
    rpc.getBlock.mockRejectedValue({ name: "TimeoutError" });
    const { result } = mountRegistry();
    await act(async () => { await vi.advanceTimersByTimeAsync(1_500); });
    expect(rpc.getBlock).toHaveBeenCalledTimes(3);
    expect(result.current.readStatus).toBe("error");
    expect(rpc.readContract).not.toHaveBeenCalled();

    rpc.getBlock.mockResolvedValue(block);
    rpc.readContract.mockResolvedValue(adoptedPet);
    await act(async () => { await result.current.refreshPet(); });
    expect(result.current.readStatus).toBe("ready");
    expect(result.current.pet?.growthPoints).toBe(0);
    expect(result.current.readErrorMessage).toBeNull();
    expect(rpc.writeContract).not.toHaveBeenCalled();
  });

  it("ignores an initial read failure from the old account after switching", async () => {
    const oldRead = deferred<typeof emptyPet>();
    rpc.readContract.mockReturnValueOnce(oldRead.promise).mockResolvedValue(adoptedPet);
    const { result, rerender } = mountRegistry();
    await waitFor(() => expect(rpc.readContract).toHaveBeenCalledOnce());
    rerender({ address: walletB });
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    await act(async () => { oldRead.reject(new Error("Old account read failed")); });
    expect(result.current.readStatus).toBe("ready");
    expect(result.current.pet?.growthPoints).toBe(0);
    expect(result.current.readErrorMessage).toBeNull();
  });

  it("bounds a stalled receipt snapshot while preserving confirmed success", async () => {
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    vi.useFakeTimers();
    const stalled = deferred<typeof block>();
    rpc.getBlock.mockReturnValue(stalled.promise);
    let write!: Promise<void>;
    await act(async () => { write = result.current.adopt(); });
    expect(result.current.txPhase).toBe("pending");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(RPC_READ_BUDGET_MS);
      await write;
    });
    expect(result.current.txPhase).toBe("success");
    expect(result.current.readStatus).toBe("error");
    expect(result.current.readErrorMessage).toMatch(/Adoption confirmed on chain/);
    expect(result.current.confirmedBlockNumber).toBe(block.number);
    await act(async () => { stalled.resolve(block); });
    expect(rpc.readContract).toHaveBeenCalledOnce();
    expect(rpc.writeContract).toHaveBeenCalledOnce();
    expect(result.current.pet).toBeNull();
  });

  it("does not apply the short read deadline to signatures or receipt confirmation", async () => {
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    vi.useFakeTimers();
    const signature = deferred<string>();
    const receipt = deferred<{ status: string; blockNumber: bigint }>();
    rpc.writeContract.mockReturnValue(signature.promise);
    rpc.waitForTransactionReceipt.mockReturnValue(receipt.promise);
    let write!: Promise<void>;
    act(() => { write = result.current.adopt(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(RPC_READ_BUDGET_MS + 1); });
    expect(result.current.txPhase).toBe("awaiting-signature");
    await act(async () => { signature.resolve(hashA); });
    await act(async () => { await vi.advanceTimersByTimeAsync(RPC_READ_BUDGET_MS + 1); });
    expect(result.current.txPhase).toBe("pending");
    expect(result.current.pet).toBeNull();
    rpc.readContract.mockResolvedValue(adoptedPet);
    await act(async () => {
      receipt.resolve({ status: "success", blockNumber: block.number });
      await write;
    });
    expect(result.current.txPhase).toBe("success");
    expect(rpc.writeContract).toHaveBeenCalledOnce();
  });
});
