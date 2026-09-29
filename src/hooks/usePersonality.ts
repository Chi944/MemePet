"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  defaultPersonality,
  parsePersonality,
  recordPersonalityInteraction,
} from "@/lib/companion/personality";
import type { PersonalityInteraction, PersonalityProfile } from "@/types/companion";

type UsePersonalityArgs = {
  readonly chainId: number | null;
  readonly registryAddress: string | null;
  readonly address: string | null;
  readonly enabled?: boolean;
};

type PersonalityState = {
  readonly profile: PersonalityProfile;
  readonly storageStatus: "available" | "unavailable";
};

const INITIAL_STATE: PersonalityState = {
  profile: defaultPersonality(),
  storageStatus: "unavailable",
};
const getServerSnapshot = () => INITIAL_STATE;
const ADDRESS_PATTERN = /^0x[0-9a-fA-F]{40}$/;

function storageKey({ chainId, registryAddress, address, enabled = true }: UsePersonalityArgs) {
  if (
    !enabled || chainId === null || !Number.isSafeInteger(chainId) || chainId <= 0 ||
    !registryAddress || !ADDRESS_PATTERN.test(registryAddress) ||
    !address || !ADDRESS_PATTERN.test(address)
  ) return null;
  return `memepet:personality:v1:${chainId}:${registryAddress.toLowerCase()}:${address.toLowerCase()}`;
}

/** One mounted wallet context. Storage is never read or written during render. */
function createPersonalityStore(key: string | null) {
  let snapshot = INITIAL_STATE;
  const listeners = new Set<() => void>();

  function publish(profile: PersonalityProfile, storageStatus: PersonalityState["storageStatus"]) {
    if (
      snapshot.storageStatus === storageStatus &&
      snapshot.profile.exploreCount === profile.exploreCount &&
      snapshot.profile.practiseCount === profile.practiseCount &&
      snapshot.profile.style === profile.style
    ) return;
    snapshot = { profile, storageStatus };
    listeners.forEach((listener) => listener());
  }

  function load() {
    if (key === null) return;
    try {
      publish(parsePersonality(window.localStorage.getItem(key)), "available");
    } catch {
      publish(snapshot.profile, "unavailable");
    }
  }

  function onStorage(event: StorageEvent) {
    if (key === null || (event.key !== null && event.key !== key)) return;
    try {
      // Ignore sessionStorage events. A null storageArea is allowed for hosts
      // which omit it; the actual localStorage value is still read below.
      if (event.storageArea !== null && event.storageArea !== window.localStorage) return;
    } catch {
      publish(snapshot.profile, "unavailable");
      return;
    }
    load();
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    if (listeners.size === 1 && key !== null) {
      window.addEventListener("storage", onStorage);
      load();
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  }

  function onInteract(interaction: PersonalityInteraction) {
    // A callback retained by an old account, network or unmounted component
    // cannot write. Returning to the same wallet creates a fresh store lifetime.
    if (key === null || listeners.size === 0 || (interaction !== "explore" && interaction !== "practise")) return;
    let storedProfile = snapshot.profile;
    try {
      const storage = window.localStorage;
      // Re-read before changing the count to include another tab's latest save.
      storedProfile = parsePersonality(storage.getItem(key));
      const next = recordPersonalityInteraction(storedProfile, interaction);
      storage.setItem(key, JSON.stringify(next));
      publish(next, "available");
    } catch {
      // A failed save must not appear to be a persisted interaction.
      publish(storedProfile, "unavailable");
    }
  }

  function onReset() {
    if (key === null || listeners.size === 0) return;
    try {
      window.localStorage.removeItem(key);
      publish(defaultPersonality(), "available");
    } catch {
      publish(snapshot.profile, "unavailable");
    }
  }

  return { subscribe, getSnapshot: () => snapshot, onInteract, onReset };
}

/** Browser-local explanation preferences, never chain progress or a wallet write. */
export function usePersonality(args: UsePersonalityArgs) {
  const key = storageKey(args);
  const store = useMemo(() => createPersonalityStore(key), [key]);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot);
  return { ...state, onInteract: store.onInteract, onReset: store.onReset };
}
