import { describe, expect, it } from "vitest";
import { mapCommunityMission } from "./map-community-mission";
import type { CommunityViewModel } from "@/types/view-models";

const community: CommunityViewModel = {
  name: "FICTIONAL community", totalCareActions: 0, milestoneTarget: null,
  isLoading: false, errorMessage: null, dataMode: "fixture",
};

describe("cosmetic garden mission", () => {
  it("counts all confirmed historical care actions and unlocks only at 20 or above", () => {
    for (const total of [0, 19, 20, 21]) {
      expect(mapCommunityMission({ ...community, totalCareActions: total })).toMatchObject({
        kind: "ready", totalCareActions: total, target: 20, isComplete: total >= 20,
      });
    }
  });

  it("does not unlock or display zero for an unknown, erroneous or unsafe count", () => {
    for (const total of [null, -1, 1.5, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
      expect(mapCommunityMission({ ...community, totalCareActions: total }).kind).toBe("unavailable");
    }
    expect(mapCommunityMission({ ...community, totalCareActions: 20, errorMessage: "failed" }).kind).toBe("unavailable");
    expect(mapCommunityMission({ ...community, totalCareActions: 20, isLoading: true }).kind).toBe("loading");
  });
});
