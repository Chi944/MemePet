/** FICTIONAL UI DATA. Only import from tests/development previews. */
import { mapGardenChapters, mapPersonalMilestones } from "@/lib/beta-progress";
import type { MilestoneState, OnboardingState, TransactionRecoveryState, WalletChoice } from "@/types/beta";

export const walletChoiceFixtures: readonly WalletChoice[] = [
  { id: "fixture-metamask", label: "MetaMask (fictional)" },
  { id: "fixture-okx", label: "OKX Wallet (fictional)" },
];

const network = { networkLabel: "X Layer testnet (fictional)", gasSymbol: "OKB", isTestnet: true } as const;
export const onboardingFixtures = {
  install: { ...network, kind: "needs-wallet" },
  connect: { ...network, kind: "needs-connection" },
  connecting: { ...network, kind: "connecting" },
  wrongNetwork: { ...network, kind: "wrong-network" },
  loading: { ...network, kind: "loading" },
  unavailable: { ...network, kind: "unavailable", message: "Fictional read failure. No pet facts are known." },
  adopt: { ...network, kind: "needs-adoption" },
  ready: { ...network, kind: "ready" },
  cooldown: { ...network, kind: "cooldown", availableAtIso: "2030-01-02T00:00:00.000Z" },
} as const satisfies Record<string, OnboardingState>;

export const personalMilestoneFixtures = {
  loading: { kind: "loading", dataMode: "fixture" },
  unavailable: mapPersonalMilestones(null, "fixture"),
  empty: mapPersonalMilestones(0, "fixture"),
  guardian: mapPersonalMilestones(5, "fixture"),
  regular: mapPersonalMilestones(10, "fixture"),
  allReached: mapPersonalMilestones(20, "fixture"),
} as const satisfies Record<string, MilestoneState>;

export const gardenChapterFixtures = {
  loading: { kind: "loading", dataMode: "fixture" },
  unavailable: mapGardenChapters(null, "fixture"),
  empty: mapGardenChapters(0, "fixture"),
  beforeBloom: mapGardenChapters(19, "fixture"),
  firstBloom: mapGardenChapters(20, "fixture"),
  growing: mapGardenChapters(50, "fixture"),
  allReached: mapGardenChapters(100, "fixture"),
} as const satisfies Record<string, MilestoneState>;

const recovery = {
  kind: "tracking", action: "care", transactionHash: "FICTIONAL_TRANSACTION_NOT_A_HASH",
  explorerUrl: null, networkLabel: "X Layer testnet (fictional)", dataMode: "fixture",
} as const;
export const recoveryFixtures = {
  idle: { kind: "idle" },
  checking: { ...recovery, phase: "checking" },
  pending: { ...recovery, phase: "pending" },
  unknown: { ...recovery, phase: "confirmation-unknown" },
  waitingFacts: { ...recovery, phase: "confirmed-awaiting-facts" },
  confirmed: { ...recovery, phase: "confirmed" },
  reverted: { ...recovery, phase: "reverted" },
  cancelled: { ...recovery, phase: "cancelled" },
  replaced: { ...recovery, phase: "replaced", replacementHash: "FICTIONAL_REPLACEMENT_NOT_A_HASH", replacementExplorerUrl: null },
} as const satisfies Record<string, TransactionRecoveryState>;
