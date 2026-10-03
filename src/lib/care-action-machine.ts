import type { CareActionState } from "@/types/view-models";

export type LivePetControllerInput = {
  readonly walletInstalled: boolean;
  readonly connected: boolean;
  readonly wrongChain: boolean;
  readonly readStatus: "idle" | "loading" | "error";
  readonly readErrorMessage?: string;
  readonly hasPet: boolean;
  readonly txPhase:
    | "idle"
    | "awaiting-signature"
    | "submitting"
    | "pending"
    | "success"
    | "error"
    | "rejected";
  /** Which write produced txPhase. An adopt receipt must not read as a confirmed care. */
  readonly txKind?: "idle" | "adopt" | "care";
  readonly transactionHash?: string;
  /** An existing submitted hash has no verified final result yet. */
  readonly transactionUnresolved?: boolean;
  readonly txErrorMessage?: string;
  /** When false, care remains unavailable even if a pet exists. */
  readonly careEnabled: boolean;
  /**
   * ISO instant care becomes available again, or null/undefined when ready.
   * Derived from lastCareDay + UTC-day rule — never from a failed submit.
   */
  readonly cooldownAvailableAtIso?: string | null;
};

/**
 * Maps wallet / read / tx outcomes onto the frozen CareActionState union.
 * A hash alone never becomes success. A confirmed receipt with a failed
 * re-read remains unavailable; only a valid pet read can display success.
 */
export function resolveCareActionState(
  input: LivePetControllerInput,
): CareActionState {
  if (!input.walletInstalled || !input.connected) {
    return { kind: "needs-wallet" };
  }

  if (input.wrongChain) {
    return { kind: "wrong-network" };
  }

  if (input.txPhase === "awaiting-signature") {
    return { kind: "awaiting-signature" };
  }

  if (input.txPhase === "submitting") {
    return { kind: "submitting" };
  }

  if (input.transactionUnresolved) {
    return {
      kind: "unavailable",
      message: "A submitted transaction still needs verification. Use Check status in its transaction panel; no new transaction will be sent.",
    };
  }

  if (input.txPhase === "pending") {
    return {
      kind: "pending",
      transactionHash: input.transactionHash ?? "pending",
    };
  }

  if (input.readStatus === "loading") {
    return {
      kind: "unavailable",
      message: "Reading pet state from the registry…",
    };
  }

  // A failed read is "unavailable", not "error": we do not know whether a pet
  // exists or whether the daily cooldown is active, so care must not be
  // offered. The "error" kind renders an enabled retry that submits a write.
  if (input.readStatus === "error") {
    return {
      kind: "unavailable",
      message:
        input.readErrorMessage ??
        "Pet data could not be loaded. No preview data is shown.",
    };
  }

  const transactionFailed =
    input.txPhase === "rejected" || input.txPhase === "error";
  const transactionError =
    input.txErrorMessage ??
    (input.txPhase === "rejected"
      ? "You declined the wallet request. No progress was awarded."
      : "The transaction failed. No progress was awarded.");

  // The error state offers a CARE retry. Preserve adoption errors without
  // wiring that retry to the wrong contract method.
  if (transactionFailed && (input.txKind === "adopt" || !input.hasPet)) {
    return { kind: "unavailable", message: transactionError };
  }

  if (!input.hasPet) {
    return {
      kind: "unavailable",
      message: "No pet adopted yet. Use Adopt on this page.",
    };
  }

  if (!input.careEnabled) {
    return {
      kind: "unavailable",
      message: "Daily care is not enabled in this build.",
    };
  }

  // Only a confirmed care with a valid pet read can announce care success.
  if (input.txPhase === "success" && input.txKind !== "adopt") {
    return { kind: "success" };
  }

  if (input.cooldownAvailableAtIso) {
    return {
      kind: "cooldown",
      availableAtIso: input.cooldownAvailableAtIso,
    };
  }

  if (transactionFailed) {
    return { kind: "error", message: transactionError };
  }

  return { kind: "ready" };
}
