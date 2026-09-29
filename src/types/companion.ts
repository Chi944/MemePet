import type { DataMode, PetStage } from "./view-models";

/** F0 integration contract. Display inputs only; never a wallet signer. */
export type CompanionQuestion = "progress" | "next-care" | "contribution";

/** One coherent, confirmed registry read. This is not full wallet history. */
export interface CompanionSnapshot {
  /** Lead-generated identity for the wallet, chain, registry and read revision. */
  readonly contextKey: string;
  readonly walletAddress: string;
  readonly chainId: number;
  readonly registryAddress: string;
  /** Decimal string: bigint must not leak into a JSON response. */
  readonly blockNumber: string;
  readonly blockTimestampIso: string;
  readonly observedAtIso: string;
  readonly careCount: number;
  readonly growthPoints: number;
  readonly stage: PetStage;
  readonly nextStageAt: number | null;
  readonly nextCareAtIso: string;
  /** Unknown is null; it cannot be interpreted as zero. */
  readonly communityTotalCares: number | null;
}

export type CompanionFactsState = { readonly dataMode: DataMode } & (
  | { readonly kind: "needs-wallet" }
  | { readonly kind: "wrong-network"; readonly expectedChainId: number }
  | { readonly kind: "loading" }
  | { readonly kind: "no-pet" }
  | { readonly kind: "unavailable"; readonly message: string }
  | { readonly kind: "ready"; readonly snapshot: CompanionSnapshot }
);

export type CompanionReplyState =
  | { readonly kind: "idle" }
  | { readonly kind: "loading"; readonly contextKey: string }
  | { readonly kind: "unavailable"; readonly message: string }
  | {
      readonly kind: "answer";
      readonly contextKey: string;
      readonly question: CompanionQuestion;
      readonly source: "standard" | "ai";
      readonly text: string;
    };

export type PersonalityInteraction = "explore" | "practise";
export type PersonalityStyle = "playful" | "curious" | "focused";

/** Browser-local preferences, separate from chain progress and ownership. */
export interface PersonalityProfile {
  readonly version: 1;
  readonly exploreCount: number;
  readonly practiseCount: number;
  readonly style: PersonalityStyle;
}

export interface PersonalityPanelProps {
  readonly profile: PersonalityProfile;
  readonly storageStatus: "available" | "unavailable";
  readonly dataMode: DataMode;
  readonly onInteract: (interaction: PersonalityInteraction) => void;
  readonly onReset: () => void;
}

export interface CompanionPanelProps {
  readonly facts: CompanionFactsState;
  readonly personality: PersonalityProfile;
  readonly reply: CompanionReplyState;
  readonly onAsk: (question: CompanionQuestion) => void;
  /** Read-only recovery. No signatures, transactions, or approvals. */
  readonly onRetry: () => void;
}
