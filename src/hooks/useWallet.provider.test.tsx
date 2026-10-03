import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWallet } from "./useWallet";
import { petRegistryAbi } from "@/lib/pet-registry-abi";

const accountA = "0x1111111111111111111111111111111111111111";
const accountB = "0x2222222222222222222222222222222222222222";
const originalProviders = {
  ethereum: Object.getOwnPropertyDescriptor(window, "ethereum"),
  okxwallet: Object.getOwnPropertyDescriptor(window, "okxwallet"),
};
type ProviderKey = keyof typeof originalProviders;
type Listener = (...args: unknown[]) => void;

function installProvider(key: ProviderKey, provider: unknown) {
  Object.defineProperty(window, key, {
    configurable: true,
    writable: true,
    value: provider,
  });
}

function createProvider(initialAccounts: string[] = []) {
  let accounts = initialAccounts;
  let chainId = "0x1";
  const listeners = new Map<string, Set<Listener>>();
  const overrides = new Map<string, () => Promise<unknown>>();
  const request = vi.fn(async ({ method, params }: {
    method: string;
    params?: readonly { chainId: string }[];
  }) => {
    if (overrides.has(method)) return overrides.get(method)!();
    if (method === "eth_accounts") return accounts;
    if (method === "eth_requestAccounts") {
      accounts = [accountA];
      return accounts;
    }
    if (method === "eth_chainId") return chainId;
    if (method === "wallet_switchEthereumChain") {
      chainId = params![0].chainId;
      return null;
    }
    throw new Error(`Unexpected provider request: ${method}`);
  });
  const on = vi.fn((event: string, listener: Listener) => {
    const registered = listeners.get(event) ?? new Set<Listener>();
    registered.add(listener);
    listeners.set(event, registered);
  });
  const removeListener = vi.fn((event: string, listener: Listener) => {
    listeners.get(event)?.delete(listener);
  });

  return {
    request,
    on,
    removeListener,
    overrides,
    emit(event: string, ...args: unknown[]) {
      for (const listener of listeners.get(event) ?? []) listener(...args);
    },
    changeAccounts(next: string[]) {
      accounts = next;
      for (const listener of listeners.get("accountsChanged") ?? []) listener(next);
    },
    changeChain(next: string) {
      chainId = next;
      for (const listener of listeners.get("chainChanged") ?? []) listener(next);
    },
    listenerCount(event: string) {
      return listeners.get(event)?.size ?? 0;
    },
  };
}

function announce(provider: unknown, name: string) {
  window.dispatchEvent(new CustomEvent("eip6963:announceProvider", {
    detail: { provider, info: { name } },
  }));
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

describe("useWallet injected provider selection", () => {
  beforeEach(() => {
    window.localStorage.removeItem("memepet.wallet-disconnected");
    installProvider("ethereum", undefined);
    installProvider("okxwallet", undefined);
  });

  afterEach(() => {
    cleanup();
    for (const key of Object.keys(originalProviders) as ProviderKey[]) {
      const descriptor = originalProviders[key];
      if (descriptor) Object.defineProperty(window, key, descriptor);
      else Reflect.deleteProperty(window, key);
    }
  });

  it("detects and connects an OKX-only provider and uses it for the wallet client", async () => {
    const okx = createProvider();
    installProvider("okxwallet", okx);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.installed).toBe(true));
    expect(result.current.address).toBeNull();

    await act(async () => { await result.current.connect(); });

    expect(okx.request).toHaveBeenCalledWith({ method: "eth_requestAccounts" });
    expect(result.current.address).toBe(accountA);
    expect(result.current.chainId).toBe(1);
    expect(result.current.errorMessage).toBeNull();
    const client = result.current.createBrowserWalletClient();
    expect(client).not.toBeNull();
    expect(client?.account?.address).toBe(accountA);
    okx.request.mockClear();
    expect(await client!.request({ method: "eth_chainId" })).toBe("0x1");
    expect(okx.request).toHaveBeenCalledTimes(1);
    expect(okx.request.mock.calls[0][0]).toEqual({ method: "eth_chainId" });
  });

  it("refreshes OKX account and chain events and removes listeners on unmount", async () => {
    const okx = createProvider([accountA]);
    installProvider("okxwallet", okx);
    const { result, unmount } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.address).toBe(accountA));

    act(() => { okx.changeAccounts([accountB]); });
    await waitFor(() => expect(result.current.address).toBe(accountB));
    act(() => { okx.changeChain("0x7a0"); });
    await waitFor(() => expect(result.current.chainId).toBe(1952));
    act(() => { okx.changeAccounts([]); });
    await waitFor(() => expect(result.current.address).toBeNull());
    expect(result.current.createBrowserWalletClient()).toBeNull();
    expect(okx.listenerCount("accountsChanged")).toBe(1);
    expect(okx.listenerCount("chainChanged")).toBe(1);

    unmount();
    expect(okx.listenerCount("accountsChanged")).toBe(0);
    expect(okx.listenerCount("chainChanged")).toBe(0);
  });

  it("switches the network through an OKX-only provider", async () => {
    const okx = createProvider([accountA]);
    installProvider("okxwallet", okx);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.chainId).toBe(1));
    const expectedChainId = result.current.expectedChainId!;

    await act(async () => { await result.current.switchNetwork(); });

    expect(okx.request).toHaveBeenCalledWith({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
    });
    await waitFor(() => expect(result.current.chainId).toBe(expectedChainId));
    expect(result.current.wrongChain).toBe(false);
  });

  it("requires explicit choice when both providers exist and routes every operation to that choice", async () => {
    const ethereum = createProvider([accountB]);
    const okx = createProvider();
    installProvider("ethereum", ethereum);
    installProvider("okxwallet", okx);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.selectionRequired).toBe(true));
    expect(result.current.address).toBeNull();
    expect(ethereum.request).not.toHaveBeenCalled();
    expect(okx.request).not.toHaveBeenCalled();
    await act(async () => { await result.current.connect(); });
    expect(result.current.errorMessage).toBe("Choose a wallet before connecting.");
    act(() => { result.current.selectWallet(result.current.choices.find(({ label }) => label === "OKX Wallet")!.id); });
    expect(result.current.address).toBeNull();
    expect(okx.request).not.toHaveBeenCalled();
    await act(async () => { await result.current.connect(); });
    await act(async () => { await result.current.switchNetwork(); });
    const client = result.current.createBrowserWalletClient();
    await client!.request({ method: "eth_chainId" });

    expect(okx.request).toHaveBeenCalledWith({ method: "eth_requestAccounts" });
    expect(okx.on).toHaveBeenCalledWith("accountsChanged", expect.any(Function));
    expect(ethereum.request).not.toHaveBeenCalled();
    expect(ethereum.on).not.toHaveBeenCalled();
  });

  it("reports the missing wallet without fabricating a connected account", async () => {
    const { result } = renderHook(() => useWallet());
    // Settle the mount-time snapshot before checking the user-initiated error.
    await act(async () => {});
    await act(async () => { await result.current.connect(); });

    expect(result.current.installed).toBe(false);
    expect(result.current.address).toBeNull();
    expect(result.current.errorMessage).toBe("No injected wallet was found.");
    expect(result.current.createBrowserWalletClient()).toBeNull();
  });

  it("invalidates an implicit connection when a second wallet announces late", async () => {
    const first = createProvider([accountA]); const second = createProvider([accountB]);
    installProvider("ethereum", first);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.address).toBe(accountA));
    const previousSession = result.current.providerSessionKey;
    const oldClient = result.current.createBrowserWalletClient;
    act(() => { announce(second, "Second wallet"); });
    expect(result.current.selectionRequired).toBe(true);
    expect(result.current.address).toBeNull();
    expect(result.current.providerSessionKey).not.toBe(previousSession);
    expect(oldClient()).toBeNull();
    expect(second.request).not.toHaveBeenCalled();
    expect(first.listenerCount("accountsChanged")).toBe(0);
    act(() => { first.changeAccounts([accountB]); });
    expect(result.current.address).toBeNull();
  });

  it("preserves an intentional connection if another wallet appears later", async () => {
    const first = createProvider(); const second = createProvider([accountB]);
    installProvider("ethereum", first);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.selectedId).not.toBeNull());
    act(() => { announce(first, "First wallet"); });
    await act(async () => { await result.current.connect(); });
    const previousSession = result.current.providerSessionKey;
    act(() => { announce(second, "Second wallet"); });
    expect(result.current.choices).toHaveLength(2);
    expect(result.current.address).toBe(accountA);
    expect(result.current.providerSessionKey).toBe(previousSession);
    expect(second.request).not.toHaveBeenCalled();
  });

  it("shows one OKX choice when its announcement and legacy compatibility wrapper are distinct", async () => {
    const wrapper = createProvider(); const announced = createProvider();
    const metamask = createProvider();
    installProvider("okxwallet", wrapper); installProvider("ethereum", metamask);
    const { result } = renderHook(() => useWallet());
    act(() => { announce(metamask, "MetaMask"); announce(announced, "OKX Wallet"); });
    await waitFor(() => expect(result.current.selectionRequired).toBe(true));
    expect(result.current.choices.map(({ label }) => label)).toEqual(["MetaMask", "OKX Wallet"]);
    act(() => { result.current.selectWallet(result.current.choices[1].id); });
    await act(async () => { await result.current.connect(); });
    expect(result.current.address).toBe(accountA);
    expect(wrapper.request).not.toHaveBeenCalled();
    expect(metamask.request).not.toHaveBeenCalled();
    const client = result.current.createBrowserWalletClient()!;
    await client.request({ method: "eth_chainId" });
    expect(announced.request).toHaveBeenCalledWith({ method: "eth_requestAccounts" });
    expect(announced.request).toHaveBeenCalledWith({ method: "eth_chainId" });
  });

  it("requires explicit reselection when a late announcement replaces an intentionally connected legacy wrapper", async () => {
    const legacy = createProvider(); const modern = createProvider([accountB]);
    installProvider("okxwallet", legacy);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.selectedId).not.toBeNull());
    await act(async () => { await result.current.connect(); });
    const oldFactory = result.current.createBrowserWalletClient;
    const oldClient = oldFactory()!;
    const generation = result.current.providerSessionKey;
    legacy.request.mockClear();
    act(() => { announce(modern, "OKX Wallet"); });
    expect(result.current.choices).toHaveLength(1);
    expect(result.current.selectedId).toBeNull();
    expect(result.current.selectionRequired).toBe(true);
    expect(result.current.address).toBeNull();
    expect(result.current.providerSessionKey).not.toBe(generation);
    expect(oldFactory()).toBeNull();
    expect(legacy.listenerCount("accountsChanged")).toBe(0);
    await expect(oldClient.request({ method: "eth_chainId" })).rejects.toThrow(/wallet session changed/);
    expect(legacy.request).not.toHaveBeenCalled();
    expect(modern.request).not.toHaveBeenCalled();
    act(() => { result.current.selectWallet(result.current.choices[0].id); });
    expect(modern.request).not.toHaveBeenCalled();
    await act(async () => { await result.current.connect(); });
    expect(modern.request).toHaveBeenCalledWith({ method: "eth_requestAccounts" });
    expect(result.current.address).toBe(accountA);
  });

  it("keeps the selected provider and ID when its exact reference announces late", async () => {
    const provider = createProvider(); installProvider("okxwallet", provider);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.selectedId).not.toBeNull());
    await act(async () => { await result.current.connect(); });
    const id = result.current.selectedId;
    const generation = result.current.providerSessionKey;
    act(() => { announce(provider, "OKX Wallet"); });
    expect(result.current.selectedId).toBe(id);
    expect(result.current.providerSessionKey).toBe(generation);
    expect(result.current.address).toBe(accountA);
    expect(result.current.choices).toHaveLength(1);
    expect(provider.listenerCount("accountsChanged")).toBe(1);
  });

  it("discards an old pending legacy connection when the announced list becomes authoritative", async () => {
    const legacy = createProvider(); const modern = createProvider();
    const oldRequest = deferred<unknown>();
    legacy.overrides.set("eth_requestAccounts", () => oldRequest.promise);
    installProvider("okxwallet", legacy);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.chainId).toBe(1));
    legacy.request.mockClear();
    let connect!: Promise<void>;
    act(() => { connect = result.current.connect(); });
    act(() => { announce(modern, "OKX Wallet"); });
    await act(async () => { oldRequest.resolve([accountA]); await connect; });
    expect(result.current.address).toBeNull();
    expect(result.current.selectedId).toBeNull();
    expect(result.current.selectionRequired).toBe(true);
    expect(result.current.connecting).toBe(false);
    expect(modern.request).not.toHaveBeenCalled();
    expect(legacy.request.mock.calls.filter(([call]) => call.method === "eth_chainId")).toHaveLength(0);
  });

  it("isolates a same-address same-chain provider swap and ignores events from the old wallet", async () => {
    const first = createProvider([accountA]); const second = createProvider([accountA]);
    installProvider("ethereum", first); installProvider("okxwallet", second);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.selectionRequired).toBe(true));
    act(() => { result.current.selectWallet(result.current.choices[0].id); });
    await act(async () => { await result.current.connect(); });
    const session = result.current.providerSessionKey;
    const oldClient = result.current.createBrowserWalletClient;
    first.request.mockClear(); second.request.mockClear();
    act(() => {
      result.current.selectWallet(result.current.choices[1].id);
      // The old effect has not cleaned its listeners yet in this same event.
      first.changeAccounts([accountB]); first.emit("disconnect");
    });
    expect(result.current.address).toBeNull();
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.providerSessionKey).not.toBe(session);
    expect(oldClient()).toBeNull();
    expect(second.request).not.toHaveBeenCalled();
    await act(async () => { await result.current.connect(); });
    expect(result.current.address).toBe(accountA);
    expect(first.request).not.toHaveBeenCalled();
    first.changeChain("0x7a0");
    expect(result.current.chainId).toBe(1);
    const client = result.current.createBrowserWalletClient();
    await client!.request({ method: "eth_chainId" });
    expect(second.request).toHaveBeenCalledWith({ method: "eth_chainId" });
  });

  it("does not let a late connection overwrite or release a newer wallet's pending connect", async () => {
    const first = createProvider(); const second = createProvider();
    const oldRequest = deferred<unknown>(); const newRequest = deferred<unknown>();
    first.overrides.set("eth_requestAccounts", () => oldRequest.promise);
    second.overrides.set("eth_requestAccounts", () => newRequest.promise);
    installProvider("ethereum", first); installProvider("okxwallet", second);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.selectionRequired).toBe(true));
    act(() => { result.current.selectWallet(result.current.choices[0].id); });
    let pendingOld!: Promise<void>; let pendingNew!: Promise<void>;
    act(() => { pendingOld = result.current.connect(); });
    act(() => { result.current.selectWallet(result.current.choices[1].id); });
    act(() => { pendingNew = result.current.connect(); });
    await act(async () => { oldRequest.resolve([accountB]); await pendingOld; });
    expect(result.current.connecting).toBe(true);
    expect(result.current.address).toBeNull();
    expect(first.request.mock.calls.filter(([call]) => call.method === "eth_chainId")).toHaveLength(0);
    await act(async () => { newRequest.resolve([accountA]); await pendingNew; });
    expect(result.current.address).toBe(accountA);
    expect(result.current.connecting).toBe(false);
  });

  it("keeps rejected explicit connections disconnected and does not disturb the other provider", async () => {
    const first = createProvider([accountA]); const second = createProvider([accountB]);
    second.overrides.set("eth_requestAccounts", async () => { throw new Error("User rejected"); });
    installProvider("ethereum", first); installProvider("okxwallet", second);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.selectionRequired).toBe(true));
    act(() => { result.current.selectWallet(result.current.choices[1].id); });
    await act(async () => { await result.current.connect(); });
    expect(result.current.address).toBeNull();
    expect(result.current.errorMessage).toBe("User rejected");
    expect(first.request).not.toHaveBeenCalled();
    expect(result.current.selectionBusy).toBe(false);
  });

  it("does not choose the other wallet automatically after the selected legacy provider disappears", async () => {
    const first = createProvider([accountA]); const second = createProvider();
    installProvider("ethereum", first); installProvider("okxwallet", second);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.selectionRequired).toBe(true));
    act(() => { result.current.selectWallet(result.current.choices[0].id); });
    await act(async () => { await result.current.connect(); });
    act(() => { installProvider("ethereum", undefined); window.dispatchEvent(new Event("focus")); });
    expect(result.current.address).toBeNull();
    expect(result.current.selectedId).toBeNull();
    expect(result.current.selectionRequired).toBe(true);
    expect(result.current.choices).toHaveLength(1);
    expect(second.request).not.toHaveBeenCalled();
  });

  it("clears a selected wallet when its provider disconnects without restoring it on incidental events", async () => {
    const first = createProvider([accountA]); installProvider("ethereum", first);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.address).toBe(accountA));
    const oldClient = result.current.createBrowserWalletClient;
    act(() => { first.emit("disconnect"); });
    expect(result.current.address).toBeNull();
    expect(oldClient()).toBeNull();
    expect(result.current.errorMessage).toContain("disconnected");
    act(() => { first.changeChain("0x7a0"); });
    expect(result.current.address).toBeNull();
  });

  it("does not continue an old network-switch prompt after selecting a different provider", async () => {
    const first = createProvider([accountA]); const second = createProvider();
    const switching = deferred<unknown>();
    first.overrides.set("wallet_switchEthereumChain", () => switching.promise);
    installProvider("ethereum", first); installProvider("okxwallet", second);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.selectionRequired).toBe(true));
    act(() => { result.current.selectWallet(result.current.choices[0].id); });
    await act(async () => { await result.current.connect(); });
    let pending!: Promise<void>;
    act(() => { pending = result.current.switchNetwork(); });
    expect(result.current.selectionBusy).toBe(true);
    act(() => { result.current.selectWallet(result.current.choices[1].id); });
    await act(async () => { switching.reject({ code: 4902 }); await pending; });
    expect(first.request.mock.calls.some(([call]) => call.method === "wallet_addEthereumChain")).toBe(false);
    expect(result.current.errorMessage).toBeNull();
    expect(second.request).not.toHaveBeenCalled();
    expect(result.current.selectionBusy).toBe(false);
  });

  it("blocks an already-created client from sending after an awaited chain read crosses a provider switch", async () => {
    const first = createProvider([accountA]); const second = createProvider();
    installProvider("ethereum", first); installProvider("okxwallet", second);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.selectionRequired).toBe(true));
    act(() => { result.current.selectWallet(result.current.choices[0].id); });
    await act(async () => { await result.current.connect(); });
    const client = result.current.createBrowserWalletClient()!;
    const chain = deferred<unknown>();
    first.overrides.set("eth_chainId", () => chain.promise);
    first.request.mockClear();
    const write = client.writeContract({
      address: "0x3333333333333333333333333333333333333333",
      abi: petRegistryAbi,
      functionName: "care",
    });
    const failed = expect(write).rejects.toThrow(/wallet session changed/);
    await waitFor(() => expect(first.request).toHaveBeenCalledWith({ method: "eth_chainId" }));
    act(() => { result.current.selectWallet(result.current.choices[1].id); });
    await act(async () => { chain.resolve("0x7a0"); await failed; });
    expect(first.request.mock.calls.some(([call]) => call.method === "eth_sendTransaction")).toBe(false);
    expect(second.request).not.toHaveBeenCalled();
  });

  it("does not transfer the saved global revocation claim to a different selected wallet", async () => {
    window.localStorage.setItem("memepet.wallet-disconnected", "revoked");
    const first = createProvider(); const second = createProvider();
    installProvider("ethereum", first); installProvider("okxwallet", second);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.selectionRequired).toBe(true));
    act(() => { result.current.selectWallet(result.current.choices[1].id); });
    await act(async () => {});
    expect(result.current.disconnectStatus).toBe("manual");
    expect(result.current.address).toBeNull();
    expect(first.request).not.toHaveBeenCalled(); expect(second.request).not.toHaveBeenCalled();
  });
});
