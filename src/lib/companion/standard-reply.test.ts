import { describe, expect, it } from "vitest";
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

  it("gives the verified eligibility time rather than promising a write will succeed", () => {
    const reply = createStandardReply({ kind: "ready", dataMode: "fixture", snapshot }, "next-care", defaultPersonality());
    expect(reply).toMatchObject({ text: expect.stringContaining(snapshot.nextCareAtIso) });
    expect(reply).toMatchObject({ text: expect.stringContaining("Check the live Care panel") });
  });
});
