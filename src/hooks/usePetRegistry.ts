"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type Address,
  createPublicClient,
  http,
  type Hash,
  type WalletClient,
} from "viem";
import { careCooldownAvailableAtIso } from "@/lib/care-cooldown";
import { APPROVED_COMMUNITY_ID } from "@/lib/pet-progress";
import { mapPetOfToViewModel } from "@/lib/map-pet";
import { petRegistryAbi, type PetOfResult } from "@/lib/pet-registry-abi";
import type { Deployment } from "@/lib/deployment";
import { chainFromDeployment } from "@/lib/chains";
import { readWithBudget, RPC_READ_HTTP_OPTIONS } from "@/lib/read-budget";
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
  /** Never let a lagging replica undo this session's confirmed transaction. */
  minimumBlockNumber?: bigint;
};

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
  const cacheKey = `${providerSessionKey}:${address ?? "none"}:${deployment.chainId ?? "none"}:${deployment.registryAddress ?? "none"}:${wrongChain ? "wrong" : "ok"}`;
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

  if (activeKey !== cacheKey) {
    setActiveKey(cacheKey);
    setSnapshot(emptySnapshot);
    setTxPhase("idle");
    setTxKind("idle");
    setTransactionHash(undefined);
    setConfirmedBlockNumber(undefined);
    setTxErrorMessage(null);
    setCelebrateStageUp(false);
  }

  // chainFromDeployment builds a fresh object for any chain id outside X Layer,
  // and this value is an effect dependency: an unstable identity re-fires the
  // read on every render. getActiveDeployment is now cached, so this is stable.
  const chain = useMemo(() => chainFromDeployment(deployment), [deployment]);
  const registryAddress = deployment.registryAddress as Address | null;

  useEffect(() => {
    // A new session identity also invalidates A → B → A writes. Comparing
    // address strings alone would accept the original A result after return.
    const session: WalletSession = {
      key: cacheKey,
      active: true,
      operation: null,
      revision: 0,
      retryingRead: false,
    };
    sessionRef.current = session;
    return () => {
      session.active = false;
    };
  }, [cacheKey]);

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
    if (!address || !registryAddress || !chain || wrongChain || !session || session.operation) {
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

    // Lock immediately: repeated clicks in the same render still start one read.
    session.retryingRead = true;
    session.revision += 1;
    setSnapshot({ ...emptySnapshot, readStatus: "loading" });
    setRefreshToken((value) => value + 1);
  }, [address, cacheKey, chain, registryAddress, snapshot.readStatus, wrongChain]);

  const dismissTx = useCallback(() => {
    setTxPhase("idle");
    setTxKind("idle");
    setTransactionHash(undefined);
    setConfirmedBlockNumber(undefined);
    setTxErrorMessage(null);
  }, []);

  const runWrite = useCallback(
    async (kind: "adopt" | "care") => {
      const session = sessionRef.current;
      if (!session?.active || session.key !== cacheKey || session.operation) {
        return;
      }

      if (!address || !registryAddress || !chain || wrongChain) {
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

      try {
        const publicClient = createPublicClient({
          chain,
          transport: http(deployment.rpcUrl ?? undefined),
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

        if (!isCurrentOperation()) {
          return;
        }

        setTransactionHash(hash);
        setTxPhase("pending");

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (!isCurrentOperation()) {
          return;
        }

        if (receipt.status !== "success") {
          setTxPhase("error");
          setTxErrorMessage(
            kind === "adopt"
              ? "The adoption transaction reverted. No pet was created."
              : "The care transaction reverted. No progress was awarded.",
          );
          return;
        }

        // Related reads must use the receipt's state, not an independently
        // cached or lagging "latest" response from the RPC service.
        session.minimumBlockNumber = receipt.blockNumber;
        setConfirmedBlockNumber(receipt.blockNumber);

        // Re-read before treating the write as success. A hash alone is not enough.
        let result;
        let chainTimeMs;
        try {
          const readClient = createPublicClient({
            chain,
            transport: http(deployment.rpcUrl ?? undefined, RPC_READ_HTTP_OPTIONS),
          });
          // RPC replicas can expose a receipt before its state is readable.
          // Retry only reads, at the same confirmed block, with a bounded wait.
          const confirmed = await readWithBudget(
            async (canRead) => {
              const blockNumber = receipt.blockNumber;
              const block = await readClient.getBlock({
                blockNumber,
              });
              if (!canRead()) return;
              if (block.number !== blockNumber) {
                throw new Error("Receipt block does not match the requested block");
              }
              const petResult = await readClient.readContract({
                address: registryAddress,
                abi: petRegistryAbi,
                functionName: "petOf",
                args: [address],
                blockNumber,
              });
              return { result: petResult, chainTimeMs: Number(block.timestamp) * 1000 };
            },
            isCurrentOperation,
          );
          if (!confirmed) return;
          result = confirmed.result;
          chainTimeMs = confirmed.chainTimeMs;
        } catch {
          // The receipt already confirmed success, so the write DID land. Say
          // so, and mark the display as stale rather than claiming failure.
          if (!isCurrentOperation()) {
            return;
          }
          setSnapshot((previous) => ({
            ...previous,
            readStatus: "error",
            readErrorMessage:
              kind === "adopt"
                ? "Adoption confirmed on chain, but refreshing the pet failed. The displayed state may be out of date."
                : "Care confirmed on chain, but refreshing the pet failed. The displayed progress may be out of date.",
          }));
          setTxPhase("success");
          return;
        }

        if (!isCurrentOperation()) {
          return;
        }

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
          chainTimeMs,
        });

        if (
          kind === "care" &&
          mapped.kind === "pet" &&
          stageBeforeCare !== null &&
          mapped.pet.stage !== stageBeforeCare
        ) {
          setCelebrateStageUp(true);
        }

        setTxPhase("success");
        setRefreshToken((value) => value + 1);
      } catch (error) {
        if (!isCurrentOperation()) {
          return;
        }

        if (isUserRejection(error)) {
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
      deployment.rpcUrl,
      registryAddress,
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
