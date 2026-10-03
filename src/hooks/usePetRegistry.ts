"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type Address,
  createPublicClient,
  http,
  type Hash,
  type WalletClient,
  type ReplacementReturnType,
} from "viem";
import { careCooldownAvailableAtIso } from "@/lib/care-cooldown";
import { APPROVED_COMMUNITY_ID } from "@/lib/pet-progress";
import { mapPetOfToViewModel } from "@/lib/map-pet";
import { petRegistryAbi, type PetOfResult } from "@/lib/pet-registry-abi";
import type { Deployment } from "@/lib/deployment";
import { chainFromDeployment } from "@/lib/chains";
import { readWithBudget, RPC_READ_HTTP_OPTIONS } from "@/lib/read-budget";
import { pendingTransactionStorageKey, type PendingTransactionRecord, type PendingTransactionScope } from "@/lib/pending-transaction-record";
import { loadPendingTransaction, savePendingTransaction, removePendingTransactionIfMatching } from "@/lib/pending-transaction-storage";
import { resolvePendingTransaction, type PendingRecoveryResult } from "@/lib/pending-transaction-recovery";
import type { TransactionRecoveryState } from "@/types/beta";
import type { PetViewModel } from "@/types/view-models";

export type PetReadStatus = "idle" | "loading" | "ready" | "error";

export type TxPhase =
  | "idle"
  | "awaiting-signature"
  | "submitting"
  | "pending"
  | "success"
  | "error"
  | "rejected";

type UsePetRegistryArgs = {
  readonly deployment: Deployment;
  readonly address: Address | null;
  readonly wrongChain: boolean;
  /** A provider change is a new live session even for the same address/chain. */
  readonly providerSessionKey?: string;
  readonly createWalletClient: () => WalletClient | null;
};

type PetSnapshot = {
  readonly readStatus: PetReadStatus;
  readonly readErrorMessage: string | null;
  readonly pet: PetViewModel | null;
  readonly hasPet: boolean;
  readonly rawPet: PetOfResult | null;
  readonly chainTimeMs: number | null;
};

const emptySnapshot: PetSnapshot = {
  readStatus: "idle",
  readErrorMessage: null,
  pet: null,
  hasPet: false,
  rawPet: null,
  chainTimeMs: null,
};

type WalletSession = {
  readonly key: string;
  active: boolean;
  operation: object | null;
  revision: number;
  retryingRead: boolean;
  pendingRecord: PendingTransactionRecord | null;
  replacement?: ReplacementReturnType;
  /** Never let a lagging replica undo this session's confirmed transaction. */
  minimumBlockNumber?: bigint;
};

const RECOVERY_STORAGE_MESSAGE = "Transaction recovery storage is unavailable or could not be updated. Keep any returned public transaction hash before leaving this page.";
export const RECEIPT_WAIT_TIMEOUT_MS = 60_000;

function recordScope(record: PendingTransactionRecord): PendingTransactionScope {
  return { chainId: record.chainId, registryAddress: record.registryAddress, address: record.address };
}

function explorerLink(deployment: Deployment, hash: string): string | null {
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash) || !deployment.explorerBaseUrl) return null;
  try {
    const url = new URL(deployment.explorerBaseUrl);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    url.pathname = `${url.pathname.replace(/\/$/, "")}/tx/${hash}`;
    url.search = "";
    url.hash = "";
    return url.href;
  } catch { return null; }
}

function recoveryView(
  deployment: Deployment,
  result: PendingRecoveryResult | { phase: "checking" | "pending" | "confirmation-unknown"; record: PendingTransactionRecord },
): TransactionRecoveryState {
  const common = {
    kind: "tracking" as const, action: result.record.action,
    transactionHash: result.record.transactionHash,
    explorerUrl: explorerLink(deployment, result.record.transactionHash),
    networkLabel: deployment.networkName ?? "Configured network", dataMode: "live" as const,
  };
  return result.phase === "replaced"
    ? { ...common, phase: "replaced", replacementHash: result.replacementHash,
      replacementExplorerUrl: explorerLink(deployment, result.replacementHash) }
    : { ...common, phase: result.phase };
}

function isUserRejection(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    /user rejected|denied|rejected the request/i.test(message) ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      Number((error as { code: number }).code) === 4001)
  );
}

export function usePetRegistry({
  deployment,
  address,
  wrongChain,
  providerSessionKey = "",
  createWalletClient,
}: UsePetRegistryArgs) {
  const cacheKey = `${providerSessionKey}:${address ?? "none"}:${deployment.chainId ?? "none"}:${deployment.registryAddress ?? "none"}:${wrongChain ? "wrong" : "ok"}:${deployment.rpcUrl ?? "none"}`;
  const [activeKey, setActiveKey] = useState(cacheKey);
  const [snapshot, setSnapshot] = useState<PetSnapshot>(emptySnapshot);
  const [txPhase, setTxPhase] = useState<TxPhase>("idle");
  const [txKind, setTxKind] = useState<"idle" | "adopt" | "care">("idle");
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const [confirmedBlockNumber, setConfirmedBlockNumber] = useState<bigint | undefined>();
  const [txErrorMessage, setTxErrorMessage] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [celebrateStageUp, setCelebrateStageUp] = useState(false);
  const sessionRef = useRef<WalletSession | null>(null);
  // A storage failure must not hide a returned hash. No game facts are persisted.
  const memoryRecords = useRef(new Map<string, PendingTransactionRecord>());
  const [recoveryState, setRecoveryState] = useState<TransactionRecoveryState>({ kind: "idle" });
  const [recoveryStorageMessage, setRecoveryStorageMessage] = useState<string | null>(null);

  if (activeKey !== cacheKey) {
    setActiveKey(cacheKey);
    setSnapshot(emptySnapshot);
    setTxPhase("idle");
    setTxKind("idle");
    setTransactionHash(undefined);
    setConfirmedBlockNumber(undefined);
    setTxErrorMessage(null);
    setCelebrateStageUp(false);
    setRecoveryState({ kind: "idle" });
    setRecoveryStorageMessage(null);
  }

  // chainFromDeployment builds a fresh object for any chain id outside X Layer,
  // and this value is an effect dependency: an unstable identity re-fires the
  // read on every render. getActiveDeployment is now cached, so this is stable.
  const chain = useMemo(() => chainFromDeployment(deployment), [deployment]);
  const registryAddress = deployment.registryAddress as Address | null;

  const scope = useMemo<PendingTransactionScope | null>(() =>
    address && registryAddress && chain && !wrongChain
      ? { chainId: chain.id, registryAddress, address } : null,
  [address, registryAddress, chain, wrongChain]);

  const resolveRecord = useCallback(async (
    session: WalletSession, record: PendingTransactionRecord, isCurrent: () => boolean,
    stageBeforeCare: PetViewModel["stage"] | null = null,
  ) => {
    let result: PendingRecoveryResult | undefined;
    try {
      result = await resolvePendingTransaction({ deployment, record, isCurrent, replacement: session.replacement });
    } catch {
      if (isCurrent()) {
        setRecoveryState(recoveryView(deployment, { phase: "confirmation-unknown", record }));
        setTxPhase("idle");
      }
      return;
    }
    if (!result || !isCurrent()) return;
    const originalKey = pendingTransactionStorageKey(recordScope(record));
    const verifiedRecord = result.record;
    // Only the resolver's verified allowed-call replacement can become this journal.
    if (verifiedRecord.transactionHash !== record.transactionHash) {
      if (!savePendingTransaction(verifiedRecord, record.transactionHash)) setRecoveryStorageMessage(RECOVERY_STORAGE_MESSAGE);
      if (originalKey) memoryRecords.current.set(originalKey, verifiedRecord);
      session.pendingRecord = verifiedRecord;
      session.replacement = undefined;
    }
    setRecoveryState(recoveryView(deployment, result));
    setTransactionHash(verifiedRecord.transactionHash);
    setTxKind(verifiedRecord.action);
    setTxErrorMessage(null);
    if (result.phase === "confirmed" || result.phase === "confirmed-awaiting-facts") {
      session.minimumBlockNumber = result.blockNumber;
      setConfirmedBlockNumber(result.blockNumber);
      setTxPhase("success");
      if (result.phase === "confirmed-awaiting-facts") {
        setSnapshot((previous) => ({ ...previous, readStatus: "error",
          readErrorMessage: verifiedRecord.action === "adopt"
            ? "Adoption confirmed on chain, but refreshing the pet failed. The displayed state may be out of date."
            : "Care confirmed on chain, but refreshing the pet failed. The displayed progress may be out of date.",
        }));
        return;
      }
      const mapped = mapPetOfToViewModel(result.rawPet);
      setSnapshot({ readStatus: "ready", readErrorMessage: null, rawPet: result.rawPet,
        hasPet: mapped.kind === "pet", pet: mapped.kind === "pet" ? mapped.pet : null,
        chainTimeMs: result.chainTimeMs });
      if (verifiedRecord.action === "care" && mapped.kind === "pet" && stageBeforeCare !== null &&
        mapped.pet.stage !== stageBeforeCare) setCelebrateStageUp(true);
    } else if (result.phase === "reverted" || result.phase === "cancelled") {
      setTxPhase("error");
      setTxErrorMessage(result.phase === "cancelled"
        ? "The transaction was cancelled. No progress was awarded."
        : verifiedRecord.action === "adopt"
          ? "The adoption transaction reverted. No pet was created."
          : "The care transaction reverted. No progress was awarded.");
    } else {
      // Pending/missing is not confirmed failure or permission for another write.
      setTxPhase("idle");
      setConfirmedBlockNumber(undefined);
      setSnapshot({ ...emptySnapshot, readStatus: "error",
        readErrorMessage: "This transaction is not fully verified yet. Check its status before sending another transaction." });
      return;
    }
    session.pendingRecord = null;
    session.replacement = undefined;
    if (originalKey && memoryRecords.current.get(originalKey)?.transactionHash === verifiedRecord.transactionHash) {
      memoryRecords.current.delete(originalKey);
    }
    if (!removePendingTransactionIfMatching(verifiedRecord)) setRecoveryStorageMessage(RECOVERY_STORAGE_MESSAGE);
    setRefreshToken((value) => value + 1);
  }, [deployment]);

  const checkTransactionStatus = useCallback(async () => {
    const session = sessionRef.current;
    if (!scope || !session?.active || session.key !== cacheKey || session.operation || !session.pendingRecord) return;
    const record = session.pendingRecord;
    const operation = {};
    session.operation = operation;
    session.revision += 1;
    const isCurrent = () => session.active && sessionRef.current === session && session.operation === operation;
    setRecoveryState(recoveryView(deployment, { phase: "checking", record }));
    try { await resolveRecord(session, record, isCurrent); }
    finally { if (session.operation === operation) session.operation = null; }
  }, [cacheKey, deployment, resolveRecord, scope]);

  useEffect(() => {
    // Session identity invalidates returning old results; the public journal
    // deliberately survives provider changes and refresh in the same scope.
    const session: WalletSession = {
      key: cacheKey, active: true, operation: null, revision: 0,
      retryingRead: false, pendingRecord: null,
    };
    sessionRef.current = session;
    if (scope) {
      const key = pendingTransactionStorageKey(scope);
      const loaded = loadPendingTransaction(scope);
      const record = loaded.record ?? (key ? memoryRecords.current.get(key) : null) ?? null;
      if (record) {
        if (key) memoryRecords.current.set(key, record);
        session.pendingRecord = record;
        session.operation = {};
      }
      // Install the synchronous guard first, then publish the external-storage
      // result asynchronously. Cleanup suppresses Strict Mode's obsolete pass.
      const operation = session.operation;
      const isCurrent = () => session.active && sessionRef.current === session && session.operation === operation;
      void (async () => {
        await Promise.resolve();
        if (!isCurrent()) return;
        if (!loaded.available) setRecoveryStorageMessage(RECOVERY_STORAGE_MESSAGE);
        if (!record) return;
        setTransactionHash(record.transactionHash);
        setTxKind(record.action);
        setRecoveryState(recoveryView(deployment, { phase: "checking", record }));
        try { await resolveRecord(session, record, isCurrent); }
        finally { if (session.operation === operation) session.operation = null; }
      })();
    }

    return () => { session.active = false; };
  }, [cacheKey, deployment, resolveRecord, scope]);

  useEffect(() => {
    if (!scope) return;
    const key = pendingTransactionStorageKey(scope);
    const changed = (event: StorageEvent) => {
      if (event.key !== key && event.key !== null) return;
      const session = sessionRef.current;
      if (!session?.active || session.key !== cacheKey || session.operation) return;
      const loaded = loadPendingTransaction(scope);
      if (!loaded.available) setRecoveryStorageMessage(RECOVERY_STORAGE_MESSAGE);
      // A deletion/corrupt value never proves that our in-memory transaction failed.
      if (!loaded.record) return;
      session.pendingRecord = loaded.record;
      session.revision += 1;
      setTransactionHash(loaded.record.transactionHash);
      setTxKind(loaded.record.action);
      setSnapshot(emptySnapshot);
      void checkTransactionStatus();
    };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [cacheKey, checkTransactionStatus, scope]);

  useEffect(() => {
    if (!address || !registryAddress || !chain || wrongChain) {
      return;
    }

    // Cooldown follows the chain clock, including local Anvil time travel.
    // Refresh confirmed reads instead of guessing from the computer's clock.
    const id = window.setInterval(() => {
      setRefreshToken((value) => value + 1);
    }, 30_000);
    return () => window.clearInterval(id);
  }, [address, registryAddress, chain, wrongChain]);

  useEffect(() => {
    const session = sessionRef.current;
    if (!address || !registryAddress || !chain || wrongChain || !session || session.operation || session.pendingRecord) {
      return;
    }

    let cancelled = false;
    const readRevision = session.revision;
    const isCurrentRead = () =>
      !cancelled && session.active && session.revision === readRevision;

    void (async () => {
      try {
        const publicClient = createPublicClient({
          chain,
          transport: http(deployment.rpcUrl ?? undefined, RPC_READ_HTTP_OPTIONS),
        });

        const confirmed = await readWithBudget(async (canRead) => {
          let block = await publicClient.getBlock({ blockTag: "latest" });
          if (!canRead()) return;
          if (typeof block.number !== "bigint" || block.number < BigInt(0)) {
            throw new Error("Invalid latest block number");
          }
          if (session.minimumBlockNumber !== undefined && block.number < session.minimumBlockNumber) {
            const minimumBlockNumber = session.minimumBlockNumber;
            block = await publicClient.getBlock({ blockNumber: minimumBlockNumber });
            if (!canRead()) return;
            if (block.number !== minimumBlockNumber) {
              throw new Error("Receipt block does not match the requested block");
            }
          }
          if (!canRead()) return;
          const result = await publicClient.readContract({
            address: registryAddress,
            abi: petRegistryAbi,
            functionName: "petOf",
            args: [address],
            blockNumber: block.number,
          });
          return { block, result };
        }, isCurrentRead);

        if (!confirmed || !isCurrentRead()) {
          return;
        }
        const { block, result } = confirmed;

        const mappedRaw: PetOfResult = {
          exists: result[0],
          communityId: result[1],
          careCount: result[2],
          lastCareDay: result[3],
        };
        const mapped = mapPetOfToViewModel(mappedRaw);

        setSnapshot({
          readStatus: "ready",
          readErrorMessage: null,
          rawPet: mappedRaw,
          hasPet: mapped.kind === "pet",
          pet: mapped.kind === "pet" ? mapped.pet : null,
          chainTimeMs: Number(block.timestamp) * 1000,
        });
      } catch {
        if (!isCurrentRead()) {
          return;
        }

        setSnapshot({
          readStatus: "error",
          readErrorMessage:
            "Pet data could not be loaded. No preview data is shown.",
          pet: null,
          hasPet: false,
          rawPet: null,
          chainTimeMs: null,
        });
      } finally {
        if (isCurrentRead()) session.retryingRead = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    address,
    cacheKey,
    chain,
    deployment.rpcUrl,
    registryAddress,
    refreshToken,
    wrongChain,
  ]);

  const cooldownAvailableAtIso =
    snapshot.rawPet && snapshot.rawPet.exists && snapshot.chainTimeMs !== null
      ? careCooldownAvailableAtIso({
          careCount: Number(snapshot.rawPet.careCount),
          lastCareDay: snapshot.rawPet.lastCareDay,
          nowMs: snapshot.chainTimeMs,
        })
      : null;

  const refreshPet = useCallback(async () => {
    setRefreshToken((value) => value + 1);
  }, []);

  const retryPet = useCallback(() => {
    const session = sessionRef.current;
    if (!address || !registryAddress || !chain || wrongChain ||
      !session?.active || session.key !== cacheKey || session.operation ||
      session.retryingRead || snapshot.readStatus !== "error") return;
    if (session.pendingRecord) { void checkTransactionStatus(); return; }

    // Lock immediately: repeated clicks in the same render still start one read.
    session.retryingRead = true;
    session.revision += 1;
    setSnapshot({ ...emptySnapshot, readStatus: "loading" });
    setRefreshToken((value) => value + 1);
  }, [address, cacheKey, chain, checkTransactionStatus, registryAddress, snapshot.readStatus, wrongChain]);

  const dismissTx = useCallback(() => {
    if (sessionRef.current?.pendingRecord) return;
    setTxPhase("idle");
    setTxKind("idle");
    setTransactionHash(undefined);
    setConfirmedBlockNumber(undefined);
    setTxErrorMessage(null);
  }, []);

  const runWrite = useCallback(
    async (kind: "adopt" | "care") => {
      const session = sessionRef.current;
      if (!session?.active || session.key !== cacheKey || session.operation || session.pendingRecord) {
        return;
      }

      if (!address || !registryAddress || !chain || wrongChain) {
        return;
      }

      // Another tab may have saved a hash after this session opened.
      const capturedScope: PendingTransactionScope = { chainId: chain.id, registryAddress, address };
      const stored = loadPendingTransaction(capturedScope);
      if (!stored.available) setRecoveryStorageMessage(RECOVERY_STORAGE_MESSAGE);
      const scopeKey = pendingTransactionStorageKey(capturedScope);
      const savedRecord = stored.record ?? (scopeKey ? memoryRecords.current.get(scopeKey) : null);
      if (savedRecord) {
        session.revision += 1;
        session.pendingRecord = savedRecord;
        setSnapshot({ ...emptySnapshot, readStatus: "error",
          readErrorMessage: "A saved transaction needs verification. Check its status before sending another transaction." });
        setRecoveryState(recoveryView(deployment, { phase: "confirmation-unknown", record: savedRecord }));
        setTransactionHash(savedRecord.transactionHash);
        return;
      }

      // Do not submit against unknown/stale pet data, including accidental
      // care callbacks after an adoption was rejected.
      if (
        snapshot.readStatus !== "ready" ||
        (kind === "care" && !snapshot.hasPet) ||
        (kind === "adopt" && snapshot.hasPet)
      ) {
        return;
      }

      if (kind === "care" && cooldownAvailableAtIso) {
        setTxKind("care");
        setTxPhase("error");
        setTxErrorMessage(
          `Care is available again at ${cooldownAvailableAtIso} (UTC). No transaction was sent.`,
        );
        return;
      }

      const walletClient = createWalletClient();
      if (!walletClient) {
        setTxKind(kind);
        setTxPhase("error");
        setTxErrorMessage("Wallet client is unavailable.");
        return;
      }

      const operation = {};
      session.operation = operation;
      // Discard any background read started before this write. Background
      // refreshes must not award progress ahead of the receipt/read sequence.
      session.revision += 1;
      const isCurrentOperation = () =>
        session.active &&
        sessionRef.current === session &&
        session.operation === operation;
      setCelebrateStageUp(false);
      setTxErrorMessage(null);
      setTransactionHash(undefined);
      setConfirmedBlockNumber(undefined);
      setTxKind(kind);
      setTxPhase("awaiting-signature");

      const stageBeforeCare = kind === "care" ? snapshot.pet?.stage ?? null : null;
      let returnedRecord: PendingTransactionRecord | null = null;

      try {
        const publicClient = createPublicClient({
          chain,
          transport: http(deployment.rpcUrl ?? undefined, RPC_READ_HTTP_OPTIONS),
        });

        const hash = (await walletClient.writeContract(
          kind === "adopt"
            ? {
                address: registryAddress,
                abi: petRegistryAbi,
                functionName: "adopt",
                args: [APPROVED_COMMUNITY_ID],
                account: address,
                chain,
              }
            : {
                address: registryAddress,
                abi: petRegistryAbi,
                functionName: "care",
                account: address,
                chain,
              },
        )) as Hash;

        // Save a late public hash under its captured original scope, without
        // replacing a different unresolved record from a newer operation.
        returnedRecord = { version: 1, ...capturedScope, action: kind, transactionHash: hash.toLowerCase() as Hash };
        const key = pendingTransactionStorageKey(capturedScope);
        if (key && !memoryRecords.current.has(key)) memoryRecords.current.set(key, returnedRecord);
        const saved = savePendingTransaction(returnedRecord);
        if (!isCurrentOperation()) return;
        if (!saved) setRecoveryStorageMessage(RECOVERY_STORAGE_MESSAGE);
        session.pendingRecord = returnedRecord;
        setTransactionHash(hash);
        setRecoveryState(recoveryView(deployment, { phase: "pending", record: returnedRecord }));
        setTxPhase("pending");
        try {
          await publicClient.waitForTransactionReceipt({ hash, timeout: RECEIPT_WAIT_TIMEOUT_MS,
            onReplaced: (replacement) => {
              if (isCurrentOperation()) session.replacement = replacement;
            },
          });
        } catch { /* A timeout/missing receipt stays unresolved until the resolver checks it. */ }
        if (!isCurrentOperation()) return;
        await resolveRecord(session, returnedRecord, isCurrentOperation, stageBeforeCare);
      } catch (error) {
        if (!isCurrentOperation()) {
          return;
        }

        if (returnedRecord) {
          setRecoveryState(recoveryView(deployment, { phase: "confirmation-unknown", record: returnedRecord }));
          setTxPhase("idle");
          setTxErrorMessage(null);
        } else if (isUserRejection(error)) {
          setTxPhase("rejected");
          setTxErrorMessage(
            "You declined the wallet request. No progress was awarded.",
          );
        } else {
          const message = error instanceof Error ? error.message : String(error);
          setTxPhase("error");
          setTxErrorMessage(
            message ||
              (kind === "adopt"
                ? "Adoption failed. No progress was awarded."
                : "Care failed. No progress was awarded."),
          );
        }
      } finally {
        if (session.operation === operation) {
          session.operation = null;
        }
      }
    },
    [
      address,
      cacheKey,
      chain,
      cooldownAvailableAtIso,
      createWalletClient,
      deployment,
      registryAddress,
      resolveRecord,
      snapshot.hasPet,
      snapshot.readStatus,
      snapshot.pet?.stage,
      wrongChain,
    ],
  );

  const adopt = useCallback(async () => {
    await runWrite("adopt");
  }, [runWrite]);

  const care = useCallback(async () => {
    await runWrite("care");
  }, [runWrite]);

  const readStatusForUi: PetReadStatus =
    address &&
    registryAddress &&
    chain &&
    !wrongChain &&
    snapshot.readStatus === "idle"
      ? "loading"
      : snapshot.readStatus;

  const isSubmitting =
    txPhase === "awaiting-signature" ||
    txPhase === "submitting" ||
    txPhase === "pending";

  return {
    recoveryState,
    recoveryStorageMessage,
    recoveryBlocksWrites: recoveryState.kind === "tracking" &&
      !["confirmed", "reverted", "cancelled"].includes(recoveryState.phase),
    checkTransactionStatus,
    readStatus: readStatusForUi,
    readErrorMessage: snapshot.readErrorMessage,
    pet: snapshot.pet,
    hasPet: snapshot.hasPet,
    rawPet: snapshot.rawPet,
    txPhase,
    txKind,
    transactionHash,
    confirmedBlockNumber,
    txErrorMessage,
    cooldownAvailableAtIso,
    celebrateStageUp,
    adopt,
    care,
    dismissTx,
    refreshPet,
    retryPet,
    isSubmitting,
    adoptPhase: txPhase,
  };
}
