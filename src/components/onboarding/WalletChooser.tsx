"use client";

import { useId } from "react";
import type { WalletChooserProps } from "@/types/beta";
import { Card } from "@/components/ui/Card";
import styles from "./onboarding.module.css";

/** Presentation only: selection is controlled by the discovered provider session. */
export function WalletChooser({ choices, selectedId, busy, onSelect }: WalletChooserProps) {
  const id = useId();
  const selected = choices.find((choice) => choice.id === selectedId);

  return (
    <Card className={styles.panel} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>Choose your wallet</h2>
      <p>Choose the wallet app you want to use for MemePet.</p>
      {choices.length === 0 ? (
        <p role="status">No wallet is available in this browser. Install a wallet or open MemePet inside your mobile wallet’s browser.</p>
      ) : (
        <fieldset className={styles.chooser} disabled={busy} aria-describedby={`${id}-hint`}>
          <legend>Available wallet apps</legend>
          <div className={styles.choices}>
            {choices.map((choice) => (
              <label className={styles.choice} key={choice.id}>
                <input type="radio" name={`${id}-wallet`} value={choice.id}
                  checked={selectedId === choice.id} onChange={() => onSelect(choice.id)} />
                <span>{choice.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <p id={`${id}-hint`} role="status" className={styles.note}>
        {busy ? "Finish the current wallet request before changing wallet apps."
          : selected ? `Selected: ${selected.label}. Changing wallet apps clears this page’s connection; connect again with your chosen wallet.`
            : selectedId ? "The previously selected wallet is unavailable. Choose an available wallet app."
              : "Selecting a wallet does not confirm a connection. Connect when you are ready."}
      </p>
      <p className={styles.note}>Wallet names are reported by installed apps; a name is not proof of authenticity.</p>
    </Card>
  );
}
