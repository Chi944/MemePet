import type { DataMode } from "@/types/view-models";
import type { MilestoneState } from "@/types/beta";

// Cosmetic app rules only. The existing pet stages and first garden target stay intact.
export const PERSONAL_CARE_MILESTONES = [
  { id: "steady-carer", label: "Steady carer", target: 5 },
  { id: "mochi-regular", label: "Mochi regular", target: 10 },
  { id: "garden-keeper", label: "Garden keeper", target: 20 },
] as const;

export const GARDEN_CHAPTERS = [
  { id: "first-bloom", label: "First bloom", target: 20 },
  { id: "growing-garden", label: "Growing garden", target: 50 },
  { id: "shared-grove", label: "Shared grove", target: 100 },
] as const;

function mapMilestones(
  count: number | null,
  definitions: readonly { readonly id: string; readonly label: string; readonly target: number }[],
  dataMode: DataMode,
): MilestoneState {
  // Unknown/invalid reads must not become zero or unlock cosmetic rewards.
  if (count === null || !Number.isSafeInteger(count) || count < 0) {
    return { kind: "unavailable", dataMode };
  }
  return {
    kind: "ready",
    dataMode,
    confirmedCareCount: count,
    milestones: definitions.map((milestone) => ({ ...milestone, reached: count >= milestone.target })),
    nextTarget: definitions.find((milestone) => count < milestone.target)?.target ?? null,
  };
}

/** Call only with a confirmed personal care count, never personality interaction counts. */
export function mapPersonalMilestones(count: number | null, dataMode: DataMode): MilestoneState {
  return mapMilestones(count, PERSONAL_CARE_MILESTONES, dataMode);
}

/** All previous confirmed community cares count; reaching a chapter never resets the total. */
export function mapGardenChapters(count: number | null, dataMode: DataMode): MilestoneState {
  return mapMilestones(count, GARDEN_CHAPTERS, dataMode);
}
