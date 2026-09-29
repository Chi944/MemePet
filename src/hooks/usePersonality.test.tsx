import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultPersonality } from "@/lib/companion/personality";
import { usePersonality } from "./usePersonality";

const accountA = "0xabcdef1111111111111111111111111111111111";
const accountB = "0x2222222222222222222222222222222222222222";
const registry = "0xabcdef3333333333333333333333333333333333";
const otherRegistry = "0x4444444444444444444444444444444444444444";
const args = { chainId: 1952, registryAddress: registry, address: accountA };
const keyFor = (address = accountA, chainId = 1952, registryAddress = registry) =>
  `memepet:personality:v1:${chainId}:${registryAddress}:${address}`;
const saved = JSON.stringify({ version: 1, exploreCount: 3, practiseCount: 1, style: "curious" });

describe("usePersonality browser-local preferences", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it("loads existing preferences without overwriting them, including Strict Mode", () => {
    localStorage.setItem(keyFor(), saved);
    const write = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => usePersonality(args), { wrapper: StrictMode });
    expect(result.current.profile).toMatchObject({ exploreCount: 3, practiseCount: 1, style: "curious" });
    expect(result.current.storageStatus).toBe("available");
    expect(write).not.toHaveBeenCalled();
  });

  it("persists interactions and restores them after remount", () => {
    const first = renderHook(() => usePersonality(args));
    act(() => { first.result.current.onInteract("practise"); });
    expect(first.result.current.profile).toEqual({ version: 1, exploreCount: 0, practiseCount: 1, style: "focused" });
    first.unmount();
    const next = renderHook(() => usePersonality(args));
    expect(next.result.current.profile.practiseCount).toBe(1);
    expect(next.result.current.storageStatus).toBe("available");
  });

  it("isolates account A to B to A and rejects callbacks from previous lifetimes", () => {
    const { result, rerender, unmount } = renderHook((props) => usePersonality(props), { initialProps: args });
    const oldInteract = result.current.onInteract;
    const oldReset = result.current.onReset;
    act(() => { result.current.onInteract("explore"); });
    rerender({ ...args, address: accountB });
    expect(result.current.profile).toEqual(defaultPersonality());
    act(() => { oldInteract("practise"); oldReset(); });
    expect(result.current.profile).toEqual(defaultPersonality());
    act(() => { result.current.onInteract("practise"); });
    expect(result.current.profile.style).toBe("focused");
    rerender(args);
    expect(result.current.profile).toMatchObject({ exploreCount: 1, practiseCount: 0 });
    act(() => { oldInteract("practise"); oldReset(); });
    expect(result.current.profile).toMatchObject({ exploreCount: 1, practiseCount: 0 });
    const afterUnmount = result.current.onInteract;
    unmount();
    act(() => { afterUnmount("practise"); });
    expect(JSON.parse(localStorage.getItem(keyFor())!)).toMatchObject({ exploreCount: 1, practiseCount: 0 });
    expect(JSON.parse(localStorage.getItem(keyFor(accountB))!)).toMatchObject({ exploreCount: 0, practiseCount: 1 });
  });

  it("isolates chains and registries while treating address letter case consistently", () => {
    const { result, rerender } = renderHook((props) => usePersonality(props), { initialProps: args });
    act(() => { result.current.onInteract("explore"); });
    rerender({ ...args, address: `0x${accountA.slice(2).toUpperCase()}`, registryAddress: `0x${registry.slice(2).toUpperCase()}` });
    expect(result.current.profile.exploreCount).toBe(1);
    rerender({ ...args, chainId: 31337 });
    expect(result.current.profile).toEqual(defaultPersonality());
    act(() => { result.current.onInteract("practise"); });
    rerender({ ...args, registryAddress: otherRegistry });
    expect(result.current.profile).toEqual(defaultPersonality());
    act(() => { result.current.onInteract("explore"); });
    rerender(args);
    expect(result.current.profile).toMatchObject({ exploreCount: 1, practiseCount: 0 });
    expect(localStorage.length).toBe(3);
  });

  it.each([
    { ...args, enabled: false },
    { ...args, address: null },
    { ...args, address: "0x123" },
    { ...args, registryAddress: "garbage" },
    { ...args, registryAddress: null },
    { ...args, chainId: null },
    { ...args, chainId: 0 },
    { ...args, chainId: 1.5 },
    { ...args, chainId: Number.NaN },
  ])("leaves invalid or disabled context inactive: %j", (props) => {
    const read = vi.spyOn(Storage.prototype, "getItem");
    const write = vi.spyOn(Storage.prototype, "setItem");
    const remove = vi.spyOn(Storage.prototype, "removeItem");
    const { result } = renderHook(() => usePersonality(props));
    act(() => { result.current.onInteract("explore"); result.current.onReset(); });
    expect(result.current.profile).toEqual(defaultPersonality());
    expect(result.current.storageStatus).toBe("unavailable");
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it("clears visible preferences immediately when disabled and reloads when enabled", () => {
    localStorage.setItem(keyFor(), saved);
    const { result, rerender } = renderHook((props) => usePersonality(props), { initialProps: { ...args, enabled: true } });
    const oldInteract = result.current.onInteract;
    rerender({ ...args, enabled: false });
    expect(result.current.profile).toEqual(defaultPersonality());
    expect(result.current.storageStatus).toBe("unavailable");
    act(() => { oldInteract("explore"); });
    rerender({ ...args, enabled: true });
    expect(result.current.profile.exploreCount).toBe(3);
  });

  it("falls back from malformed saved data without changing it on mount", () => {
    localStorage.setItem(keyFor(), "{broken");
    const { result } = renderHook(() => usePersonality(args));
    expect(result.current.profile).toEqual(defaultPersonality());
    expect(result.current.storageStatus).toBe("available");
    expect(localStorage.getItem(keyFor())).toBe("{broken");
    act(() => { result.current.onInteract("explore"); });
    expect(result.current.profile.exploreCount).toBe(1);
  });

  it("handles a throwing storage getter without claiming a saved interaction", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => { throw new Error("Storage blocked"); });
    const { result } = renderHook(() => usePersonality(args));
    act(() => { result.current.onInteract("explore"); result.current.onReset(); });
    expect(result.current.storageStatus).toBe("unavailable");
    expect(result.current.profile).toEqual(defaultPersonality());
  });

  it("handles read failure and recovers when storage becomes readable", () => {
    localStorage.setItem(keyFor(), saved);
    const read = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Read blocked"); });
    const { result } = renderHook(() => usePersonality(args));
    expect(result.current.storageStatus).toBe("unavailable");
    expect(result.current.profile).toEqual(defaultPersonality());
    act(() => { result.current.onInteract("explore"); });
    expect(result.current.profile.exploreCount).toBe(0);
    read.mockRestore();
    act(() => { result.current.onInteract("explore"); });
    expect(result.current.profile.exploreCount).toBe(4);
    expect(result.current.storageStatus).toBe("available");
  });

  it("reports write failures and preserves the last saved profile", () => {
    localStorage.setItem(keyFor(), saved);
    const { result } = renderHook(() => usePersonality(args));
    const write = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Quota exceeded"); });
    act(() => { result.current.onInteract("explore"); });
    expect(result.current.storageStatus).toBe("unavailable");
    expect(result.current.profile.exploreCount).toBe(3);
    expect(localStorage.getItem(keyFor())).toBe(saved);
    write.mockRestore();
    act(() => { result.current.onInteract("explore"); });
    expect(result.current.storageStatus).toBe("available");
    expect(result.current.profile.exploreCount).toBe(4);
  });

  it("removes only the current key on reset and preserves preferences on reset failure", () => {
    localStorage.setItem(keyFor(), saved);
    localStorage.setItem(keyFor(accountB), saved);
    const { result } = renderHook(() => usePersonality(args));
    const remove = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new Error("Removal blocked"); });
    act(() => { result.current.onReset(); });
    expect(result.current.profile.exploreCount).toBe(3);
    expect(result.current.storageStatus).toBe("unavailable");
    remove.mockRestore();
    act(() => { result.current.onReset(); });
    expect(result.current.profile).toEqual(defaultPersonality());
    expect(result.current.storageStatus).toBe("available");
    expect(localStorage.getItem(keyFor())).toBeNull();
    expect(localStorage.getItem(keyFor(accountB))).toBe(saved);
  });

  it("responds to other-tab updates and clears, ignoring other accounts and session storage", () => {
    const { result } = renderHook(() => usePersonality(args));
    act(() => {
      localStorage.setItem(keyFor(), saved);
      window.dispatchEvent(new StorageEvent("storage", { key: keyFor(accountB), storageArea: localStorage }));
      window.dispatchEvent(new StorageEvent("storage", { key: keyFor(), storageArea: sessionStorage }));
    });
    expect(result.current.profile.exploreCount).toBe(0);
    act(() => { window.dispatchEvent(new StorageEvent("storage", { key: keyFor(), storageArea: localStorage })); });
    expect(result.current.profile.exploreCount).toBe(3);
    act(() => {
      localStorage.clear();
      window.dispatchEvent(new StorageEvent("storage", { key: null, storageArea: localStorage }));
    });
    expect(result.current.profile).toEqual(defaultPersonality());
  });

  it("includes the latest saved count when an event from another tab has not arrived", () => {
    const { result } = renderHook(() => usePersonality(args));
    localStorage.setItem(keyFor(), saved);
    act(() => { result.current.onInteract("explore"); });
    expect(result.current.profile.exploreCount).toBe(4);
  });

  it("renders the same default server snapshot without reading browser storage", () => {
    localStorage.setItem(keyFor(), saved);
    const read = vi.spyOn(Storage.prototype, "getItem");
    function ServerProbe() {
      const { profile, storageStatus } = usePersonality(args);
      return <span>{profile.style}:{storageStatus}</span>;
    }
    expect(renderToString(<ServerProbe />)).toBe("<span>playful<!-- -->:<!-- -->unavailable</span>");
    expect(read).not.toHaveBeenCalled();
  });
});
