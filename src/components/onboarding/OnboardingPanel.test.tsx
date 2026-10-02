import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { onboardingFixtures } from "@/fixtures/beta-fixtures";
import { OnboardingPanel } from "./OnboardingPanel";

const callbacks = () => ({ onConnect: vi.fn(), onSwitchNetwork: vi.fn(), onRetry: vi.fn() });
afterEach(() => vi.restoreAllMocks());

describe("OnboardingPanel", () => {
  it.each(Object.entries(onboardingFixtures))("renders the %s state without automatic side effects", (_name, state) => {
    const props = callbacks();
    render(<OnboardingPanel state={state} {...props} />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/One care per UTC calendar day/)).toBeInTheDocument();
    for (const callback of Object.values(props)) expect(callback).not.toHaveBeenCalled();
  });
  it.each([
    ["connect", "Connect chosen wallet", "onConnect"],
    ["wrongNetwork", "Switch to X Layer testnet (fictional)", "onSwitchNetwork"],
    ["unavailable", "Retry pet read", "onRetry"],
  ] as const)("routes only the explicit %s action", (fixture, button, callback) => {
    const props = callbacks();
    render(<OnboardingPanel state={onboardingFixtures[fixture]} {...props} />);
    fireEvent.click(screen.getByRole("button", { name: button }));
    expect(props[callback]).toHaveBeenCalledExactlyOnceWith();
    for (const [name, fn] of Object.entries(props)) if (name !== callback) expect(fn).not.toHaveBeenCalled();
  });
  it("does not turn unknown reads into an adoption prompt", () => {
    render(<OnboardingPanel state={onboardingFixtures.unavailable} {...callbacks()} />);
    expect(screen.getByRole("status")).toHaveTextContent("No pet facts are known");
    expect(screen.queryByText(/Use the adoption action/)).not.toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
  it.each(["connecting", "loading", "adopt", "ready"] as const)("does not duplicate primary actions in %s", (fixture) => {
    render(<OnboardingPanel state={onboardingFixtures[fixture]} {...callbacks()} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
  it("formats the provided instant in the visitor timezone, retaining UTC rules", () => {
    const NativeFormatter = Intl.DateTimeFormat;
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation((locale, options) => new NativeFormatter(locale, { ...options, timeZone: "Asia/Singapore" }));
    const { container, rerender } = render(<OnboardingPanel state={onboardingFixtures.cooldown} {...callbacks()} />);
    expect(container.querySelector("time")).toHaveAttribute("datetime", "2030-01-02T00:00:00.000Z");
    expect(container.querySelector("time")).toHaveTextContent(/8:00/);
    expect(container.querySelector("time")).toHaveTextContent(/Singapore/);
    // A past reset is still explanatory. Only a new supplied state can allow care.
    rerender(<OnboardingPanel state={{ ...onboardingFixtures.cooldown, availableAtIso: "2000-01-01T00:00:00Z" }} {...callbacks()} />);
    expect(screen.getByRole("heading")).toHaveTextContent("Your next little care");
    expect(screen.queryByRole("button", { name: /care/i })).not.toBeInTheDocument();
  });
  it.each(["", "not-a-date", "2030-01-02", "2030-02-30T00:00:00Z", "2030-13-01T00:00:00Z"])("keeps invalid reset %s honest", (availableAtIso) => {
    const { container } = render(<OnboardingPanel state={{ ...onboardingFixtures.cooldown, availableAtIso }} {...callbacks()} />);
    expect(screen.getByRole("status")).toHaveTextContent("Reset time unavailable");
    expect(container.querySelector("time")).toBeNull();
  });
  it("has a deterministic server-rendered placeholder rather than server-local time", () => {
    expect(renderToString(<OnboardingPanel state={onboardingFixtures.cooldown} {...callbacks()} />)).toContain("Preparing your local reset time");
  });
  it("shows official setup links, test gas and no seed request", () => {
    render(<OnboardingPanel state={onboardingFixtures.install} {...callbacks()} />);
    expect(screen.getByRole("link", { name: /MetaMask/ })).toHaveAttribute("href", "https://support.metamask.io/start/getting-started-with-metamask/");
    expect(screen.getByRole("link", { name: /OKX Wallet/ })).toHaveAttribute("href", "https://web3.okx.com/download");
    expect(screen.getByRole("link", { name: /faucet/ })).toHaveAttribute("href", "https://web3.okx.com/xlayer/faucet");
    expect(screen.getByText(/uses test OKB/)).toBeInTheDocument();
    expect(screen.getByText(/Never enter a seed phrase/)).toBeInTheDocument();
  });
  it("does not call local Anvil mainnet or send it to the X Layer faucet", () => {
    render(<OnboardingPanel state={{ kind: "needs-wallet", networkLabel: "Local Anvil", gasSymbol: "ETH", isTestnet: false }} {...callbacks()} />);
    expect(screen.getByText(/Local Anvil uses ETH/)).toBeInTheDocument();
    expect(screen.queryByText(/mainnet/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /faucet/ })).not.toBeInTheDocument();
  });
});
