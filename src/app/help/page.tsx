import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { HelpPanel } from "@/components/help/HelpPanel";
import { HELP_ENTRIES, SUPPORT_URL } from "@/content/help";
import styles from "./help.module.css";

export const metadata: Metadata = {
  title: "Help",
  description: "Wallet setup, daily care, confirmed progress and read recovery for MemePet on X Layer testnet.",
};

/** Public guidance needs no connected wallet and performs no chain reads. */
export default function HelpPage() {
  return (
    <AppShell>
      <div className={styles.content}>
        <header className={styles.intro}>
          <p className="eyebrow">A little help for your daily care</p>
          <h1>Mochi, made simple.</h1>
          <p className="lede">
            Set up your wallet, understand your pet’s progress, or find your next
            step when a read takes longer than expected.
          </p>
          <p className={styles.note}>No wallet connection is needed to read this page.</p>
          <Link className="link-button" href="/pet">Go to your pet</Link>
        </header>
        <HelpPanel entries={HELP_ENTRIES} supportUrl={SUPPORT_URL} />
      </div>
    </AppShell>
  );
}
