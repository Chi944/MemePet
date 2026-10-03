import {
  parsePendingTransactionRecord,
  pendingTransactionStorageKey,
  serializePendingTransactionRecord,
  type PendingTransactionRecord,
  type PendingTransactionScope,
} from "./pending-transaction-record";

function scopeOf(record: PendingTransactionRecord): PendingTransactionScope {
  return { chainId: record.chainId, registryAddress: record.registryAddress, address: record.address };
}

/** Storage failures never turn a submitted transaction into a failed transaction. */
export function loadPendingTransaction(scope: PendingTransactionScope): {
  readonly record: PendingTransactionRecord | null;
  readonly available: boolean;
} {
  try {
    const key = pendingTransactionStorageKey(scope);
    if (!key || typeof window === "undefined") return { record: null, available: false };
    const serialized = window.localStorage.getItem(key);
    return { record: parsePendingTransactionRecord(serialized, scope), available: true };
  } catch {
    return { record: null, available: false };
  }
}

/** Never replace a different unresolved hash or silently discard malformed data. */
export function savePendingTransaction(record: PendingTransactionRecord, expectedHash?: `0x${string}`): boolean {
  try {
    const serialized = serializePendingTransactionRecord(record);
    if (!serialized || typeof window === "undefined") return false;
    const normalized = JSON.parse(serialized) as PendingTransactionRecord;
    const scope = scopeOf(normalized);
    const key = pendingTransactionStorageKey(scope);
    if (!key) return false;
    const storage = window.localStorage;
    const existing = storage.getItem(key);
    if (expectedHash !== undefined) {
      if (typeof expectedHash !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(expectedHash) || /^0x0+$/.test(expectedHash)) return false;
      const previous = parsePendingTransactionRecord(existing, scope);
      if (!previous || previous.transactionHash !== expectedHash.toLowerCase() || previous.action !== normalized.action) return false;
      if (storage.getItem(key) !== existing) return false;
      storage.setItem(key, serialized);
      return storage.getItem(key) === serialized;
    }
    if (existing !== null) {
      const parsed = parsePendingTransactionRecord(existing, scope);
      return parsed !== null && serializePendingTransactionRecord(parsed) === serialized;
    }
    // Recheck just before mutation, then verify the saved value. localStorage is
    // synchronous but is not a cross-tab compare-and-swap primitive.
    if (storage.getItem(key) !== null) return false;
    storage.setItem(key, serialized);
    return storage.getItem(key) === serialized;
  } catch {
    return false;
  }
}

/** A stale completion can remove only the exact scope, action and hash it owns. */
export function removePendingTransactionIfMatching(record: PendingTransactionRecord): boolean {
  try {
    const serialized = serializePendingTransactionRecord(record);
    if (!serialized || typeof window === "undefined") return false;
    const normalized = JSON.parse(serialized) as PendingTransactionRecord;
    const scope = scopeOf(normalized);
    const key = pendingTransactionStorageKey(scope);
    if (!key) return false;
    const storage = window.localStorage;
    const current = storage.getItem(key);
    const parsed = parsePendingTransactionRecord(current, scope);
    if (!parsed || serializePendingTransactionRecord(parsed) !== serialized) return false;
    if (storage.getItem(key) !== current) return false;
    storage.removeItem(key);
    return storage.getItem(key) === null;
  } catch {
    return false;
  }
}
