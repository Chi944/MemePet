import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PetPreview } from "./PetPreview";

function callbackCount(name: string) {
  const counters = screen.getByRole("region", { name: "Callback counters" });
  return within(counters).getByText(name).parentElement?.querySelector("dd")?.textContent;
}

describe("PetPreview personality fixtures", () => {
  it("exposes all supplied styles and the storage-unavailable state", () => {
    render(<PetPreview />);
    for (const [value, label] of [["playful", "Playful"], ["curious", "Curious"], ["focused", "Focused"]]) {
      fireEvent.change(screen.getByLabelText("Personality fixture"), { target: { value } });
      expect(screen.getByRole("heading", { name: label })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByLabelText("Browser saving unavailable"));
    expect(screen.getByText(/Browser saving is unavailable/)).toBeInTheDocument();
  });

  it("keeps personality callbacks separate from care, stage, growth and celebration", () => {
    render(<PetPreview />);
    fireEvent.change(screen.getByLabelText("Pet stage fixture"), { target: { value: "buddy" } });
    fireEvent.change(screen.getByLabelText("Care-action fixture"), { target: { value: "cooldown" } });
    const care = screen.getByRole("region", { name: "Care for your pet" });
    const originalCare = care.textContent;
    fireEvent.click(screen.getByRole("button", { name: "Explore" }));
    fireEvent.click(screen.getByRole("button", { name: "Practise" }));
    fireEvent.click(screen.getByRole("button", { name: "Reset personality" }));
    expect(callbackCount("onInteract: explore")).toBe("1");
    expect(callbackCount("onInteract: practise")).toBe("1");
    expect(callbackCount("onReset")).toBe("1");
    expect(callbackCount("onCare")).toBe("0");
    expect(care.textContent).toBe(originalCare);
    expect(screen.getByText("Stage: Buddy")).toBeInTheDocument();
    expect(screen.getByText("20 growth points")).toBeInTheDocument();
    expect(screen.queryByText(/grew into/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Show confirmed-success celebration")).not.toBeChecked();
    expect(screen.getByRole("heading", { name: "Playful" })).toBeInTheDocument();
  });
});
