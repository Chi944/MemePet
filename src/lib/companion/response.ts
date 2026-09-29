import type { CompanionFactsState, CompanionSnapshot } from "@/types/companion";
import { mapConfirmedPetProgress } from "@/lib/pet-progress";

export const COMPANION_READ_ERROR = "Mochi's confirmed activity could not be read. Please retry the read.";

export function unavailableCompanionFacts(): CompanionFactsState {
  return { kind: "unavailable", dataMode: "live", message: COMPANION_READ_ERROR };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function integer(value: unknown, maximum = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= maximum;
}

function timestamp(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 30) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && time >= 0 && new Date(time).toISOString() === value;
}

export interface CompanionResponseScope {
  readonly address: string;
  readonly registryAddress: string;
  readonly chainId: number;
  readonly minimumBlock?: bigint;
  readonly knownPet?: boolean;
}

/** Validate the API boundary before any response becomes displayable live facts. */
export function parseCompanionResponse(value: unknown, scope: CompanionResponseScope): CompanionFactsState {
  if (!record(value) || value.schemaVersion !== 1 || !record(value.scope) ||
    !integer(value.scope.chainId) || value.scope.chainId === 0 || value.scope.chainId !== scope.chainId ||
    typeof value.scope.walletAddress !== "string" || !/^0x[\da-f]{40}$/i.test(value.scope.walletAddress) ||
    value.scope.walletAddress.toLowerCase() !== scope.address.toLowerCase() ||
    typeof value.scope.registryAddress !== "string" || !/^0x[\da-f]{40}$/i.test(value.scope.registryAddress) ||
    value.scope.registryAddress.toLowerCase() !== scope.registryAddress.toLowerCase() ||
    !record(value.facts) || value.facts.dataMode !== "live") {
    return unavailableCompanionFacts();
  }
  const facts = value.facts;
  if (facts.kind === "no-pet") {
    // A confirmed adoption/care, or a previous existing pet in this session,
    // cannot legitimately become "no pet" in the immutable registry.
    return scope.knownPet || scope.minimumBlock !== undefined
      ? unavailableCompanionFacts() : { kind: "no-pet", dataMode: "live" };
  }
  if (facts.kind !== "ready" || !record(facts.snapshot)) return unavailableCompanionFacts();
  const pet = facts.snapshot;
  if (
    typeof pet.walletAddress !== "string" || !/^0x[\da-f]{40}$/i.test(pet.walletAddress) ||
    pet.walletAddress.toLowerCase() !== scope.address.toLowerCase() ||
    typeof pet.registryAddress !== "string" || !/^0x[\da-f]{40}$/i.test(pet.registryAddress) ||
    pet.registryAddress.toLowerCase() !== scope.registryAddress.toLowerCase() ||
    pet.chainId !== scope.chainId || !integer(pet.chainId) || pet.chainId === 0 ||
    typeof pet.contextKey !== "string" || pet.contextKey.length === 0 || pet.contextKey.length > 512 ||
    /[\u0000-\u001f]/.test(pet.contextKey) ||
    typeof pet.blockNumber !== "string" || !/^(0|[1-9]\d{0,77})$/.test(pet.blockNumber) ||
    BigInt(pet.blockNumber) > (BigInt(1) << BigInt(256)) - BigInt(1) ||
    (scope.minimumBlock !== undefined && BigInt(pet.blockNumber) < scope.minimumBlock) ||
    !timestamp(pet.blockTimestampIso) || !timestamp(pet.observedAtIso) || !timestamp(pet.nextCareAtIso) ||
    !integer(pet.careCount, 2 ** 32 - 1) || !integer(pet.growthPoints) ||
    (pet.communityTotalCares !== null && (!integer(pet.communityTotalCares) || pet.communityTotalCares < pet.careCount))
  ) return unavailableCompanionFacts();

  const progress = mapConfirmedPetProgress(pet.careCount);
  const blockTime = Date.parse(pet.blockTimestampIso);
  const nextCareTime = Date.parse(pet.nextCareAtIso);
  const nextDay = (Math.floor(blockTime / 86_400_000) + 1) * 86_400_000;
  if (
    pet.growthPoints !== progress.growthPoints || pet.stage !== progress.stage || pet.nextStageAt !== progress.nextStageAt ||
    (nextCareTime !== blockTime && (pet.careCount === 0 || nextCareTime !== nextDay))
  ) return unavailableCompanionFacts();

  // Explicit copying drops unrelated server fields and any untrusted reply.
  const snapshot: CompanionSnapshot = {
    contextKey: pet.contextKey,
    walletAddress: pet.walletAddress,
    chainId: pet.chainId,
    registryAddress: pet.registryAddress,
    blockNumber: pet.blockNumber,
    blockTimestampIso: pet.blockTimestampIso,
    observedAtIso: pet.observedAtIso,
    careCount: pet.careCount,
    ...progress,
    nextCareAtIso: pet.nextCareAtIso,
    communityTotalCares: pet.communityTotalCares as number | null,
  };
  return { kind: "ready", dataMode: "live", snapshot };
}
