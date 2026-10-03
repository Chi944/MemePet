import { createPublicClient, http, type ReplacementReturnType } from "viem";
import { chainFromDeployment } from "./chains";
import type { Deployment } from "./deployment";
import { petRegistryAbi, type PetOfResult } from "./pet-registry-abi";
import { APPROVED_COMMUNITY_ID } from "./pet-progress";
import { serializePendingTransactionRecord, type PendingTransactionRecord, type PendingTransactionScope } from "./pending-transaction-record";
import { validatePendingTransaction } from "./pending-transaction-validation";
import { validatePendingTransactionReceipt } from "./pending-transaction-receipt";
import { readWithBudget, RPC_READ_HTTP_OPTIONS } from "./read-budget";

type RecoveryBase = { readonly record: PendingTransactionRecord };
type ConfirmedBlock = { readonly blockNumber: bigint; readonly blockHash: `0x${string}` };
type RecoveryStep = RecoveryBase & (
  | { readonly phase: "pending" | "confirmation-unknown" | "reverted" | "cancelled" }
  | { readonly phase: "replaced"; readonly replacementHash: `0x${string}` }
  | ({ readonly phase: "confirmed-awaiting-facts" } & ConfirmedBlock)
  | ({ readonly phase: "confirmed"; readonly rawPet: PetOfResult; readonly chainTimeMs: number } & ConfirmedBlock)
);
export type PendingRecoveryResult = RecoveryStep & { readonly effectiveRecord: PendingTransactionRecord };
const exposed = (result: RecoveryStep): PendingRecoveryResult => ({ ...result, effectiveRecord: result.record });

/** Narrow, read-only injection seam. It deliberately exposes no wallet methods. */
export interface PendingRecoveryClient {
  getChainId(): Promise<number>;
  getTransaction(args: { hash: `0x${string}` }): Promise<unknown>;
  getTransactionReceipt(args: { hash: `0x${string}` }): Promise<unknown>;
  getBlock(args: { blockNumber: bigint }): Promise<unknown>;
  readContract(args: {
    address: `0x${string}`;
    abi: typeof petRegistryAbi;
    functionName: "petOf";
    args: readonly [`0x${string}`];
    blockNumber: bigint;
  }): Promise<unknown>;
}

function field(value: unknown, key: string): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return descriptor && "value" in descriptor ? descriptor.value : undefined;
}
function hash(value: unknown): `0x${string}` | undefined {
  return typeof value === "string" && /^0x[0-9a-fA-F]{64}$/.test(value) && !/^0x0+$/.test(value)
    ? value.toLowerCase() as `0x${string}` : undefined;
}
function addressEquals(value: unknown, expected: string): boolean {
  return typeof value === "string" && /^0x[0-9a-fA-F]{40}$/.test(value) && value.toLowerCase() === expected.toLowerCase();
}
function nonce(value: unknown): number | undefined {
  const result = field(value, "nonce");
  return typeof result === "number" && Number.isSafeInteger(result) && result >= 0 ? result : undefined;
}
function isNotFound(error: unknown): boolean {
  const name = field(error, "name");
  return name === "TransactionNotFoundError" || name === "TransactionReceiptNotFoundError";
}
function validTimestamp(block: unknown): bigint | undefined {
  const timestamp = field(block, "timestamp");
  return typeof timestamp === "bigint" && timestamp >= BigInt(0) && timestamp <= BigInt(8_640_000_000_000)
    ? timestamp : undefined;
}
function petFacts(value: unknown, action: PendingTransactionRecord["action"], timestamp: bigint): PetOfResult | undefined {
  if (!Array.isArray(value) || value.length !== 4) return;
  const [exists, communityId, careCount, lastCareDay] = value;
  if (exists !== true || communityId !== APPROVED_COMMUNITY_ID || typeof careCount !== "number" ||
      !Number.isInteger(careCount) || careCount < 0 || careCount > 0xffffffff || typeof lastCareDay !== "bigint" ||
      lastCareDay < BigInt(0) || lastCareDay > timestamp / BigInt(86_400) ||
      (careCount === 0 && lastCareDay !== BigInt(0)) ||
      (action === "care" && (careCount === 0 || lastCareDay !== timestamp / BigInt(86_400)))) return;
  return { exists, communityId, careCount, lastCareDay };
}

/** Inclusion for a replacement with different calldata, including a self-send cancellation. */
function replacementInclusion(transaction: unknown, receipt: unknown, block: unknown, txHash: string, owner: string): ConfirmedBlock | undefined {
  const number = field(receipt, "blockNumber");
  const blockHash = hash(field(receipt, "blockHash"));
  const index = field(receipt, "transactionIndex");
  if (typeof number !== "bigint" || number < BigInt(0) || !blockHash || typeof index !== "number" ||
      !Number.isSafeInteger(index) || index < 0 || hash(field(receipt, "transactionHash")) !== txHash ||
      !addressEquals(field(receipt, "from"), owner) || field(receipt, "to") !== field(transaction, "to") ||
      field(transaction, "blockNumber") !== number || hash(field(transaction, "blockHash")) !== blockHash ||
      field(transaction, "transactionIndex") !== index || field(block, "number") !== number || hash(field(block, "hash")) !== blockHash ||
      (field(receipt, "status") !== "success" && field(receipt, "status") !== "reverted")) return;
  return { blockNumber: number, blockHash };
}

/** Recover one public hash without signing, resubmitting, or trusting cached pet state. */
export async function resolvePendingTransaction({
  deployment, record, isCurrent, replacement, client: injectedClient,
}: {
  readonly deployment: Deployment;
  readonly record: PendingTransactionRecord;
  readonly isCurrent: () => boolean;
  readonly replacement?: ReplacementReturnType;
  readonly client?: PendingRecoveryClient;
}): Promise<PendingRecoveryResult | undefined> {
  let activeRecord = record;
  let fallback: RecoveryStep = { phase: "confirmation-unknown", record };
  const current = () => { try { return isCurrent(); } catch { return false; } };
  if (!current()) return;
  try {
    const serialized = serializePendingTransactionRecord(record);
    if (!serialized) return exposed(fallback);
    activeRecord = JSON.parse(serialized) as PendingTransactionRecord;
    fallback = { phase: "confirmation-unknown", record: activeRecord };
    const scope: PendingTransactionScope = { chainId: activeRecord.chainId, address: activeRecord.address, registryAddress: activeRecord.registryAddress };
    if (deployment.status === "not-deployed" || deployment.chainId !== scope.chainId ||
        !addressEquals(deployment.registryAddress, scope.registryAddress) || !deployment.rpcUrl) return exposed(fallback);
    const chain = chainFromDeployment(deployment);
    if (!chain) return exposed(fallback);
    const client: PendingRecoveryClient = injectedClient ?? createPublicClient({ chain, transport: http(deployment.rpcUrl, RPC_READ_HTTP_OPTIONS) });
    const observedReplacement = hash(field(field(replacement, "transaction"), "hash"));
    const unresolved: RecoveryStep = observedReplacement && observedReplacement !== activeRecord.transactionHash
      ? { phase: "replaced", record: activeRecord, replacementHash: observedReplacement }
      : { phase: "confirmation-unknown", record: activeRecord };
    const result = await readWithBudget(async (canRead): Promise<RecoveryStep | undefined> => {
      fallback = unresolved;
      if (!canRead()) return;
      const chainId = await client.getChainId();
      if (!canRead()) return;
      if (chainId !== scope.chainId) return { phase: "confirmation-unknown", record: activeRecord };
      let transaction: unknown;
      try { transaction = await client.getTransaction({ hash: activeRecord.transactionHash }); }
      catch (error) { if (!isNotFound(error)) throw error; }
      if (!canRead()) return;
      if (validatePendingTransaction(activeRecord, scope, transaction, chainId).kind !== "matched") return fallback;

      let followingRecord = activeRecord;
      let isCancellation = false;
      let isDifferentCall = false;
      if (replacement && observedReplacement && observedReplacement !== activeRecord.transactionHash) {
        fallback = { phase: "replaced", record: activeRecord, replacementHash: observedReplacement };
        const suppliedOriginal = field(replacement, "replacedTransaction");
        if (validatePendingTransaction(activeRecord, scope, suppliedOriginal, chainId).kind !== "matched" ||
            nonce(transaction) === undefined || nonce(suppliedOriginal) !== nonce(transaction)) return fallback;
        const candidate = await client.getTransaction({ hash: observedReplacement });
        if (!canRead()) return;
        if (hash(field(candidate, "hash")) !== observedReplacement || field(candidate, "chainId") !== chainId ||
            !addressEquals(field(candidate, "from"), scope.address) || nonce(candidate) !== nonce(transaction)) return fallback;
        followingRecord = { ...activeRecord, transactionHash: observedReplacement };
        const allowedCall = validatePendingTransaction(followingRecord, scope, candidate, chainId).kind === "matched";
        isCancellation = !allowedCall && addressEquals(field(candidate, "to"), scope.address) && field(candidate, "value") === BigInt(0) && field(candidate, "input") === "0x";
        isDifferentCall = !allowedCall && !isCancellation;
        transaction = candidate;
      } else if (replacement) {
        return fallback;
      }

      let receipt: unknown;
      try { receipt = await client.getTransactionReceipt({ hash: followingRecord.transactionHash }); }
      catch (error) { if (!isNotFound(error)) throw error; }
      if (!canRead()) return;
      if (!receipt) {
        if (replacement) return fallback;
        return field(transaction, "blockNumber") === null && field(transaction, "blockHash") === null
          ? { phase: "pending", record: activeRecord } : fallback;
      }
      const blockNumber = field(receipt, "blockNumber");
      if (typeof blockNumber !== "bigint" || blockNumber < BigInt(0)) return fallback;
      const block = await client.getBlock({ blockNumber });
      if (!canRead()) return;
      const validation = !isCancellation && !isDifferentCall
        ? validatePendingTransactionReceipt(followingRecord, scope, transaction, receipt, block, chainId)
        : undefined;
      const inclusion = validation?.kind === "receipt" ? validation :
        (isCancellation || isDifferentCall) ? replacementInclusion(transaction, receipt, block, followingRecord.transactionHash, scope.address) : undefined;
      if (!inclusion || validTimestamp(block) === undefined) return fallback;
      const recheck = async () => {
        if (!canRead()) return false;
        const checked = await client.getBlock({ blockNumber });
        if (!canRead()) return false;
        const checkedChain = await client.getChainId();
        return canRead() && checkedChain === chainId && field(checked, "number") === blockNumber &&
          hash(field(checked, "hash")) === inclusion.blockHash && validTimestamp(checked) === validTimestamp(block);
      };
      if (isCancellation || isDifferentCall || field(receipt, "status") === "reverted") {
        if (!await recheck()) return canRead() ? fallback : undefined;
        if (isCancellation && field(receipt, "status") === "success") return { phase: "cancelled", record: activeRecord };
        if (isCancellation || isDifferentCall) return fallback;
        return { phase: "reverted", record: followingRecord };
      }

      // Only validated allowed-call receipts may promote the record to a replacement hash.
      const confirmedBlock = { blockNumber: inclusion.blockNumber, blockHash: inclusion.blockHash };
      const awaiting: RecoveryStep = { phase: "confirmed-awaiting-facts", record: followingRecord, ...confirmedBlock };
      let rawPet: PetOfResult | undefined;
      const timestamp = validTimestamp(block);
      try {
        const raw = await client.readContract({ address: scope.registryAddress, abi: petRegistryAbi, functionName: "petOf", args: [scope.address], blockNumber });
        if (!canRead()) return;
        rawPet = timestamp === undefined ? undefined : petFacts(raw, followingRecord.action, timestamp);
      } catch (error) {
        // A failed fact read still needs a fresh header/chain check before its
        // receipt can remain visible as awaiting facts. Each new budget retry
        // resets fallback; an older successful attempt cannot mask a reorg.
        if (!canRead()) return;
        if (!await recheck()) {
          fallback = { phase: "confirmation-unknown", record: activeRecord };
          return canRead() ? fallback : undefined;
        }
        fallback = awaiting;
        throw error;
      }
      if (!await recheck()) {
        fallback = { phase: "confirmation-unknown", record: activeRecord };
        return canRead() ? fallback : undefined;
      }
      if (!rawPet || timestamp === undefined) return awaiting;
      return { phase: "confirmed", record: followingRecord, ...confirmedBlock, rawPet, chainTimeMs: Number(timestamp) * 1000 };
    }, current);
    return current() && result ? exposed(result) : undefined;
  } catch {
    return current() ? exposed(fallback) : undefined;
  }
}
