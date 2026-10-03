import type { usePetRegistry } from "@/hooks/usePetRegistry";
import type { useWallet } from "@/hooks/useWallet";
import type { OnboardingState, ProgressionPanelProps } from "@/types/beta";
import type { CommunityViewModel } from "@/types/view-models";
import { mapGardenChapters, mapPersonalMilestones } from "./beta-progress";
import { isRegistryConfigured, type Deployment } from "./deployment";
import { APPROVED_COMMUNITY_ID } from "./pet-progress";
import type { PetOfResult } from "./pet-registry-abi";

/** Inputs come from the same render/session of the lead's live hooks. */
export interface BetaPanelInputs {
  readonly deployment: Deployment;
  readonly wallet: Pick<ReturnType<typeof useWallet>,
    "installed" | "address" | "chainId" | "connecting" | "wrongChain" | "selectionBusy">;
  readonly registry: Pick<ReturnType<typeof usePetRegistry>,
    "readStatus" | "rawPet" | "cooldownAvailableAtIso" | "isSubmitting"> & {
      readonly recoveryBlocksWrites?: boolean;
    };
  readonly community: CommunityViewModel;
}

export interface BetaPanelState {
  readonly onboarding: OnboardingState;
  readonly progression: Pick<ProgressionPanelProps, "personal" | "community">;
}

function validPet(pet: PetOfResult | null): pet is PetOfResult {
  if (!pet || !Number.isInteger(pet.careCount) || pet.careCount < 0 || pet.careCount > 0xffff_ffff
    || typeof pet.lastCareDay !== "bigint" || pet.lastCareDay < BigInt(0) || pet.lastCareDay > BigInt("18446744073709551615")) return false;
  return pet.exists
    ? pet.communityId === APPROVED_COMMUNITY_ID
    : pet.communityId === 0 && pet.careCount === 0 && pet.lastCareDay === BigInt(0);
}

function canonicalReset(iso: string): boolean {
  const date = new Date(iso);
  return Number.isFinite(date.getTime()) && date.toISOString() === iso
    && date.getUTCHours() === 0 && date.getUTCMinutes() === 0
    && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0;
}

/** Pure preparation for B1 integration. Does not connect, read, write or run a timer. */
export function mapBetaPanelState({ deployment, wallet, registry, community }: BetaPanelInputs): BetaPanelState {
  const network = {
    networkLabel: deployment.networkName ?? "Unconfigured network",
    gasSymbol: deployment.currencySymbol ?? "Unknown",
    isTestnet: deployment.status === "testnet",
  };
  const configured = isRegistryConfigured(deployment);
  const matchingChain = configured && wallet.chainId === deployment.chainId && !wallet.wrongChain;
  const personalScopeReady = matchingChain && wallet.address !== null && wallet.installed && !wallet.connecting;
  const personal = !personalScopeReady
    ? mapPersonalMilestones(null, "live")
    : wallet.selectionBusy || registry.isSubmitting || registry.recoveryBlocksWrites || registry.readStatus === "idle" || registry.readStatus === "loading"
      ? { kind: "loading" as const, dataMode: "live" as const }
      : registry.readStatus !== "ready" || !validPet(registry.rawPet)
        ? mapPersonalMilestones(null, "live")
        : mapPersonalMilestones(registry.rawPet.careCount, "live");
  // The shared total can be read without connecting a wallet. Loading/error
  // always outrank an old retained count; fixture data is never promoted live.
  const shared = !configured || wallet.wrongChain || (wallet.chainId !== null && !matchingChain)
    || community.dataMode !== "live" || community.errorMessage !== null
    ? mapGardenChapters(null, community.dataMode)
    : community.isLoading || registry.isSubmitting || (wallet.address !== null && wallet.selectionBusy)
      ? { kind: "loading" as const, dataMode: "live" as const }
      : mapGardenChapters(community.totalCareActions, "live");

  let onboarding: OnboardingState;
  if (!configured) {
    onboarding = { ...network, kind: "unavailable", message: "A care network and registry must be configured first." };
  } else if (!wallet.installed && wallet.selectionBusy) {
    onboarding = { ...network, kind: "loading" };
  } else if (!wallet.installed) {
    onboarding = { ...network, kind: "needs-wallet" };
  } else if (wallet.connecting) {
    onboarding = { ...network, kind: "connecting" };
  } else if (wallet.selectionBusy) {
    onboarding = { ...network, kind: "loading" };
  } else if (!wallet.address) {
    onboarding = { ...network, kind: "needs-connection" };
  } else if (wallet.wrongChain || (wallet.chainId !== null && !matchingChain)) {
    onboarding = { ...network, kind: "wrong-network" };
  } else if (registry.recoveryBlocksWrites) {
    onboarding = { ...network, kind: "unavailable", message: "A submitted transaction still needs verification. Use Check status in its transaction panel before another adoption or care." };
  } else if (wallet.chainId === null || registry.isSubmitting || registry.readStatus === "idle" || registry.readStatus === "loading") {
    onboarding = { ...network, kind: "loading" };
  } else if (registry.readStatus !== "ready" || !validPet(registry.rawPet)) {
    onboarding = { ...network, kind: "unavailable", message: "Your confirmed pet could not be read. Retry the read." };
  } else if (!registry.rawPet.exists) {
    onboarding = { ...network, kind: "needs-adoption" };
  } else if (registry.cooldownAvailableAtIso !== null) {
    onboarding = canonicalReset(registry.cooldownAvailableAtIso)
      ? { ...network, kind: "cooldown", availableAtIso: registry.cooldownAvailableAtIso }
      : { ...network, kind: "unavailable", message: "The next care time could not be verified. Retry the read." };
  } else {
    onboarding = { ...network, kind: "ready" };
  }
  // Eligibility comes from the hook's chain-clock calculation. The viewer's
  // wall clock/timezone may format the label but never unlock a care here.
  return { onboarding, progression: { personal, community: shared } };
}
