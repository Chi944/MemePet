"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Card } from "@/components/ui/Card";
import {
  companionFactsFixtures,
  companionReplyFixtures,
  communityIdentityFixtures,
  communityMissionFixtures,
  personalityFixtures,
} from "@/fixtures/finale-fixtures";
import styles from "./finale.module.css";

function FixtureInspector({
  title,
  description,
  fixtures,
}: {
  readonly title: string;
  readonly description: string;
  readonly fixtures: Readonly<Record<string, unknown>>;
}) {
  const [selected, setSelected] = useState(Object.keys(fixtures)[0]);
  const id = useId();

  return (
    <Card className={styles.inspector} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`}>{title}</h2>
      <p>{description}</p>
      <label htmlFor={`${id}-state`}>{title} fixture</label>
      <select
        id={`${id}-state`}
        value={selected}
        onChange={(event) => setSelected(event.target.value)}
      >
        {Object.keys(fixtures).map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>
      <pre tabIndex={0} aria-label={`${title} fixture data`}>
        {JSON.stringify(fixtures[selected], null, 2)}
      </pre>
    </Card>
  );
}

export function FinaleWorkbench() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>F0 · shared interface reference</p>
        <h1>Finale fixture workbench</h1>
        <p>
          Fictional data for building the pet, community and companion components
          in parallel. Each selector is independent; these panels do not represent
          a combined live session. No wallet, RPC or model requests are made.
        </p>
        <nav aria-label="Related component previews" className={styles.links}>
          <Link href="/dev/pet">Pet preview</Link>
          <Link href="/dev/community">Community preview</Link>
          <Link href="/dev/landing">Landing preview</Link>
        </nav>
      </header>
      <div className={styles.grid}>
        <FixtureInspector
          title="Companion facts"
          description="One registry snapshot. Null community activity means unknown; zero means a confirmed count of zero. All values here are fictional."
          fixtures={companionFactsFixtures}
        />
        <FixtureInspector
          title="Companion reply"
          description="Standard and AI-labelled answers are separate states. The AI-style example is handwritten fixture text, not a model integration."
          fixtures={companionReplyFixtures}
        />
        <FixtureInspector
          title="Personality"
          description="Browser-local interaction preferences, separate from confirmed care, growth points and ownership."
          fixtures={personalityFixtures}
        />
        <FixtureInspector
          title="Community mission"
          description="Mochi garden is a cosmetic application goal at 20 confirmed care actions, including historical care. It grants no on-chain or financial reward."
          fixtures={communityMissionFixtures}
        />
        <FixtureInspector
          title="Community identity"
          description="The reference example is synthetic and uses an invalid address and reserved .invalid URL. It establishes no live integration, verification or partnership."
          fixtures={communityIdentityFixtures}
        />
      </div>
    </main>
  );
}
