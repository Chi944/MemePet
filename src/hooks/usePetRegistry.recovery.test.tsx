import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Address, WalletClient } from "viem";
import type { Deployment } from "@/lib/deployment";
import { pendingTransactionStorageKey, type PendingTransactionRecord } from "@/lib/pending-transaction-record";
import type { PendingRecoveryResult } from "@/lib/pending-transaction-recovery";

const mocks = vi.hoisted(() => ({
  resolve: vi.fn(), readContract: vi.fn(), getBlock: vi.fn(),
  writeContract: vi.fn(), waitForTransactionReceipt: vi.fn(),
}));
vi.mock("@/lib/pending-transaction-recovery", () => ({ resolvePendingTransaction: mocks.resolve }));
vi.mock("viem", async (importOriginal) => ({
  ...await importOriginal<typeof import("viem")>(), createPublicClient: vi.fn(() => mocks),
}));
import { RECEIPT_WAIT_TIMEOUT_MS, usePetRegistry } from "./usePetRegistry";

const address = "0x1111111111111111111111111111111111111111" as Address;
const other = "0x2222222222222222222222222222222222222222" as Address;
const registryAddress = "0x3333333333333333333333333333333333333333" as Address;
const hash = `0x${"a".repeat(64)}` as const;
const nextHash = `0x${"b".repeat(64)}` as const;
const record: PendingTransactionRecord = { version: 1, chainId: 31337, registryAddress, address,
  action: "adopt", transactionHash: hash };
const scope = { chainId: record.chainId, registryAddress, address };
const key = pendingTransactionStorageKey(scope)!;
const deployment: Deployment = { status: "local", networkName: "Anvil", registryAddress,
  chainId: 31337, rpcUrl: "http://127.0.0.1:8545", explorerBaseUrl: null, currencySymbol: "ETH" };
const createWalletClient = () => mocks as unknown as WalletClient;
const pending = (value = record): PendingRecoveryResult => ({ phase: "pending", record: value, effectiveRecord: value });
const confirmed = (value = record): PendingRecoveryResult => ({ phase: "confirmed", record: value,
  effectiveRecord: value, blockNumber: BigInt(10), blockHash: `0x${"c".repeat(64)}`,
  rawPet: { exists: true, communityId: 1, careCount: 0, lastCareDay: BigInt(0) }, chainTimeMs: 100_000 });
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((accept) => { resolve = accept; });
  return { promise, resolve };
}
function mount() {
  return renderHook(({ account, provider, wrongChain }: { account: Address | null; provider: string; wrongChain: boolean }) =>
    usePetRegistry({ deployment, address: account, wrongChain, providerSessionKey: provider, createWalletClient }),
  { initialProps: { account: address as Address | null, provider: "metamask", wrongChain: false } });
}
function seed(value: PendingTransactionRecord = record) {
  const storageKey = pendingTransactionStorageKey({ chainId: value.chainId, registryAddress: value.registryAddress, address: value.address })!;
  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

// These tests isolate hook orchestration. The adjacent original hook suite runs
// the real resolver with complete independent RPC evidence; resolver tests own
// identity/header/replacement verification. Every input below is fictional.
describe("usePetRegistry pending recovery orchestration (simulated)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.localStorage.clear();
    mocks.getBlock.mockResolvedValue({ number: BigInt(10), timestamp: BigInt(100), hash: `0x${"c".repeat(64)}` });
    mocks.readContract.mockResolvedValue([false, 0, 0, BigInt(0)]);
    mocks.writeContract.mockResolvedValue(hash);
    mocks.waitForTransactionReceipt.mockResolvedValue({});
    mocks.resolve.mockImplementation(async ({ record: value }) => pending(value));
  });
  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

  it("resumes a saved hash on remount without signing, waiting again or granting progress", async () => {
    const first = mount();
    await waitFor(() => expect(first.result.current.readStatus).toBe("ready"));
    await act(async () => { await first.result.current.adopt(); });
    expect(JSON.parse(window.localStorage.getItem(key)!).transactionHash).toBe(hash);
    expect(first.result.current.recoveryState).toMatchObject({ phase: "pending", transactionHash: hash });
    first.unmount();
    const second = mount();
    await waitFor(() => expect(second.result.current.recoveryState).toMatchObject({ phase: "pending" }));
    expect(second.result.current.recoveryBlocksWrites).toBe(true);
    expect(second.result.current.isSubmitting).toBe(false);
    expect(second.result.current.pet).toBeNull();
    await act(async () => { await second.result.current.adopt(); await second.result.current.care(); });
    expect(mocks.writeContract).toHaveBeenCalledOnce();
    expect(mocks.waitForTransactionReceipt).toHaveBeenCalledOnce();
    expect(mocks.waitForTransactionReceipt).toHaveBeenCalledWith(expect.objectContaining({ hash, timeout: RECEIPT_WAIT_TIMEOUT_MS }));
  });

  it("locks duplicate status checks synchronously and never repeats the write", async () => {
    seed();
    const { result } = mount();
    await waitFor(() => expect(result.current.recoveryState).toMatchObject({ phase: "pending" }));
    const read = deferred<PendingRecoveryResult>();
    mocks.resolve.mockReturnValueOnce(read.promise);
    let check!: Promise<void>;
    act(() => { check = result.current.checkTransactionStatus(); void result.current.checkTransactionStatus(); });
    expect(result.current.recoveryState).toMatchObject({ phase: "checking" });
    expect(mocks.resolve).toHaveBeenCalledTimes(2);
    await act(async () => { await result.current.adopt(); await result.current.care(); });
    expect(mocks.writeContract).not.toHaveBeenCalled();
    await act(async () => { read.resolve(pending()); await check; });
    expect(result.current.recoveryBlocksWrites).toBe(true);
  });

  it("cannot dismiss awaiting-facts state and clears the journal only after verified facts", async () => {
    seed();
    const accepted = confirmed();
    mocks.resolve.mockResolvedValueOnce({ ...accepted, phase: "confirmed-awaiting-facts" });
    const { result } = mount();
    await waitFor(() => expect(result.current.recoveryState).toMatchObject({ phase: "confirmed-awaiting-facts" }));
    act(() => { result.current.dismissTx(); });
    expect(result.current.transactionHash).toBe(hash);
    expect(result.current.confirmedBlockNumber).toBe(BigInt(10));
    expect(result.current.recoveryBlocksWrites).toBe(true);
    expect(result.current.pet).toBeNull();
    expect(window.localStorage.getItem(key)).not.toBeNull();
    mocks.resolve.mockResolvedValueOnce(accepted);
    mocks.readContract.mockResolvedValue([true, 1, 0, BigInt(0)]);
    await act(async () => { await result.current.checkTransactionStatus(); });
    expect(result.current.recoveryState).toMatchObject({ phase: "confirmed" });
    expect(result.current.pet?.growthPoints).toBe(0);
    expect(result.current.celebrateStageUp).toBe(false);
    expect(result.current.recoveryBlocksWrites).toBe(false);
    expect(window.localStorage.getItem(key)).toBeNull();
    expect(mocks.writeContract).not.toHaveBeenCalled();
  });

  it("discards old account recovery results including an A to B to A return", async () => {
    seed();
    const old = deferred<PendingRecoveryResult>();
    mocks.resolve.mockReturnValueOnce(old.promise);
    const { result, rerender } = mount();
    await waitFor(() => expect(mocks.resolve).toHaveBeenCalledOnce());
    rerender({ account: other, provider: "metamask", wrongChain: false });
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    expect(result.current.recoveryState).toEqual({ kind: "idle" });
    rerender({ account: address, provider: "metamask", wrongChain: false });
    await waitFor(() => expect(result.current.recoveryState).toMatchObject({ phase: "pending" }));
    await act(async () => { old.resolve(confirmed()); });
    expect(result.current.pet).toBeNull();
    expect(result.current.recoveryBlocksWrites).toBe(true);
    expect(window.localStorage.getItem(key)).not.toBeNull();
  });

  it("checks the same public journal anew on provider change and hides it on wrong network", async () => {
    seed();
    const { result, rerender } = mount();
    await waitFor(() => expect(result.current.recoveryState).toMatchObject({ phase: "pending" }));
    rerender({ account: address, provider: "okx", wrongChain: false });
    await waitFor(() => expect(mocks.resolve).toHaveBeenCalledTimes(2));
    expect(result.current.recoveryBlocksWrites).toBe(true);
    rerender({ account: address, provider: "okx", wrongChain: true });
    expect(result.current.recoveryState).toEqual({ kind: "idle" });
    expect(result.current.transactionHash).toBeUndefined();
    await act(async () => { await result.current.checkTransactionStatus(); await result.current.adopt(); });
    expect(mocks.resolve).toHaveBeenCalledTimes(2);
    expect(mocks.writeContract).not.toHaveBeenCalled();
  });

  it.each(["broken", "x".repeat(1025), JSON.stringify({ ...record, address: other })])("ignores malformed or foreign stored data", async (value) => {
    window.localStorage.setItem(key, value);
    const { result } = mount();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    expect(result.current.recoveryState).toEqual({ kind: "idle" });
    expect(mocks.resolve).not.toHaveBeenCalled();
  });

  it("keeps a returned hash in memory when storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage disabled"); });
    const { result, rerender } = mount();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    await act(async () => { await result.current.adopt(); });
    expect(result.current.transactionHash).toBe(hash);
    expect(result.current.recoveryStorageMessage).toMatch(/storage is unavailable/);
    expect(result.current.recoveryBlocksWrites).toBe(true);
    rerender({ account: address, provider: "okx", wrongChain: false });
    await waitFor(() => expect(result.current.recoveryState).toMatchObject({ phase: "pending", transactionHash: hash }));
    expect(mocks.writeContract).toHaveBeenCalledOnce();
  });

  it("persists a late wallet hash in its original account scope without updating the new account", async () => {
    const signature = deferred<`0x${string}`>();
    mocks.writeContract.mockReturnValueOnce(signature.promise);
    const { result, rerender } = mount();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    let write!: Promise<void>;
    act(() => { write = result.current.adopt(); });
    rerender({ account: other, provider: "metamask", wrongChain: false });
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    await act(async () => { signature.resolve(hash); await write; });
    expect(JSON.parse(window.localStorage.getItem(key)!)).toMatchObject({ address, transactionHash: hash });
    expect(result.current.recoveryState).toEqual({ kind: "idle" });
    expect(result.current.transactionHash).toBeUndefined();
    expect(mocks.waitForTransactionReceipt).not.toHaveBeenCalled();
  });

  it("a late old signature cannot overwrite a newer unresolved hash", async () => {
    const signature = deferred<`0x${string}`>();
    mocks.writeContract.mockReturnValueOnce(signature.promise);
    const { result, rerender } = mount();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    let write!: Promise<void>;
    act(() => { write = result.current.adopt(); });
    seed({ ...record, transactionHash: nextHash });
    rerender({ account: address, provider: "okx", wrongChain: false });
    await waitFor(() => expect(result.current.recoveryState).toMatchObject({ transactionHash: nextHash, phase: "pending" }));
    await act(async () => { signature.resolve(hash); await write; });
    expect(JSON.parse(window.localStorage.getItem(key)!).transactionHash).toBe(nextHash);
    expect(result.current.transactionHash).toBe(nextHash);
  });

  it("rechecks a journal created in another tab before requesting a signature", async () => {
    const { result } = mount();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    seed();
    await act(async () => { await result.current.adopt(); });
    expect(result.current.recoveryBlocksWrites).toBe(true);
    expect(result.current.transactionHash).toBe(hash);
    expect(mocks.writeContract).not.toHaveBeenCalled();
  });

  it("invalidates a background read when preflight discovers another tab's journal", async () => {
    mocks.readContract.mockResolvedValue([true, 1, 0, BigInt(0)]);
    const { result } = mount();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    const background = deferred<readonly [boolean, number, number, bigint]>();
    mocks.readContract.mockReturnValueOnce(background.promise);
    await act(async () => { await result.current.refreshPet(); });
    await waitFor(() => expect(mocks.readContract).toHaveBeenCalledTimes(2));
    seed({ ...record, action: "care" });
    await act(async () => { await result.current.care(); });
    expect(result.current.recoveryBlocksWrites).toBe(true);
    expect(result.current.pet).toBeNull();
    await act(async () => { background.resolve([true, 1, 1, BigInt(0)]); });
    expect(result.current.pet).toBeNull();
    expect(result.current.readStatus).toBe("error");
    expect(mocks.writeContract).not.toHaveBeenCalled();
  });

  it("blocks a new same-account provider write after an old hash arrives with storage unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage disabled"); });
    const signature = deferred<`0x${string}`>();
    mocks.writeContract.mockReturnValueOnce(signature.promise);
    const { result, rerender } = mount();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    let write!: Promise<void>;
    act(() => { write = result.current.adopt(); });
    rerender({ account: address, provider: "okx", wrongChain: false });
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    await act(async () => { signature.resolve(hash); await write; });
    expect(result.current.recoveryState).toEqual({ kind: "idle" });
    await act(async () => { await result.current.adopt(); });
    expect(result.current.recoveryBlocksWrites).toBe(true);
    expect(result.current.transactionHash).toBe(hash);
    expect(mocks.writeContract).toHaveBeenCalledOnce();
  });

  it("responds to storage events with read-only recovery, never treating deletion as a failed transaction", async () => {
    const { result } = mount();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    seed();
    await act(async () => { window.dispatchEvent(new StorageEvent("storage", { key })); });
    expect(result.current.recoveryState).toMatchObject({ phase: "pending" });
    window.localStorage.removeItem(key);
    await act(async () => { window.dispatchEvent(new StorageEvent("storage", { key })); });
    expect(result.current.recoveryBlocksWrites).toBe(true);
    expect(mocks.writeContract).not.toHaveBeenCalled();
  });

  it("a waiter timeout retains the public hash for bounded read-only checking", async () => {
    mocks.waitForTransactionReceipt.mockRejectedValue(new Error("Confirmation timeout"));
    mocks.resolve.mockImplementation(async ({ record: value }) => ({ ...pending(value), phase: "confirmation-unknown" }));
    const { result } = mount();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    await act(async () => { await result.current.adopt(); });
    expect(result.current.recoveryState).toMatchObject({ phase: "confirmation-unknown", transactionHash: hash });
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.txErrorMessage).toBeNull();
    expect(result.current.recoveryBlocksWrites).toBe(true);
    expect(window.localStorage.getItem(key)).not.toBeNull();
  });

  it("clears a verified replacement hint so awaiting facts can be checked by its new hash", async () => {
    const replacementHint = { reason: "repriced" };
    mocks.waitForTransactionReceipt.mockImplementation(async ({ onReplaced }) => { onReplaced(replacementHint); return {}; });
    const updated = { ...record, transactionHash: nextHash };
    mocks.resolve.mockResolvedValueOnce({ ...confirmed(updated), phase: "confirmed-awaiting-facts" });
    const { result } = mount();
    await waitFor(() => expect(result.current.readStatus).toBe("ready"));
    await act(async () => { await result.current.adopt(); });
    expect(mocks.resolve.mock.calls[0][0].replacement).toEqual(replacementHint);
    expect(result.current.transactionHash).toBe(nextHash);
    expect(JSON.parse(window.localStorage.getItem(key)!).transactionHash).toBe(nextHash);
    mocks.resolve.mockResolvedValueOnce(confirmed(updated));
    mocks.readContract.mockResolvedValue([true, 1, 0, BigInt(0)]);
    await act(async () => { await result.current.checkTransactionStatus(); });
    expect(mocks.resolve.mock.calls[1][0]).toMatchObject({ record: updated, replacement: undefined });
    expect(result.current.recoveryState).toMatchObject({ phase: "confirmed", transactionHash: nextHash });
    expect(window.localStorage.getItem(key)).toBeNull();
    expect(mocks.writeContract).toHaveBeenCalledOnce();
  });
});
