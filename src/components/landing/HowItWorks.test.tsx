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

  it("describes participation, never rewards, earnings, holders or users", () => {
    for (const connected of [true, false]) {
      const { container, unmount } = render(<HowItWorks connected={connected} />);
      expect(container.textContent).not.toMatch(/\b(reward|earn|holders?|users?)\b/i);
      unmount();
    }
  });
});
