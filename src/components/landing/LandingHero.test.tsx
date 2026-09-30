import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LandingHero } from "./LandingHero";

vi.mock("@/hooks/useMochiMotion", async () => {
  const { useState } = await import("react");
  return {
    useMochiMotion() {
      const [enabled, setEnabled] = useState(true);
      return { enabled, setEnabled };
    },
  };
});

describe("LandingHero", () => {
  afterEach(() => vi.useRealTimers());
  it("explains the product and forwards the primary action", () => {
    const onGetStarted = vi.fn();

    render(<LandingHero onGetStarted={onGetStarted} />);

    expect(
      screen.getByRole("heading", {
        name: "Adopt the meme. Grow the community.",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Meet your pet" }));

    expect(onGetStarted).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("img", { name: "Mochi, the MemePet hatchling mascot" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Adopt a meme-community mascot/i),
    ).toBeInTheDocument();
  });

  it("greets without navigating or changing the selected growth stage", () => {
    vi.useFakeTimers();
    const onGetStarted = vi.fn();
    render(<LandingHero onGetStarted={onGetStarted} />);
    const greeting = screen.getByRole("button", { name: "Say hello to Mochi" });
    expect(greeting).toHaveAttribute("type", "button");
    expect(screen.getByRole("switch", { name: "Animate Mochi" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(greeting);
    expect(greeting).toHaveAttribute("data-greeting", "true");
    expect(screen.getByRole("heading", { name: "Hatchling" })).toBeInTheDocument();
    expect(onGetStarted).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(650); });
    expect(greeting).toHaveAttribute("data-greeting", "false");
  });

  it("keeps artwork and stage selection available when Mochi motion is off", () => {
    const onGetStarted = vi.fn();
    render(<LandingHero onGetStarted={onGetStarted} />);
    fireEvent.click(screen.getByRole("button", { name: "Say hello to Mochi" }));
    const toggle = screen.getByRole("switch", { name: "Animate Mochi" });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("button", { name: "Say hello to Mochi" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Buddy\s*20 points/ }));
    const greeting = screen.getByRole("button", { name: "Say hello to Mochi" });
    expect(greeting).toBeDisabled();
    expect(greeting).toHaveAttribute("data-greeting", "false");
    expect(screen.getByRole("img", { name: "Mochi, the MemePet buddy mascot" })).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(greeting).toBeEnabled();
    expect(greeting).toHaveAttribute("data-greeting", "false");
    expect(onGetStarted).not.toHaveBeenCalled();
  });
});
