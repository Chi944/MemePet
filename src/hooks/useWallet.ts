"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Address,
  createWalletClient,
  custom,
  getAddress,
} from "viem";
import { discoverWallets, listenToWallet, type DiscoveredWallet, type EthereumProvider } from "@/lib/wallet-providers";
import type { WalletChoice } from "@/types/beta";
import { chainFromDeployment } from "@/lib/chains";
import {
  getActiveDeployment,
  isRegistryConfigured,
} from "@/lib/deployment";

export type WalletState = {
  readonly installed: boolean;
  readonly address: Address | null;
  readonly chainId: number | null;
  readonly connecting: boolean;
  readonly errorMessage: string | null;
  readonly disconnectStatus: "pending" | "revoked" | "manual" | null;
};

const initialState: WalletState = {
  installed: false,
  address: null,
  chainId: null,
  connecting: false,
  errorMessage: null,
  disconnectStatus: null,
};

const disconnectStorageKey = "memepet.wallet-disconnected";

function savedDisconnect(): "manual" | "revoked" | null {
  try {
    const value = window.localStorage.getItem(disconnectStorageKey);
    return value === "manual" || value === "revoked" ? value : null;
  } catch {
    return null;
  }
}

function saveDisconnect(value: "manual" | "revoked" | null) {
  try {
    if (value) window.localStorage.setItem(disconnectStorageKey, value);
    else window.localStorage.removeItem(disconnectStorageKey);
  } catch {
    // Wallet revocation still runs when browser storage is unavailable.
  }
}

function readDisconnectedSnapshot(
  provider: EthereumProvider | null,
): Promise<WalletState> {
  // This global flag records disconnection intent, not a provider identity or
  // permanent proof of revoked permission. Empty accounts may mean locked.
  return Promise.resolve({ ...initialState, installed: !!provider, disconnectStatus: "manual" });
}

async function readWalletSnapshot(provider: EthereumProvider | null): Promise<WalletState> {
  if (!provider) {
    return initialState;
  }

  try {
    const accounts = (await provider.request({
      method: "eth_accounts",
    })) as string[];
    const chainHex = (await provider.request({
      method: "eth_chainId",
    })) as string;

    return {
      ...initialState,
      installed: true,
      address: accounts[0] ? getAddress(accounts[0]) : null,
      chainId: Number.parseInt(chainHex, 16),
      connecting: false,
      errorMessage: null,
    };
  } catch {
    return {
      ...initialState,
      installed: true,
      address: null,
      chainId: null,
      connecting: false,
      errorMessage: "Wallet state could not be read.",
    };
  }
}

export function useWallet() {
  const deployment = getActiveDeployment();
  const configured = isRegistryConfigured(deployment);
  const expectedChain = chainFromDeployment(deployment);
  const [state, setState] = useState<WalletState>(initialState);
  const [hydrationToken, setHydrationToken] = useState(0);
  const [choices, setChoices] = useState<readonly WalletChoice[]>([]);
  const [selected, setSelected] = useState<DiscoveredWallet | null>(null);
  const [discovering, setDiscovering] = useState(true);
  const [switchingNetwork, setSwitchingNetwork] = useState(false);
  const [providerGeneration, setProviderGeneration] = useState(0);
  const wallets = useRef<readonly DiscoveredWallet[]>([]);
  const activeProvider = useRef<DiscoveredWallet | null>(null);
  const explicitlySelected = useRef(false);
  const allowImplicitSelection = useRef(true);
  const providerRevision = useRef(0);
  const activeAddress = useRef<Address | null>(null);
  // Every explicit connect/disconnect invalidates older async completions.
  const operation = useRef(0);
  const locallyDisconnected = useRef(false);
  const connecting = useRef(false);
  const disconnecting = useRef(false);
  const networkSwitching = useRef(false);
  const networkRequest = useRef(0);
  const refreshAfterConnect = useRef(false);

  const clearPendingRequests = useCallback(() => {
    connecting.current = false;
    disconnecting.current = false;
    networkSwitching.current = false;
    networkRequest.current += 1;
    refreshAfterConnect.current = false;
    setSwitchingNetwork(false);
  }, []);

  const replaceProvider = useCallback((wallet: DiscoveredWallet | null, explicit: boolean) => {
    if (activeProvider.current?.provider === wallet?.provider) return;
    if (explicit || activeProvider.current) allowImplicitSelection.current = false;
    operation.current += 1;
    providerRevision.current += 1;
    activeProvider.current = wallet;
    activeAddress.current = null;
    explicitlySelected.current = explicit;
    clearPendingRequests();
    // Choosing a different wallet never implies consent to connect it. Only a
    // sole provider may restore previously granted permissions on initial load.
    locallyDisconnected.current = explicit || !!savedDisconnect();
    setSelected(wallet);
    setProviderGeneration(providerRevision.current);
    setState({ ...initialState, installed: wallets.current.length > 0, disconnectStatus: savedDisconnect() ? "manual" : null });
  }, [clearPendingRequests]);

  useEffect(() => discoverWallets(window, ({ wallets: available, settled }) => {
    wallets.current = available;
    setChoices(available.map(({ id, label }) => ({ id, label })));
    setDiscovering(!settled);
    const current = activeProvider.current;
    if (current && !available.some(({ provider }) => provider === current.provider)) {
      replaceProvider(null, false);
    } else if (available.length > 1 && current && !explicitlySelected.current) {
      // A second, late-announcing extension must not inherit our initial
      // single-provider assumption. Invalidate its reads immediately.
      replaceProvider(null, false);
    }
    if (!activeProvider.current && available.length === 1 && settled && allowImplicitSelection.current) {
      replaceProvider(available[0], false);
    }
    if (!activeProvider.current) {
      setState((previous) => ({ ...previous, installed: available.length > 0 && (settled || available.length > 1) }));
    }
  }), [replaceProvider]);

  const selectWallet = useCallback((id: string) => {
    const wallet = wallets.current.find((entry) => entry.id === id);
    if (!wallet) return;
    explicitlySelected.current = true;
    replaceProvider(wallet, true);
  }, [replaceProvider]);

  useEffect(() => () => {
    // A route change must not let an old request overwrite a new session's
    // saved disconnect preference after this hook has unmounted.
    operation.current += 1;
    providerRevision.current += 1;
    networkRequest.current += 1;
    activeProvider.current = null;
    activeAddress.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const generation = operation.current;
    const provider = selected?.provider ?? null;
    if (!provider) return;
    const saved = savedDisconnect();
    if (saved) locallyDisconnected.current = true;

    if (saved || !locallyDisconnected.current) {
      const snapshot = saved
        ? readDisconnectedSnapshot(provider)
        : readWalletSnapshot(provider);
      void snapshot.then((next) => {
        if (!cancelled && generation === operation.current && !connecting.current) {
          activeAddress.current = next.address;
          setState(next);
        }
      });
    }

    const refresh = () => {
      if (provider !== activeProvider.current?.provider) return;
      if (connecting.current) {
        refreshAfterConnect.current = true;
      } else if (!locallyDisconnected.current) {
        operation.current += 1;
        activeAddress.current = null;
        setState((previous) => ({ ...previous, address: null, chainId: null }));
        setHydrationToken((value) => value + 1);
      }
    };
    const onDisconnect = () => {
      if (provider !== activeProvider.current?.provider) return;
      operation.current += 1;
      activeAddress.current = null;
      clearPendingRequests();
      locallyDisconnected.current = true;
      setState({ ...initialState, installed: true, errorMessage: "The selected wallet disconnected. Reconnect it to continue." });
    };
    const onAccounts = (...args: unknown[]) => {
      if (provider !== activeProvider.current?.provider) return;
      // An external reconnection can restore permissions without a connect
      // click in this tab. Keep this tab disconnected but drop stale success.
      if (locallyDisconnected.current && !connecting.current && Array.isArray(args[0]) && args[0].length > 0) {
        operation.current += 1;
        activeAddress.current = null;
        clearPendingRequests();
        setState({ ...initialState, installed: !!provider, disconnectStatus: "manual" });
      }
      refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (provider !== activeProvider.current?.provider) return;
      if (event.key !== disconnectStorageKey) return;
      if (!event.newValue) {
        // Another tab explicitly connected. It may use the wallet, but this
        // tab stays locally disconnected and cannot claim permission removal.
        if (locallyDisconnected.current) {
          operation.current += 1;
          activeAddress.current = null;
          clearPendingRequests();
          setState({ ...initialState, installed: !!provider, disconnectStatus: "manual" });
        }
        return;
      }
      operation.current += 1;
      activeAddress.current = null;
      clearPendingRequests();
      const generation = operation.current;
      locallyDisconnected.current = true;
      setState({ ...initialState, installed: !!provider, disconnectStatus: "manual" });
      void readDisconnectedSnapshot(provider).then((snapshot) => {
        if (!cancelled && generation === operation.current) setState(snapshot);
      });
    };

    const removeListeners = listenToWallet(provider, {
      accountsChanged: onAccounts, chainChanged: refresh, disconnect: onDisconnect,
    });
    window.addEventListener("storage", onStorage);

    return () => {
      cancelled = true;
      removeListeners();
      window.removeEventListener("storage", onStorage);
    };
  }, [hydrationToken, selected, providerGeneration, clearPendingRequests]);

  const connect = useCallback(async () => {
    if (connecting.current || disconnecting.current || networkSwitching.current) return;
    const generation = ++operation.current;
    const provider = activeProvider.current?.provider ?? null;
    if (!provider) {
      setState((prev) => ({
        ...prev,
        installed: wallets.current.length > 0,
        errorMessage: wallets.current.length > 0 ? "Choose a wallet before connecting." : "No injected wallet was found.",
      }));
      return;
    }

    connecting.current = true;
    explicitlySelected.current = true;
    refreshAfterConnect.current = false;
    setState((prev) => ({ ...prev, connecting: true, errorMessage: null }));

    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (generation !== operation.current) return;
      const chainHex = (await provider.request({
        method: "eth_chainId",
      })) as string;
      if (generation !== operation.current) return;
      if (!accounts[0]) throw new Error("No wallet account was connected.");
      const address = getAddress(accounts[0]);
      activeAddress.current = address;
      locallyDisconnected.current = false;
      saveDisconnect(null);
      setState({
        ...initialState,
        installed: true,
        address,
        chainId: Number.parseInt(chainHex, 16),
        connecting: false,
        errorMessage: null,
      });
    } catch (error) {
      if (generation !== operation.current) return;
      const message =
        error instanceof Error ? error.message : "Wallet connection failed.";
      setState((prev) => ({
        ...prev,
        connecting: false,
        errorMessage: message,
      }));
    } finally {
      if (generation === operation.current) {
        connecting.current = false;
        if (refreshAfterConnect.current && !locallyDisconnected.current) {
          setHydrationToken((value) => value + 1);
        }
        refreshAfterConnect.current = false;
      }
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (disconnecting.current) return;
    const generation = ++operation.current;
    const provider = activeProvider.current?.provider ?? null;
    const hadPendingConnection = connecting.current;
    clearPendingRequests();
    // Remember the user's intent even if this provider cannot revoke access.
    // No address, permission, or game state is stored here.
    locallyDisconnected.current = true;
    activeAddress.current = null;
    connecting.current = false;
    disconnecting.current = true;
    saveDisconnect("manual");
    setState({ ...initialState, installed: !!provider, disconnectStatus: "pending" });
    let status: "manual" | "revoked" = "manual";
    try {
      if (!provider) throw new Error("Wallet unavailable");
      await provider.request({
        method: "wallet_revokePermissions",
        params: [{ eth_accounts: {} }],
      });
      if (generation !== operation.current) return;
      const accounts = await provider.request({ method: "eth_accounts" });
      // A still-open connect prompt can grant access after this read-back.
      // In that case, retain the manual instruction rather than promise removal.
      if (Array.isArray(accounts) && accounts.length === 0 && !hadPendingConnection) {
        status = "revoked";
      }
    } catch {
      // Unsupported, declined, failed, and unverified revocations all need the
      // same honest next step in the wallet's own connection controls.
    } finally {
      if (generation === operation.current) {
        disconnecting.current = false;
        saveDisconnect(status);
        setState({ ...initialState, installed: !!provider, disconnectStatus: status });
      }
    }
  }, [clearPendingRequests]);

  const switchNetwork = useCallback(async () => {
    if (locallyDisconnected.current || disconnecting.current || connecting.current || networkSwitching.current) return;
    const generation = operation.current;
    const provider = activeProvider.current?.provider ?? null;
    if (!provider || !expectedChain || !configured) {
      return;
    }

    const chainIdHex = `0x${expectedChain.id.toString(16)}`;
    const request = ++networkRequest.current;
    networkSwitching.current = true;
    setSwitchingNetwork(true);

    try {
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
      } catch (error) {
        if (generation !== operation.current) return;
        const code =
          typeof error === "object" && error && "code" in error
            ? Number((error as { code: number }).code)
            : null;

        if (code === 4902) {
          // Declining this prompt rejects too. Without its own catch the
          // rejection escapes switchNetwork, and every call site invokes it as
          // `void switchNetwork()` — an unhandled rejection with no error shown.
          try {
            await provider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: chainIdHex,
                  chainName: expectedChain.name,
                  nativeCurrency: expectedChain.nativeCurrency,
                  rpcUrls: [...expectedChain.rpcUrls.default.http],
                  blockExplorerUrls: expectedChain.blockExplorers
                    ? [expectedChain.blockExplorers.default.url]
                    : undefined,
                },
              ],
            });
          } catch (addError) {
            if (generation !== operation.current) return;
            const addMessage =
              addError instanceof Error
                ? addError.message
                : `${expectedChain.name} could not be added to your wallet.`;
            setState((prev) => ({ ...prev, errorMessage: addMessage }));
            return;
          }
        } else {
          const message =
            error instanceof Error ? error.message : "Network switch failed.";
          setState((prev) => ({ ...prev, errorMessage: message }));
          return;
        }
      }

      if (generation === operation.current && !locallyDisconnected.current) {
        setHydrationToken((value) => value + 1);
      }
    } finally {
      if (request === networkRequest.current) {
        networkSwitching.current = false;
        setSwitchingNetwork(false);
      }
    }
  }, [configured, expectedChain]);

  const createBrowserWalletClient = useCallback(() => {
    const provider = selected?.provider;
    if (!provider || provider !== activeProvider.current?.provider || providerGeneration !== providerRevision.current || !expectedChain || !state.address || state.address !== activeAddress.current || locallyDisconnected.current) {
      return null;
    }
    const generation = operation.current;
    const isCurrent = () => provider === activeProvider.current?.provider
      && providerGeneration === providerRevision.current
      && state.address === activeAddress.current
      && generation === operation.current
      && !locallyDisconnected.current;
    // Viem may await a chain read before sending. Guard the transport itself,
    // not just the factory, so an already-created client cannot send later for
    // a session that has been replaced by an account/network/provider event.
    type ProviderRequest = (args: { method: string; params?: unknown }) => Promise<unknown>;
    const request = async (args: { method: string; params?: unknown }) => {
      if (!isCurrent()) throw new Error("The wallet session changed. Reconnect before trying again.");
      const response = await (provider.request as unknown as ProviderRequest).call(provider, args);
      if (!isCurrent()) throw new Error("The wallet session changed. Reconnect before trying again.");
      return response;
    };

    return createWalletClient({
      account: state.address,
      chain: expectedChain,
      transport: custom({ request }, { retryCount: 0 }),
    });
  }, [expectedChain, state.address, selected, providerGeneration]);

  const wrongChain =
    configured &&
    state.chainId !== null &&
    deployment.chainId !== null &&
    state.chainId !== deployment.chainId;

  return {
    ...state,
    choices,
    selectedId: selected?.id ?? null,
    selectionRequired: choices.length > 0 && selected === null && !discovering,
    providerSessionKey: `provider-${providerGeneration}`,
    selectionBusy: discovering || state.connecting || switchingNetwork || state.disconnectStatus === "pending",
    selectWallet,
    configured,
    deployment,
    expectedChainId: deployment.chainId,
    wrongChain,
    connect,
    disconnect,
    switchNetwork,
    createBrowserWalletClient,
  };
}
