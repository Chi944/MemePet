import { describe, expect, it } from "vitest";
import { mapGardenChapters, mapPersonalMilestones } from "./beta-progress";
import { mapConfirmedPetProgress } from "./pet-progress";

describe("beta cosmetic progress (simulated counts, not wallet acceptance)", () => {
  it.each([null, -1, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    "does not turn unknown/invalid count %s into zero or an unlock",
    (count) => {
      expect(mapPersonalMilestones(count, "live")).toEqual({ kind: "unavailable", dataMode: "live" });
      expect(mapGardenChapters(count, "live")).toEqual({ kind: "unavailable", dataMode: "live" });
    },
  );

  it.each([
    [0, 0, 20], [19, 0, 20], [20, 1, 50], [49, 1, 50],
    [50, 2, 100], [99, 2, 100], [100, 3, null], [135, 3, null],
  ])("maps lifetime community count %s without resetting earlier chapters", (count, reached, nextTarget) => {
    const state = mapGardenChapters(count!, "fixture");
    expect(state.kind).toBe("ready");
    if (state.kind !== "ready") throw new Error("expected ready state");
    expect(state.confirmedCareCount).toBe(count);
    expect(state.milestones.filter((milestone) => milestone.reached)).toHaveLength(reached!);
    expect(state.nextTarget).toBe(nextTarget);
    expect(state.dataMode).toBe("fixture");
  });

  it("adds post-Guardian goals without introducing a fourth pet stage", () => {
    const state = mapPersonalMilestones(10, "live");
    expect(state.kind).toBe("ready");
    if (state.kind !== "ready") throw new Error("expected ready state");
    expect(state.milestones.filter((milestone) => milestone.reached)).toHaveLength(2);
    expect(state.nextTarget).toBe(20);
    expect(mapConfirmedPetProgress(10)).toEqual({ stage: "guardian", growthPoints: 100, nextStageAt: null });
  });

  it.each([[4, 0, 5], [5, 1, 10], [9, 1, 10], [10, 2, 20], [19, 2, 20], [20, 3, null]])(
    "requires each personal milestone's full confirmed count: %s",
    (count, reached, nextTarget) => {
      const state = mapPersonalMilestones(count!, "fixture");
      if (state.kind !== "ready") throw new Error("expected ready state");
      expect(state.milestones.filter((milestone) => milestone.reached)).toHaveLength(reached!);
      expect(state.nextTarget).toBe(nextTarget);
    },
  );

  it("has no date/streak reset and does not mutate its inputs or definitions", () => {
    const first = mapGardenChapters(50, "fixture");
    mapGardenChapters(0, "fixture");
    expect(mapGardenChapters(50, "fixture")).toEqual(first);
    expect(mapPersonalMilestones(0, "fixture")).toMatchObject({ kind: "ready", nextTarget: 5, confirmedCareCount: 0 });
  });
});
