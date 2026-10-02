import { encodeFunctionData } from "viem";
import {
  parsePendingTransactionRecord,
  serializePendingTransactionRecord,
  type PendingTransactionRecord,
  type PendingTransactionScope,
} from "./pending-transaction-record";
import { APPROVED_COMMUNITY_ID } from "./pet-progress";
import { petRegistryAbi } from "./pet-registry-abi";

export type PendingTransactionValidation =
  | { readonly kind: "matched" }
  | {
      readonly kind: "unverified";
      readonly reason: "record" | "network" | "transaction" | "hash" | "sender" | "registry" | "value" | "call";
    };

const expectedInputs = {
  adopt: encodeFunctionData({
    abi: petRegistryAbi,
    functionName: "adopt",
    args: [APPROVED_COMMUNITY_ID],
  }),
  care: encodeFunctionData({ abi: petRegistryAbi, functionName: "care" }),
} as const;

function hexEquals(value: unknown, expected: string): boolean {
  return typeof value === "string" && value.length === expected.length &&
    /^0x[0-9a-fA-F]+$/.test(value) && value.toLowerCase() === expected.toLowerCase();
}

/** Read only own data fields; malformed objects/accessors are not RPC evidence. */
function transactionFields(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const fields: Record<string, unknown> = {};
  for (const name of ["chainId", "hash", "from", "to", "value", "input"]) {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    if (!descriptor || !("value" in descriptor)) return null;
    fields[name] = descriptor.value;
  }
  return fields;
}

/**
 * Associate a saved request with a viem-formatted public transaction. The caller
 * supplies the independently read RPC chain ID, not a chain inferred from the
 * stored record. Missing transactions or unverifiable fields stay unverified;
 * they do not prove a revert, cancellation or permission to submit again.
 *
 * A match is request identity only. It does not establish receipt confirmation
 * or pet progress; those still require receipt-bound fact reads. This helper
 * neither reads RPC/storage nor signs, sends, retries or persists anything.
 */
export function validatePendingTransaction(
  record: PendingTransactionRecord,
  scope: PendingTransactionScope,
  transaction: unknown,
  readChainId: number,
): PendingTransactionValidation {
  try {
    // Revalidate runtime callers rather than trusting TypeScript or local storage.
    const serialized = serializePendingTransactionRecord(record);
    const parsed = serialized === null ? null : parsePendingTransactionRecord(serialized, scope);
    if (!parsed) return { kind: "unverified", reason: "record" };
    if (!Number.isSafeInteger(readChainId) || readChainId <= 0 || readChainId !== parsed.chainId) {
      return { kind: "unverified", reason: "network" };
    }
    const fields = transactionFields(transaction);
    if (!fields) return { kind: "unverified", reason: "transaction" };
    if (fields.chainId !== readChainId) return { kind: "unverified", reason: "network" };
    if (!hexEquals(fields.hash, parsed.transactionHash)) return { kind: "unverified", reason: "hash" };
    if (!hexEquals(fields.from, parsed.address)) return { kind: "unverified", reason: "sender" };
    if (!hexEquals(fields.to, parsed.registryAddress)) return { kind: "unverified", reason: "registry" };
    if (fields.value !== BigInt(0)) return { kind: "unverified", reason: "value" };
    // Exact ABI encoding also rejects appended calldata and noncanonical padding.
    if (!hexEquals(fields.input, expectedInputs[parsed.action])) return { kind: "unverified", reason: "call" };
    return { kind: "matched" };
  } catch {
    return { kind: "unverified", reason: "transaction" };
  }
}
