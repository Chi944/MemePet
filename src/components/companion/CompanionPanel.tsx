"use client";
import type {
  CompanionFactsState,
  CompanionPanelProps,
  CompanionQuestion,
  CompanionReplyState,
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

  // ready
  const s = facts.snapshot;
  const communityDisplay =
    s.communityTotalCares === null ? (
      <>
        Unknown <span className={styles.note}>(not zero)</span>
      </>
    ) : (
      <>{s.communityTotalCares}</>
    );

  return (
    <Card surface="plain" className={styles.factsCard}>
      {modeBadge}
      <h2 className={styles.sectionTitle}>MemePet activity</h2>
      <dl className={styles.factsList}>
        <div className={styles.factRow}>
          <dt>Network</dt>
          <dd>Chain {s.chainId}</dd>
        </div>
        <div className={styles.factRow}>
          <dt>Wallet</dt>
          <dd className={styles.address} title={s.walletAddress}>
            {displayAddress(s.walletAddress)}
          </dd>
        </div>
        <div className={styles.factRow}>
          <dt>Registry</dt>
          <dd className={styles.address} title={s.registryAddress}>
            {displayAddress(s.registryAddress)}
          </dd>
        </div>
        <div className={styles.factRow}>
          <dt>Read block</dt>
          <dd>{s.blockNumber}</dd>
        </div>
        <div className={styles.factRow}>
          <dt>Block time</dt>
          <dd>{s.blockTimestampIso}</dd>
        </div>
        <div className={styles.factRow}>
          <dt>Observed at</dt>
          <dd>{s.observedAtIso}</dd>
        </div>
        <div className={styles.factRow}>
          <dt>Care actions</dt>
          <dd>{s.careCount}</dd>
        </div>
        <div className={styles.factRow}>
          <dt>Growth points</dt>
          <dd>{s.growthPoints}</dd>
        </div>
        <div className={styles.factRow}>
          <dt>Stage</dt>
          <dd className={styles.capitalize}>{s.stage}</dd>
        </div>
        <div className={styles.factRow}>
          <dt>Next stage at</dt>
          <dd>
            {s.nextStageAt === null
              ? "Final stage reached"
              : `${s.nextStageAt} points`}
          </dd>
        </div>
        <div className={styles.factRow}>
          <dt>Next care time</dt>
          <dd>{s.nextCareAtIso}</dd>
        </div>
        <div className={styles.factRow}>
          <dt>Community total</dt>
          <dd>{communityDisplay}</dd>
        </div>
      </dl>
    </Card>
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

  return (
    <div className={styles.panel}>
      <FactsSection facts={facts} onRetry={onRetry} />

      {isReady && (
        <>
          <p className={styles.personalityNote}>
            Mochi&apos;s style:{" "}
            <span className={styles.capitalize}>{personality.style}</span>
          </p>
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
        </>
      )}

      <ReplySection reply={showReply ? reply : { kind: "idle" }} onRetry={onRetry} />
    </div>
  );
}
