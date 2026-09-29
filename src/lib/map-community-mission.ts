import type { CommunityViewModel } from "@/types/view-models";
import type { CommunityMissionState } from "@/types/finale-community";

/** Deliberate finale app rule, not a reward encoded in PetRegistry. */
export const GARDEN_CARE_TARGET = 20;

export function mapCommunityMission(community: CommunityViewModel): CommunityMissionState {
  const base = { title: "Mochi garden", target: GARDEN_CARE_TARGET, dataMode: community.dataMode } as const;
  if (community.isLoading) return { ...base, kind: "loading" };
  const total = community.totalCareActions;
  if (community.errorMessage || total === null || !Number.isSafeInteger(total) || total < 0) {
    return { ...base, kind: "unavailable", message: "Confirmed community progress is unavailable. Retry the read." };
  }
  return { ...base, kind: "ready", totalCareActions: total, isComplete: total >= GARDEN_CARE_TARGET };
}
