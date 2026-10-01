import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CompanionPanelProps } from "@/types/companion";
import {
  companionFactsFixtures,
  companionReplyFixtures,
  personalityFixtures,
} from "@/fixtures/finale-fixtures";
import { CompanionPanel } from "./CompanionPanel";

const baseProps: CompanionPanelProps = {
  facts: companionFactsFixtures.ready,
  personality: personalityFixtures.playful,
  reply: companionReplyFixtures.idle,
  onAsk: () => undefined,
  onRetry: () => undefined,
};

describe("CompanionPanel", () => {
  it("does not render ask controls when facts are not ready", () => {
    const nonReadyFacts = [
      companionFactsFixtures.needsWallet,
      companionFactsFixtures.loading,
      companionFactsFixtures.noPet,
      companionFactsFixtures.unavailable,
      companionFactsFixtures.wrongNetwork,
    ];
    for (const facts of nonReadyFacts) {
      const { unmount } = render(<CompanionPanel {...baseProps} facts={facts} />);
      expect(
        screen.queryByRole("group", { name: "Ask Mochi" }),
      ).not.toBeInTheDocument();
      unmount();
    }
  });

  it("shows a no-pet message without ask controls", () => {
    render(<CompanionPanel {...baseProps} facts={companionFactsFixtures.noPet} />);
    expect(screen.getByText(/no pet found/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Ask Mochi" }),
    ).not.toBeInTheDocument();
  });

  it("fires onAsk exactly once with the correct question ID per button", () => {
    const onAsk = vi.fn();
    render(<CompanionPanel {...baseProps} onAsk={onAsk} />);

    fireEvent.click(screen.getByRole("button", { name: "Explain progress" }));
    expect(onAsk).toHaveBeenCalledTimes(1);
    expect(onAsk).toHaveBeenLastCalledWith("progress");

    fireEvent.click(screen.getByRole("button", { name: "Next care time" }));
    expect(onAsk).toHaveBeenCalledTimes(2);
    expect(onAsk).toHaveBeenLastCalledWith("next-care");

    fireEvent.click(screen.getByRole("button", { name: "Contribution" }));
    expect(onAsk).toHaveBeenCalledTimes(3);
    expect(onAsk).toHaveBeenLastCalledWith("contribution");
  });

  it("disables ask controls while a reply is loading for the current snapshot", () => {
    render(<CompanionPanel {...baseProps} reply={companionReplyFixtures.loading} />);
    expect(screen.getByRole("button", { name: "Explain progress" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next care time" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Contribution" })).toBeDisabled();
  });

  it("hides a loading reply whose context key does not match the current snapshot", () => {
    render(
      <CompanionPanel
        {...baseProps}
        reply={{ kind: "loading", contextKey: "STALE_KEY" }}
      />,
    );
    expect(screen.queryByText("Mochi is thinking…")).not.toBeInTheDocument();
    // Ask controls remain enabled when the stale load is hidden
    expect(screen.getByRole("button", { name: "Explain progress" })).not.toBeDisabled();
  });

  it("hides an answer whose context key does not match the current snapshot", () => {
    render(
      <CompanionPanel
        {...baseProps}
        reply={{
          kind: "answer",
          contextKey: "STALE_KEY",
          question: "progress",
          source: "standard",
          text: "Stale answer that must not appear.",
        }}
      />,
    );
    expect(screen.queryByText("Stale answer that must not appear.")).not.toBeInTheDocument();
    expect(screen.queryByText("Standard explanation")).not.toBeInTheDocument();
  });

  it("updates the same polite region for immediate answers and clears it when the snapshot changes", () => {
    const { rerender } = render(<CompanionPanel {...baseProps} />);
    const region = screen.getByRole("region", { name: "Mochi's response" });
    expect(region).toBeEmptyDOMElement();
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "true");

    rerender(<CompanionPanel {...baseProps} reply={companionReplyFixtures.standardAnswer} />);
    expect(screen.getByRole("region", { name: "Mochi's response" })).toBe(region);
    expect(region).toHaveTextContent(companionReplyFixtures.standardAnswer.text);

    rerender(
      <CompanionPanel
        {...baseProps}
        facts={{
          ...companionFactsFixtures.ready,
          snapshot: { ...companionFactsFixtures.ready.snapshot, contextKey: "OTHER_WALLET" },
        }}
        reply={companionReplyFixtures.standardAnswer}
      />,
    );
    expect(screen.getByRole("region", { name: "Mochi's response" })).toBe(region);
    expect(region).toBeEmptyDOMElement();
  });

  it("preserves the response region through loading and clears busy state for the answer", () => {
    const { rerender } = render(<CompanionPanel {...baseProps} />);
    const region = screen.getByRole("region", { name: "Mochi's response" });

    rerender(<CompanionPanel {...baseProps} reply={companionReplyFixtures.loading} />);
    expect(screen.getByRole("region", { name: "Mochi's response" })).toBe(region);
    expect(region).toHaveAttribute("aria-busy", "true");
    expect(region).toHaveTextContent("Mochi is thinking…");

    rerender(<CompanionPanel {...baseProps} reply={companionReplyFixtures.standardAnswer} />);
    expect(screen.getByRole("region", { name: "Mochi's response" })).toBe(region);
    expect(region).toHaveAttribute("aria-busy", "false");
    expect(region).toHaveTextContent(companionReplyFixtures.standardAnswer.text);
  });

  it("labels standard answers as 'Standard explanation', not 'AI response'", () => {
    render(
      <CompanionPanel {...baseProps} reply={companionReplyFixtures.standardAnswer} />,
    );
    expect(screen.getByText("Standard explanation")).toBeInTheDocument();
    expect(screen.queryByText("AI response")).not.toBeInTheDocument();
    expect(screen.getByText(companionReplyFixtures.standardAnswer.text)).toBeInTheDocument();
  });

  it("labels ai answers with 'AI response', not 'Standard explanation'", () => {
    render(
      <CompanionPanel {...baseProps} reply={companionReplyFixtures.aiAnswer} />,
    );
    expect(screen.getByText("AI response")).toBeInTheDocument();
    expect(screen.queryByText("Standard explanation")).not.toBeInTheDocument();
    expect(screen.getByText(companionReplyFixtures.aiAnswer.text)).toBeInTheDocument();
  });

  it("renders reply text as safe text, not executable HTML", () => {
    const dangerous = "<img src=x onerror=alert(1)>";
    render(
      <CompanionPanel
        {...baseProps}
        reply={{
          kind: "answer",
          contextKey: "FICTIONAL_CONTEXT_1",
          question: "progress",
          source: "standard",
          text: dangerous,
        }}
      />,
    );
    expect(screen.getByText(dangerous)).toBeInTheDocument();
    expect(document.querySelector("img")).not.toBeInTheDocument();
  });

  it("keeps facts readable when reply is unavailable", () => {
    render(
      <CompanionPanel {...baseProps} reply={companionReplyFixtures.unavailable} />,
    );
    // Recap and evidence remain after a failed explanation
    expect(screen.getByRole("heading", { name: "Where is my pet now?" })).toBeInTheDocument();
    expect(screen.getByText("View verified evidence")).toBeInTheDocument();
    // Reply error also visible
    expect(
      screen.getByText(companionReplyFixtures.unavailable.message),
    ).toBeInTheDocument();
  });

  it("shows unknown community total as unknown, not zero", () => {
    render(
      <CompanionPanel
        {...baseProps}
        facts={companionFactsFixtures.unknownCommunity}
      />,
    );
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.queryByText(/community total.*\b0\b/i)).not.toBeInTheDocument();
  });

  it("fires onRetry when retry is clicked on unavailable facts", () => {
    const onRetry = vi.fn();
    render(
      <CompanionPanel
        {...baseProps}
        facts={companionFactsFixtures.unavailable}
        onRetry={onRetry}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry read" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

const readySnapshot = companionFactsFixtures.ready.snapshot;

function evidence(): HTMLDetailsElement {
  const summary = screen.getByText("View verified evidence");
  const details = summary.closest("details");
  if (!details) throw new Error("evidence is not inside a native details element");
  return details;
}

function evidenceValue(label: string): string | null {
  const term = within(evidence()).getByText(label, { selector: "dt" });
  return term.nextElementSibling?.textContent ?? null;
}

describe("CompanionPanel F6 recap and evidence layout", () => {
  it("answers 'where is my pet now' with the four recap facts outside the disclosure", () => {
    render(<CompanionPanel {...baseProps} />);
    const recap = screen
      .getByRole("heading", { name: "Where is my pet now?" })
      .closest("section");
    if (!recap) throw new Error("recap card missing");
    expect(evidence()).not.toContainElement(recap);

    const r = within(recap);
    expect(r.getByText("Stage").nextElementSibling).toHaveTextContent("hatchling");
    expect(r.getByText("Growth").nextElementSibling).toHaveTextContent(
      "10 pointsNext stage at 20 points",
    );
    expect(r.getByText("Your confirmed cares").nextElementSibling).toHaveTextContent(/^1$/);
    expect(r.getByText("Next eligible care").nextElementSibling).toHaveTextContent(
      "2030-01-02 00:00 UTC",
    );
    // Closed-view context: identity, network, scope, provenance and block.
    expect(r.getByText(readySnapshot.walletAddress)).toBeInTheDocument();
    expect(r.getByText("Chain 1952")).toBeInTheDocument();
    expect(r.getByText("MemePet activity only")).toBeInTheDocument();
    expect(r.getByText("Fixture")).toBeInTheDocument();
    expect(r.getByText("Confirmed at block 100")).toBeInTheDocument();
    // Community total is evidence only, not part of the concise recap.
    expect(r.queryByText(/community/i)).not.toBeInTheDocument();
  });

  it("shortens a long wallet in the recap but keeps it complete in the evidence", () => {
    const wallet = `0x${"ab".repeat(20)}`;
    const registry = `0x${"cd".repeat(20)}`;
    render(
      <CompanionPanel
        {...baseProps}
        facts={{
          ...companionFactsFixtures.ready,
          dataMode: "live",
          snapshot: { ...readySnapshot, walletAddress: wallet, registryAddress: registry },
        }}
      />,
    );
    expect(screen.getByText("0xabab…abab")).toHaveAttribute("title", wallet);
    expect(screen.getByText("Live read")).toBeInTheDocument();
    expect(screen.queryByText("Fixture")).not.toBeInTheDocument();
    expect(evidenceValue("Wallet")).toBe(wallet);
    expect(evidenceValue("Registry")).toBe(registry);
  });

  it("describes already-eligible care at its source block without implying ready now", () => {
    vi.useFakeTimers();
    try {
      const facts = {
        ...companionFactsFixtures.ready,
        snapshot: { ...readySnapshot, nextCareAtIso: readySnapshot.blockTimestampIso },
      };
      vi.setSystemTime("2000-01-01T00:00:00Z");
      const { rerender } = render(<CompanionPanel {...baseProps} facts={facts} />);
      expect(screen.getByText("Care at this read").nextElementSibling).toHaveTextContent(
        "AvailableCheck Daily care for current status.",
      );
      expect(screen.queryByText("Next eligible care")).not.toBeInTheDocument();
      expect(evidenceValue("Next care time")).toBe(readySnapshot.blockTimestampIso);

      vi.setSystemTime("2040-01-01T00:00:00Z");
      rerender(<CompanionPanel {...baseProps} facts={facts} />);
      expect(screen.getByText("Care at this read").nextElementSibling).toHaveTextContent("Available");
      expect(screen.queryByText(/ready now/i)).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps a snapshot cooldown even after the browser clock passes its deadline", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime("2040-01-01T00:00:00Z");
      render(<CompanionPanel {...baseProps} />);
      expect(screen.getByText("Next eligible care").nextElementSibling).toHaveTextContent("2030-01-02 00:00 UTC");
      expect(screen.queryByText("Care at this read")).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps every supplied evidence field unchanged inside a closed native disclosure", () => {
    render(<CompanionPanel {...baseProps} />);
    const details = evidence();
    expect(details.open).toBe(false);
    expect(evidenceValue("Network")).toBe("Chain 1952");
    expect(evidenceValue("Wallet")).toBe(readySnapshot.walletAddress);
    expect(evidenceValue("Registry")).toBe(readySnapshot.registryAddress);
    expect(evidenceValue("Read block")).toBe(readySnapshot.blockNumber);
    expect(evidenceValue("Block time")).toBe(readySnapshot.blockTimestampIso);
    expect(evidenceValue("Observed at")).toBe(readySnapshot.observedAtIso);
    expect(evidenceValue("Your care actions")).toBe("1");
    expect(evidenceValue("Growth points")).toBe("10");
    expect(evidenceValue("Stage")).toBe("hatchling");
    expect(evidenceValue("Next stage at")).toBe("20 points");
    expect(evidenceValue("Next care time")).toBe(readySnapshot.nextCareAtIso);
    expect(evidenceValue("Community total (all pets)")).toBe("7");
    // No invented history-style evidence.
    expect(details).not.toHaveTextContent(/transaction|streak|holder|0x[0-9a-f]{64}/i);
  });

  it("uses a focusable summary placed after the question controls and toggles open", () => {
    render(<CompanionPanel {...baseProps} />);
    const summary = screen.getByText("View verified evidence");
    expect(summary.tagName).toBe("SUMMARY");
    expect(summary.parentElement).toBe(evidence());
    // Native summaries are in the tab order without tabindex; ensure none was removed.
    expect(summary).not.toHaveAttribute("tabindex", "-1");
    summary.focus();
    expect(summary).toHaveFocus();

    const lastQuestion = screen.getByRole("button", { name: "Contribution" });
    expect(
      lastQuestion.compareDocumentPosition(summary) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    fireEvent.click(summary);
    expect(evidence().open).toBe(true);
    fireEvent.click(summary);
    expect(evidence().open).toBe(false);
  });

  it("shows the answer and its provenance above the closed disclosure", () => {
    render(<CompanionPanel {...baseProps} reply={companionReplyFixtures.standardAnswer} />);
    const answer = screen.getByText(companionReplyFixtures.standardAnswer.text);
    expect(evidence().open).toBe(false);
    expect(evidence()).not.toContainElement(answer);
    expect(
      answer.compareDocumentPosition(evidence()) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("Standard explanation")).toBeVisible();
  });

  it("shows final stage instead of a next-stage threshold", () => {
    render(
      <CompanionPanel
        {...baseProps}
        facts={{
          ...companionFactsFixtures.ready,
          snapshot: { ...readySnapshot, stage: "guardian", growthPoints: 60, nextStageAt: null },
        }}
      />,
    );
    expect(screen.getByText("Growth").nextElementSibling).toHaveTextContent(
      "60 pointsFinal stage reached",
    );
    expect(evidenceValue("Next stage at")).toBe("Final stage reached");
  });

  it("shows a non-UTC next care value exactly as supplied", () => {
    render(
      <CompanionPanel
        {...baseProps}
        facts={{
          ...companionFactsFixtures.ready,
          snapshot: { ...readySnapshot, nextCareAtIso: "2030-01-02T08:00:00+08:00" },
        }}
      />,
    );
    expect(screen.getByText("Next eligible care").nextElementSibling).toHaveTextContent(
      "2030-01-02T08:00:00+08:00",
    );
  });

  it("keeps an unknown community total as 'Unknown', separate from personal cares", () => {
    render(<CompanionPanel {...baseProps} facts={companionFactsFixtures.unknownCommunity} />);
    expect(evidenceValue("Community total (all pets)")).toBe("Unknown");
    expect(evidenceValue("Your care actions")).toBe("1");
    expect(screen.getByText("Your confirmed cares").nextElementSibling).toHaveTextContent(
      /^1$/,
    );
  });

  it("shows a genuine zero community total as 0, distinct from unknown", () => {
    render(<CompanionPanel {...baseProps} facts={companionFactsFixtures.zeroActivity} />);
    expect(evidenceValue("Community total (all pets)")).toBe("0");
    expect(evidenceValue("Your care actions")).toBe("0");
  });

  it("gives each non-ready state its own message with no recap, evidence or questions", () => {
    const cases = [
      [companionFactsFixtures.needsWallet, /connect a wallet/i],
      [companionFactsFixtures.wrongNetwork, /switch to chain 1952/i],
      [companionFactsFixtures.loading, /loading memepet activity/i],
      [companionFactsFixtures.noPet, /no pet found/i],
      [companionFactsFixtures.unavailable, companionFactsFixtures.unavailable.message],
    ] as const;
    for (const [facts, message] of cases) {
      const { unmount } = render(
        <CompanionPanel {...baseProps} facts={facts} reply={companionReplyFixtures.standardAnswer} />,
      );
      expect(screen.getByText(message)).toBeInTheDocument();
      expect(screen.queryByText("Where is my pet now?")).not.toBeInTheDocument();
      expect(screen.queryByText("View verified evidence")).not.toBeInTheDocument();
      expect(screen.queryByRole("group", { name: "Ask Mochi" })).not.toBeInTheDocument();
      // A reply for an earlier snapshot never appears without ready facts.
      expect(
        screen.queryByText(companionReplyFixtures.standardAnswer.text),
      ).not.toBeInTheDocument();
      unmount();
    }
  });

  it("drops an obsolete answer after a context change while showing the new facts", () => {
    const { rerender } = render(
      <CompanionPanel {...baseProps} reply={companionReplyFixtures.aiAnswer} />,
    );
    expect(screen.getByText("AI response")).toBeInTheDocument();
    rerender(
      <CompanionPanel
        {...baseProps}
        facts={{
          ...companionFactsFixtures.ready,
          snapshot: { ...readySnapshot, contextKey: "NEXT_READ", blockNumber: "101" },
        }}
        reply={companionReplyFixtures.aiAnswer}
      />,
    );
    expect(screen.queryByText("AI response")).not.toBeInTheDocument();
    expect(screen.queryByText(companionReplyFixtures.aiAnswer.text)).not.toBeInTheDocument();
    expect(evidenceValue("Read block")).toBe("101");
    expect(screen.getByRole("button", { name: "Explain progress" })).toBeEnabled();
  });
});
