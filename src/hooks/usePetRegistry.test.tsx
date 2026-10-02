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

function mountProviderRegistry() {
  return renderHook(
    ({ providerSessionKey }) => usePetRegistry({
      deployment, address: walletA, wrongChain: false, createWalletClient, providerSessionKey,
    }),
    { initialProps: { providerSessionKey: "metamask" } },
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
    rpc.waitForTransactionReceipt.mockResolvedValue({ status: "success", blockNumber: BigInt(11) });
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

  it("clears the old pet immediately when the provider changes for the same account", async () => {
    rpc.readContract.mockResolvedValue(caredPet);
    const { result, rerender } = mountProviderRegistry();
    await waitFor(() => expect(result.current.pet?.growthPoints).toBe(10));
    const nextRead = deferred<typeof adoptedPet>();
    rpc.readContract.mockReturnValueOnce(nextRead.promise);

    rerender({ providerSessionKey: "okx" });
    expect(result.current.readStatus).toBe("loading");
    expect(result.current.pet).toBeNull();
    expect(result.current.cooldownAvailableAtIso).toBeNull();
    await waitFor(() => expect(rpc.readContract).toHaveBeenCalledTimes(2));
    await act(async () => { nextRead.resolve(adoptedPet); });
    expect(result.current.pet?.growthPoints).toBe(0);
  });

  it.each(["success", "failure"])("discards a late initial read %s after provider A → B → A", async (outcome) => {
    const firstRead = deferred<typeof caredPet>();
    rpc.readContract.mockReturnValueOnce(firstRead.promise).mockResolvedValue(adoptedPet);
    const { result, rerender } = mountProviderRegistry();
    await waitFor(() => expect(rpc.readContract).toHaveBeenCalledOnce());
    rerender({ providerSessionKey: "okx" });
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    rerender({ providerSessionKey: "metamask" });
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));

    await act(async () => {
      if (outcome === "success") firstRead.resolve(caredPet);
      else firstRead.reject(new Error("Old provider read failed"));
    });
    expect(result.current.pet?.growthPoints).toBe(0);
    expect(result.current.readStatus).toBe("ready");
    expect(result.current.readErrorMessage).toBeNull();
    expect(rpc.readContract).toHaveBeenCalledTimes(3);
  });

  it("ignores the old provider's signature without releasing the new provider's write lock", async () => {
    const oldSignature = deferred<string>();
    const newSignature = deferred<string>();
    rpc.writeContract.mockReturnValueOnce(oldSignature.promise).mockReturnValueOnce(newSignature.promise);
    const { result, rerender } = mountProviderRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    let oldWrite!: Promise<void>;
    act(() => { oldWrite = result.current.adopt(); });
    rerender({ providerSessionKey: "okx" });
    expect(result.current.txPhase).toBe("idle");
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    let newWrite!: Promise<void>;
    act(() => { newWrite = result.current.adopt(); });

    await act(async () => { oldSignature.resolve(hashA); await oldWrite; });
    expect(result.current.txPhase).toBe("awaiting-signature");
    expect(result.current.transactionHash).toBeUndefined();
    expect(rpc.waitForTransactionReceipt).not.toHaveBeenCalled();
    await act(async () => { await result.current.adopt(); });
    expect(rpc.writeContract).toHaveBeenCalledTimes(2);
    await act(async () => { newSignature.reject(new Error("User rejected request")); await newWrite; });
    expect(result.current.txPhase).toBe("rejected");
  });

  it.each(["success", "reverted"])("ignores a late %s receipt after provider A → B → A for the same account", async (status) => {
    const receipt = deferred<{ status: string; blockNumber: bigint }>();
    rpc.waitForTransactionReceipt.mockReturnValueOnce(receipt.promise);
    const { result, rerender } = mountProviderRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    let write!: Promise<void>;
    act(() => { write = result.current.adopt(); });
    await waitFor(() => expect(result.current.txPhase).toBe("pending"));

    rerender({ providerSessionKey: "okx" });
    expect(result.current.transactionHash).toBeUndefined();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    rerender({ providerSessionKey: "metamask" });
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    await act(async () => { receipt.resolve({ status, blockNumber: block.number }); await write; });

    expect(result.current.txPhase).toBe("idle");
    expect(result.current.pet).toBeNull();
    expect(result.current.confirmedBlockNumber).toBeUndefined();
    expect(result.current.transactionHash).toBeUndefined();
    expect(result.current.txErrorMessage).toBeNull();
    expect(rpc.getBlock.mock.calls.filter(([args]) => args.blockNumber !== undefined)).toHaveLength(0);
  });

  it("drops a late receipt-bound pet snapshot and celebration after a provider change", async () => {
    rpc.readContract.mockResolvedValue(caredPet);
    rpc.getBlock.mockResolvedValue({ ...block, timestamp: block.timestamp + BigInt(86400) });
    const { result, rerender } = mountProviderRegistry();
    await waitFor(() => expect(result.current.pet?.growthPoints).toBe(10));
    const evolved = [true, 1, 2, day + BigInt(1)] as const;
    const receiptRead = deferred<typeof evolved>();
    rpc.readContract.mockReturnValueOnce(receiptRead.promise);
    let write!: Promise<void>;
    act(() => { write = result.current.care(); });
    await waitFor(() => expect(result.current.confirmedBlockNumber).toBe(block.number));
    await waitFor(() => expect(rpc.readContract).toHaveBeenCalledTimes(2));

    rerender({ providerSessionKey: "okx" });
    expect(result.current.confirmedBlockNumber).toBeUndefined();
    expect(result.current.pet).toBeNull();
    await waitFor(() => expect(result.current.pet?.growthPoints).toBe(10));
    await act(async () => { receiptRead.resolve(evolved); await write; });
    expect(result.current.pet?.growthPoints).toBe(10);
    expect(result.current.celebrateStageUp).toBe(false);
    expect(result.current.txPhase).toBe("idle");
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

  it("coalesces manual retry clicks, shows loading and never asks the wallet", async () => {
    rpc.getBlock.mockRejectedValueOnce(new Error("Read unavailable"));
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("error"));
    const retryRead = deferred<typeof adoptedPet>();
    rpc.readContract.mockReturnValueOnce(retryRead.promise);
    act(() => { result.current.retryPet(); result.current.retryPet(); });
    expect(result.current.readStatus).toBe("loading");
    await waitFor(() => expect(rpc.readContract).toHaveBeenCalledOnce());
    act(() => { result.current.retryPet(); });
    await act(async () => { await result.current.adopt(); await result.current.care(); });
    expect(rpc.readContract).toHaveBeenCalledOnce();
    expect(rpc.writeContract).not.toHaveBeenCalled();
    await act(async () => { retryRead.resolve(adoptedPet); });
    expect(result.current.readStatus).toBe("ready");
    expect(result.current.readErrorMessage).toBeNull();
  });

  it("allows retry again after its deadline and ignores the expired answer", async () => {
    rpc.getBlock.mockRejectedValueOnce(new Error("Read unavailable"));
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("error"));
    vi.useFakeTimers();
    const stalled = deferred<typeof block>();
    rpc.getBlock.mockReturnValueOnce(stalled.promise);
    act(() => { result.current.retryPet(); });
    await act(async () => { await vi.advanceTimersByTimeAsync(RPC_READ_BUDGET_MS); });
    expect(result.current.readStatus).toBe("error");
    rpc.readContract.mockResolvedValue(adoptedPet);
    await act(async () => { result.current.retryPet(); });
    expect(result.current.readStatus).toBe("ready");
    await act(async () => { stalled.resolve(block); });
    expect(rpc.readContract).toHaveBeenCalledOnce();
    expect(result.current.pet?.growthPoints).toBe(0);
    expect(rpc.writeContract).not.toHaveBeenCalled();
  });

  it("keeps a simulated retry locked across an interval replacement and recovers after its deadline", async () => {
    vi.useFakeTimers();
    rpc.getBlock.mockRejectedValueOnce(new Error("Read unavailable"));
    const { result } = mountRegistry();
    await act(async () => {});
    expect(result.current.readStatus).toBe("error");
    const retryFromError = result.current.retryPet;
    await act(async () => { await vi.advanceTimersByTimeAsync(29_000); });

    const originalRetry = deferred<typeof caredPet>();
    const intervalRead = deferred<typeof caredPet>();
    rpc.readContract.mockReturnValueOnce(originalRetry.promise).mockReturnValueOnce(intervalRead.promise);
    await act(async () => { retryFromError(); });
    expect(result.current.readStatus).toBe("loading");
    expect(rpc.readContract).toHaveBeenCalledOnce();

    // The normal 30-second refresh replaces the manual read while it is pending.
    await act(async () => { await vi.advanceTimersByTimeAsync(1_000); });
    expect(rpc.readContract).toHaveBeenCalledTimes(2);
    await act(async () => { originalRetry.resolve(caredPet); });
    expect(result.current.readStatus).toBe("loading");
    expect(result.current.pet).toBeNull();
    // This saved callback still captured an error state. Only the synchronous
    // session lock prevents its obsolete click from replacing the interval read.
    await act(async () => { retryFromError(); });
    expect(rpc.readContract).toHaveBeenCalledTimes(2);

    await act(async () => { await vi.advanceTimersByTimeAsync(RPC_READ_BUDGET_MS); });
    expect(result.current.readStatus).toBe("error");
    rpc.readContract.mockResolvedValue(adoptedPet);
    await act(async () => { result.current.retryPet(); });
    expect(result.current.readStatus).toBe("ready");
    expect(result.current.pet?.growthPoints).toBe(0);
    expect(rpc.readContract).toHaveBeenCalledTimes(3);
    await act(async () => { intervalRead.resolve(caredPet); });
    expect(result.current.pet?.growthPoints).toBe(0);
    expect(result.current.readStatus).toBe("ready");
    expect(rpc.readContract).toHaveBeenCalledTimes(3);
    expect(rpc.writeContract).not.toHaveBeenCalled();
  });

  it("drops a manual retry and its lock when the provider session changes", async () => {
    rpc.getBlock.mockRejectedValueOnce(new Error("Read unavailable"));
    const { result, rerender } = mountProviderRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("error"));
    const oldRead = deferred<typeof caredPet>();
    rpc.readContract.mockReturnValueOnce(oldRead.promise);
    act(() => { result.current.retryPet(); });
    await waitFor(() => expect(rpc.readContract).toHaveBeenCalledOnce());
    rpc.getBlock.mockRejectedValueOnce(new Error("New provider unavailable"));
    rerender({ providerSessionKey: "okx" });
    await waitFor(() => expect(result.current.readStatus).toBe("error"));
    rpc.readContract.mockResolvedValue(adoptedPet);
    await act(async () => { result.current.retryPet(); });
    expect(result.current.readStatus).toBe("ready");
    await act(async () => { oldRead.resolve(caredPet); });
    expect(result.current.pet?.growthPoints).toBe(0);
    expect(rpc.writeContract).not.toHaveBeenCalled();
  });

  it("keeps retry reads at least as new as a confirmed receipt after dismissing its notice", async () => {
    rpc.readContract.mockResolvedValue(adoptedPet);
    const { result, rerender } = mountProviderRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    const receiptNumber = BigInt(20);
    rpc.waitForTransactionReceipt.mockResolvedValue({ status: "success", blockNumber: receiptNumber });
    rpc.getBlock.mockRejectedValueOnce(new Error("Receipt snapshot temporarily unavailable"));
    await act(async () => { await result.current.care(); });
    expect(result.current.readStatus).toBe("error");
    act(() => { result.current.dismissTx(); });
    expect(result.current.confirmedBlockNumber).toBeUndefined();
    rpc.getBlock.mockImplementation(async ({ blockNumber }) => ({ ...block, number: blockNumber ?? block.number }));
    rpc.readContract.mockResolvedValue(caredPet);
    await act(async () => { result.current.retryPet(); });
    expect(result.current.pet?.growthPoints).toBe(10);
    expect(rpc.readContract).toHaveBeenLastCalledWith(expect.objectContaining({ blockNumber: receiptNumber }));
    expect(rpc.writeContract).toHaveBeenCalledOnce();

    // A newer latest block must advance time instead of pinning forever.
    rpc.getBlock.mockResolvedValue({ ...block, number: BigInt(21), timestamp: block.timestamp + BigInt(86400) });
    await act(async () => { await result.current.refreshPet(); });
    expect(rpc.readContract).toHaveBeenLastCalledWith(expect.objectContaining({ blockNumber: BigInt(21) }));
    expect(result.current.cooldownAvailableAtIso).toBeNull();

    // A new provider session owns its own floor; an old session cannot pin it.
    rpc.getBlock.mockResolvedValue(block);
    rpc.readContract.mockResolvedValue(adoptedPet);
    rerender({ providerSessionKey: "okx" });
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    expect(rpc.readContract).toHaveBeenLastCalledWith(expect.objectContaining({ blockNumber: block.number }));
  });

  it("does not read an older pet when the known receipt block is unavailable", async () => {
    rpc.readContract.mockResolvedValue(adoptedPet);
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    rpc.waitForTransactionReceipt.mockResolvedValue({ status: "success", blockNumber: BigInt(20) });
    rpc.getBlock.mockRejectedValueOnce(new Error("Read failed"));
    await act(async () => { await result.current.care(); });
    rpc.getBlock.mockImplementation(async ({ blockNumber }) => {
      if (blockNumber !== undefined) throw new Error("Receipt block unavailable");
      return block;
    });
    await act(async () => { result.current.retryPet(); });
    expect(result.current.readStatus).toBe("error");
    expect(result.current.pet).toBeNull();
    expect(rpc.readContract).toHaveBeenCalledOnce();
    expect(rpc.writeContract).toHaveBeenCalledOnce();
  });

  it.each([null, 10, BigInt(-1)])("rejects an invalid latest block number (%s) before reading a pet", async (number) => {
    rpc.getBlock.mockResolvedValue({ ...block, number });
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("error"));
    expect(result.current.pet).toBeNull();
    expect(rpc.readContract).not.toHaveBeenCalled();
    expect(rpc.writeContract).not.toHaveBeenCalled();
  });

  it("keeps receipt success but rejects a mismatched immediate read-back header", async () => {
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    rpc.waitForTransactionReceipt.mockResolvedValue({ status: "success", blockNumber: BigInt(20) });
    // This replica returns block 10 even though block 20 was requested.
    await act(async () => { await result.current.adopt(); });
    expect(result.current.txPhase).toBe("success");
    expect(result.current.confirmedBlockNumber).toBe(BigInt(20));
    expect(result.current.readStatus).toBe("error");
    expect(result.current.readErrorMessage).toMatch(/Adoption confirmed on chain/);
    expect(result.current.pet).toBeNull();
    expect(rpc.readContract).toHaveBeenCalledOnce();
    expect(rpc.writeContract).toHaveBeenCalledOnce();
  });

  it.each([BigInt(19), BigInt(21)])("rejects a receipt fallback header at the wrong height (%s)", async (number) => {
    rpc.readContract.mockResolvedValue(adoptedPet);
    const { result } = mountRegistry();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    rpc.waitForTransactionReceipt.mockResolvedValue({ status: "success", blockNumber: BigInt(20) });
    rpc.getBlock.mockRejectedValueOnce(new Error("Read failed"));
    await act(async () => { await result.current.care(); });
    rpc.getBlock.mockImplementation(async ({ blockNumber }) => ({
      ...block, number: blockNumber === undefined ? block.number : number,
    }));
    await act(async () => { result.current.retryPet(); });
    expect(rpc.getBlock).toHaveBeenLastCalledWith({ blockNumber: BigInt(20) });
    expect(result.current.readStatus).toBe("error");
    expect(result.current.pet).toBeNull();
    expect(result.current.txPhase).toBe("success");
    expect(result.current.confirmedBlockNumber).toBe(BigInt(20));
    expect(rpc.readContract).toHaveBeenCalledOnce();
    expect(rpc.writeContract).toHaveBeenCalledOnce();
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
