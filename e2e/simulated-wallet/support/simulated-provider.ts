/**
 * SIMULATED WALLET BROWSER REGRESSION: fictional EIP-1193 providers injected
 * before navigation. No extension, key, signature or transaction exists.
 */
import type { Page } from "@playwright/test";

export interface SimulatedWalletSpec {
  /** Legacy global this provider is exposed as. */
  readonly global: "ethereum" | "okxwallet";
  readonly name: "MetaMask" | "OKX Wallet";
  /** Accounts already granted to this site (restored without a prompt). */
  readonly grantedAccounts: readonly string[];
  /** Accounts returned when the user connects. */
  readonly connectAccounts: readonly string[];
  readonly chainIdHex: string;
}

export interface ProviderCall {
  readonly wallet: string;
  readonly method: string;
}

type Controls = {
  calls: ProviderCall[];
  setAccounts: (wallet: string, accounts: string[]) => void;
};

/** Install fake providers. Writes and signatures are rejected and recorded. */
export async function installSimulatedWallets(page: Page, wallets: readonly SimulatedWalletSpec[]) {
  await page.addInitScript((specs: readonly SimulatedWalletSpec[]) => {
    const calls: ProviderCall[] = [];
    const providers = new Map<string, { setAccounts: (accounts: string[]) => void }>();
    for (const spec of specs) {
      let accounts = [...spec.grantedAccounts];
      const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
      const emit = (event: string, value: unknown) => {
        for (const listener of listeners.get(event) ?? []) listener(value);
      };
      const provider = {
        isMetaMask: spec.name === "MetaMask",
        isOkxWallet: spec.name === "OKX Wallet",
        async request({ method }: { method: string }) {
          calls.push({ wallet: spec.name, method });
          if (method === "eth_accounts") return [...accounts];
          if (method === "eth_chainId") return spec.chainIdHex;
          if (method === "eth_requestAccounts") {
            accounts = [...spec.connectAccounts];
            return [...accounts];
          }
          throw Object.assign(new Error(`SIMULATED: ${method} is not available`), { code: 4200 });
        },
        on(event: string, listener: (...args: unknown[]) => void) {
          const set = listeners.get(event) ?? new Set();
          set.add(listener);
          listeners.set(event, set);
        },
        removeListener(event: string, listener: (...args: unknown[]) => void) {
          listeners.get(event)?.delete(listener);
        },
      };
      providers.set(spec.name, {
        setAccounts: (next) => {
          accounts = [...next];
          emit("accountsChanged", [...accounts]);
        },
      });
      Object.defineProperty(window, spec.global, { configurable: true, value: provider });
    }
    for (const global of ["ethereum", "okxwallet"]) {
      if (!specs.some((spec) => spec.global === global)) {
        Object.defineProperty(window, global, { configurable: true, value: undefined });
      }
    }
    (window as Window & { __simulatedWallets?: Controls }).__simulatedWallets = {
      calls,
      setAccounts: (wallet, accounts) => providers.get(wallet)?.setAccounts(accounts),
    };
  }, wallets);

  return {
    /** Simulate the user changing account inside the wallet extension. */
    setAccounts: (wallet: SimulatedWalletSpec["name"], accounts: string[]) =>
      page.evaluate(([name, next]) => {
        (window as Window & { __simulatedWallets?: Controls }).__simulatedWallets!.setAccounts(name, next);
      }, [wallet, accounts] as const),
    calls: () => page.evaluate(() => (window as Window & { __simulatedWallets?: Controls }).__simulatedWallets!.calls),
  };
}

/** Methods a recovery or read must never trigger. */
export const WRITE_OR_SIGN = /send|sign|approve|switch|addEthereumChain|revoke/i;
