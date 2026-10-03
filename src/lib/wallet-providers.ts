import type { EIP1193Provider } from "viem";
import type { WalletChoice } from "@/types/beta";

export type EthereumProvider = EIP1193Provider & {
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export interface DiscoveredWallet extends WalletChoice {
  readonly provider: EthereumProvider;
}

export interface WalletDiscovery {
  readonly wallets: readonly DiscoveredWallet[];
  readonly settled: boolean;
}

const MAX_PROVIDERS = 8;
export const WALLET_DISCOVERY_DELAY_MS = 150;

function property(value: unknown, key: string): unknown {
  try {
    return value !== null && (typeof value === "object" || typeof value === "function")
      ? Reflect.get(value, key) : undefined;
  } catch {
    return undefined;
  }
}

function isProvider(value: unknown): value is EthereumProvider {
  return typeof property(value, "request") === "function";
}

/** Malformed optional extension APIs must not break wallet state or cleanup. */
export function listenToWallet(provider: EthereumProvider, handlers: Readonly<Record<string, (...args: unknown[]) => void>>): () => void {
  const on = property(provider, "on");
  const remove = property(provider, "removeListener");
  if (typeof on !== "function" || typeof remove !== "function") return () => {};
  const registered: [string, (...args: unknown[]) => void][] = [];
  for (const [event, handler] of Object.entries(handlers)) {
    registered.push([event, handler]);
    try { on.call(provider, event, handler); } catch { /* Optional events may be unsupported. */ }
  }
  return () => {
    for (const [event, handler] of registered) {
      try { remove.call(provider, event, handler); } catch { /* A disabled extension may reject cleanup. */ }
    }
  };
}

function label(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  // Wallet metadata is self-reported. Only short text reaches the view; icons,
  // HTML, reverse-domain branding claims and supplied IDs are never rendered.
  if (!trimmed || trimmed.length > 64 || /[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069<>]/.test(trimmed)) return null;
  return trimmed;
}

function legacyLabel(provider: EthereumProvider, source?: "okx"): string {
  if (source === "okx" || property(provider, "isOkxWallet") === true || property(provider, "isOKExWallet") === true) return "OKX Wallet";
  if (property(provider, "isMetaMask") === true) return "MetaMask";
  return "Browser wallet";
}

/** Discovery is read-only: it never invokes provider.request or asks for accounts. */
export function discoverWallets(target: Window, onChange: (snapshot: WalletDiscovery) => void): () => void {
  // Announcements and legacy injection are alternative discovery channels.
  // Extensions may expose different wrapper objects in each; merging channels
  // invents duplicate choices. Names/rdns/flags are not wallet identity proof.
  const announcedEntries = new Map<EthereumProvider, DiscoveredWallet>();
  const legacyEntries = new Map<EthereumProvider, DiscoveredWallet>();
  const ids = new WeakMap<EthereumProvider, string>();
  let nextId = 0;
  let settled = false;
  let stopped = false;

  const publish = () => {
    const entries = announcedEntries.size > 0 ? announcedEntries : legacyEntries;
    if (!stopped) onChange({ wallets: [...entries.values()], settled });
  };
  const add = (entries: Map<EthereumProvider, DiscoveredWallet>, provider: EthereumProvider, name: string) => {
    const existing = entries.get(provider);
    if (existing) {
      entries.set(provider, { ...existing, label: name });
      return;
    }
    if (entries.size >= MAX_PROVIDERS) return;
    // A reference that appears in both channels keeps its opaque ID. Distinct
    // announced providers stay distinct even when all metadata is identical.
    let id = ids.get(provider);
    if (!id) { id = `wallet-${++nextId}`; ids.set(provider, id); }
    entries.set(provider, { id, label: name, provider });
  };
  const scanLegacy = () => {
    if (announcedEntries.size > 0) { publish(); return; }
    const found = new Set<EthereumProvider>();
    const ethereum = property(target, "ethereum");
    const children = property(ethereum, "providers");
    const providers = Array.isArray(children)
      ? children.slice(0, MAX_PROVIDERS).filter(isProvider) : [];
    // A legacy multiplexer is not an additional wallet when it exposes providers.
    if (providers.length) {
      for (const provider of providers) { found.add(provider); add(legacyEntries, provider, legacyLabel(provider)); }
    } else if (isProvider(ethereum)) {
      found.add(ethereum); add(legacyEntries, ethereum, legacyLabel(ethereum));
    }
    const okx = property(target, "okxwallet");
    if (isProvider(okx)) {
      found.add(okx); add(legacyEntries, okx, legacyLabel(okx, "okx"));
    }
    for (const provider of legacyEntries.keys()) {
      if (!found.has(provider)) legacyEntries.delete(provider);
    }
    publish();
  };
  const announce = (event: Event) => {
    const detail = property(event, "detail");
    const provider = property(detail, "provider");
    const name = label(property(property(detail, "info"), "name"));
    if (!isProvider(provider) || !name) return;
    add(announcedEntries, provider, name);
    publish();
  };
  target.addEventListener("eip6963:announceProvider", announce);
  target.addEventListener("ethereum#initialized", scanLegacy);
  target.addEventListener("focus", scanLegacy);
  scanLegacy();
  target.dispatchEvent(new Event("eip6963:requestProvider"));
  const timer = target.setTimeout(() => { settled = true; scanLegacy(); }, WALLET_DISCOVERY_DELAY_MS);
  return () => {
    stopped = true;
    target.clearTimeout(timer);
    target.removeEventListener("eip6963:announceProvider", announce);
    target.removeEventListener("ethereum#initialized", scanLegacy);
    target.removeEventListener("focus", scanLegacy);
  };
}
