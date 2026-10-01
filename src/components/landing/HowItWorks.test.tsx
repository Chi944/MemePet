import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HowItWorks } from "./HowItWorks";

describe("HowItWorks", () => {
  it("names the garden goal in the care step", () => {
    render(<HowItWorks connected />);

    expect(
      screen.getByText(/one to the community's shared garden, which blooms at 20 confirmed care actions/),
    ).toBeInTheDocument();
  });

  it("ends with asking Mochi, an explanation that never changes facts or growth", () => {
    render(<HowItWorks connected />);

    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(4);
    expect(steps[3]).toHaveTextContent("Ask Mochi");
    expect(steps[3]).toHaveTextContent(/shows the block it was read from/);
    expect(steps[3]).toHaveTextContent(/never the facts or your growth/);
    expect(screen.getByText(/^Four small steps\./)).toBeInTheDocument();
  });

  it("never presents explanations as AI, a model or something Mochi learns", () => {
    for (const connected of [true, false]) {
      const { container, unmount } = render(<HowItWorks connected={connected} />);
      expect(container.textContent).not.toMatch(/\b(AI|model|trained|trains|learns?|smart)\b/i);
      unmount();
    }
  });

  it("describes participation, never rewards, earnings, holders or users", () => {
    for (const connected of [true, false]) {
      const { container, unmount } = render(<HowItWorks connected={connected} />);
      expect(container.textContent).not.toMatch(/\b(reward|earn|holders?|users?)\b/i);
      unmount();
    }
  });
});
