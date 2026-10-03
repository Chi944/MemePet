import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CarePanel } from "@/components/pet/CarePanel";
import { resolveCareActionState } from "@/lib/care-action-machine";

const baseInput = {
  walletInstalled: true,
  connected: true,
  wrongChain: false,
  hasPet: false,
  careEnabled: true,
  cooldownAvailableAtIso: null,
} as const;

describe("live pet surface never fabricates progress", () => {
  it.each(["idle", "error", "success", "pending"] as const)("does not offer Care for an unresolved hash with phase %s", (txPhase) => {
    const onCare = vi.fn();
    const action = resolveCareActionState({
      ...baseInput, hasPet: true, readStatus: "idle", txPhase,
      transactionUnresolved: true,
    });
    render(<CarePanel pet={null} action={action} onCare={onCare} onConnect={vi.fn()} onSwitchNetwork={vi.fn()} />);
    expect(action.kind).toBe("unavailable");
    expect(screen.getByText(/submitted transaction still needs verification/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /care/i })).not.toBeInTheDocument();
    expect(onCare).not.toHaveBeenCalled();
  });

  // Regression: PLACEHOLDER_PET was a hand-written pet with growthPoints 0,
  // nextStageAt 20 and dataMode "live", rendered whenever the chain read
  // returned no pet. A failed read therefore showed "0 growth points" while
  // the very same panel said "No preview data is shown".
  it("shows no growth numbers when no pet is known", () => {
    const action = resolveCareActionState({
      ...baseInput,
      readStatus: "error",
      txPhase: "idle",
    });

    render(
      <CarePanel
        pet={null}
        action={action}
        onCare={() => {}}
        onConnect={() => {}}
        onSwitchNetwork={() => {}}
      />,
    );

    expect(screen.queryByText(/growth points/i)).toBeNull();
    expect(screen.queryByText(/Next stage at/i)).toBeNull();
  });

  // Regression: readStatus "error" mapped to the "error" kind, which renders an
  // enabled retry wired to onCare — offering a real care transaction even
  // though neither the pet nor the cooldown was known.
  it("does not offer a care transaction while the read is failing", () => {
    const onCare = vi.fn();
    const action = resolveCareActionState({
      ...baseInput,
      readStatus: "error",
      txPhase: "idle",
      cooldownAvailableAtIso: "2099-01-01T00:00:00.000Z",
    });

    expect(action.kind).toBe("unavailable");

    render(
      <CarePanel
        pet={null}
        action={action}
        onCare={onCare}
        onConnect={() => {}}
        onSwitchNetwork={() => {}}
      />,
    );

    const retry = screen.queryByRole("button", { name: /care/i });
    expect(retry).toBeNull();

    screen.getAllByText(/could not be loaded/i);
    expect(onCare).not.toHaveBeenCalled();
  });

  // Regression: the state machine had no txKind, so an adopt receipt set
  // txPhase "success" and the panel announced "Care is confirmed".
  it("does not announce a confirmed care after an adoption", () => {
    const afterAdopt = resolveCareActionState({
      ...baseInput,
      readStatus: "idle",
      hasPet: true,
      txPhase: "success",
      txKind: "adopt",
    });

    expect(afterAdopt.kind).not.toBe("success");
  });

  // Regression: the write path sets readStatus "error" alongside txPhase
  // "success" to say "confirmed on chain, but the display is stale". Checking
  // success first short-circuited that, rendering stale growth as confirmed
  // and discarding the warning the write path went out of its way to produce.
  it("does not render a confirmed care when the post-receipt re-read failed", () => {
    const stale =
      "Care confirmed on chain, but refreshing the pet failed. The displayed progress may be out of date.";

    const action = resolveCareActionState({
      ...baseInput,
      hasPet: true,
      readStatus: "error",
      readErrorMessage: stale,
      txPhase: "success",
      txKind: "care",
    });

    expect(action.kind).not.toBe("success");

    render(
      <CarePanel
        pet={null}
        action={action}
        onCare={() => {}}
        onConnect={() => {}}
        onSwitchNetwork={() => {}}
      />,
    );

    expect(screen.getByText(stale)).toBeInTheDocument();
    expect(screen.queryByText(/Care is confirmed/)).toBeNull();
  });

  it("still announces a confirmed care after a care", () => {
    const afterCare = resolveCareActionState({
      ...baseInput,
      readStatus: "idle",
      hasPet: true,
      txPhase: "success",
      txKind: "care",
    });

    expect(afterCare.kind).toBe("success");
  });

  it("keeps the retry affordance for a genuine transaction error", () => {
    const onCare = vi.fn();
    const action = resolveCareActionState({
      ...baseInput,
      readStatus: "idle",
      hasPet: true,
      txPhase: "error",
      txErrorMessage: "The care transaction reverted. No progress was awarded.",
    });

    expect(action.kind).toBe("error");

    render(
      <CarePanel
        pet={null}
        action={action}
        onCare={onCare}
        onConnect={() => {}}
        onSwitchNetwork={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Try care again/i }));
    expect(onCare).toHaveBeenCalledTimes(1);
  });
});
