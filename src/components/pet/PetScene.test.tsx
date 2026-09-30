import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { petFixtures } from "@/fixtures/ui-fixtures";
import { PetScene } from "./PetScene";

vi.mock("@/hooks/useMochiMotion", async () => {
  const { useState } = await import("react");
  return {
    useMochiMotion() {
      const [enabled, setEnabled] = useState(true);
      return { enabled, setEnabled };
    },
  };
});

describe("PetScene", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it("announces the confirmed new stage and advances the trail", () => {
    const { rerender } = render(<PetScene pet={petFixtures.hatchling} celebrate={false} />);
    const announcement = screen.getByRole("status");
    expect(announcement).toBeEmptyDOMElement();
    rerender(<PetScene pet={petFixtures.buddy} celebrate />);
    expect(screen.getByRole("status")).toBe(announcement);
    expect(announcement).toHaveTextContent("Mochi grew into Buddy!");
    expect(announcement).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("Buddy").closest("li")).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Hatchling").closest("li")).not.toHaveAttribute("aria-current");
    expect(screen.getByText("20 growth points")).toBeVisible();
    rerender(<PetScene pet={petFixtures.buddy} celebrate={false} />);
    expect(announcement).toBeEmptyDOMElement();
  });

  it("does not infer a celebration from a stage change", () => {
    const { rerender } = render(<PetScene pet={petFixtures.hatchling} celebrate={false} />);
    rerender(<PetScene pet={petFixtures.guardian} celebrate={false} />);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(screen.queryByText(/grew into/)).not.toBeInTheDocument();
  });

  it("keeps the announcement when reduced motion is requested", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)" }));
    render(<PetScene pet={petFixtures.guardian} celebrate />);
    expect(screen.getByRole("status")).toHaveTextContent("Mochi grew into Guardian!");
    // Status effects still respect reduced motion; the announcement is unconditional.
    expect(screen.getByText("Mochi grew into Guardian!")).toBeVisible();
  });

  it("renders an accessible placeholder when art is missing", () => {
    render(<PetScene pet={petFixtures.missingArt} celebrate={false} />);

    expect(screen.getByRole("heading", { name: "Mochi" })).toBeInTheDocument();
    expect(screen.getByText("Stage: Hatchling")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Mochi artwork placeholder" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Say hello to Mochi" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Mochi" })).toHaveAttribute("data-mochi-motion", "off");
    fireEvent.click(screen.getByRole("switch", { name: "Animate Mochi" }));
    fireEvent.click(screen.getByRole("switch", { name: "Animate Mochi" }));
    expect(screen.getByRole("region", { name: "Mochi" })).toHaveAttribute("data-mochi-motion", "off");
  });

  it("enables the explicit Mochi motion preference even when the system requests reduced motion", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    render(<PetScene pet={petFixtures.hatchling} celebrate={false} />);
    expect(screen.getByRole("switch", { name: "Animate Mochi" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("button", { name: "Say hello to Mochi" })).toBeEnabled();
    expect(screen.getByRole("region", { name: "Mochi" })).toHaveAttribute("data-mochi-motion", "on");
  });

  it("finishes a decorative greeting without changing care progress or awarding a celebration", () => {
    vi.useFakeTimers();
    render(<PetScene pet={petFixtures.hatchling} celebrate={false} />);
    const greeting = screen.getByRole("button", { name: "Say hello to Mochi" });
    fireEvent.click(greeting);
    expect(greeting).toHaveAttribute("data-greeting", "true");
    expect(screen.getByText("10 growth points")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    act(() => { vi.advanceTimersByTime(650); });
    expect(greeting).toHaveAttribute("data-greeting", "false");
    expect(screen.getByText("10 growth points")).toBeInTheDocument();
  });

  it("cancels a greeting when motion is turned off while leaving the toggle usable", () => {
    render(<PetScene pet={petFixtures.hatchling} celebrate={false} />);
    const greeting = screen.getByRole("button", { name: "Say hello to Mochi" });
    const toggle = screen.getByRole("switch", { name: "Animate Mochi" });
    fireEvent.click(greeting);
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(greeting).toBeDisabled();
    expect(greeting).toHaveAttribute("data-greeting", "false");
    expect(screen.getByRole("region", { name: "Mochi" })).toHaveAttribute("data-mochi-motion", "off");
    fireEvent.click(greeting);
    expect(greeting).toHaveAttribute("data-greeting", "false");
    fireEvent.click(toggle);
    expect(greeting).toBeEnabled();
    expect(greeting).toHaveAttribute("data-greeting", "false");
  });

  it("renders supplied hatchling art and details", () => {
    render(<PetScene pet={petFixtures.hatchling} celebrate={false} />);

    expect(
      screen.getByRole("img", { name: "Mochi, the hatchling pet" }),
    ).toBeInTheDocument();
    expect(screen.getByText("10 growth points")).toBeInTheDocument();
  });

  it("shows a final-stage message instead of a progress ratio", () => {
    render(<PetScene pet={petFixtures.guardian} celebrate={false} />);

    expect(screen.getByText("Stage: Guardian")).toBeInTheDocument();
    expect(
      screen.getByText("Guardian is the final stage."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("progressbar", { name: "Growth toward next stage" }),
    ).not.toBeInTheDocument();
  });

  it("updates visible stage text when props change", () => {
    const { rerender } = render(
      <PetScene pet={petFixtures.hatchling} celebrate={false} />,
    );

    expect(screen.getByText("Stage: Hatchling")).toBeInTheDocument();

    rerender(<PetScene pet={petFixtures.buddy} celebrate={false} />);

    expect(screen.getByText("Stage: Buddy")).toBeInTheDocument();
    expect(screen.getByText("20 growth points")).toBeInTheDocument();
  });
});
