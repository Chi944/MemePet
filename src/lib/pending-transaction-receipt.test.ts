import { describe, expect, it } from "vitest";
import { encodeFunctionData } from "viem";
import { petRegistryAbi } from "./pet-registry-abi";
import type { PendingTransactionRecord, PendingTransactionScope } from "./pending-transaction-record";
import { validatePendingTransactionReceipt } from "./pending-transaction-receipt";

const scope: PendingTransactionScope = {
  chainId: 1952,
  registryAddress: `0x${"aa".repeat(20)}`,
  address: `0x${"bb".repeat(20)}`,
};
const record: PendingTransactionRecord = {
  ...scope, version: 1, action: "care", transactionHash: `0x${"cd".repeat(32)}`,
};
const header = { number: BigInt(420), hash: `0x${"ef".repeat(32)}` };
const tx = {
  chainId: scope.chainId, hash: record.transactionHash, from: scope.address,
  to: scope.registryAddress, value: BigInt(0),
  input: encodeFunctionData({ abi: petRegistryAbi, functionName: "care" }),
  blockNumber: header.number, blockHash: header.hash, transactionIndex: 2,
};
const receipt = {
  transactionHash: record.transactionHash, from: scope.address, to: scope.registryAddress,
  blockNumber: header.number, blockHash: header.hash, transactionIndex: 2, status: "success",
};
const otherHash = `0x${"12".repeat(32)}`;
const validate = (transaction: unknown = tx, result: unknown = receipt, block: unknown = header) =>
  validatePendingTransactionReceipt(record, scope, transaction, result, block, scope.chainId);

describe("pending receipt validation (pure preparation, not genuine wallet acceptance)", () => {
  it.each(["success", "reverted"])("identifies a matching %s receipt without awarding progress", (status) => {
    expect(validate(tx, { ...receipt, status })).toEqual({
      kind: "receipt", status, blockNumber: header.number, blockHash: header.hash,
    });
  });

  it("also validates approved-community adoption through the existing identity guard", () => {
    const adoption = { ...record, action: "adopt" as const };
    const input = encodeFunctionData({ abi: petRegistryAbi, functionName: "adopt", args: [1] });
    expect(validatePendingTransactionReceipt(adoption, scope, { ...tx, input }, receipt, header, 1952).kind).toBe("receipt");
    expect(validatePendingTransactionReceipt(adoption, scope, tx, receipt, header, 1952)).toEqual({ kind: "unverified", reason: "transaction" });
  });

  it("cannot use a successful receipt to bypass transaction identity or network validation", () => {
    for (const changed of [{ value: BigInt(1) }, { input: "0x" }, { hash: otherHash }, { from: scope.registryAddress }, { to: scope.address }]) {
      expect(validate({ ...tx, ...changed })).toEqual({ kind: "unverified", reason: "transaction" });
    }
    expect(validatePendingTransactionReceipt(record, scope, tx, receipt, header, 1)).toEqual({ kind: "unverified", reason: "transaction" });
    expect(validatePendingTransactionReceipt(record, { ...scope, address: scope.registryAddress }, tx, receipt, header, 1952).kind).toBe("unverified");
  });

  it.each([null, false, [], "0x01", {}])("keeps missing/malformed receipts unknown: %j", (value) => {
    expect(validate(tx, value)).toEqual({ kind: "unverified", reason: "receipt" });
  });

  it.each([
    { transactionHash: otherHash }, { transactionHash: `${record.transactionHash}00` },
    { from: scope.registryAddress }, { to: scope.address }, { to: null },
  ])("rejects a receipt for another transaction or contract: %j", (change) => {
    expect(validate(tx, { ...receipt, ...change })).toEqual({ kind: "unverified", reason: "receipt" });
  });

  it.each([
    { blockNumber: null, blockHash: null, transactionIndex: null },
    { blockHash: otherHash }, { blockNumber: BigInt(419) }, { transactionIndex: 1 },
  ])("keeps pending or contradictory transaction inclusion unknown: %s", (change) => {
    expect(validate({ ...tx, ...change })).toEqual({ kind: "unverified", reason: "inclusion" });
  });

  it.each([
    { blockNumber: 420 }, { blockNumber: "0x1a4" }, { blockNumber: BigInt(-1) },
    { blockHash: `0x${"00".repeat(32)}` }, { blockHash: "0x12" },
    { transactionIndex: -1 }, { transactionIndex: "2" }, { transactionIndex: 0.5 },
    { transactionIndex: Number.MAX_SAFE_INTEGER + 1 },
  ])("rejects malformed inclusion even when transaction and receipt agree: %s", (change) => {
    expect(validate({ ...tx, ...change }, { ...receipt, ...change })).toEqual({ kind: "unverified", reason: "inclusion" });
  });

  it.each([null, {}, { number: BigInt(421), hash: header.hash }, { number: 420, hash: header.hash }, { ...header, hash: otherHash }])(
    "requires a matching freshly observed block header: %s", (block) => {
      expect(validate(tx, receipt, block)).toEqual({ kind: "unverified", reason: "block" });
    },
  );

  it.each([null, 0, 1, "0x1", "pending", "cancelled", "replaced", "SUCCESS"])("does not infer success or cancellation from status %s", (status) => {
    expect(validate(tx, { ...receipt, status })).toEqual({ kind: "unverified", reason: "status" });
  });

  it("compares hexadecimal bytes case-insensitively and returns a normalized block hash", () => {
    const upper = (s: string) => `0x${s.slice(2).toUpperCase()}`;
    expect(validate(tx, { ...receipt, transactionHash: upper(record.transactionHash), from: upper(scope.address), to: upper(scope.registryAddress), blockHash: upper(header.hash) })).toEqual({
      kind: "receipt", status: "success", blockNumber: header.number, blockHash: header.hash,
    });
  });

  it("does not invoke getters or accept inherited fields", () => {
    let reads = 0;
    const accessor = Object.defineProperty({ ...receipt }, "status", { get() { reads++; return "success"; } });
    expect(validate(tx, accessor).kind).toBe("unverified");
    expect(validate(tx, Object.create(receipt)).kind).toBe("unverified");
    expect(validate(Object.create(tx)).kind).toBe("unverified");
    expect(validate(tx, receipt, Object.create(header)).kind).toBe("unverified");
    expect(reads).toBe(0);
  });

  it("treats throwing/revoked evidence objects as unknown without leaking their error", () => {
    const bad = Proxy.revocable({}, {}); bad.revoke();
    for (const value of [validate(bad.proxy), validate(tx, bad.proxy), validate(tx, receipt, bad.proxy)]) {
      expect(value.kind).toBe("unverified");
      expect(Object.keys(value).sort()).toEqual(["kind", "reason"]);
    }
  });

  it("does not mutate evidence or silently promote a missing receipt to failure", () => {
    const inputs = [Object.freeze({ ...tx }), Object.freeze({ ...receipt }), Object.freeze({ ...header })] as const;
    expect(validate(...inputs).kind).toBe("receipt");
    expect(validate(tx, null)).toEqual({ kind: "unverified", reason: "receipt" });
  });
});
