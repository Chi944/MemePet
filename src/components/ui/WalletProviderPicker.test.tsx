import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WalletProviderPicker } from "./WalletProviderPicker";

const choices = [{ id: "wallet-1", label: "MetaMask" }, { id: "wallet-2", label: "OKX Wallet" }];

describe("wallet provider selection presentation (simulated)", () => {
  it("offers a labelled native group with no initial provider preference", () => {
    const onSelect = vi.fn();
    render(<WalletProviderPicker choices={choices} selectedId={null} busy={false} onSelect={onSelect} />);
    expect(screen.getByRole("group", { name: "Wallet app" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "MetaMask" })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: "OKX Wallet" })).not.toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: "OKX Wallet" }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith("wallet-2");
  });

  it("shows the selected wallet and disables choices during a wallet operation", () => {
    render(<WalletProviderPicker choices={choices} selectedId="wallet-2" busy onSelect={vi.fn()} />);
    expect(screen.getByRole("radio", { name: "OKX Wallet" })).toBeChecked();
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
    expect(screen.getByText(/Finish the current wallet request/)).toBeInTheDocument();
  });

  it("renders provider names only as text", () => {
    const { container } = render(<WalletProviderPicker choices={[{ id: "untrusted", label: "<img src=x onerror=alert(1)>" }]} selectedId={null} busy={false} onSelect={vi.fn()} />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("radio", { name: "<img src=x onerror=alert(1)>" })).toBeInTheDocument();
  });
});
