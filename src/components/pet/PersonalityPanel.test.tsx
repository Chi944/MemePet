import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { personalityFixtures } from "@/fixtures/finale-fixtures";
import type { PersonalityPanelProps } from "@/types/companion";
import { PersonalityPanel } from "./PersonalityPanel";

function props(overrides: Partial<PersonalityPanelProps> = {}): PersonalityPanelProps {
  return { profile: personalityFixtures.playful, storageStatus: "available", dataMode: "live", onInteract: vi.fn(), onReset: vi.fn(), ...overrides };
}
function count(label: string) {
  return screen.getByText(label).closest("dl")?.querySelector("dd")?.textContent;
}

describe("PersonalityPanel", () => {
  it.each([
    ["playful", "Playful", "Mochi begins playful", "0", "0"],
    ["curious", "Curious", "Explore interactions lead", "3", "0"],
    ["focused", "Focused", "Practise interactions lead", "0", "3"],
  ] as const)("explains the supplied %s style and counts", (key, label, reason, explore, practise) => {
    render(<PersonalityPanel {...props({ profile: personalityFixtures[key] })} />);
    expect(screen.getByRole("heading", { name: label })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(reason))).toBeInTheDocument();
    expect(count("Explore interactions")).toBe(explore);
    expect(count("Practise interactions")).toBe(practise);
    expect(screen.getByText(/do not earn growth points, change care cooldown, or train a model/)).toBeInTheDocument();
    expect(screen.getByText("Browser preference")).toBeInTheDocument();
    expect(screen.queryByText("Live")).not.toBeInTheDocument();
  });

  it("requests each action once without optimistic count changes", () => {
    const input = props();
    render(<PersonalityPanel {...input} />);
    fireEvent.click(screen.getByRole("button", { name: "Explore" }));
    fireEvent.click(screen.getByRole("button", { name: "Practise" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset personality" }));
    expect(input.onInteract).toHaveBeenCalledTimes(2);
    expect(input.onInteract).toHaveBeenNthCalledWith(1, "explore");
    expect(input.onInteract).toHaveBeenNthCalledWith(2, "practise");
    expect(input.onReset).toHaveBeenCalledTimes(1);
    expect(count("Explore interactions")).toBe("0");
    expect(count("Practise interactions")).toBe("0");
    expect(screen.getByRole("heading", { name: "Playful" })).toBeInTheDocument();
  });

  it("updates only from new props, including a reset or another wallet's profile", () => {
    const input = props({ profile: personalityFixtures.curious });
    const { rerender } = render(<PersonalityPanel {...input} />);
    fireEvent.click(screen.getByRole("button", { name: "Reset personality" }));
    expect(count("Explore interactions")).toBe("3");
    rerender(<PersonalityPanel {...input} profile={personalityFixtures.playful} />);
    expect(count("Explore interactions")).toBe("0");
    const status = screen.getAllByRole("status")[0];
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(within(status).getByRole("heading", { name: "Playful" })).toBeInTheDocument();
  });

  it("reports unavailable storage without claiming saves and still allows retries", () => {
    const input = props({ profile: personalityFixtures.focused, storageStatus: "unavailable" });
    render(<PersonalityPanel {...input} />);
    expect(screen.getByText(/Changes and resets are not confirmed saved/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Explore" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset personality" }));
    expect(input.onInteract).toHaveBeenCalledExactlyOnceWith("explore");
    expect(input.onReset).toHaveBeenCalledTimes(1);
    expect(count("Practise interactions")).toBe("3");
  });

  it("labels fictional data and does not suggest the preview saves preferences", () => {
    render(<PersonalityPanel {...props({ dataMode: "fixture" })} />);
    expect(screen.getByText("Preview data")).toBeInTheDocument();
    expect(screen.getByText(/No personality preferences are saved here/)).toBeInTheDocument();
  });

  it("explains a balanced nonzero profile without treating it as a fresh start", () => {
    render(<PersonalityPanel {...props({ profile: { version: 1, exploreCount: 2, practiseCount: 2, style: "playful" } })} />);
    expect(screen.getByText(/Explore and Practise are balanced/)).toBeInTheDocument();
    expect(screen.queryByText(/Mochi begins playful/)).not.toBeInTheDocument();
  });
});
