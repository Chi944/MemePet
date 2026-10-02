import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { discoverWallets, listenToWallet, WALLET_DISCOVERY_DELAY_MS, type EthereumProvider, type WalletDiscovery } from "./wallet-providers";

const original = {
  ethereum: Object.getOwnPropertyDescriptor(window, "ethereum"),
  okxwallet: Object.getOwnPropertyDescriptor(window, "okxwallet"),
};
const cleanups: (() => void)[] = [];
function install(key: keyof typeof original, value: unknown) {
  Object.defineProperty(window, key, { value, configurable: true, writable: true });
}
function provider(flags: Record<string, unknown> = {}) { return { request: vi.fn(), ...flags }; }
function announce(wallet: unknown, name = "Announced wallet") {
  window.dispatchEvent(new CustomEvent("eip6963:announceProvider", { detail: { provider: wallet, info: { name, icon: "<script>bad()</script>", uuid: "untrusted", rdns: "untrusted.test" } } }));
}
function start() {
  let snapshot: WalletDiscovery = { wallets: [], settled: false };
  const changed = vi.fn((next: WalletDiscovery) => { snapshot = next; });
  const stop = discoverWallets(window, changed);
  cleanups.push(stop);
  return { get snapshot() { return snapshot; }, changed, stop };
}

beforeEach(() => { vi.useFakeTimers(); install("ethereum", undefined); install("okxwallet", undefined); });
afterEach(() => {
  cleanups.splice(0).forEach((stop) => stop());
  vi.useRealTimers();
  for (const key of Object.keys(original) as (keyof typeof original)[]) {
    if (original[key]) Object.defineProperty(window, key, original[key]!);
    else Reflect.deleteProperty(window, key);
  }
});

describe("read-only EIP-6963 and legacy discovery", () => {
  it("settles the zero-provider case without requesting account access", () => {
    const discovery = start();
    expect(discovery.snapshot).toEqual({ wallets: [], settled: false });
    vi.advanceTimersByTime(WALLET_DISCOVERY_DELAY_MS);
    expect(discovery.snapshot).toEqual({ wallets: [], settled: true });
  });

  it("deduplicates object references across legacy aliases and announcements", () => {
    const wallet = provider({ isMetaMask: true });
    install("ethereum", wallet); install("okxwallet", wallet);
    const discovery = start();
    const originalId = discovery.snapshot.wallets[0].id;
    announce(wallet, "MetaMask"); announce(wallet, "MetaMask");
    expect(discovery.snapshot.wallets).toHaveLength(1);
    expect(discovery.snapshot.wallets[0]).toEqual({ id: originalId, label: "MetaMask", provider: wallet });
    expect(wallet.request).not.toHaveBeenCalled();
    expect(discovery.snapshot.wallets[0]).not.toHaveProperty("icon");
  });

  it("discovers synchronous announcements and keeps listening for late providers", () => {
    const first = provider(); const second = provider();
    const reply = () => announce(first, "First");
    window.addEventListener("eip6963:requestProvider", reply);
    const discovery = start();
    window.removeEventListener("eip6963:requestProvider", reply);
    expect(discovery.snapshot.wallets[0].provider).toBe(first);
    vi.advanceTimersByTime(WALLET_DISCOVERY_DELAY_MS);
    announce(second, "Second");
    expect(discovery.snapshot.wallets).toHaveLength(2);
    expect(first.request).not.toHaveBeenCalled(); expect(second.request).not.toHaveBeenCalled();
  });

  it("does not mistake a legacy multiplexer for a third wallet", () => {
    const metamask = provider({ isMetaMask: true }); const okx = provider({ isMetaMask: true, isOkxWallet: true });
    const aggregate = provider({ providers: [metamask, okx, metamask] });
    install("ethereum", aggregate); install("okxwallet", okx);
    const discovery = start();
    expect(discovery.snapshot.wallets.map(({ label }) => label)).toEqual(["MetaMask", "OKX Wallet"]);
    expect(aggregate.request).not.toHaveBeenCalled();
  });

  it("bounds providers and ignores malformed names and throwing getters", () => {
    const many = Array.from({ length: 12 }, () => provider());
    install("ethereum", provider({ providers: many }));
    install("okxwallet", provider());
    const discovery = start();
    expect(discovery.snapshot.wallets).toHaveLength(8);
    expect(() => announce(Object.defineProperty({}, "request", { get() { throw new Error("bad getter"); } }))).not.toThrow();
    for (const name of ["", " ", "<img src=x>", "a".repeat(65), "spoof\u202e"]) announce(provider(), name);
    announce(provider(), "Additional provider");
    expect(discovery.snapshot.wallets).toHaveLength(8);
  });

  it("rejects invalid announced metadata without creating a choice", () => {
    const discovery = start();
    for (const name of ["", "\u0001", "<svg>", "a".repeat(65)]) announce(provider(), name);
    announce({}, "Missing request");
    expect(discovery.snapshot.wallets).toHaveLength(0);
  });

  it("notices removed legacy providers on focus and cleans up announcement listeners", () => {
    const wallet = provider(); install("ethereum", wallet);
    const discovery = start();
    install("ethereum", undefined);
    window.dispatchEvent(new Event("focus"));
    expect(discovery.snapshot.wallets).toHaveLength(0);
    discovery.stop(); discovery.changed.mockClear();
    announce(provider()); window.dispatchEvent(new Event("focus"));
    vi.advanceTimersByTime(WALLET_DISCOVERY_DELAY_MS);
    expect(discovery.changed).not.toHaveBeenCalled();
  });

  it("tolerates malformed or throwing optional listener APIs", () => {
    for (const malformed of [
      provider({ on: true, removeListener: true }),
      provider({ on: () => { throw new Error("unsupported"); }, removeListener: () => { throw new Error("disabled"); } }),
      Object.defineProperty(provider(), "on", { get() { throw new Error("getter"); } }),
    ]) {
      const wallet = malformed as unknown as EthereumProvider;
      const stop = listenToWallet(wallet, { accountsChanged: vi.fn() });
      expect(stop).not.toThrow();
    }
  });
});
