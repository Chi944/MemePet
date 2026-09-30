import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useMochiMotion } from "./useMochiMotion";

const storageKey = "memepet.mochi-motion.v1";

function resetPreference() {
  localStorage.clear();
  window.dispatchEvent(new StorageEvent("storage", { key: storageKey }));
}

describe("Mochi motion preference", () => {
  beforeEach(resetPreference);
  afterEach(() => { vi.restoreAllMocks(); resetPreference(); });

  it("defaults on and shares the saved off choice across mounted artwork and remounts", () => {
    const first = renderHook(useMochiMotion);
    const second = renderHook(useMochiMotion);
    expect(first.result.current.enabled).toBe(true);

    act(() => { first.result.current.setEnabled(false); });
    expect(second.result.current.enabled).toBe(false);
    expect(localStorage.getItem(storageKey)).toBe("off");
    first.unmount();
    expect(renderHook(useMochiMotion).result.current.enabled).toBe(false);
    act(() => { second.result.current.setEnabled(true); });
    expect(second.result.current.enabled).toBe(true);
  });

  it("accepts another tab's saved choice and returns to the default when cleared", () => {
    const { result } = renderHook(useMochiMotion);
    act(() => {
      localStorage.setItem(storageKey, "off");
      window.dispatchEvent(new StorageEvent("storage", { key: storageKey, newValue: "off" }));
    });
    expect(result.current.enabled).toBe(false);
    act(resetPreference);
    expect(result.current.enabled).toBe(true);
  });

  it("keeps server artwork still until the browser preference is available", () => {
    function ServerProbe() {
      const { enabled } = useMochiMotion();
      return <span data-motion={enabled ? "on" : "off"} />;
    }
    expect(renderToString(<ServerProbe />)).toContain('data-motion="off"');
    localStorage.setItem(storageKey, "off");
    expect(renderHook(useMochiMotion).result.current.enabled).toBe(false);
  });

  it("keeps on/off usable when storage writes fail even if an older value remains readable", () => {
    localStorage.setItem(storageKey, "on");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    const { result } = renderHook(useMochiMotion);
    act(() => { result.current.setEnabled(false); });
    expect(result.current.enabled).toBe(false);
    expect(localStorage.getItem(storageKey)).toBe("on");
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: storageKey, storageArea: sessionStorage }));
    });
    expect(result.current.enabled).toBe(false);
    act(() => { result.current.setEnabled(true); });
    expect(result.current.enabled).toBe(true);
  });

  it("defaults on and remains switchable when storage reads and writes are denied", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage blocked"); });
    const { result } = renderHook(useMochiMotion);
    expect(result.current.enabled).toBe(true);
    act(() => { result.current.setEnabled(false); });
    expect(result.current.enabled).toBe(false);
  });
});
