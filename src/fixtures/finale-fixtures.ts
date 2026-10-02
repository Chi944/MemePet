/** FICTIONAL UI DATA. Development previews/tests only; never live-read fallbacks. */
import type {
  CompanionFactsState,
  CompanionReplyState,
  CompanionSnapshot,
  PersonalityProfile,
} from "@/types/companion";
import type {
  CommunityIdentityState,
  CommunityMissionState,
} from "@/types/finale-community";

const fictionalSnapshot = {
  contextKey: "FICTIONAL_CONTEXT_1",
  walletAddress: "FICTIONAL_WALLET_NOT_AN_ADDRESS",
  chainId: 1952,
  registryAddress: "FICTIONAL_REGISTRY_NOT_AN_ADDRESS",
  blockNumber: "100",
  blockTimestampIso: "2030-01-01T12:00:00.000Z",
  observedAtIso: "2030-01-01T12:00:05.000Z",
  careCount: 1,
  growthPoints: 10,
  stage: "hatchling",
  nextStageAt: 20,
  nextCareAtIso: "2030-01-02T00:00:00.000Z",
  communityTotalCares: 7,
} as const satisfies CompanionSnapshot;

export const companionFactsFixtures = {
  needsWallet: { kind: "needs-wallet", dataMode: "fixture" },
  wrongNetwork: {
    kind: "wrong-network",
    expectedChainId: 1952,
    dataMode: "fixture",
  },
  loading: { kind: "loading", dataMode: "fixture" },
  noPet: { kind: "no-pet", dataMode: "fixture" },
  unavailable: {
    kind: "unavailable",
    message: "Fictional read failure. No pet facts are available.",
    dataMode: "fixture",
  },
  ready: {
    kind: "ready",
    snapshot: fictionalSnapshot,
    dataMode: "fixture",
  },
  careAvailable: {
    kind: "ready",
    snapshot: {
      ...fictionalSnapshot,
      contextKey: "FICTIONAL_CONTEXT_CARE_AVAILABLE",
      nextCareAtIso: fictionalSnapshot.blockTimestampIso,
    },
    dataMode: "fixture",
  },
  zeroActivity: {
    kind: "ready",
    snapshot: {
      ...fictionalSnapshot,
      careCount: 0,
      growthPoints: 0,
      communityTotalCares: 0,
    },
    dataMode: "fixture",
  },
  unknownCommunity: {
    kind: "ready",
    snapshot: { ...fictionalSnapshot, communityTotalCares: null },
    dataMode: "fixture",
  },
} as const satisfies Record<string, CompanionFactsState>;

export const personalityFixtures = {
  playful: { version: 1, exploreCount: 0, practiseCount: 0, style: "playful" },
  curious: { version: 1, exploreCount: 3, practiseCount: 0, style: "curious" },
  focused: { version: 1, exploreCount: 0, practiseCount: 3, style: "focused" },
} as const satisfies Record<string, PersonalityProfile>;

export const companionReplyFixtures = {
  idle: { kind: "idle" },
  loading: { kind: "loading", contextKey: fictionalSnapshot.contextKey },
  standardAnswer: {
    kind: "answer",
    contextKey: fictionalSnapshot.contextKey,
    question: "progress",
    source: "standard",
    text: "FICTIONAL STANDARD RECAP: Mochi is a Hatchling with 10 growth points from 1 care action. Buddy begins at 20 points.",
  },
  aiAnswer: {
    kind: "answer",
    contextKey: fictionalSnapshot.contextKey,
    question: "progress",
    source: "ai",
    text: "FICTIONAL AI-STYLE PREVIEW — no model was called: One little care, one happy Mochi! This example Hatchling has 10 points; Buddy begins at 20.",
  },
  unavailable: {
    kind: "unavailable",
    message: "Fictional reply failure. The confirmed facts remain available.",
  },
} as const satisfies Record<string, CompanionReplyState>;

export const communityMissionFixtures = {
  loading: { title: "Mochi garden", target: 20, kind: "loading", dataMode: "fixture" },
  unavailable: {
    title: "Mochi garden",
    target: 20,
    kind: "unavailable",
    message: "Fictional community read failure. The total is unknown.",
    dataMode: "fixture",
  },
  empty: {
    title: "Mochi garden",
    target: 20,
    kind: "ready",
    totalCareActions: 0,
    isComplete: false,
    dataMode: "fixture",
  },
  progress: {
    title: "Mochi garden",
    target: 20,
    kind: "ready",
    totalCareActions: 7,
    isComplete: false,
    dataMode: "fixture",
  },
  exactlyReached: {
    title: "Mochi garden",
    target: 20,
    kind: "ready",
    totalCareActions: 20,
    isComplete: true,
    dataMode: "fixture",
  },
  reached: {
    title: "Mochi garden",
    target: 20,
    kind: "ready",
    totalCareActions: 24,
    isComplete: true,
    dataMode: "fixture",
  },
} as const satisfies Record<string, CommunityMissionState>;

export const communityIdentityFixtures = {
  unconfigured: { kind: "unconfigured" },
  fictionalReference: {
    kind: "verified-reference",
    name: "FICTIONAL example community — not a verified live token",
    chainId: 1952,
    networkLabel: "FICTIONAL reference on X Layer testnet",
    tokenAddress: "FICTIONAL_TOKEN_NOT_AN_ADDRESS",
    sourceUrl: "https://example.invalid/fictional-token",
    checkedAtIso: "2030-01-01T12:00:00.000Z",
    dataMode: "fixture",
  },
} as const satisfies Record<string, CommunityIdentityState>;
