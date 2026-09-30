"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "memepet.mochi-motion.v1";
const CHANGE_EVENT = "memepet:mochi-motion";
// Retain a usable choice for this page if browser storage is blocked or full.
let memoryChoice: boolean | undefined;

function getSnapshot(): boolean {
  if (memoryChoice !== undefined) return memoryChoice;
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    try {
      if (event.storageArea && event.storageArea !== window.localStorage) return;
    } catch {
      return;
    }
    memoryChoice = undefined;
    listener();
  };
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

function setEnabled(enabled: boolean) {
  memoryChoice = enabled;
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    memoryChoice = undefined;
  } catch {
    // A denied write must not make the visible control stop working.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** A cosmetic browser preference, independent of wallets and earned progress. */
export function useMochiMotion() {
  // Keep server-rendered art still until a saved browser opt-out is known.
  const enabled = useSyncExternalStore(subscribe, getSnapshot, () => false);
  return { enabled, setEnabled };
}
