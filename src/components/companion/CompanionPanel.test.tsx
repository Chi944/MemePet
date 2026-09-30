import { fireEvent, render, screen } from "@testing-library/react";
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
    // Facts card still visible
    expect(screen.getByText(/Chain/)).toBeInTheDocument();
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
