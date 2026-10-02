"use client";

import { useId } from "react";
import type { MilestoneState, ProgressionPanelProps } from "@/types/beta";
import { DataModeBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./progression.module.css";

function Milestones({ state, title, community = false }: { readonly state: MilestoneState; readonly title: string; readonly community?: boolean }) {
  const id = useId();
  return (
    <Card className={styles.group} aria-labelledby={`${id}-title`}>
      <div className={styles.header}><h3 id={`${id}-title`}>{title}</h3><DataModeBadge mode={state.dataMode} isKnown={state.kind === "ready"} /></div>
      {state.kind === "loading" ? <p role="status">Reading confirmed {community ? "community" : "personal"} care totals…</p>
        : state.kind === "unavailable" ? <p role="status">{community ? "Community" : "Personal"} care total unavailable. Milestones cannot be confirmed from an unknown total.</p>
          : <>
            <p className={styles.total}><strong>{state.confirmedCareCount}</strong> {community ? "community" : "personal"} confirmed cares</p>
            <p className={styles.note}>Lifetime total{community ? " across all pets" : " for this pet"}. Reaching a milestone never resets it.</p>
            <ol className={styles.milestones} aria-label={title}>
              {state.milestones.map((milestone) => (
                <li key={milestone.id} className={styles.milestone} data-reached={milestone.reached}>
                  <svg className={styles.emblem} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                    <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="2" />
                    {community ? <path d="M24 35V23m0 5C12 29 12 17 12 17s13-1 12 11Zm0-5c12 1 12-11 12-11S23 11 24 23Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                      : <path d="m24 11 4 8 9 1-7 7 2 10-8-5-8 5 2-10-7-7 9-1Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />}
                  </svg>
                  <div><h4>{milestone.label}</h4><p>{milestone.target} confirmed cares</p><span className={styles.state}>{milestone.reached ? "Earned" : "Not yet earned"}</span></div>
                </li>
              ))}
            </ol>
            <p className={styles.next}>{state.nextTarget === null
              ? `All defined ${community ? "garden chapters" : "personal milestones"} reached.`
              : `Next ${community ? "chapter" : "milestone"} at ${state.nextTarget} lifetime confirmed cares.`}</p>
          </>}
    </Card>
  );
}

export function ProgressionPanel({ personal, community, onRetry }: ProgressionPanelProps) {
  const id = useId();
  return (
    <section className={styles.panel} aria-labelledby={`${id}-title`}>
      <p className={styles.eyebrow}>A little care adds up</p>
      <h2 id={`${id}-title`}>Keep growing together</h2>
      <p className={styles.intro}>Collect cosmetic milestones through confirmed care. Guardian remains the final pet form.</p>
      <div className={styles.grid}>
        <Milestones state={personal} title="Personal milestones" />
        <Milestones state={community} title="Garden chapters" community />
      </div>
      {(personal.kind === "unavailable" || community.kind === "unavailable") && <Button className={styles.retry} tone="secondary" onClick={() => onRetry()}>Retry progression reads</Button>}
      <p className={styles.note}>Cosmetic recognition only: no money, tokens or extra growth points. No streak or missed-day loss. Earlier confirmed cares keep counting.</p>
    </section>
  );
}
