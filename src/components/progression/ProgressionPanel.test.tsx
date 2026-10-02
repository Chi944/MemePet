import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { gardenChapterFixtures, personalMilestoneFixtures } from "@/fixtures/beta-fixtures";
import { mapGardenChapters, mapPersonalMilestones } from "@/lib/beta-progress";
import { ProgressionPanel } from "./ProgressionPanel";

function show(personal = personalMilestoneFixtures.empty, community = gardenChapterFixtures.empty, onRetry = vi.fn()) {
  return render(<ProgressionPanel personal={personal} community={community} onRetry={onRetry} />);
}

describe("ProgressionPanel", () => {
  it("shows zero as known, every absolute target and no earned milestones", () => {
    show();
    expect(screen.getAllByText("Not yet earned")).toHaveLength(6);
    expect(screen.getByText("Next milestone at 5 lifetime confirmed cares.")).toBeInTheDocument();
    expect(screen.getByText("Next chapter at 20 lifetime confirmed cares.")).toBeInTheDocument();
    expect(screen.getAllByText("Preview data")).toHaveLength(2);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
  it.each([
    [4, 0, 5], [5, 1, 10], [9, 1, 10], [10, 2, 20], [19, 2, 20], [20, 3, null], [27, 3, null],
  ] as const)("preserves personal count %i and its supplied boundaries", (count, earned, next) => {
    show(mapPersonalMilestones(count, "fixture"));
    const group = screen.getByRole("region", { name: "Personal milestones" });
    expect(group).toHaveTextContent(`${count} personal confirmed cares`);
    expect(within(group).queryAllByText("Earned")).toHaveLength(earned);
    expect(group).toHaveTextContent(next === null ? "All defined personal milestones reached." : `Next milestone at ${next} lifetime confirmed cares.`);
  });
  it.each([
    [19, 0, 20], [20, 1, 50], [49, 1, 50], [50, 2, 100], [99, 2, 100], [100, 3, null], [137, 3, null],
  ] as const)("preserves garden lifetime total %i without resetting at chapters", (count, earned, next) => {
    show(personalMilestoneFixtures.empty, mapGardenChapters(count, "fixture"));
    const group = screen.getByRole("region", { name: "Garden chapters" });
    expect(group).toHaveTextContent(`${count} community confirmed cares`);
    expect(within(group).queryAllByText("Earned")).toHaveLength(earned);
    expect(group).toHaveTextContent(next === null ? "All defined garden chapters reached." : `Next chapter at ${next} lifetime confirmed cares.`);
  });
  it("keeps loading and unknown distinct from zero; retry is explicit and read-only", () => {
    const onRetry = vi.fn();
    show(personalMilestoneFixtures.loading, gardenChapterFixtures.unavailable, onRetry);
    expect(screen.getByText(/Reading confirmed personal/)).toBeInTheDocument();
    expect(screen.getByText(/Community care total unavailable/)).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(onRetry).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Retry progression reads" }));
    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
  });
  it("renders known community chapters independently of unavailable personal data", () => {
    show({ kind: "unavailable", dataMode: "live" }, { ...gardenChapterFixtures.firstBloom, dataMode: "live" });
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Garden chapters" })).toHaveTextContent("Earned");
    expect(screen.getByRole("region", { name: "Personal milestones" })).not.toHaveTextContent("0 personal");
  });
  it("removes obsolete earned badges when the parent supplies a new loading or failed scope", () => {
    const { rerender } = show(personalMilestoneFixtures.allReached, gardenChapterFixtures.allReached);
    expect(screen.getAllByText("Earned")).toHaveLength(6);
    rerender(<ProgressionPanel personal={personalMilestoneFixtures.loading} community={gardenChapterFixtures.unavailable} onRetry={vi.fn()} />);
    expect(screen.queryByText("Earned")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByText(/Community care total unavailable/)).toBeInTheDocument();
  });
  it("uses supplied earned flags and nextTarget instead of a parallel unlocking rule", () => {
    show({ kind: "ready", dataMode: "fixture", confirmedCareCount: 200,
      milestones: [{ id: "lead", label: "Supplied milestone", target: 5, reached: false }], nextTarget: 250 });
    const group = screen.getByRole("region", { name: "Personal milestones" });
    expect(group).toHaveTextContent("Not yet earned");
    expect(group).toHaveTextContent("250 lifetime confirmed cares");
  });
  it("preserves the final pet form and cosmetic, no-loss meaning", () => {
    show(personalMilestoneFixtures.allReached, gardenChapterFixtures.allReached);
    expect(screen.getAllByText("Earned")).toHaveLength(6);
    expect(screen.getByText(/Guardian remains the final pet form/)).toBeInTheDocument();
    expect(screen.getByText(/no money, tokens or extra growth points/)).toBeInTheDocument();
    expect(screen.getByText(/No streak or missed-day loss/)).toBeInTheDocument();
  });
});
