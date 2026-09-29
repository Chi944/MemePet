import type { CommunityViewModel, DataMode } from "./view-models";

/** An application-defined cosmetic mission. It grants no on-chain reward. */
export type CommunityMissionState = {
  readonly title: "Mochi garden";
  readonly target: 20;
  readonly dataMode: DataMode;
} & (
  | { readonly kind: "loading" }
  | { readonly kind: "unavailable"; readonly message: string }
  | {
      readonly kind: "ready";
      /** Includes historical confirmed care actions for registry community 1. */
      readonly totalCareActions: number;
      readonly isComplete: boolean;
    }
);

/** A token reference is not an endorsement, partnership, balance or reward. */
export type CommunityIdentityState =
  | { readonly kind: "unconfigured" }
  | {
      readonly kind: "verified-reference";
      readonly name: string;
      readonly chainId: number;
      readonly networkLabel: string;
      readonly tokenAddress: string;
      readonly sourceUrl: string;
      readonly checkedAtIso: string;
      readonly dataMode: DataMode;
    };

export interface FinaleCommunityPanelProps {
  readonly community: CommunityViewModel;
  readonly mission: CommunityMissionState;
  readonly identity: CommunityIdentityState;
  /** Read-only: cannot care or send a transaction. */
  readonly onRetry: () => void;
}
