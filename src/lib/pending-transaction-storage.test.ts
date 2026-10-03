import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadPendingTransaction, removePendingTransactionIfMatching, savePendingTransaction } from "./pending-transaction-storage";
import { pendingTransactionStorageKey, serializePendingTransactionRecord, type PendingTransactionRecord } from "./pending-transaction-record";

const scope = { chainId: 1952, registryAddress: `0x${"aa".repeat(20)}` as const, address: `0x${"bb".repeat(20)}` as const };
const record: PendingTransactionRecord = { ...scope, version: 1, action: "care", transactionHash: `0x${"cc".repeat(32)}` };
const replacement: PendingTransactionRecord = { ...record, transactionHash: `0x${"dd".repeat(32)}` };
const key = pendingTransactionStorageKey(scope)!;

beforeEach(() => localStorage.clear());
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("public pending-transaction journal", () => {
  it("stores and reloads only normalized public metadata", () => {
    expect(loadPendingTransaction(scope)).toEqual({ available: true, record: null });
    expect(savePendingTransaction(record)).toBe(true);
    expect(loadPendingTransaction(scope)).toEqual({ available: true, record });
    expect(localStorage.getItem(key)).toBe(serializePendingTransactionRecord(record));
    expect(Object.keys(JSON.parse(localStorage.getItem(key)!))).toEqual(["version", "action", "chainId", "registryAddress", "address", "transactionHash"]);
  });

  it("is idempotent but never overwrites another unresolved action/hash", () => {
    expect(savePendingTransaction(record)).toBe(true);
    expect(savePendingTransaction(record)).toBe(true);
    expect(savePendingTransaction(replacement)).toBe(false);
    expect(savePendingTransaction({ ...record, action: "adopt" })).toBe(false);
    expect(loadPendingTransaction(scope).record).toEqual(record);
  });

  it("allows a verified replacement only while the captured original still owns the journal", () => {
    savePendingTransaction(record);
    expect(savePendingTransaction(replacement, record.transactionHash)).toBe(true);
    expect(loadPendingTransaction(scope).record).toEqual(replacement);
    expect(savePendingTransaction(record, record.transactionHash)).toBe(false);
    expect(removePendingTransactionIfMatching(record)).toBe(false);
    expect(loadPendingTransaction(scope).record).toEqual(replacement);
    expect(removePendingTransactionIfMatching(replacement)).toBe(true);
  });

  it("does not turn expected-hash replacement into an unconditional insert", () => {
    expect(savePendingTransaction(replacement, record.transactionHash)).toBe(false);
    savePendingTransaction(record);
    expect(savePendingTransaction({ ...replacement, action: "adopt" }, record.transactionHash)).toBe(false);
    expect(savePendingTransaction(replacement, "0x01")).toBe(false);
    expect(loadPendingTransaction(scope).record).toEqual(record);
  });

  it("isolates chain, registry and owner scopes", () => {
    savePendingTransaction(record);
    for (const other of [{ ...scope, chainId: 31337 }, { ...scope, address: scope.registryAddress }, { ...scope, registryAddress: scope.address }]) {
      expect(loadPendingTransaction(other).record).toBeNull();
      expect(removePendingTransactionIfMatching({ ...record, ...other })).toBe(false);
    }
    expect(loadPendingTransaction(scope).record).toEqual(record);
  });

  it.each(["{", "null", " ".repeat(1025), JSON.stringify({ ...record, transactionHash: "bad" })])("contains malformed records without deleting or overwriting them", (value) => {
    localStorage.setItem(key, value);
    expect(loadPendingTransaction(scope)).toEqual({ available: true, record: null });
    expect(savePendingTransaction(record)).toBe(false);
    expect(removePendingTransactionIfMatching(record)).toBe(false);
    expect(localStorage.getItem(key)).toBe(value);
  });

  it("does not inspect or persist accessor/extra fields", () => {
    let calls = 0;
    const bad = Object.defineProperty({ ...record }, "action", { get() { calls++; return "care"; } });
    expect(savePendingTransaction(bad)).toBe(false);
    expect(removePendingTransactionIfMatching(bad)).toBe(false);
    expect(savePendingTransaction({ ...record, signature: "not-for-storage" } as PendingTransactionRecord)).toBe(false);
    expect(calls).toBe(0);
    expect(localStorage.length).toBe(0);
  });

  it("contains unavailable storage, quota and removal errors", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => { throw new Error("blocked"); });
    expect(loadPendingTransaction(scope)).toEqual({ available: false, record: null });
    expect(savePendingTransaction(record)).toBe(false);
    expect(removePendingTransactionIfMatching(record)).toBe(false);
    vi.restoreAllMocks();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    expect(savePendingTransaction(record)).toBe(false);
    vi.restoreAllMocks();
    savePendingTransaction(record);
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("blocked"); });
    expect(removePendingTransactionIfMatching(record)).toBe(false);
    expect(loadPendingTransaction(scope).record).toEqual(record);
  });

  it("works safely without a browser and with invalid scopes", () => {
    expect(loadPendingTransaction({ ...scope, chainId: 0 }).available).toBe(false);
    vi.stubGlobal("window", undefined);
    expect(loadPendingTransaction(scope)).toEqual({ record: null, available: false });
    expect(savePendingTransaction(record)).toBe(false);
    expect(removePendingTransactionIfMatching(record)).toBe(false);
  });

  it("rechecks ownership immediately before replacing or deleting", () => {
    const getter = vi.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(serializePendingTransactionRecord(record)).mockReturnValue(serializePendingTransactionRecord(replacement));
    const setter = vi.spyOn(Storage.prototype, "setItem");
    const remover = vi.spyOn(Storage.prototype, "removeItem");
    expect(savePendingTransaction(replacement, record.transactionHash)).toBe(false);
    getter.mockReset().mockReturnValueOnce(serializePendingTransactionRecord(record)).mockReturnValue(serializePendingTransactionRecord(replacement));
    expect(removePendingTransactionIfMatching(record)).toBe(false);
    expect(setter).not.toHaveBeenCalled();
    expect(remover).not.toHaveBeenCalled();
  });
});
