"use client";
import type { ReactNode } from "react";
import type {
  CompanionFactsState,
  CompanionPanelProps,
  CompanionQuestion,
  CompanionReplyState,
  CompanionSnapshot,
} from "@/types/companion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./CompanionPanel.module.css";

function displayAddress(addr: string): string {
  if (/^0x[0-9a-fA-F]{12,}$/.test(addr)) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }
  return addr;
}

/**
 * Reformats a supplied UTC ISO timestamp for reading. Pure string formatting:
 * it never compares against the browser clock, so it cannot imply "ready now".
 * Anything that is not a plain UTC ISO string is shown exactly as supplied.
 */
function readableUtc(iso: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?Z$/.exec(iso);
  return match ? `${match[1]} ${match[2]} UTC` : iso;
}

function FactsSection({
  facts,
  onRetry,
}: {
  facts: CompanionFactsState;
  onRetry: () => void;
}) {
  const modeBadge =
    facts.dataMode === "fixture" ? (
      <span className={styles.badge}>Fixture</span>
    ) : null;

  if (facts.kind === "needs-wallet") {
    return (
      <Card surface="plain" className={styles.factsCard}>
        {modeBadge}
        <p>Connect a wallet to read MemePet activity.</p>
      </Card>
    );
  }
  if (facts.kind === "wrong-network") {
    return (
      <Card surface="plain" className={styles.factsCard}>
        {modeBadge}
        <p>Switch to chain {facts.expectedChainId} to read MemePet activity.</p>
      </Card>
    );
  }
  if (facts.kind === "loading") {
    return (
      <Card surface="plain" className={styles.factsCard} aria-busy="true">
        <p>Loading MemePet activity…</p>
      </Card>
    );
  }
  if (facts.kind === "no-pet") {
    return (
      <Card surface="plain" className={styles.factsCard}>
        {modeBadge}
        <p>No pet found in this wallet at the checked registry.</p>
      </Card>
    );
  }
  if (facts.kind === "unavailable") {
    return (
      <Card surface="plain" className={styles.factsCard}>
        {modeBadge}
        <p role="alert">{facts.message}</p>
        <Button tone="quiet" onClick={onRetry}>
          Retry read
        </Button>
      </Card>
    );
  }

  // ready: the concise recap. Full source evidence lives in EvidenceDisclosure.
  const s = facts.snapshot;
  return (
    <Card surface="plain" className={styles.factsCard}>
      <h2 className={styles.sectionTitle}>
        Where is my pet now?
      </h2>
      <p className={styles.context}>
        {modeBadge ?? <span className={styles.liveLabel}>Live read</span>}
        <span className={styles.address} title={s.walletAddress}>
          {displayAddress(s.walletAddress)}
        </span>
        <span>Chain {s.chainId}</span>
        <span>MemePet activity only</span>
        <span>Confirmed at block {s.blockNumber}</span>
      </p>
      <dl className={styles.recap}>
        <div className={styles.recapItem}>
          <dt>Stage</dt>
          <dd className={styles.capitalize}>{s.stage}</dd>
        </div>
        <div className={styles.recapItem}>
          <dt>Growth</dt>
          <dd>
            {s.growthPoints} points
            <span className={styles.recapNote}>
              {s.nextStageAt === null
                ? "Final stage reached"
                : `Next stage at ${s.nextStageAt} points`}
            </span>
          </dd>
        </div>
        <div className={styles.recapItem}>
          <dt>Your confirmed cares</dt>
          <dd>{s.careCount}</dd>
        </div>
        <div className={styles.recapItem}>
          <dt>Next eligible care</dt>
          <dd>{readableUtc(s.nextCareAtIso)}</dd>
        </div>
      </dl>
    </Card>
  );
}

function EvidenceRow({
  label,
  children,
  address = false,
}: {
  label: string;
  children: ReactNode;
  address?: boolean;
}) {
  return (
    <div className={styles.factRow}>
      <dt>{label}</dt>
      <dd className={address ? styles.address : undefined}>{children}</dd>
    </div>
  );
}

/** Native disclosure: keyboard and screen-reader behaviour come from the browser. */
function EvidenceDisclosure({ snapshot: s }: { snapshot: CompanionSnapshot }) {
  return (
    <details className={styles.evidence}>
      <summary className={styles.evidenceSummary}>View verified evidence</summary>
      <div className={styles.evidenceBody}>
        <p className={styles.note}>
          One confirmed registry read. MemePet activity only — not full wallet history.
        </p>
        <dl className={styles.factsList} aria-label="Your pet at this read">
          <EvidenceRow label="Network">Chain {s.chainId}</EvidenceRow>
          <EvidenceRow label="Wallet" address>{s.walletAddress}</EvidenceRow>
          <EvidenceRow label="Registry" address>{s.registryAddress}</EvidenceRow>
          <EvidenceRow label="Read block">{s.blockNumber}</EvidenceRow>
          <EvidenceRow label="Block time">{s.blockTimestampIso}</EvidenceRow>
          <EvidenceRow label="Observed at">{s.observedAtIso}</EvidenceRow>
          <EvidenceRow label="Your care actions">{s.careCount}</EvidenceRow>
          <EvidenceRow label="Growth points">{s.growthPoints}</EvidenceRow>
          <EvidenceRow label="Stage">
            <span className={styles.capitalize}>{s.stage}</span>
          </EvidenceRow>
          <EvidenceRow label="Next stage at">
            {s.nextStageAt === null ? "Final stage reached" : `${s.nextStageAt} points`}
          </EvidenceRow>
          <EvidenceRow label="Next care time">{s.nextCareAtIso}</EvidenceRow>
        </dl>
        <h3 className={styles.subTitle}>Shared community</h3>
        <dl className={styles.factsList} aria-label="Shared community">
          <EvidenceRow label="Community total (all pets)">
            {s.communityTotalCares === null ? "Unknown" : s.communityTotalCares}
          </EvidenceRow>
        </dl>
      </div>
    </details>
  );
}

const QUESTIONS: ReadonlyArray<{ id: CompanionQuestion; label: string }> = [
  { id: "progress", label: "Explain progress" },
  { id: "next-care", label: "Next care time" },
  { id: "contribution", label: "Contribution" },
];

function replyContextKey(reply: CompanionReplyState): string | null {
  if (reply.kind === "loading" || reply.kind === "answer") return reply.contextKey;
  return null;
}

function ReplySection({
  reply,
  onRetry,
}: {
  reply: CompanionReplyState;
  onRetry: () => void;
}) {
  const hasResponse = reply.kind === "loading" || reply.kind === "answer";
  return (
    <>
      {/* Keep this region mounted before an immediate standard answer arrives. */}
      <div
        className={hasResponse ? styles.replyArea : undefined}
        role="region"
        aria-label="Mochi's response"
        aria-live="polite"
        aria-atomic="true"
        aria-busy={reply.kind === "loading"}
      >
        {reply.kind === "loading" && <p>Mochi is thinking…</p>}
        {reply.kind === "answer" && (
          <>
            <span className={reply.source === "ai" ? styles.aiLabel : styles.standardLabel}>
              {reply.source === "ai" ? "AI response" : "Standard explanation"}
            </span>
            <p>{reply.text}</p>
          </>
        )}
      </div>
      {reply.kind === "unavailable" && (
        <div className={styles.replyArea}>
          <p role="alert" className={styles.errorText}>
            {reply.message}
          </p>
          <Button tone="quiet" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </>
  );
}

export function CompanionPanel({
  facts,
  personality,
  reply,
  onAsk,
  onRetry,
}: CompanionPanelProps) {
  const isReady = facts.kind === "ready";
  const snapshotKey = isReady ? facts.snapshot.contextKey : null;

  const isAsking =
    isReady &&
    reply.kind === "loading" &&
    reply.contextKey === facts.snapshot.contextKey;

  // Show reply if: unavailable (separate failure, always visible), or loading/answer
  // with a contextKey matching the current confirmed snapshot.
  const showReply =
    reply.kind === "unavailable" ||
    (snapshotKey !== null &&
      (reply.kind === "loading" || reply.kind === "answer") &&
      replyContextKey(reply) === snapshotKey);

  // Order: recap → questions → answer → evidence, so the answer stays close to
  // the controls and the detailed evidence never pushes them down.
  return (
    <div className={styles.panel}>
      <FactsSection facts={facts} onRetry={onRetry} />

      {isReady && (
        <div className={styles.askBlock}>
          <div className={styles.controls} role="group" aria-label="Ask Mochi">
            {QUESTIONS.map(({ id, label }) => (
              <Button
                key={id}
                tone="secondary"
                disabled={isAsking}
                onClick={() => onAsk(id)}
              >
                {label}
              </Button>
            ))}
          </div>
          <p className={styles.personalityNote}>
            Mochi&apos;s style:{" "}
            <span className={styles.capitalize}>{personality.style}</span>
          </p>
        </div>
      )}

      <ReplySection reply={showReply ? reply : { kind: "idle" }} onRetry={onRetry} />

      {isReady && <EvidenceDisclosure snapshot={facts.snapshot} />}
    </div>
  );
}
