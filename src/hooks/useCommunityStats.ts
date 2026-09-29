"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type Address, createPublicClient, http } from "viem";
import { chainFromDeployment } from "@/lib/chains";
import type { Deployment } from "@/lib/deployment";
import {
  mapCommunityStatsFailureToViewModel,
  mapCommunityStatsToViewModel,
  unknownCommunityViewModel,
} from "@/lib/map-community";
import { APPROVED_COMMUNITY_ID } from "@/lib/pet-progress";
import { petRegistryAbi } from "@/lib/pet-registry-abi";
import { readReceiptWithRetry } from "@/lib/receipt-read-retry";
import { mapCommunityMission } from "@/lib/map-community-mission";
import type { FinaleCommunityPanelProps } from "@/types/finale-community";
import type { CommunityViewModel } from "@/types/view-models";

type UseCommunityStatsArgs = {
  readonly deployment: Deployment;
  /** Included in the cache key so account switches drop stale community reads. */
  readonly address: Address | null;
  readonly wrongChain: boolean;
};

export function useCommunityStats({
  deployment,
  address,
  wrongChain,
}: UseCommunityStatsArgs) {
  // chainFromDeployment builds a fresh object for any chain id outside X Layer,
  // and this value is an effect dependency: an unstable identity re-fires the
  // read on every render. getActiveDeployment is now cached, so this is stable.
  const chain = useMemo(() => chainFromDeployment(deployment), [deployment]);
  const registryAddress = deployment.registryAddress as Address | null;
  const canRead = Boolean(registryAddress && chain && deployment.rpcUrl && !wrongChain && deployment.status !== "not-deployed");
  const initialCommunity = useMemo(() => unknownCommunityViewModel({
    isLoading: canRead,
    errorMessage: canRead ? null : wrongChain
      ? "Community total is unavailable on this network."
      : "Community total is unavailable until a contract and network are configured.",
  }), [canRead, wrongChain]);
  const cacheKey = `${address ?? "none"}:${deployment.chainId ?? "none"}:${deployment.registryAddress ?? "none"}:${deployment.rpcUrl ?? "none"}:${deployment.networkName ?? "none"}:${deployment.status}:${wrongChain ? "wrong" : "ok"}`;
  const [activeKey, setActiveKey] = useState(cacheKey);
  const [community, setCommunity] = useState<CommunityViewModel>(() => initialCommunity);
  const [refreshToken, setRefreshToken] = useState(0);
  const [readBlockNumber, setReadBlockNumber] = useState<bigint | undefined>();

  if (activeKey !== cacheKey) {
    setActiveKey(cacheKey);
    setReadBlockNumber(undefined);
    setCommunity(initialCommunity);
  }

  useEffect(() => {
    if (!canRead || !registryAddress || !chain) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const publicClient = createPublicClient({
          chain,
          transport: http(deployment.rpcUrl ?? undefined),
        });

        const readTotal = (blockNumber?: bigint) => publicClient.readContract({
          address: registryAddress,
          abi: petRegistryAbi,
          functionName: "communityStats",
          args: [APPROVED_COMMUNITY_ID],
          blockNumber,
        });
        // A receipt can be visible before a replica can serve its state.
        // Keep every retry pinned and discard it if this effect is replaced.
        const total = readBlockNumber === undefined
          ? await readTotal()
          : await readReceiptWithRetry(readBlockNumber, readTotal, () => !cancelled);

        if (!cancelled && total !== undefined) {
          setCommunity(mapCommunityStatsToViewModel(total));
        }
      } catch (error) {
        if (!cancelled) {
          setCommunity(mapCommunityStatsFailureToViewModel(error));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    // `address` is required: the render-phase cacheKey reset puts the panel
    // back into loading on an account switch, and without this dep the effect
    // never re-runs to resolve it.
    address,
    canRead,
    chain,
    deployment.rpcUrl,
    refreshToken,
    readBlockNumber,
    registryAddress,
  ]);

  const refresh = useCallback((blockNumber?: bigint) => {
    if (!canRead) return;
    setReadBlockNumber(blockNumber);
    setCommunity(unknownCommunityViewModel({ isLoading: true }));
    setRefreshToken((value) => value + 1);
  }, [canRead]);

  // Recover a failed read without clearing the receipt block. A retry must
  // never fall back to a potentially older "latest" result after confirmed care.
  const retry = useCallback(() => {
    if (!canRead) return;
    setCommunity(unknownCommunityViewModel({ isLoading: true }));
    setRefreshToken((value) => value + 1);
  }, [canRead]);

  const finale = useMemo<FinaleCommunityPanelProps>(() => ({
    community,
    mission: mapCommunityMission(community),
    // Larm's sourced candidate still needs verification before live use.
    identity: { kind: "unconfigured" },
    onRetry: retry,
  }), [community, retry]);

  return { community, refresh, retry, finale };
}
