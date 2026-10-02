import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWallet } from "./useWallet";

const account = "0x1111111111111111111111111111111111111111";
const storageKey = "memepet.wallet-disconnected";
const originalProvider = Object.getOwnPropertyDescriptor(window, "ethereum");
type Request = { method: string; params?: unknown };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function providerFixture(initialAccounts = [account]) {
  let accounts = initialAccounts;
  const overrides = new Map<string, () => Promise<unknown>>();
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  const emit = (event: string, ...args: unknown[]) => {
    for (const listener of listeners.get(event) ?? []) listener(...args);
  };
  const request = vi.fn(async ({ method }: Request) => {
    if (overrides.has(method)) return overrides.get(method)!();
    if (method === "eth_accounts") return accounts;
    if (method === "eth_chainId") return "0x1";
    if (method === "eth_requestAccounts") {
      accounts = [account];
      emit("accountsChanged", accounts);
      return accounts;
    }
    if (method === "wallet_revokePermissions") {
      accounts = [];
      emit("accountsChanged", accounts);
      return null;
    }
    if (method === "wallet_switchEthereumChain") return null;
    throw new Error(`Unexpected request: ${method}`);
  });
  const provider = {
    request,
    on(event: string, listener: (...args: unknown[]) => void) {
      const set = listeners.get(event) ?? new Set();
      set.add(listener);
      listeners.set(event, set);
    },
    removeListener(event: string, listener: (...args: unknown[]) => void) {
      listeners.get(event)?.delete(listener);
    },
  };
  Object.defineProperty(window, "ethereum", {
    configurable: true, value: provider, writable: true,
  });
  return { request, overrides, emit };
}

async function connectedWallet() {
  const provider = providerFixture();
  const hook = renderHook(() => useWallet());
  await waitFor(() => expect(hook.result.current.address).toBe(account));
  return { ...provider, ...hook };
}

beforeEach(() => {
  window.localStorage.removeItem(storageKey);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.localStorage.removeItem(storageKey);
  if (originalProvider) Object.defineProperty(window, "ethereum", originalProvider);
  else Reflect.deleteProperty(window, "ethereum");
});

describe("wallet permission revocation", () => {
  it("revokes account access, verifies it, and clears the wallet immediately", async () => {
    const { result, request, overrides } = await connectedWallet();
    const revoke = deferred<null>();
    overrides.set("wallet_revokePermissions", () => revoke.promise);
    const oldCreateClient = result.current.createBrowserWalletClient;
    let disconnect!: Promise<void>;
    act(() => { disconnect = result.current.disconnect(); });
    expect(result.current.address).toBeNull();
    expect(result.current.chainId).toBeNull();
    expect(result.current.disconnectStatus).toBe("pending");
    expect(oldCreateClient()).toBeNull();
    expect(request).toHaveBeenCalledWith({
      method: "wallet_revokePermissions", params: [{ eth_accounts: {} }],
    });
    overrides.set("eth_accounts", async () => []);
    await act(async () => { revoke.resolve(null); await disconnect; });
    expect(result.current.disconnectStatus).toBe("revoked");
    expect(request.mock.calls.at(-1)?.[0].method).toBe("eth_accounts");
    expect(request.mock.calls.some(([call]) => /sign|sendTransaction/.test(call.method))).toBe(false);
  });

  it.each([-32601, 4001])("keeps access unverified when revocation fails with %s", async (code) => {
    const { result, overrides, emit } = await connectedWallet();
    overrides.set("wallet_revokePermissions", async () => {
      throw Object.assign(new Error("Cannot revoke"), { code });
    });
    await act(async () => { await result.current.disconnect(); });
    expect(result.current.disconnectStatus).toBe("manual");
    act(() => { emit("accountsChanged"); emit("chainChanged"); });
    await act(async () => {});
    expect(result.current.address).toBeNull();
    expect(result.current.createBrowserWalletClient()).toBeNull();
  });

  it("does not claim success when the provider still exposes an account", async () => {
    const { result, overrides } = await connectedWallet();
    overrides.set("wallet_revokePermissions", async () => null);
    await act(async () => { await result.current.disconnect(); });
    expect(result.current.disconnectStatus).toBe("manual");
  });

  it("preserves failed-revocation intent after remount until an explicit successful connect", async () => {
    const { result, overrides, unmount, request } = await connectedWallet();
    overrides.set("wallet_revokePermissions", async () => { throw new Error("Unsupported"); });
    await act(async () => { await result.current.disconnect(); });
    unmount();
    request.mockClear();
    const next = renderHook(() => useWallet());
    await waitFor(() => expect(next.result.current.disconnectStatus).toBe("manual"));
    expect(next.result.current.address).toBeNull();
    expect(request).not.toHaveBeenCalled();
    overrides.set("eth_requestAccounts", async () => { throw new Error("User rejected"); });
    await act(async () => { await next.result.current.connect(); });
    expect(window.localStorage.getItem(storageKey)).toBe("manual");
    expect(next.result.current.address).toBeNull();
    overrides.delete("eth_requestAccounts");
    await act(async () => { await next.result.current.connect(); });
    expect(next.result.current.address).toBe(account);
    expect(next.result.current.disconnectStatus).toBeNull();
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("still revokes wallet access when local storage is blocked", async () => {
    const { result } = await connectedWallet();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Denied"); });
    await act(async () => { await result.current.disconnect(); });
    expect(result.current.disconnectStatus).toBe("revoked");
    expect(result.current.address).toBeNull();
  });

  it("restores saved disconnection conservatively without claiming a past wallet revocation is current", async () => {
    const { result, overrides, unmount, request } = await connectedWallet();
    await act(async () => { await result.current.disconnect(); });
    expect(result.current.disconnectStatus).toBe("revoked");
    unmount();
    overrides.set("eth_accounts", async () => [account]);
    request.mockClear();
    const next = renderHook(() => useWallet());
    await waitFor(() => expect(next.result.current.disconnectStatus).toBe("manual"));
    expect(next.result.current.address).toBeNull();
    expect(request).not.toHaveBeenCalled();
  });

  it("drops the revocation claim when another tab reconnects but stays locally disconnected", async () => {
    const { result, emit } = await connectedWallet();
    await act(async () => { await result.current.disconnect(); });
    window.localStorage.removeItem(storageKey);
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: storageKey, newValue: null }));
      emit("accountsChanged", [account]);
    });
    expect(result.current.disconnectStatus).toBe("manual");
    expect(result.current.address).toBeNull();
  });

  it("drops the revocation claim when access returns through the wallet itself", async () => {
    const { result, emit } = await connectedWallet();
    await act(async () => { await result.current.disconnect(); });
    act(() => { emit("accountsChanged", [account]); });
    expect(result.current.disconnectStatus).toBe("manual");
    expect(result.current.address).toBeNull();
  });
});

describe("disconnect race protection", () => {
  it("ignores a mount snapshot that completes after disconnect", async () => {
    const { overrides } = providerFixture();
    const read = deferred<unknown>();
    overrides.set("eth_accounts", () => read.promise);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.selectedId).not.toBeNull());
    overrides.delete("eth_accounts");
    await act(async () => { await result.current.disconnect(); });
    await act(async () => { read.resolve([account]); });
    expect(result.current.address).toBeNull();
    expect(result.current.disconnectStatus).toBe("revoked");
  });

  it("ignores a stale account-event snapshot", async () => {
    const { result, overrides, emit } = await connectedWallet();
    const read = deferred<unknown>();
    overrides.set("eth_accounts", () => read.promise);
    act(() => { emit("accountsChanged"); });
    overrides.delete("eth_accounts");
    await act(async () => { await result.current.disconnect(); });
    await act(async () => { read.resolve([account]); });
    expect(result.current.address).toBeNull();
    expect(result.current.disconnectStatus).toBe("revoked");
  });

  it("reconciles an account change received during an outstanding connect request", async () => {
    const secondAccount = "0x2222222222222222222222222222222222222222";
    const { overrides, emit, request } = providerFixture([]);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.installed).toBe(true));
    const chain = deferred<unknown>();
    overrides.set("eth_chainId", () => chain.promise);
    request.mockClear();
    let pending!: Promise<void>;
    act(() => { pending = result.current.connect(); });
    await waitFor(() => expect(request).toHaveBeenCalledWith({ method: "eth_chainId" }));
    overrides.set("eth_accounts", async () => [secondAccount]);
    act(() => { emit("accountsChanged", [secondAccount]); });
    await act(async () => { chain.resolve("0x1"); await pending; });
    await waitFor(() => expect(result.current.address).toBe(secondAccount));
    expect(result.current.connecting).toBe(false);
  });

  it("does not restore a cancelled pending connection or claim it has no remaining prompt", async () => {
    const { overrides, request } = providerFixture([]);
    const connect = deferred<unknown>();
    overrides.set("eth_requestAccounts", () => connect.promise);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.installed).toBe(true));
    let pending!: Promise<void>;
    act(() => { pending = result.current.connect(); });
    await act(async () => { await result.current.disconnect(); });
    expect(result.current.disconnectStatus).toBe("manual");
    request.mockClear();
    await act(async () => { connect.resolve([account]); await pending; });
    expect(result.current.address).toBeNull();
    expect(result.current.connecting).toBe(false);
    expect(result.current.disconnectStatus).toBe("manual");
    expect(request).not.toHaveBeenCalled();
  });

  it.each(["success", "unknown-chain"])("ignores a late network-switch %s after disconnect", async (outcome) => {
    const { result, overrides, request } = await connectedWallet();
    const network = deferred<unknown>();
    overrides.set("wallet_switchEthereumChain", () => network.promise);
    let pending!: Promise<void>;
    act(() => { pending = result.current.switchNetwork(); });
    await act(async () => { await result.current.disconnect(); });
    request.mockClear();
    await act(async () => {
      if (outcome === "success") network.resolve(null);
      else network.reject({ code: 4902 });
      await pending;
    });
    expect(request).not.toHaveBeenCalled();
    expect(result.current.address).toBeNull();
    expect(result.current.disconnectStatus).toBe("revoked");
    expect(result.current.errorMessage).toBeNull();
  });

  it("ignores a late add-network rejection after disconnect", async () => {
    const { result, overrides, request } = await connectedWallet();
    const add = deferred<unknown>();
    overrides.set("wallet_switchEthereumChain", async () => { throw { code: 4902 }; });
    overrides.set("wallet_addEthereumChain", () => add.promise);
    let pending!: Promise<void>;
    act(() => { pending = result.current.switchNetwork(); });
    await waitFor(() => expect(request).toHaveBeenCalledWith(expect.objectContaining({ method: "wallet_addEthereumChain" })));
    await act(async () => { await result.current.disconnect(); });
    await act(async () => { add.reject(new Error("User rejected")); await pending; });
    expect(result.current.errorMessage).toBeNull();
    expect(result.current.disconnectStatus).toBe("revoked");
  });

  it("observes another tab's disconnect without restoring accounts on wallet events", async () => {
    const { result, emit } = await connectedWallet();
    window.localStorage.setItem(storageKey, "manual");
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: storageKey, newValue: "manual" }));
      emit("accountsChanged");
    });
    expect(result.current.address).toBeNull();
    expect(result.current.disconnectStatus).toBe("manual");
  });

  it("allows a new connect after another tab invalidates an older pending connection", async () => {
    const { overrides, request } = providerFixture([]);
    const old = deferred<unknown>();
    overrides.set("eth_requestAccounts", () => old.promise);
    const { result } = renderHook(() => useWallet());
    await waitFor(() => expect(result.current.selectedId).not.toBeNull());
    let pending!: Promise<void>;
    act(() => { pending = result.current.connect(); });
    act(() => {
      window.localStorage.setItem(storageKey, "manual");
      window.dispatchEvent(new StorageEvent("storage", { key: storageKey, newValue: "manual" }));
    });
    expect(result.current.connecting).toBe(false);
    overrides.delete("eth_requestAccounts");
    await act(async () => { await result.current.connect(); });
    expect(result.current.address).toBe(account);
    const requestCount = request.mock.calls.length;
    await act(async () => { old.resolve([account]); await pending; });
    expect(result.current.address).toBe(account);
    expect(request.mock.calls).toHaveLength(requestCount);
  });

  it.each(["disconnect", "accountsChanged"])("allows reconnect after %s invalidates a pending revocation", async (event) => {
    const { result, overrides, emit, request } = await connectedWallet();
    const revoke = deferred<unknown>();
    overrides.set("wallet_revokePermissions", () => revoke.promise);
    let pending!: Promise<void>;
    act(() => { pending = result.current.disconnect(); });
    act(() => { emit(event, [account]); });
    await act(async () => { await result.current.connect(); });
    expect(result.current.address).toBe(account);
    const requestCount = request.mock.calls.length;
    await act(async () => { revoke.resolve(null); await pending; });
    expect(result.current.address).toBe(account);
    expect(request.mock.calls).toHaveLength(requestCount);
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("releases a stalled network switch on disconnect without letting its completion release a newer switch", async () => {
    const { result, overrides } = await connectedWallet();
    const oldNetwork = deferred<unknown>();
    const newNetwork = deferred<unknown>();
    overrides.set("wallet_switchEthereumChain", () => oldNetwork.promise);
    let oldPending!: Promise<void>;
    act(() => { oldPending = result.current.switchNetwork(); });
    expect(result.current.selectionBusy).toBe(true);
    await act(async () => { await result.current.disconnect(); });
    expect(result.current.selectionBusy).toBe(false);
    expect(result.current.disconnectStatus).toBe("revoked");
    await act(async () => { await result.current.connect(); });
    expect(result.current.address).toBe(account);

    overrides.set("wallet_switchEthereumChain", () => newNetwork.promise);
    let newPending!: Promise<void>;
    act(() => { newPending = result.current.switchNetwork(); });
    await act(async () => { oldNetwork.resolve(null); await oldPending; });
    expect(result.current.selectionBusy).toBe(true);
    await act(async () => { newNetwork.resolve(null); await newPending; });
    expect(result.current.selectionBusy).toBe(false);
    expect(result.current.address).toBe(account);
  });
});
