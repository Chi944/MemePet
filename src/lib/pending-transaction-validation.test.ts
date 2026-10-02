import { describe, expect, it } from "vitest";
import { encodeFunctionData } from "viem";
import type { PendingTransactionRecord, PendingTransactionScope } from "./pending-transaction-record";
import { validatePendingTransaction } from "./pending-transaction-validation";
import { petRegistryAbi } from "./pet-registry-abi";

const scope: PendingTransactionScope = {
  chainId: 1952,
  registryAddress: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
};
const careRecord: PendingTransactionRecord = {
  ...scope,
  version: 1,
  action: "care",
  transactionHash: `0x${"cd".repeat(32)}`,
};
const adoptRecord: PendingTransactionRecord = { ...careRecord, action: "adopt" };
const careInput = encodeFunctionData({ abi: petRegistryAbi, functionName: "care" });
const adoptInput = encodeFunctionData({ abi: petRegistryAbi, functionName: "adopt", args: [1] });

function transaction(overrides: Record<string, unknown> = {}) {
  return {
    chainId: scope.chainId,
    hash: careRecord.transactionHash,
    from: scope.address,
    to: scope.registryAddress,
    value: BigInt(0),
    input: careInput,
    ...overrides,
  };
}

function validate(value: unknown, record = careRecord) {
  return validatePendingTransaction(record, scope, value, scope.chainId);
}

describe("pending transaction identity validation (pure preparation; no wallet acceptance)", () => {
  it("matches zero-value care and approved-community adoption only", () => {
    expect(validate(transaction())).toEqual({ kind: "matched" });
    expect(validate(transaction({ input: adoptInput }), adoptRecord)).toEqual({ kind: "matched" });
  });

  it("compares equivalent hexadecimal bytes regardless of letter case", () => {
    const uppercase = (value: string) => `0x${value.slice(2).toUpperCase()}`;
    expect(validate(transaction({
      hash: uppercase(careRecord.transactionHash),
      from: uppercase(scope.address),
      to: uppercase(scope.registryAddress),
      input: uppercase(careInput),
    }))).toEqual({ kind: "matched" });
  });

  it.each([null, undefined, false, "0xabc", [], 1])("keeps a missing/malformed transaction unverified: %s", (value) => {
    expect(validate(value)).toEqual({ kind: "unverified", reason: "transaction" });
  });

  it.each([1, 0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1, "1952", null])(
    "rejects a foreign or invalid observed RPC chain: %s", (chainId) => {
      expect(validatePendingTransaction(careRecord, scope, transaction(), chainId as number)).toEqual({
        kind: "unverified", reason: "network",
      });
    },
  );

  it.each([1, undefined, null, "1952", "0x7a0", BigInt(1952)])(
    "requires a matching formatted transaction chain ID: %s", (chainId) => {
      expect(validate(transaction({ chainId }))).toEqual({ kind: "unverified", reason: "network" });
    },
  );

  it.each([
    { chainId: 1 },
    { address: "0xcccccccccccccccccccccccccccccccccccccccc" },
    { registryAddress: "0xcccccccccccccccccccccccccccccccccccccccc" },
  ])("refuses to associate a stored record from another active scope: %j", (change) => {
    expect(validatePendingTransaction(careRecord, { ...scope, ...change } as PendingTransactionScope, transaction(), scope.chainId)).toEqual({
      kind: "unverified", reason: "record",
    });
  });

  it.each([
    { version: 2 },
    { action: "approve" },
    { transactionHash: "0x1234" },
    { address: "not-an-address" },
    { chainId: "1952" },
    { confirmed: true },
  ])("revalidates malformed/extended records even if a caller bypasses types: %j", (change) => {
    expect(validate(transaction(), { ...careRecord, ...change } as unknown as PendingTransactionRecord)).toEqual({
      kind: "unverified", reason: "record",
    });
  });

  it.each([
    ["hash", `0x${"12".repeat(32)}`, "hash"],
    ["hash", `${careRecord.transactionHash}00`, "hash"],
    ["hash", `0X${careRecord.transactionHash.slice(2)}`, "hash"],
    ["from", "0xcccccccccccccccccccccccccccccccccccccccc", "sender"],
    ["from", null, "sender"],
    ["to", "0xcccccccccccccccccccccccccccccccccccccccc", "registry"],
    ["to", null, "registry"],
    ["to", `${scope.registryAddress} `, "registry"],
    ["value", BigInt(1), "value"],
    ["value", BigInt(-1), "value"],
    ["value", 0, "value"],
    ["value", "0x0", "value"],
    ["value", null, "value"],
  ])("rejects mismatched or malformed %s (%s)", (field, value, reason) => {
    expect(validate(transaction({ [field as string]: value }))).toEqual({ kind: "unverified", reason });
  });

  it.each([
    "0x",
    "0x12345678",
    `${careInput}00`,
    `${careInput}${"0".repeat(64)}`,
    `0X${careInput.slice(2)}`,
    careInput.slice(0, -1),
    adoptInput,
    encodeFunctionData({ abi: petRegistryAbi, functionName: "petOf", args: [scope.address] }),
    null,
  ])("rejects a different or noncanonical care payload: %s", (input) => {
    expect(validate(transaction({ input }))).toEqual({ kind: "unverified", reason: "call" });
  });

  it.each([
    careInput,
    encodeFunctionData({ abi: petRegistryAbi, functionName: "adopt", args: [0] }),
    encodeFunctionData({ abi: petRegistryAbi, functionName: "adopt", args: [2] }),
    `${adoptInput}00`,
    adoptInput.slice(0, -2),
  ])("rejects another action/community or malformed adoption payload: %s", (input) => {
    expect(validate(transaction({ input }), adoptRecord)).toEqual({ kind: "unverified", reason: "call" });
  });

  it("requires transaction fields, not just a successful receipt or matching hash", () => {
    expect(validate({ transactionHash: careRecord.transactionHash, status: "success" }).kind).toBe("unverified");
    expect(validate({ hash: careRecord.transactionHash }).kind).toBe("unverified");
    // Matching identity does not expose or establish progress/receipt status.
    expect(validate(transaction({ blockNumber: null, blockHash: null }))).toEqual({ kind: "matched" });
  });

  it("does not invoke getters or accept inherited identity fields", () => {
    let invoked = false;
    const accessor = Object.defineProperty(transaction(), "from", { get() { invoked = true; return scope.address; } });
    expect(validate(accessor).kind).toBe("unverified");
    expect(invoked).toBe(false);
    expect(validate(Object.create(transaction())).kind).toBe("unverified");
    const throwingProxy = new Proxy({}, { getOwnPropertyDescriptor() { throw new Error("unavailable"); } });
    expect(() => validate(throwingProxy)).not.toThrow();
    expect(validate(throwingProxy).kind).toBe("unverified");
  });

  it("does not mutate the supplied record, scope or transaction", () => {
    const frozenRecord = Object.freeze({ ...careRecord });
    const frozenScope = Object.freeze({ ...scope });
    const frozenTransaction = Object.freeze(transaction());
    expect(validatePendingTransaction(frozenRecord, frozenScope, frozenTransaction, scope.chainId)).toEqual({ kind: "matched" });
    expect(frozenRecord).toEqual(careRecord);
    expect(frozenScope).toEqual(scope);
  });
});
