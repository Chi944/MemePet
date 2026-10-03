"use client";
import { useId } from "react";
import type { TransactionRecoveryPanelProps, TransactionRecoveryState } from "@/types/beta";
import { Badge, DataModeBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./TransactionRecoveryPanel.module.css";

type Tracking = Extract<TransactionRecoveryState, { kind: "tracking" }>;
type Phase = Tracking["phase"];

const ACTION_LABEL: Record<Tracking["action"], string> = {
  adopt: "Adoption",
  care: "Daily care",
};

/**
 * Plain-language outcome per phase. Only "confirmed" and "reverted" are final
 * chain outcomes; replacement, pending and unknown never claim success or failure.
 */
const PHASE_COPY: Record<Phase, { title: string; body: string; tone: "live" | "unknown" | "neutral" }> = {
  checking: {
    title: "Checking transaction status…",
    body: "Reading the network for this transaction. Nothing is sent and no wallet prompt opens.",
    tone: "unknown",
  },
  pending: {
    title: "Waiting for confirmation",
    body: "This transaction was sent but is not confirmed yet. Progress appears only after the network confirms it.",
    tone: "unknown",
  },
  "confirmation-unknown": {
    title: "Confirmation not known yet",
    body: "The network could not tell us this transaction's status right now. This is not a failure; it may still confirm.",
    tone: "unknown",
  },
  "confirmed-awaiting-facts": {
    title: "Confirmed — pet details not read yet",
    body: "The network confirmed this transaction, but your pet details could not be read yet. Updated pet progress is not shown until they are. Community progress is read separately.",
    tone: "unknown",
  },
  confirmed: {
    title: "Confirmed",
    body: "The network confirmed this transaction and your updated pet details were read back.",
    tone: "live",
  },
  reverted: {
    title: "Transaction reverted",
    body: "The network included this transaction but it reverted. No progress was awarded for it.",
    tone: "neutral",
  },
  cancelled: {
    title: "Transaction cancelled",
    body: "Your wallet cancelled this transaction before it was carried out. No progress was awarded for it.",
    tone: "neutral",
  },
  replaced: {
    title: "Transaction replaced",
    body: "Your wallet replaced this transaction with another one. A replacement is not a confirmation; its status is checked separately.",
    tone: "unknown",
  },
};

const STATUS_LABEL: Record<Phase, string> = {
  checking: "Checking",
  pending: "Pending",
  "confirmation-unknown": "Unknown",
  "confirmed-awaiting-facts": "Confirmed",
  confirmed: "Confirmed",
  reverted: "Reverted",
  cancelled: "Cancelled",
  replaced: "Replaced",
};

/** Phases whose outcome is settled on chain. They need no further status read. */
const SETTLED: ReadonlySet<Phase> = new Set<Phase>(["confirmed", "reverted", "cancelled"]);

/** Only an https URL becomes a link; anything else is shown as plain hash text. */
function safeHttpsUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

function TransactionHash({ label, hash, explorerUrl }: { label: string; hash: string; explorerUrl: string | null }) {
  const href = safeHttpsUrl(explorerUrl);
  return (
    <div className={styles.hashRow}>
      <dt>{label}</dt>
      <dd>
        <code className={styles.hash}>{hash}</code>
        {href ? (
          <a className={styles.explorer} href={href} target="_blank" rel="noreferrer">
            View on explorer <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </dd>
    </div>
  );
}

/**
 * Display-only recovery of an already-submitted transaction. Its single
 * operation reads the existing hash. It never signs, resubmits, dismisses as
 * failure, stores anything or invents a receipt.
 */
export function TransactionRecoveryPanel({ state, onCheckStatus }: TransactionRecoveryPanelProps) {
  const titleId = useId();

  if (state.kind === "idle") {
    return (
      <Card className={styles.panel} aria-labelledby={titleId}>
        <h2 id={titleId} className={styles.title}>Transaction status</h2>
        <p className={styles.body}>No transaction is waiting for confirmation.</p>
      </Card>
    );
  }

  const copy = PHASE_COPY[state.phase];
  const checking = state.phase === "checking";
  const canCheck = !SETTLED.has(state.phase);

  return (
    <Card className={styles.panel} aria-labelledby={titleId} aria-busy={checking}>
      <header className={styles.head}>
        <p className={styles.kicker}>{ACTION_LABEL[state.action]} transaction</p>
        <DataModeBadge mode={state.dataMode} />
      </header>

      <div className={styles.status} role="status" aria-live="polite">
        <h2 id={titleId} className={styles.title}>{copy.title}</h2>
        <Badge tone={copy.tone}>{STATUS_LABEL[state.phase]}</Badge>
        <p className={styles.body}>{copy.body}</p>
      </div>

      <dl className={styles.facts}>
        <div className={styles.hashRow}>
          <dt>Network</dt>
          <dd>{state.networkLabel}</dd>
        </div>
        <TransactionHash label="Transaction" hash={state.transactionHash} explorerUrl={state.explorerUrl} />
        {state.phase === "replaced" ? (
          <TransactionHash
            label="Replacement transaction"
            hash={state.replacementHash}
            explorerUrl={state.replacementExplorerUrl}
          />
        ) : null}
      </dl>

      {canCheck ? (
        <div className={styles.actions}>
          <Button
            tone="secondary"
            // aria-disabled keeps keyboard focus on the button while a read runs.
            aria-disabled={checking}
            onClick={() => {
              if (!checking) onCheckStatus();
            }}
          >
            {checking ? "Checking…" : "Check status"}
          </Button>
          <p className={styles.note}>
            Checking only reads this transaction. It never sends it again or opens your wallet.
          </p>
        </div>
      ) : (
        <p className={styles.note}>MemePet never resubmits a transaction for you.</p>
      )}
    </Card>
  );
}
