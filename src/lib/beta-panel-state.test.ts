import { afterEach, describe, expect, it, vi } from "vitest";
import { DEPLOYMENT } from "./deployment";
import { mapBetaPanelState, type BetaPanelInputs } from "./beta-panel-state";
import { mapCommunityStatsToViewModel } from "./map-community";

const baseline: BetaPanelInputs = {
  deployment: DEPLOYMENT,
  wallet: {
    installed: true, address: "0x1111111111111111111111111111111111111111", chainId: 1952,
    connecting: false, wrongChain: false, selectionBusy: false,
  },
  registry: {
    readStatus: "ready", rawPet: { exists: true, communityId: 1, careCount: 10, lastCareDay: BigInt(20_000) },
    cooldownAvailableAtIso: null, isSubmitting: false,
  },
  community: mapCommunityStatsToViewModel(50),
};
function map(overrides: {
  wallet?: Partial<BetaPanelInputs["wallet"]>;
  registry?: Partial<BetaPanelInputs["registry"]>;
  community?: Partial<BetaPanelInputs["community"]>;
  deployment?: Partial<BetaPanelInputs["deployment"]>;
} = {}) {
  return mapBetaPanelState({
    deployment: { ...baseline.deployment, ...overrides.deployment },
    wallet: { ...baseline.wallet, ...overrides.wallet },
    registry: { ...baseline.registry, ...overrides.registry },
    community: { ...baseline.community, ...overrides.community },
  });
}
afterEach(() => vi.useRealTimers());

describe("B4 beta panel preparation — simulated inputs, not wallet acceptance", () => {
  it("uses confirmed care counts for independent cosmetic goals", () => {
    const state = map();
    expect(state.onboarding).toMatchObject({ kind: "ready", networkLabel: "X Layer testnet", gasSymbol: "OKB", isTestnet: true });
    expect(state.progression.personal).toMatchObject({ kind: "ready", confirmedCareCount: 10, nextTarget: 20 });
    expect(state.progression.community).toMatchObject({ kind: "ready", confirmedCareCount: 50, nextTarget: 100 });
  });

  it.each([
    [{ installed: false, address: null }, "needs-wallet"],
    [{ installed: false, address: null, selectionBusy: true }, "loading"],
    [{ address: null }, "needs-connection"],
    [{ address: null, selectionBusy: true }, "loading"],
    [{ connecting: true, address: null }, "connecting"],
    [{ chainId: 1 }, "wrong-network"],
    [{ wrongChain: true }, "wrong-network"],
    [{ chainId: null }, "loading"],
  ] as const)("orders wallet state before a retained pet: %s", (wallet, kind) => {
    const state = map({ wallet });
    expect(state.onboarding.kind).toBe(kind);
    expect(state.progression.personal.kind).toBe("unavailable");
  });

  it("keeps confirmed public community progress available without wallet connection", () => {
    expect(map({ wallet: { address: null, chainId: null, installed: false } }).progression.community)
      .toMatchObject({ kind: "ready", confirmedCareCount: 50 });
  });

  it.each(["idle", "loading", "error"] as const)("does not use retained pet counts when the read is %s", (readStatus) => {
    const state = map({ registry: { readStatus } });
    expect(state.onboarding.kind).toBe(readStatus === "error" ? "unavailable" : "loading");
    expect(state.progression.personal.kind).toBe(readStatus === "error" ? "unavailable" : "loading");
  });

  it("does not display care readiness or unlock milestones during submission", () => {
    const state = map({ registry: { isSubmitting: true } });
    expect(state.onboarding.kind).toBe("loading");
    expect(state.progression.personal.kind).toBe("loading");
    expect(state.progression.community.kind).toBe("loading");
  });

  it("never suggests another care or personal milestone while a saved hash is unresolved", () => {
    const state = map({ registry: { recoveryBlocksWrites: true } });
    expect(state.onboarding).toMatchObject({ kind: "unavailable", message: expect.stringContaining("Check status") });
    expect(state.progression.personal.kind).toBe("loading");
    // Independent, confirmed community reads remain honest and usable.
    expect(state.progression.community).toMatchObject({ kind: "ready", confirmedCareCount: 50 });
  });

  it("does not suggest care while a connected wallet's network request is unresolved", () => {
    const state = map({ wallet: { selectionBusy: true } });
    expect(state.onboarding.kind).toBe("loading");
    expect(state.progression.personal.kind).toBe("loading");
    expect(state.progression.community.kind).toBe("loading");
  });

  it("distinguishes a confirmed no-pet response from an unavailable pet", () => {
    expect(map({ registry: { rawPet: null } }).onboarding.kind).toBe("unavailable");
    const state = map({ registry: { rawPet: { exists: false, communityId: 0, careCount: 0, lastCareDay: BigInt(0) } } });
    expect(state.onboarding.kind).toBe("needs-adoption");
    expect(state.progression.personal).toMatchObject({ kind: "ready", confirmedCareCount: 0, nextTarget: 5 });
  });

  it.each([
    { exists: true, communityId: 99, careCount: 10, lastCareDay: BigInt(1) },
    { exists: true, communityId: 1, careCount: -1, lastCareDay: BigInt(1) },
    { exists: true, communityId: 1, careCount: 0x1_0000_0000, lastCareDay: BigInt(1) },
    { exists: false, communityId: 0, careCount: 10, lastCareDay: BigInt(1) },
  ])("rejects inconsistent or out-of-range personal facts", (rawPet) => {
    const state = map({ registry: { rawPet } });
    expect(state.onboarding.kind).toBe("unavailable");
    expect(state.progression.personal.kind).toBe("unavailable");
  });

  it.each([
    [{ isLoading: true }, "loading"],
    [{ errorMessage: "Read failed" }, "unavailable"],
    [{ totalCareActions: null }, "unavailable"],
    [{ totalCareActions: Number.MAX_SAFE_INTEGER + 1 }, "unavailable"],
    [{ dataMode: "fixture" }, "unavailable"],
  ] as const)("does not unlock garden chapters from stale or unverified totals", (community, kind) => {
    const state = map({ community });
    expect(state.progression.community.kind).toBe(kind);
    expect(state.progression.personal.kind).toBe("ready");
  });

  it("preserves the source marker when rejecting fixture totals", () => {
    expect(map({ community: { dataMode: "fixture" } }).progression.community)
      .toEqual({ kind: "unavailable", dataMode: "fixture" });
  });

  it("keeps a chain-derived cooldown even if the computer clock is far ahead", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2040-01-01T00:00:00Z"));
    const availableAtIso = "2030-01-02T00:00:00.000Z";
    expect(map({ registry: { cooldownAvailableAtIso: availableAtIso } }).onboarding)
      .toMatchObject({ kind: "cooldown", availableAtIso });
  });

  it.each(["invalid", "2030-01-02T08:00:00.000Z", "2030-01-02T00:00:00+08:00"])(
    "does not present an invalid UTC reset %s as care readiness", (cooldownAvailableAtIso) => {
      expect(map({ registry: { cooldownAvailableAtIso } }).onboarding.kind).toBe("unavailable");
    },
  );

  it("keeps unconfigured deployment and wrong-network totals unavailable", () => {
    const missing = map({ deployment: { status: "not-deployed", registryAddress: null } });
    expect(missing.onboarding.kind).toBe("unavailable");
    expect(missing.progression.personal.kind).toBe("unavailable");
    expect(missing.progression.community.kind).toBe("unavailable");
    expect(map({ wallet: { chainId: 31337 } }).progression.community.kind).toBe("unavailable");
  });

  it("does not relabel mainnet or a local chain as a testnet", () => {
    const mainnet = map({ deployment: { status: "mainnet", networkName: "Configured mainnet", chainId: 196 }, wallet: { chainId: 196 } });
    expect(mainnet.onboarding).toMatchObject({ networkLabel: "Configured mainnet", isTestnet: false });
    const local = map({ deployment: { status: "local", networkName: "Local Anvil", currencySymbol: "ETH", chainId: 31337 }, wallet: { chainId: 31337 } });
    expect(local.onboarding).toMatchObject({ networkLabel: "Local Anvil", gasSymbol: "ETH", isTestnet: false });
  });
});
