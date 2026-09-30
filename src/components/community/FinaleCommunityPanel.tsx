import type { CSSProperties, ReactNode } from "react";
import type {
  CommunityIdentityState,
  FinaleCommunityPanelProps,
} from "@/types/finale-community";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataModeBadge } from "@/components/ui/Badge";
import styles from "./finale-community.module.css";

const PLANT_COUNT = 7;

/** Only http(s) sources become links; anything else renders as plain text. */
function safeSourceUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

function formatCheckedAt(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

function IdentityReference({ identity }: { identity: CommunityIdentityState }) {
  if (identity.kind === "unconfigured") {
    return (
      <section className={styles.reference} aria-labelledby="community-reference">
        <h3 id="community-reference">Community reference</h3>
        <p className={styles.note}>
          No community reference is configured. MemePet shows none rather than
          guessing one.
        </p>
      </section>
    );
  }

  const source = safeSourceUrl(identity.sourceUrl);
  const checked = formatCheckedAt(identity.checkedAtIso);

  return (
    <section className={styles.reference} aria-labelledby="community-reference">
      <div className={styles.referenceHead}>
        <h3 id="community-reference">Community reference</h3>
        <DataModeBadge mode={identity.dataMode} />
      </div>
      <dl className={styles.facts}>
        <div>
          <dt>Reference</dt>
          <dd>{identity.name}</dd>
        </div>
        <div>
          <dt>Reference network</dt>
          <dd>
            {identity.networkLabel} (chain {identity.chainId})
          </dd>
        </div>
        <div>
          <dt>Token address</dt>
          <dd>
            <code className={styles.address}>{identity.tokenAddress}</code>
          </dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>
            {source ? (
              <a href={source.href} target="_blank" rel="noopener noreferrer">
                {source.hostname}
                <span className={styles.srOnly}> (opens in a new tab)</span>
              </a>
            ) : (
              "Source link unavailable"
            )}
          </dd>
        </div>
        <div>
          <dt>Checked</dt>
          <dd>
            {checked ? (
              <time dateTime={identity.checkedAtIso}>{checked}</time>
            ) : (
              "Check time unavailable"
            )}
          </dd>
        </div>
      </dl>
      <p className={styles.disclaimer}>
        A reference only — not a partnership, endorsement, balance or reward.
        Caring for Mochi does not buy, hold or earn this token. MemePet records
        care on its own network, which can differ from the reference network
        above.
      </p>
    </section>
  );
}

export function FinaleCommunityPanel({
  community,
  mission,
  identity,
  onRetry,
}: FinaleCommunityPanelProps) {
  const ready = mission.kind === "ready" ? mission : null;
  const total = ready ? ready.totalCareActions : null;
  // The bloom is decided by the supplied flag, never by comparing the total
  // here: the completion rule belongs to the data layer, not the view.
  const bloomed = ready ? ready.isComplete : false;

  let body: ReactNode;

  if (mission.kind === "loading") {
    body = (
      <>
        <p className={styles.stateLabel}>Reading confirmed care actions…</p>
        <div className={styles.trackPending} aria-hidden="true" />
      </>
    );
  } else if (mission.kind === "unavailable") {
    body = (
      <>
        <p className={styles.error}>{mission.message}</p>
        <div className={styles.trackUnknown} aria-hidden="true" />
        <p className={styles.note}>
          No total is shown in its place, and the garden is not drawn as
          blooming.
        </p>
        <div className={styles.retry}>
          <Button tone="secondary" onClick={onRetry}>
            Retry reading
          </Button>
          <p className={styles.note}>Retrying only reads again. It sends no transaction.</p>
        </div>
      </>
    );
  } else {
    const count = total as number;
    const target = mission.target;
    const percentage = Math.min(100, Math.max(0, (count / target) * 100));
    const progressStyle = { "--garden-progress": `${percentage}%` } as CSSProperties;
    const remaining = Math.max(0, target - count);
    const gardenState = bloomed ? "bloomed" : count === 0 ? "bare" : "sprouting";
    const gardenLabel = bloomed
      ? "The Mochi garden in full bloom"
      : count === 0
        ? "The Mochi garden: bare soil, waiting for the first confirmed care"
        : "The Mochi garden: sprouting";

    let status: string;
    if (bloomed) {
      status = "The garden is in bloom.";
    } else if (remaining > 0) {
      status = `${remaining} more confirmed care ${remaining === 1 ? "action" : "actions"} until it blooms.`;
    } else {
      status = "Bloom is not confirmed yet.";
    }

    body = (
      <>
        <div
          className={`${styles.garden} ${styles[gardenState]}`}
          role="img"
          aria-label={gardenLabel}
        >
          {Array.from({ length: PLANT_COUNT }, (_, index) => (
            <span key={index} className={styles.plant} />
          ))}
        </div>
        <p className={styles.total}>
          <strong>{count}</strong> confirmed care {count === 1 ? "action" : "actions"}
        </p>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label="Mochi garden progress"
          aria-valuemin={0}
          aria-valuemax={target}
          aria-valuenow={Math.min(count, target)}
          aria-valuetext={`${count} of ${target} confirmed care actions${bloomed ? ", garden in bloom" : ""}`}
        >
          <span className={styles.progressFill} style={progressStyle} />
        </div>
        <p className={styles.status}>{status}</p>
      </>
    );
  }

  return (
    <Card className={styles.panel} aria-labelledby="mochi-garden">
      <header className={styles.head}>
        <p className={styles.kicker}>Shared mission</p>
        <DataModeBadge mode={mission.dataMode} isKnown={ready !== null} />
      </header>

      <section
        className={styles.mission}
        aria-live="polite"
        aria-busy={mission.kind === "loading"}
      >
        <h2 id="mochi-garden">{mission.title}</h2>
        <p className={styles.rule}>
          Blooms at {mission.target} confirmed care actions across{" "}
          {community.name}. Every confirmed care counts, including ones made
          before the garden existed. It is a goal inside this app — no token,
          reward or on-chain change.
        </p>
        {body}
      </section>

      <IdentityReference identity={identity} />
    </Card>
  );
}
