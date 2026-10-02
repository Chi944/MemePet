import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { walletChoiceFixtures } from "@/fixtures/beta-fixtures";
import { WalletChooser } from "./WalletChooser";

describe("WalletChooser", () => {
  it("never selects or connects automatically, including a single available wallet", () => {
    const onSelect = vi.fn();
    render(<WalletChooser choices={[walletChoiceFixtures[0]]} selectedId={null} busy={false} onSelect={onSelect} />);
    expect(screen.getByRole("radio")).not.toBeChecked();
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
  it.each(walletChoiceFixtures)("requests the opaque ID for $label and waits for parent confirmation", (choice) => {
    const onSelect = vi.fn();
    const props = { choices: walletChoiceFixtures, selectedId: null, busy: false, onSelect };
    const { rerender } = render(<WalletChooser {...props} />);
    fireEvent.click(screen.getByRole("radio", { name: choice.label }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith(choice.id);
    expect(screen.getByRole("radio", { name: choice.label })).not.toBeChecked();
    rerender(<WalletChooser {...props} selectedId={choice.id} />);
    expect(screen.getByRole("radio", { name: choice.label })).toBeChecked();
  });
  it("disables choices while busy and explains the current request", () => {
    render(<WalletChooser choices={walletChoiceFixtures} selectedId={walletChoiceFixtures[0].id} busy onSelect={vi.fn()} />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("Finish the current wallet request");
  });
  it("handles empty choices and a disappearing selected provider honestly", () => {
    const props = { selectedId: "gone", busy: false, onSelect: vi.fn() };
    const { rerender } = render(<WalletChooser {...props} choices={[]} />);
    expect(screen.getByText(/No wallet is available/)).toBeInTheDocument();
    rerender(<WalletChooser {...props} choices={walletChoiceFixtures} />);
    expect(screen.getByRole("status")).toHaveTextContent("previously selected wallet is unavailable");
    for (const radio of screen.getAllByRole("radio")) expect(radio).not.toBeChecked();
  });
  it("renders untrusted wallet names as text with independent radio groups", () => {
    const props = { choices: [{ id: "opaque", label: '<img src=x onerror="alert(1)">' }], selectedId: null, busy: false, onSelect: vi.fn() };
    render(<><WalletChooser {...props} /><WalletChooser {...props} /></>);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios[0].getAttribute("name")).not.toBe(radios[1].getAttribute("name"));
  });
});
