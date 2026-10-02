import { describe, expect, it } from "vitest";
import {
  parsePendingTransactionRecord,
  pendingTransactionStorageKey,
  serializePendingTransactionRecord,
  type PendingTransactionRecord,
  type PendingTransactionScope,
} from "./pending-transaction-record";

const scope: PendingTransactionScope = {
  chainId: 1952,
  registryAddress: "0xAbCd000000000000000000000000000000000000",
  address: "0xEf12000000000000000000000000000000000000",
};
const record: PendingTransactionRecord = {
  version: 1,
  action: "care",
  ...scope,
  transactionHash: `0x${"AB".repeat(32)}`,
};
const canonical: PendingTransactionRecord = {
  ...record,
  registryAddress: scope.registryAddress.toLowerCase() as `0x${string}`,
  address: scope.address.toLowerCase() as `0x${string}`,
  transactionHash: record.transactionHash.toLowerCase() as `0x${string}`,
};

describe("pending transaction record preparation (pure, recovery not enabled)", () => {
  it.each(["adopt", "care"] as const)("round-trips %s with only normalized public metadata", (action) => {
    const input = Object.freeze({ ...record, action });
    const serialized = serializePendingTransactionRecord(input);
    expect(serialized).toBe(JSON.stringify({ ...canonical, action }));
    expect(parsePendingTransactionRecord(serialized, scope)).toEqual({ ...canonical, action });
    expect(input.transactionHash).toBe(record.transactionHash);
    expect(Object.keys(JSON.parse(serialized!))).toEqual([
      "version", "action", "chainId", "registryAddress", "address", "transactionHash",
    ]);
  });

  it("uses a stable, case-normalized key scoped by chain, registry and account", () => {
    const key = pendingTransactionStorageKey(scope);
    expect(key).toBe(`memepet:pending-transaction:v1:1952:${canonical.registryAddress}:${canonical.address}`);
    expect(pendingTransactionStorageKey({
      chainId: record.chainId,
      registryAddress: canonical.registryAddress,
      address: canonical.address,
    })).toBe(key);
    for (const otherScope of [
      { ...scope, chainId: 31337 },
      { ...scope, registryAddress: scope.address },
      { ...scope, address: scope.registryAddress },
    ]) {
      expect(pendingTransactionStorageKey(otherScope)).not.toBe(key);
      expect(parsePendingTransactionRecord(JSON.stringify(record), otherScope)).toBeNull();
    }
  });

  it.each([null, undefined, 1, {}, [], "", "{", "null", "[]", "true", "0", '"text"'])(
    "rejects missing or malformed serialized input %j",
    (serialized) => expect(parsePendingTransactionRecord(serialized, scope)).toBeNull(),
  );

  it("enforces the input size bound before parsing even valid JSON with padding", () => {
    const serialized = JSON.stringify(record);
    expect(parsePendingTransactionRecord(serialized.padEnd(1024), scope)).toEqual(canonical);
    expect(parsePendingTransactionRecord(serialized.padEnd(1025), scope)).toBeNull();
    expect(parsePendingTransactionRecord(" ".repeat(100_000) + serialized, scope)).toBeNull();
  });

  it.each([
    { version: 2 }, { version: "1" }, { action: "approve" }, { action: "CARE" },
    { chainId: 0 }, { chainId: -1 }, { chainId: 1.5 }, { chainId: "1952" },
    { chainId: Number.MAX_SAFE_INTEGER + 1 }, { chainId: Number.NaN }, { chainId: Infinity },
    { registryAddress: `0x${"0".repeat(40)}` }, { address: `0x${"0".repeat(40)}` },
    { registryAddress: "0x123" }, { address: `0x${"g".repeat(40)}` },
    { address: `0X${"a".repeat(40)}` }, { address: `${scope.address} ` },
    { address: `0x${"a".repeat(39)}\n` },
    { transactionHash: `0x${"0".repeat(64)}` }, { transactionHash: `0x${"a".repeat(63)}` },
    { transactionHash: `0x${"g".repeat(64)}` }, { transactionHash: `${record.transactionHash}\n` },
  ])("rejects invalid fields %j in parsing and serialization", (overrides) => {
    const invalid = { ...record, ...overrides } as PendingTransactionRecord;
    expect(parsePendingTransactionRecord(JSON.stringify(invalid), scope)).toBeNull();
    expect(serializePendingTransactionRecord(invalid)).toBeNull();
  });

  it.each(["timestamp", "amount", "signature", "privateKey", "growthPoints", "providerSessionKey", "toJSON"])(
    "rejects unrecognized %s instead of preserving or silently ignoring it",
    (field) => {
      const extra = { ...record, [field]: "not-allowed" };
      expect(parsePendingTransactionRecord(JSON.stringify(extra), scope)).toBeNull();
      expect(serializePendingTransactionRecord(extra)).toBeNull();
    },
  );

  it("rejects missing fields and prototype-shaped JSON keys", () => {
    for (const field of Object.keys(record)) {
      const missing: Record<string, unknown> = { ...record };
      delete missing[field];
      expect(parsePendingTransactionRecord(JSON.stringify(missing), scope)).toBeNull();
      expect(serializePendingTransactionRecord(missing as unknown as PendingTransactionRecord)).toBeNull();
    }
    const serialized = JSON.stringify(record);
    expect(parsePendingTransactionRecord(serialized.slice(0, -1) + ',"__proto__":{}}', scope)).toBeNull();
  });

  it("rejects inherited fields, extra symbols and accessors without executing them", () => {
    const inherited = Object.create(record) as PendingTransactionRecord;
    const withSymbol = { ...record, [Symbol("extra")]: true };
    const accessor = { ...record };
    let invoked = false;
    Object.defineProperty(accessor, "action", { get() { invoked = true; return "care"; } });
    expect(serializePendingTransactionRecord(inherited)).toBeNull();
    expect(serializePendingTransactionRecord(withSymbol)).toBeNull();
    expect(serializePendingTransactionRecord(accessor)).toBeNull();
    expect(invoked).toBe(false);
  });

  it("fails closed for invalid scope metadata and object inspection errors", () => {
    const invalidScopes = [
      null, { ...scope, chainId: 0 }, { ...scope, address: "0x123" },
      { ...scope, providerSessionKey: "temporary-session" },
      new Proxy(scope, { getPrototypeOf() { throw new Error("unavailable"); } }),
    ];
    for (const invalid of invalidScopes) {
      expect(pendingTransactionStorageKey(invalid as PendingTransactionScope)).toBeNull();
      expect(parsePendingTransactionRecord(JSON.stringify(record), invalid as PendingTransactionScope)).toBeNull();
    }
    const inaccessible = new Proxy(record, { ownKeys() { throw new Error("unavailable"); } });
    expect(serializePendingTransactionRecord(inaccessible)).toBeNull();
  });
});
