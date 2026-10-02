import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { TransactionRecoveryState } from "@/types/beta";
import { recoveryFixtures } from "@/fixtures/beta-fixtures";
import { TransactionRecoveryPanel } from "./TransactionRecoveryPanel";

const checkButton = () => screen.queryByRole("button", { name: /check status|checking/i });

describe("TransactionRecoveryPanel", () => {
  it("shows an idle state with no hash and no operation", () => {
    render(<TransactionRecoveryPanel state={recoveryFixtures.idle} onCheckStatus={vi.fn()} />);
    expect(screen.getByText("No transaction is waiting for confirmation.")).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it.each([
    ["checking", "Checking transaction status…"],
    ["pending", "Waiting for confirmation"],
    ["unknown", "Confirmation not known yet"],
    ["waitingFacts", "Confirmed — pet details not read yet"],
    ["confirmed", "Confirmed"],
    ["reverted", "Transaction reverted"],
    ["cancelled", "Transaction cancelled"],
    ["replaced", "Transaction replaced"],
  ] as const)("renders the %s phase with its hash and preview label", (key, title) => {
    render(<TransactionRecoveryPanel state={recoveryFixtures[key]} onCheckStatus={vi.fn()} />);
    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(screen.getByText("FICTIONAL_TRANSACTION_NOT_A_HASH")).toBeInTheDocument();
    expect(screen.getByText("Preview data")).toBeInTheDocument();
  });

  it("never offers a resend, signature or dismissal operation", () => {
    for (const state of Object.values(recoveryFixtures)) {
      const { unmount } = render(<TransactionRecoveryPanel state={state} onCheckStatus={vi.fn()} />);
      for (const button of screen.queryAllByRole("button")) {
        expect(button).toHaveAccessibleName(/^(Check status|Checking…)$/);
      }
      expect(screen.queryByText(/send again|resend|retry transaction|dismiss/i)).not.toBeInTheDocument();
      unmount();
    }
  });

  it.each(["pending", "unknown", "waitingFacts", "replaced"] as const)("calls onCheckStatus once from %s", (key) => {
    const onCheckStatus = vi.fn();
    render(<TransactionRecoveryPanel state={recoveryFixtures[key]} onCheckStatus={onCheckStatus} />);
    fireEvent.click(screen.getByRole("button", { name: "Check status" }));
    expect(onCheckStatus).toHaveBeenCalledTimes(1);
  });

  it("keeps the button focusable but inert while checking", () => {
    const onCheckStatus = vi.fn();
    render(<TransactionRecoveryPanel state={recoveryFixtures.checking} onCheckStatus={onCheckStatus} />);
    const button = screen.getByRole("button", { name: "Checking…" });
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toBeDisabled();
    button.focus();
    expect(button).toHaveFocus();
    fireEvent.click(button);
    expect(onCheckStatus).not.toHaveBeenCalled();
  });

  it("does not offer a status read once the chain outcome is settled", () => {
    for (const key of ["confirmed", "reverted", "cancelled"] as const) {
      const { unmount } = render(<TransactionRecoveryPanel state={recoveryFixtures[key]} onCheckStatus={vi.fn()} />);
      expect(checkButton()).not.toBeInTheDocument();
      unmount();
    }
  });

  it("separates a confirmed receipt from unavailable pet facts", () => {
    render(<TransactionRecoveryPanel state={recoveryFixtures.waitingFacts} onCheckStatus={vi.fn()} />);
    expect(screen.getByText(/network confirmed this transaction, but your pet and community details could not be read/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Check status" })).toBeInTheDocument();
  });

  it("renders the replacement hash separately and never as a confirmation", () => {
    render(<TransactionRecoveryPanel state={recoveryFixtures.replaced} onCheckStatus={vi.fn()} />);
    expect(screen.getByText("Replacement transaction")).toBeInTheDocument();
    expect(screen.getByText("FICTIONAL_REPLACEMENT_NOT_A_HASH")).toBeInTheDocument();
    expect(screen.getByText(/A replacement is not a confirmation/)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Confirmed" })).not.toBeInTheDocument();
  });

  it("does not claim failure for pending, unknown or replaced phases", () => {
    for (const key of ["pending", "unknown", "replaced"] as const) {
      const { unmount } = render(<TransactionRecoveryPanel state={recoveryFixtures[key]} onCheckStatus={vi.fn()} />);
      expect(screen.queryByText(/failed|no progress was awarded/i)).not.toBeInTheDocument();
      unmount();
    }
  });

  it("links only https explorer URLs", () => {
    const base = recoveryFixtures.replaced;
    const state: TransactionRecoveryState = {
      ...base,
      explorerUrl: "https://explorer.invalid/tx/fictional",
      replacementExplorerUrl: "javascript:alert(1)",
    };
    render(<TransactionRecoveryPanel state={state} onCheckStatus={vi.fn()} />);
    const links = screen.getAllByRole("link", { name: /view on explorer/i });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "https://explorer.invalid/tx/fictional");
    expect(links[0]).toHaveAttribute("rel", "noreferrer");
  });

  it("announces the phase in a polite live region", () => {
    render(<TransactionRecoveryPanel state={recoveryFixtures.pending} onCheckStatus={vi.fn()} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
