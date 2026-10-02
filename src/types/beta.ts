import type { DataMode } from "./view-models";

/** B0 presentation contracts. These types do not connect wallets or award progress. */
export interface WalletChoice {
  /** Opaque discovery-session ID. Never use the display name to route requests. */
  readonly id: string;
  readonly label: string;
}

export interface WalletChooserProps {
  readonly choices: readonly WalletChoice[];
  readonly selectedId: string | null;
  readonly busy: boolean;
  /** Explicit selection only. The lead owns connection prompts and providers. */
  readonly onSelect: (id: string) => void;
}

export type OnboardingState = {
  readonly networkLabel: string;
  readonly gasSymbol: string;
  readonly isTestnet: boolean;
} & (
  | { readonly kind: "needs-wallet" }
  | { readonly kind: "needs-connection" }
  | { readonly kind: "connecting" }
  | { readonly kind: "wrong-network" }
  | { readonly kind: "loading" }
  | { readonly kind: "unavailable"; readonly message: string }
  | { readonly kind: "needs-adoption" }
  | { readonly kind: "ready" }
  | { readonly kind: "cooldown"; readonly availableAtIso: string }
);

export interface OnboardingPanelProps {
  readonly state: OnboardingState;
  readonly onConnect: () => void;
  readonly onSwitchNetwork: () => void;
  /** Read-only. Adoption/care remain in the existing primary action area. */
  readonly onRetry: () => void;
}

export interface CosmeticMilestone {
  readonly id: string;
  readonly label: string;
  /** Absolute lifetime confirmed-care threshold, never a streak or unique-user count. */
  readonly target: number;
  readonly reached: boolean;
}

export type MilestoneState = { readonly dataMode: DataMode } & (
  | { readonly kind: "loading" }
  | { readonly kind: "unavailable" }
  | {
      readonly kind: "ready";
      readonly confirmedCareCount: number;
      readonly milestones: readonly CosmeticMilestone[];
      /** null means all defined cosmetic milestones are reached. */
      readonly nextTarget: number | null;
    }
);

export interface ProgressionPanelProps {
  readonly personal: MilestoneState;
  readonly community: MilestoneState;
  readonly onRetry: () => void;
}

/** Display contract only. Persistence/runtime wiring waits for final acceptance. */
export type TransactionRecoveryState =
  | { readonly kind: "idle" }
  | {
      readonly kind: "tracking";
      readonly action: "adopt" | "care";
      readonly transactionHash: string;
      /** Only the lead may construct an explorer link from the configured deployment. */
      readonly explorerUrl: string | null;
      readonly networkLabel: string;
      readonly dataMode: DataMode;
    } & (
      | { readonly phase: "checking" | "pending" | "confirmation-unknown" | "confirmed-awaiting-facts" | "confirmed" | "reverted" | "cancelled" }
      | {
          readonly phase: "replaced";
          /** Replacement is not confirmation; the lead validates and follows this hash. */
          readonly replacementHash: string;
          readonly replacementExplorerUrl: string | null;
        }
    );

export interface TransactionRecoveryPanelProps {
  readonly state: TransactionRecoveryState;
  /** Reads the existing hash. Never creates another submission. */
  readonly onCheckStatus: () => void;
}

export interface HelpEntry {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  /** Verified HTTPS guidance links. Render as links, never raw HTML or Markdown. */
  readonly links?: readonly { readonly label: string; readonly href: string }[];
}

export interface HelpPanelProps {
  readonly entries: readonly HelpEntry[];
  /** null until an actual monitored contact has been verified. */
  readonly supportUrl: string | null;
}
