"use client";

import { useId, useState } from "react";
import type { HelpEntry, TransactionRecoveryState } from "@/types/beta";
import { HelpPanel } from "@/components/help/HelpPanel";
import { TransactionRecoveryPanel } from "@/components/recovery/TransactionRecoveryPanel";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { recoveryFixtures } from "@/fixtures/beta-fixtures";
import styles from "./beta.module.css";

type RecoveryKey = keyof typeof recoveryFixtures;
type HelpKey = "examples" | "empty";
type Action = "adopt" | "care";

const recoveryLabels: Record<RecoveryKey, string> = {
  idle: "Idle — no tracked request",
  checking: "Checking status",
  pending: "Pending confirmation",
  unknown: "Confirmation unknown",
  waitingFacts: "Confirmed, awaiting facts",
  confirmed: "Confirmed with facts",
  reverted: "Reverted",
  cancelled: "Cancelled",
  replaced: "Replaced",
};
const recoveryKeys = Object.keys(recoveryLabels) as RecoveryKey[];

/** Fictional presentation samples only. These are not the published FAQ. */
const helpExamples: readonly HelpEntry[] = [
  {
    id: "fictional-status",
    question: "Fictional sample: what does checking status do?",
    answer: "In this workbench, Check status only increments the preview callback counter. It does not read a network or open a wallet.\n\nSelect another fictional state to inspect its wording. No transaction exists here.",
  },
  {
    id: "fictional-progress",
    question: "Fictional sample: does changing a preview award progress?",
    answer: "No. These controls switch display examples only. They do not create a pet, change a cooldown, award growth or demonstrate a confirmed transaction.",
  },
];

/** Development-only inspection; no data hooks, network, wallet or storage I/O. */
export function BetaWorkbench() {
  const id = useId();
  const [recoveryKey, setRecoveryKey] = useState<RecoveryKey>("pending");
  const [action, setAction] = useState<Action>("care");
  const [helpKey, setHelpKey] = useState<HelpKey>("examples");
  const [checkCount, setCheckCount] = useState(0);
  const [resetVersion, setResetVersion] = useState(0);
  const fixture = recoveryFixtures[recoveryKey];
  const recovery: TransactionRecoveryState = fixture.kind === "tracking"
    ? { ...fixture, action }
    : fixture;

  function resetPreview() {
    setRecoveryKey("pending");
    setAction("care");
    setHelpKey("examples");
    setCheckCount(0);
    setResetVersion((value) => value + 1);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>UI preview — fictional data</p>
        <h1>Beta UI workbench</h1>
        <p>
          Inspect recovery and help components with fictional inputs. These
          examples do not enable transaction recovery in the live app or prove
          a wallet action. No network, wallet or storage actions run here.
        </p>
      </header>

      <Card className={styles.controls} aria-labelledby={`${id}-controls`}>
        <h2 id={`${id}-controls`}>Preview controls</h2>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label htmlFor={`${id}-recovery`}>Recovery preview state</label>
            <select id={`${id}-recovery`} value={recoveryKey} onChange={(event) => setRecoveryKey(event.target.value as RecoveryKey)}>
              {recoveryKeys.map((key) => <option key={key} value={key}>{recoveryLabels[key]}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor={`${id}-action`}>Fictional transaction action</label>
            <select id={`${id}-action`} value={action} onChange={(event) => setAction(event.target.value as Action)}>
              <option value="care">Daily care</option>
              <option value="adopt">Adoption</option>
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor={`${id}-help`}>Help preview content</label>
            <select id={`${id}-help`} value={helpKey} onChange={(event) => setHelpKey(event.target.value as HelpKey)}>
              <option value="examples">Fictional FAQ examples</option>
              <option value="empty">No help entries</option>
            </select>
          </div>
        </div>
        <p id={`${id}-callback-note`} className={styles.note}>
          Check status increments this counter only. It does not fetch or
          confirm anything. Support stays unavailable in every preview.
        </p>
        <div className={styles.actions}>
          <p className={styles.counter}>
            <label htmlFor={`${id}-counter`}>Check status callbacks: </label>
            <output id={`${id}-counter`} aria-describedby={`${id}-callback-note`} aria-live="polite">{checkCount}</output>
          </p>
          <Button tone="secondary" onClick={resetPreview}>Reset preview</Button>
        </div>
      </Card>

      <div className={styles.panels}>
        <div className={styles.preview}>
          <p className={styles.previewLabel}>Fictional recovery example</p>
          <TransactionRecoveryPanel state={recovery} onCheckStatus={() => setCheckCount((count) => count + 1)} />
        </div>
        <div className={styles.preview}>
          <p className={styles.previewLabel}>Fictional help example</p>
          <HelpPanel key={resetVersion} entries={helpKey === "examples" ? helpExamples : []} supportUrl={null} />
        </div>
      </div>
    </main>
  );
}
