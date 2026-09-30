import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  communityIdentityFixtures,
  communityMissionFixtures,
} from "@/fixtures/finale-fixtures";
import { communityFixtures } from "@/fixtures/ui-fixtures";
import type {
  CommunityIdentityState,
  CommunityMissionState,
} from "@/types/finale-community";
import { FinaleCommunityPanel } from "./FinaleCommunityPanel";

function renderPanel(
  mission: CommunityMissionState,
  identity: CommunityIdentityState = communityIdentityFixtures.unconfigured,
  onRetry = vi.fn(),
) {
  const view = render(
    <FinaleCommunityPanel
      community={communityFixtures.growing}
      mission={mission}
      identity={identity}
      onRetry={onRetry}
    />,
  );
  return { ...view, onRetry };
}

function ready(totalCareActions: number, isComplete: boolean): CommunityMissionState {
  return {
    title: "Mochi garden",
    target: 20,
    dataMode: "fixture",
    kind: "ready",
    totalCareActions,
    isComplete,
  };
}

const garden = () => screen.getByRole("img", { name: /Mochi garden/ });
const bar = () => screen.getByRole("progressbar", { name: "Mochi garden progress" });

describe("FinaleCommunityPanel mission", () => {
  it("renders zero as a known zero, not as bloom", () => {
    renderPanel(communityMissionFixtures.empty);

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(bar()).toHaveAttribute("aria-valuenow", "0");
    expect(garden()).toHaveAccessibleName(/bare soil/);
    expect(screen.getByText("20 more confirmed care actions until it blooms.")).toBeInTheDocument();
    expect(screen.queryByText(/in bloom/)).not.toBeInTheDocument();
  });

  it("renders a total below the target as growing", () => {
    renderPanel(communityMissionFixtures.progress);

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(bar()).toHaveAttribute("aria-valuenow", "7");
    expect(bar()).toHaveAttribute("aria-valuemax", "20");
    expect(garden()).toHaveAccessibleName(/sprouting/);
    expect(screen.getByText("13 more confirmed care actions until it blooms.")).toBeInTheDocument();
  });

  it("blooms at exactly the target when the data layer says it is complete", () => {
    renderPanel(ready(20, true));

    expect(screen.getByText("20")).toBeInTheDocument();
    expect(bar()).toHaveAttribute("aria-valuenow", "20");
    expect(garden()).toHaveAccessibleName("The Mochi garden in full bloom");
    expect(screen.getByText("The garden is in bloom.")).toBeInTheDocument();
  });

  it("caps the bar above the target but keeps the true total", () => {
    renderPanel(communityMissionFixtures.reached);

    expect(screen.getByText("24")).toBeInTheDocument();
    expect(bar()).toHaveAttribute("aria-valuenow", "20");
    expect(bar()).toHaveAttribute(
      "aria-valuetext",
      "24 of 20 confirmed care actions, garden in bloom",
    );
  });

  it("follows the supplied isComplete flag instead of comparing the total itself", () => {
    renderPanel(ready(25, false));

    expect(garden()).not.toHaveAccessibleName(/full bloom/);
    expect(screen.getByText("Bloom is not confirmed yet.")).toBeInTheDocument();
    expect(screen.queryByText("The garden is in bloom.")).not.toBeInTheDocument();
  });

  it("shows no number, bar or bloom while loading", () => {
    const { container } = renderPanel(communityMissionFixtures.loading);

    expect(screen.getByText("Reading confirmed care actions…")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /Mochi garden/ })).not.toBeInTheDocument();
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it("shows no number, bar or bloom when the read is unavailable", () => {
    renderPanel(communityMissionFixtures.unavailable);

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /Mochi garden/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/in bloom/)).not.toBeInTheDocument();
  });

  it("calls the read-only retry once per click and never submits a form", () => {
    const { onRetry } = renderPanel(communityMissionFixtures.unavailable);
    const retry = screen.getByRole("button", { name: "Retry reading" });

    expect(retry).toHaveAttribute("type", "button");
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Retrying only reads again. It sends no transaction.")).toBeInTheDocument();
  });

  it("offers no retry while the total is readable", () => {
    renderPanel(communityMissionFixtures.progress);
    expect(screen.queryByRole("button", { name: "Retry reading" })).not.toBeInTheDocument();
  });

  it("describes care actions, never people or holders", () => {
    for (const mission of Object.values(communityMissionFixtures)) {
      const { unmount } = renderPanel(mission, communityIdentityFixtures.fictionalReference);
      expect(document.body.textContent).not.toMatch(/\b(users?|holders?|people|members?|investors?)\b/i);
      unmount();
    }
  });
});

describe("FinaleCommunityPanel reference", () => {
  it("says plainly when no reference is configured", () => {
    renderPanel(communityMissionFixtures.progress, communityIdentityFixtures.unconfigured);

    expect(screen.getByText(/No community reference is configured/)).toBeInTheDocument();
    expect(screen.queryByText(/Token address/)).not.toBeInTheDocument();
  });

  it("labels a reference as a reference, with its network and source", () => {
    renderPanel(communityMissionFixtures.progress, communityIdentityFixtures.fictionalReference);

    expect(screen.getByText(/FICTIONAL example community/)).toBeInTheDocument();
    expect(screen.getByText(/FICTIONAL reference on X Layer testnet \(chain 1952\)/)).toBeInTheDocument();
    expect(screen.getByText("FICTIONAL_TOKEN_NOT_AN_ADDRESS")).toBeInTheDocument();
    expect(screen.getByText(/not a partnership, endorsement, balance or reward/)).toBeInTheDocument();

    const source = screen.getByRole("link", { name: /example\.invalid/ });
    expect(source).toHaveAttribute("href", "https://example.invalid/fictional-token");
    expect(source).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not turn a non-http source into a link", () => {
    renderPanel(communityMissionFixtures.progress, {
      ...communityIdentityFixtures.fictionalReference,
      sourceUrl: "javascript:alert(1)",
    });

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Source link unavailable")).toBeInTheDocument();
  });

  it("marks fixture identity as preview data", () => {
    renderPanel(communityMissionFixtures.progress, communityIdentityFixtures.fictionalReference);
    expect(screen.getAllByText(/Preview data/i).length).toBeGreaterThan(0);
  });
});
