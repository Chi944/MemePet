import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BetaWorkbench } from "./BetaWorkbench";

describe("beta development preview (fictional inputs only)", () => {
  it("labels the preview and provides all recovery examples without an external link", () => {
    render(<BetaWorkbench />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByText("UI preview — fictional data")).toBeInTheDocument();
    const select = screen.getByRole("combobox", { name: "Recovery preview state" });
    expect(select.querySelectorAll("option")).toHaveLength(9);
    expect(select).toHaveValue("pending");
    expect(screen.getByRole("heading", { name: "Waiting for confirmation" })).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("counts callback inspections without changing the simulated transaction outcome", () => {
    render(<BetaWorkbench />);
    fireEvent.click(screen.getByRole("button", { name: "Check status" }));
    expect(screen.getByLabelText("Check status callbacks:")).toHaveTextContent("1");
    expect(screen.getByRole("heading", { name: "Waiting for confirmation" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Recovery preview state" }), { target: { value: "checking" } });
    fireEvent.click(screen.getByRole("button", { name: "Checking…" }));
    expect(screen.getByLabelText("Check status callbacks:")).toHaveTextContent("1");
  });

  it("resets state, action, help disclosures and counter to the initial preview", () => {
    render(<BetaWorkbench />);
    fireEvent.click(screen.getByRole("button", { name: "Check status" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Fictional transaction action" }), { target: { value: "adopt" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Recovery preview state" }), { target: { value: "confirmed" } });
    fireEvent.click(screen.getByText("Fictional sample: what does checking status do?"));
    fireEvent.click(screen.getByRole("button", { name: "Reset preview" }));
    expect(screen.getByRole("combobox", { name: "Recovery preview state" })).toHaveValue("pending");
    expect(screen.getByRole("combobox", { name: "Fictional transaction action" })).toHaveValue("care");
    expect(screen.getByLabelText("Check status callbacks:")).toHaveTextContent("0");
    expect(screen.getByText("Fictional sample: what does checking status do?").closest("details")).not.toHaveAttribute("open");
  });

  it("provides the empty-help state while keeping support unavailable", () => {
    render(<BetaWorkbench />);
    fireEvent.change(screen.getByRole("combobox", { name: "Help preview content" }), { target: { value: "empty" } });
    expect(screen.getByText("Help answers are not available right now.")).toBeInTheDocument();
    expect(screen.getByText(/Support contact unavailable/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset preview" }));
    expect(screen.getByRole("combobox", { name: "Help preview content" })).toHaveValue("examples");
  });
});
