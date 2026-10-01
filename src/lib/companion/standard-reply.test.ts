import { describe, expect, it, vi } from "vitest";
import type { CompanionFactsState, CompanionSnapshot } from "@/types/companion";
import { defaultPersonality } from "./personality";
import { createStandardReply } from "./standard-reply";

const snapshot: CompanionSnapshot = {
  contextKey: "FICTIONAL_CONTEXT_A", walletAddress: "FICTIONAL_WALLET", chainId: 1952,
  registryAddress: "FICTIONAL_REGISTRY", blockNumber: "100", blockTimestampIso: "2030-01-01T12:00:00.000Z",
  observedAtIso: "2030-01-01T12:00:02.000Z", careCount: 1, growthPoints: 10, stage: "hatchling",
  nextStageAt: 20, nextCareAtIso: "2030-01-02T00:00:00.000Z", communityTotalCares: null,
};

describe("grounded standard replies", () => {
  it("never turns missing reads or an absent pet into a progress answer", () => {
    const states: CompanionFactsState[] = [
      { kind: "needs-wallet", dataMode: "live" }, { kind: "wrong-network", expectedChainId: 1952, dataMode: "live" },
      { kind: "loading", dataMode: "live" }, { kind: "no-pet", dataMode: "live" },
      { kind: "unavailable", message: "RPC failed", dataMode: "live" },
    ];
    for (const facts of states) expect(createStandardReply(facts, "progress", defaultPersonality()).kind).toBe("unavailable");
  });

  it("keeps unknown community totals distinct from a confirmed zero", () => {
    const unknown = createStandardReply({ kind: "ready", dataMode: "fixture", snapshot }, "contribution", defaultPersonality());
    const zero = createStandardReply({ kind: "ready", dataMode: "fixture", snapshot: { ...snapshot, careCount: 0, communityTotalCares: 0 } }, "contribution", defaultPersonality());
    expect(unknown).toMatchObject({ source: "standard", text: expect.stringContaining("community total is unavailable") });
    expect(zero).toMatchObject({ text: expect.stringContaining("confirmed community total is 0") });
  });

  it("binds replies to their read context, timestamp and source without claiming AI", () => {
    const reply = createStandardReply({ kind: "ready", dataMode: "fixture", snapshot }, "progress", defaultPersonality());
    expect(reply).toMatchObject({ kind: "answer", source: "standard", contextKey: snapshot.contextKey });
    if (reply.kind !== "answer") throw new Error("Expected answer");
    expect(reply.text).toContain("1 confirmed care action, 10 growth points");
    expect(reply.text).toContain("block 100 (2030-01-01T12:00:00.000Z)");
    expect(reply.text).toContain("MemePet activity only");
  });

  it.each([snapshot.blockTimestampIso, "2030-01-01T00:00:00.000Z"])(
    "describes already-available care at the source block, regardless of the browser clock (%s)",
    (nextCareAtIso) => {
      vi.useFakeTimers();
      try {
        const facts: CompanionFactsState = { kind: "ready", dataMode: "fixture", snapshot: { ...snapshot, nextCareAtIso } };
        vi.setSystemTime("2000-01-01T00:00:00.000Z");
        const earlierClock = createStandardReply(facts, "next-care", { ...defaultPersonality(), style: "curious" });
        vi.setSystemTime("2040-01-01T00:00:00.000Z");
        const laterClock = createStandardReply(facts, "next-care", { ...defaultPersonality(), style: "curious" });

        expect(laterClock).toEqual(earlierClock);
        expect(laterClock).toMatchObject({
          kind: "answer", source: "standard", contextKey: snapshot.contextKey, question: "next-care",
          text: expect.stringContaining("Here is what Mochi found: Care was available as of block 100 (2030-01-01T12:00:00.000Z, UTC)."),
        });
        expect(laterClock).toMatchObject({ text: expect.stringContaining("Check the live Care panel") });
        expect(laterClock).toMatchObject({ text: expect.not.stringContaining("next eligible care time is") });
      } finally {
        vi.useRealTimers();
      }
    },
  );

  it("keeps the verified cooldown time in UTC even when the browser clock has passed it", () => {
    vi.useFakeTimers();
    try {
      const facts: CompanionFactsState = { kind: "ready", dataMode: "fixture", snapshot };
      vi.setSystemTime("2000-01-01T00:00:00.000Z");
      const earlierClock = createStandardReply(facts, "next-care", defaultPersonality());
      vi.setSystemTime("2040-01-01T00:00:00.000Z");
      const laterClock = createStandardReply(facts, "next-care", defaultPersonality());

      expect(laterClock).toEqual(earlierClock);
      expect(laterClock).toMatchObject({ text: expect.stringContaining(`The next eligible care time is ${snapshot.nextCareAtIso} (UTC).`) });
      expect(laterClock).toMatchObject({ text: expect.stringContaining("Check the live Care panel") });
      expect(laterClock).toMatchObject({ text: expect.stringContaining(`Based on block ${snapshot.blockNumber} (${snapshot.blockTimestampIso})`) });
      expect(laterClock).toMatchObject({ text: expect.not.stringContaining("Care was available") });
    } finally {
      vi.useRealTimers();
    }
  });
});
