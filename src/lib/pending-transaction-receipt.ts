import type { PendingTransactionRecord, PendingTransactionScope } from "./pending-transaction-record";
import { validatePendingTransaction } from "./pending-transaction-validation";

export type PendingReceiptValidation =
  | { readonly kind: "unverified"; readonly reason: "transaction" | "receipt" | "inclusion" | "block" | "status" }
  | {
      readonly kind: "receipt";
      readonly status: "success" | "reverted";
      readonly blockNumber: bigint;
      readonly blockHash: `0x${string}`;
    };

/** Do not execute accessors on malformed evidence objects. */
function fields(value: unknown, names: readonly string[]): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    if (!descriptor || !("value" in descriptor)) return null;
    result[name] = descriptor.value;
  }
  return result;
}

function hash(value: unknown): `0x${string}` | null {
  return typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value) && !/^0x0+$/.test(value)
    ? value.toLowerCase() as `0x${string}` : null;
}

function sameAddress(value: unknown, expected: string): boolean {
  return typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value) &&
    value.toLowerCase() === expected.toLowerCase();
}

/**
 * Pure B5 preparation, not runtime recovery. Inputs are viem-formatted reads
 * from the selected RPC: transaction, receipt and a fresh header fetched by
 * receipt block NUMBER (not by hash). A missing/contradictory read is unknown,
 * never evidence of a dropped transaction, cancellation or permission to resend.
 *
 * A successful result only identifies a receipt in the observed block. It is
 * not finality or pet progress. The future caller must guard the active session,
 * read facts at this block, recheck its hash, and preserve awaiting-facts on
 * failure. This helper has no I/O, persistence, wallet access or live imports.
 */
export function validatePendingTransactionReceipt(
  record: PendingTransactionRecord,
  scope: PendingTransactionScope,
  transaction: unknown,
  receipt: unknown,
  block: unknown,
  readChainId: number,
): PendingReceiptValidation {
  try {
    if (validatePendingTransaction(record, scope, transaction, readChainId).kind !== "matched") {
      return { kind: "unverified", reason: "transaction" };
    }
    const mined = fields(transaction, ["blockNumber", "blockHash", "transactionIndex"]);
    const received = fields(receipt, ["transactionHash", "from", "to", "blockNumber", "blockHash", "transactionIndex", "status"]);
    if (!received || hash(received.transactionHash) !== hash(record.transactionHash) ||
        !sameAddress(received.from, record.address) || !sameAddress(received.to, record.registryAddress)) {
      return { kind: "unverified", reason: "receipt" };
    }
    const blockHash = hash(received.blockHash);
    const blockNumber = received.blockNumber;
    const index = received.transactionIndex;
    if (!mined || !blockHash || typeof blockNumber !== "bigint" || blockNumber < BigInt(0) ||
        typeof index !== "number" || !Number.isSafeInteger(index) || index < 0 ||
        mined.blockNumber !== blockNumber || hash(mined.blockHash) !== blockHash || mined.transactionIndex !== index) {
      return { kind: "unverified", reason: "inclusion" };
    }
    const header = fields(block, ["number", "hash"]);
    if (!header || header.number !== blockNumber || hash(header.hash) !== blockHash) {
      return { kind: "unverified", reason: "block" };
    }
    if (received.status !== "success" && received.status !== "reverted") {
      return { kind: "unverified", reason: "status" };
    }
    return { kind: "receipt", status: received.status, blockNumber, blockHash };
  } catch {
    return { kind: "unverified", reason: "receipt" };
  }
}
