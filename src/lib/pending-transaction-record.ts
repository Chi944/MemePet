export interface PendingTransactionScope {
  readonly chainId: number;
  readonly registryAddress: `0x${string}`;
  readonly address: `0x${string}`;
}

export interface PendingTransactionRecord extends PendingTransactionScope {
  readonly version: 1;
  readonly action: "adopt" | "care";
  readonly transactionHash: `0x${string}`;
}

const MAX_RECORD_BYTES = 1024;
const SCOPE_KEYS = ["chainId", "registryAddress", "address"] as const;
const RECORD_KEYS = ["version", "action", ...SCOPE_KEYS, "transactionHash"] as const;

/** Only accept own data fields, without invoking accessors or toJSON. */
function plainFields(value: unknown, keys: readonly string[]): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) return null;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return null;
  const actualKeys = Reflect.ownKeys(value);
  if (actualKeys.length !== keys.length || actualKeys.some((key) => typeof key !== "string" || !keys.includes(key))) {
    return null;
  }
  const fields: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) return null;
    fields[key] = descriptor.value;
  }
  return fields;
}

function nonzeroHex(value: unknown, bytes: number): `0x${string}` | null {
  if (typeof value !== "string" || value.length !== 2 + bytes * 2) return null;
  if (!value.startsWith("0x") || /[^0-9a-fA-F]/.test(value.slice(2)) || /^0x0+$/.test(value)) return null;
  return value.toLowerCase() as `0x${string}`;
}

function normalizedScope(fields: Record<string, unknown>): PendingTransactionScope | null {
  const chainId = fields.chainId;
  const registryAddress = nonzeroHex(fields.registryAddress, 20);
  const address = nonzeroHex(fields.address, 20);
  if (typeof chainId !== "number" || !Number.isSafeInteger(chainId) || chainId <= 0 || !registryAddress || !address) {
    return null;
  }
  return { chainId, registryAddress, address };
}

function normalizedRecord(value: unknown): PendingTransactionRecord | null {
  const fields = plainFields(value, RECORD_KEYS);
  if (!fields || fields.version !== 1 || (fields.action !== "adopt" && fields.action !== "care")) return null;
  const scope = normalizedScope(fields);
  const transactionHash = nonzeroHex(fields.transactionHash, 32);
  if (!scope || !transactionHash) return null;
  return { version: 1, action: fields.action, ...scope, transactionHash };
}

/** Pure preparation only: the caller owns storage and the acceptance gate. */
export function pendingTransactionStorageKey(scope: PendingTransactionScope): string | null {
  try {
    const fields = plainFields(scope, SCOPE_KEYS);
    const valid = fields && normalizedScope(fields);
    if (!valid) return null;
    return `memepet:pending-transaction:v1:${valid.chainId}:${valid.registryAddress}:${valid.address}`;
  } catch {
    return null;
  }
}

/** Reject untrusted, oversized or foreign records; this does not verify a transaction. */
export function parsePendingTransactionRecord(
  serialized: unknown,
  expectedScope: PendingTransactionScope,
): PendingTransactionRecord | null {
  if (typeof serialized !== "string" || serialized.length > MAX_RECORD_BYTES) return null;
  try {
    if (new TextEncoder().encode(serialized).byteLength > MAX_RECORD_BYTES) return null;
    const record = normalizedRecord(JSON.parse(serialized));
    const expectedKey = pendingTransactionStorageKey(expectedScope);
    if (!record || !expectedKey) return null;
    const recordKey = pendingTransactionStorageKey({
      chainId: record.chainId,
      registryAddress: record.registryAddress,
      address: record.address,
    });
    return recordKey === expectedKey ? record : null;
  } catch {
    return null;
  }
}

/** Serialize validated public fields only; reject rather than drop extra fields. */
export function serializePendingTransactionRecord(record: PendingTransactionRecord): string | null {
  try {
    const valid = normalizedRecord(record);
    return valid ? JSON.stringify(valid) : null;
  } catch {
    return null;
  }
}
