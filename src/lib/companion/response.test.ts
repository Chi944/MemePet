import { describe, expect, it } from "vitest";
import { parseCompanionResponse } from "./response";

const scope = {
  address: "0x1111111111111111111111111111111111111111",
  registryAddress: "0x3333333333333333333333333333333333333333",
  chainId: 1952,
};

function envelope<T>(facts: T) {
  return { schemaVersion: 1, scope: { chainId: scope.chainId,
    registryAddress: scope.registryAddress, walletAddress: scope.address }, facts };
}

function response(snapshot: Record<string, unknown> = {}) {
  return envelope({ kind: "ready", dataMode: "live", snapshot: {
    contextKey: "real-api-context", walletAddress: scope.address,
    registryAddress: scope.registryAddress, chainId: scope.chainId, blockNumber: "100",
    blockTimestampIso: "2026-09-30T12:00:00.000Z", observedAtIso: "2026-09-30T12:00:01.000Z",
    careCount: 1, growthPoints: 10, stage: "hatchling", nextStageAt: 20,
    nextCareAtIso: "2026-10-01T00:00:00.000Z", communityTotalCares: 4,
    ...snapshot,
  } });
}

describe("companion response validation", () => {
  it("accepts a coherent snapshot and strips unrelated server fields", () => {
    const value = response({ arbitraryText: "not display data" });
    const parsed = parseCompanionResponse({ ...value, reply: { text: "untrusted reply" } }, scope);
    expect(parsed.kind).toBe("ready");
    if (parsed.kind === "ready") {
      expect(parsed.snapshot.growthPoints).toBe(10);
      expect(parsed.snapshot).not.toHaveProperty("arbitraryText");
    }
    expect(parsed).not.toHaveProperty("reply");
  });

  it("keeps missing pets distinct from failed reads", () => {
    expect(parseCompanionResponse(envelope({ kind: "no-pet", dataMode: "live" }), scope).kind).toBe("no-pet");
    expect(parseCompanionResponse(envelope({ kind: "unavailable", dataMode: "live", message: "private RPC URL" }), scope))
      .toEqual(expect.objectContaining({ kind: "unavailable", message: expect.not.stringContaining("private") }));
  });

  it.each([
    { schemaVersion: undefined },
    { schemaVersion: 2 },
    { scope: undefined },
    { scope: { chainId: 1, registryAddress: scope.registryAddress, walletAddress: scope.address } },
    { scope: { chainId: scope.chainId, registryAddress: "0x4444444444444444444444444444444444444444", walletAddress: scope.address } },
    { scope: { chainId: scope.chainId, registryAddress: scope.registryAddress, walletAddress: "0x2222222222222222222222222222222222222222" } },
    { scope: { chainId: scope.chainId, registryAddress: scope.registryAddress } },
  ])("rejects mismatched or unversioned envelopes for ready and no-pet states: %o", (patch) => {
    expect(parseCompanionResponse({ ...response(), ...patch }, scope).kind).toBe("unavailable");
    expect(parseCompanionResponse({ ...envelope({ kind: "no-pet", dataMode: "live" }), ...patch }, scope).kind).toBe("unavailable");
  });

  it.each([
    { walletAddress: "0x2222222222222222222222222222222222222222" },
    { registryAddress: "0x4444444444444444444444444444444444444444" },
    { chainId: 196 },
    { growthPoints: 999 },
    { stage: "guardian" },
    { nextStageAt: null },
    { careCount: 0.5 },
    { careCount: 2 ** 32 },
    { communityTotalCares: 0 },
    { communityTotalCares: -1 },
    { blockNumber: "1e2" },
    { blockNumber: "0100" },
    { blockNumber: ((BigInt(1) << BigInt(256))).toString() },
    { blockTimestampIso: "yesterday" },
    { observedAtIso: "2026-02-30T00:00:00.000Z" },
    { nextCareAtIso: "2026-09-30T13:00:00.000Z" },
    { contextKey: "" },
  ])("rejects invalid identity/progress/evidence: %o", (patch) => {
    expect(parseCompanionResponse(response(patch), scope).kind).toBe("unavailable");
  });

  it("accepts unknown totals without inventing zero", () => {
    const result = parseCompanionResponse(response({ communityTotalCares: null }), scope);
    expect(result.kind === "ready" && result.snapshot.communityTotalCares).toBeNull();
  });

  it("accepts ready-now at the source block timestamp", () => {
    expect(parseCompanionResponse(response({ nextCareAtIso: "2026-09-30T12:00:00.000Z" }), scope).kind).toBe("ready");
  });

  it("rejects fictional payloads and evidence older than the session floor", () => {
    const fictional = response();
    fictional.facts.dataMode = "fixture";
    expect(parseCompanionResponse(fictional, scope).kind).toBe("unavailable");
    expect(parseCompanionResponse(response(), { ...scope, minimumBlock: BigInt(101) }).kind).toBe("unavailable");
  });

  it("does not erase confirmed ownership on an unverifiable no-pet response", () => {
    const noPet = envelope({ kind: "no-pet", dataMode: "live" });
    expect(parseCompanionResponse(noPet, { ...scope, knownPet: true }).kind).toBe("unavailable");
    expect(parseCompanionResponse(noPet, { ...scope, minimumBlock: BigInt(100) }).kind).toBe("unavailable");
  });
});
