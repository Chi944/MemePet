"use client";

import { useId } from "react";
import type { WalletChooserProps } from "@/types/beta";
import styles from "./wallet-picker.module.css";

/** Minimal live picker; the B1 onboarding component can replace this presentation. */
export function WalletProviderPicker({ choices, selectedId, busy, onSelect }: WalletChooserProps) {
  const id = useId();
  if (choices.length === 0) return null;

  return (
    <fieldset className={styles.picker} disabled={busy} aria-describedby={`${id}-hint`}>
      <legend>Wallet app</legend>
      <div className={styles.options}>
        {choices.map((choice) => (
          <label key={choice.id} className={styles.option}>
            <input
              type="radio"
              name={`${id}-wallet`}
              value={choice.id}
              checked={selectedId === choice.id}
              onChange={() => onSelect(choice.id)}
            />
            <span>{choice.label}</span>
          </label>
        ))}
      </div>
      <p id={`${id}-hint`}>
        {busy
          ? "Finish the current wallet request before changing wallets."
          : selectedId
            ? "Changing wallet apps clears this page's connection. Connect again with your chosen wallet."
            : "Choose the wallet app you want to connect."}
      </p>
    </fieldset>
  );
}
