import { afterEach, describe, expect, it, vi } from "vitest";
import { encodeFunctionData, type ReplacementReturnType } from "viem";
import { resolvePendingTransaction, type PendingRecoveryClient } from "./pending-transaction-recovery";
import type { Deployment } from "./deployment";
import type { PendingTransactionRecord } from "./pending-transaction-record";
import { petRegistryAbi } from "./pet-registry-abi";

const record: PendingTransactionRecord = { version: 1, chainId: 1952, registryAddress: `0x${"aa".repeat(20)}`, address: `0x${"bb".repeat(20)}`, action: "care", transactionHash: `0x${"cc".repeat(32)}` };
const deployment: Deployment = { status: "testnet", chainId: 1952, registryAddress: record.registryAddress, rpcUrl: "https://example.invalid", networkName: "Fixture testnet", currencySymbol: "OKB", explorerBaseUrl: null };
const block = { number: BigInt(420), hash: `0x${"dd".repeat(32)}`, timestamp: BigInt(172800) };
const tx = { chainId: 1952, hash: record.transactionHash, from: record.address, to: record.registryAddress, value: BigInt(0), nonce: 7, input: encodeFunctionData({ abi: petRegistryAbi, functionName: "care" }), blockNumber: block.number, blockHash: block.hash, transactionIndex: 2 };
const receipt = { transactionHash: record.transactionHash, from: record.address, to: record.registryAddress, blockNumber: block.number, blockHash: block.hash, transactionIndex: 2, status: "success" };
const pet = [true, 1, 2, BigInt(2)] as const;
const otherHash = `0x${"ee".repeat(32)}` as const;
function client() {
  return {
    getChainId: vi.fn().mockResolvedValue(1952), getTransaction: vi.fn().mockResolvedValue(tx),
    getTransactionReceipt: vi.fn().mockResolvedValue(receipt), getBlock: vi.fn().mockResolvedValue(block),
    readContract: vi.fn().mockResolvedValue(pet),
  } satisfies PendingRecoveryClient;
}
const run = (readClient = client(), extra: Partial<Parameters<typeof resolvePendingTransaction>[0]> = {}) =>
  resolvePendingTransaction({ deployment, record, isCurrent: () => true, client: readClient, ...extra });
function replacementFixture(change: Record<string, unknown> = {}) {
  const candidate = { ...tx, hash: otherHash, ...change };
  const candidateReceipt = { ...receipt, transactionHash: otherHash, to: candidate.to };
  const event = { reason: "repriced", replacedTransaction: tx, transaction: candidate, transactionReceipt: candidateReceipt } as unknown as ReplacementReturnType;
  const readClient = client();
  readClient.getTransaction.mockImplementation(async ({ hash }) => hash === otherHash ? candidate : tx);
  readClient.getTransactionReceipt.mockResolvedValue(candidateReceipt);
  return { candidate, candidateReceipt, event, readClient };
}
afterEach(() => vi.useRealTimers());

describe("read-only pending transaction recovery (simulated RPC, no wallet)", () => {
  it("requires identity, receipt-bound pet facts and a fresh final header/chain recheck", async () => {
    const reads = client();
    const result = await run(reads);
    expect(result).toEqual({ phase: "confirmed", record, effectiveRecord: record, blockNumber: block.number, blockHash: block.hash, rawPet: { exists: true, communityId: 1, careCount: 2, lastCareDay: BigInt(2) }, chainTimeMs: 172800000 });
    expect(reads.readContract).toHaveBeenCalledExactlyOnceWith({ address: record.registryAddress, abi: petRegistryAbi, functionName: "petOf", args: [record.address], blockNumber: block.number });
    expect(reads.getBlock).toHaveBeenCalledTimes(2);
    expect(reads.getChainId).toHaveBeenCalledTimes(2);
  });

  it("recovers approved adoption without inventing a care", async () => {
    const reads = client();
    reads.getTransaction.mockResolvedValue({ ...tx, input: encodeFunctionData({ abi: petRegistryAbi, functionName: "adopt", args: [1] }) });
    reads.readContract.mockResolvedValue([true, 1, 0, BigInt(0)]);
    expect(await run(reads, { record: { ...record, action: "adopt" } })).toMatchObject({ phase: "confirmed", rawPet: { careCount: 0 } });
  });

  it("keeps a matching unmined transaction pending when its receipt is absent", async () => {
    const reads = client();
    reads.getTransaction.mockResolvedValue({ ...tx, blockNumber: null, blockHash: null, transactionIndex: null });
    reads.getTransactionReceipt.mockRejectedValue({ name: "TransactionReceiptNotFoundError" });
    expect(await run(reads)).toMatchObject({ phase: "pending" });
    expect(reads.readContract).not.toHaveBeenCalled();
  });

  it("missing transactions or missing receipts for mined transactions remain unknown", async () => {
    for (const missingTransaction of [true, false]) {
      const reads = client();
      if (missingTransaction) reads.getTransaction.mockRejectedValue({ name: "TransactionNotFoundError" });
      else reads.getTransactionReceipt.mockResolvedValue(null);
      expect(await run(reads)).toMatchObject({ phase: "confirmation-unknown" });
      expect(reads.readContract).not.toHaveBeenCalled();
    }
  });

  it("never reads for a stale operation or a foreign deployment scope", async () => {
    const reads = client();
    expect(await run(reads, { isCurrent: () => false })).toBeUndefined();
    expect(await run(reads, { deployment: { ...deployment, chainId: 1 } })).toMatchObject({ phase: "confirmation-unknown" });
    expect(reads.getChainId).not.toHaveBeenCalled();
  });

  it("drops late reads after account/provider/session invalidation", async () => {
    let current = true;
    const reads = client();
    reads.readContract.mockImplementation(async () => { current = false; return pet; });
    expect(await run(reads, { isCurrent: () => current })).toBeUndefined();
    expect(reads.getBlock).toHaveBeenCalledTimes(1);
  });

  it.each([{ from: record.registryAddress }, { to: record.address }, { value: BigInt(1) }, { chainId: 1 }, { input: "0x" }])("never uses a successful receipt to bypass transaction validation (case %#)", async (change) => {
    const reads = client(); reads.getTransaction.mockResolvedValue({ ...tx, ...change });
    expect(await run(reads)).toMatchObject({ phase: "confirmation-unknown" });
    expect(reads.readContract).not.toHaveBeenCalled();
  });

  it("independently rejects another RPC chain at the beginning and end", async () => {
    const early = client(); early.getChainId.mockResolvedValue(1);
    expect(await run(early)).toMatchObject({ phase: "confirmation-unknown" });
    expect(early.getTransaction).not.toHaveBeenCalled();
    const late = client(); late.getChainId.mockResolvedValueOnce(1952).mockResolvedValue(1);
    expect(await run(late)).toMatchObject({ phase: "confirmation-unknown" });
  });

  it("rejects a reorg after pet facts instead of returning confirmed", async () => {
    const reads = client(); reads.getBlock.mockResolvedValueOnce(block).mockResolvedValue({ ...block, hash: otherHash });
    expect(await run(reads)).toMatchObject({ phase: "confirmation-unknown" });
  });

  it("requires valid timestamp/header evidence for a revert", async () => {
    const reads = client(); reads.getTransactionReceipt.mockResolvedValue({ ...receipt, status: "reverted" });
    expect(await run(reads)).toMatchObject({ phase: "reverted" });
    expect(reads.readContract).not.toHaveBeenCalled();
    reads.getBlock.mockResolvedValue({ ...block, timestamp: undefined });
    expect(await run(reads)).toMatchObject({ phase: "confirmation-unknown" });
  });

  it.each([[false, 0, 0, BigInt(0)], [true, 2, 2, BigInt(2)], [true, 1, -1, BigInt(2)], [true, 1, 0, BigInt(0)], [true, 1, 2, BigInt(3)], null].map((facts) => ({ facts })))("keeps successful receipts awaiting facts for malformed or contradictory reads (case %#)", async ({ facts }) => {
    const reads = client(); reads.readContract.mockResolvedValue(facts);
    const result = await run(reads);
    expect(result).toMatchObject({ phase: "confirmed-awaiting-facts", blockNumber: block.number, blockHash: block.hash });
    expect(result).not.toHaveProperty("rawPet");
  });

  it("retains awaiting-facts only after a failed read's header recheck", async () => {
    const reads = client(); reads.readContract.mockRejectedValue(new Error("unavailable"));
    expect(await run(reads)).toMatchObject({ phase: "confirmed-awaiting-facts" });
    reads.getBlock.mockResolvedValueOnce(block).mockResolvedValue({ ...block, hash: otherHash });
    expect(await run(reads)).toMatchObject({ phase: "confirmation-unknown" });
  });

  it("does not carry an earlier awaiting-facts fallback across a contradictory retry", async () => {
    vi.useFakeTimers();
    const reads = client();
    reads.readContract.mockRejectedValue({ name: "TimeoutError" });
    reads.getTransaction.mockResolvedValueOnce(tx).mockResolvedValue(null);
    const result = run(reads);
    await vi.advanceTimersByTimeAsync(600);
    expect(await result).toMatchObject({ phase: "confirmation-unknown" });
  });

  it("bounds stalled reads without a signing call or late success", async () => {
    vi.useFakeTimers();
    const reads = client(); reads.readContract.mockImplementation(() => new Promise(() => {}));
    const result = run(reads);
    await vi.advanceTimersByTimeAsync(15001);
    expect(await result).toMatchObject({ phase: "confirmation-unknown" });
    expect(reads.getBlock).toHaveBeenCalledTimes(1);
  });

  it("independently verifies an allowed repriced replacement and exposes its effective record", async () => {
    const { readClient, event } = replacementFixture();
    expect(await run(readClient, { replacement: event })).toMatchObject({ phase: "confirmed", record: { transactionHash: otherHash }, effectiveRecord: { transactionHash: otherHash } });
  });

  it("never trusts a callback's claimed cancellation reason without the actual self-send", async () => {
    const { readClient, event } = replacementFixture();
    expect(await run(readClient, { replacement: { ...event, reason: "cancelled" } })).toMatchObject({ phase: "confirmed" });
    const cancelled = replacementFixture({ to: record.address, input: "0x" });
    expect(await run(cancelled.readClient, { replacement: cancelled.event })).toMatchObject({ phase: "cancelled", effectiveRecord: record });
    expect(cancelled.readClient.readContract).not.toHaveBeenCalled();
  });

  it.each([{ nonce: 8 }, { from: record.registryAddress }, { chainId: 1 }, { to: record.address, value: BigInt(1), input: "0x" }, { input: "0x1234" }])("keeps unverifiable or different replacement unresolved (case %#)", async (change) => {
    const { readClient, event } = replacementFixture(change);
    expect(await run(readClient, { replacement: event })).toMatchObject({ phase: "replaced", record, effectiveRecord: record, replacementHash: otherHash });
    expect(readClient.readContract).not.toHaveBeenCalled();
  });

  it("cannot prove replacement from a missing original transaction or a reorged receipt", async () => {
    const missing = replacementFixture(); missing.readClient.getTransaction.mockResolvedValue(null);
    expect(await run(missing.readClient, { replacement: missing.event })).toMatchObject({ phase: "replaced", record });
    const cancelled = replacementFixture({ to: record.address, input: "0x" });
    cancelled.readClient.getBlock.mockResolvedValueOnce(block).mockResolvedValue({ ...block, hash: otherHash });
    expect(await run(cancelled.readClient, { replacement: cancelled.event })).toMatchObject({ phase: "replaced", record });
  });
});
