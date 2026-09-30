"use client";

import { useState } from "react";
import {
  communityIdentityFixtures,
  communityMissionFixtures,
} from "@/fixtures/finale-fixtures";
import { communityFixtures } from "@/fixtures/ui-fixtures";
import { Card } from "@/components/ui/Card";
import { CommunityPanel } from "./CommunityPanel";
import { FinaleCommunityPanel } from "./FinaleCommunityPanel";
import styles from "./community.module.css";

type CommunityFixtureKey = keyof typeof communityFixtures;
type MissionFixtureKey = keyof typeof communityMissionFixtures;
type IdentityFixtureKey = keyof typeof communityIdentityFixtures;

const fixtureLabels: Record<CommunityFixtureKey, string> = {
  loading: "Loading",
  empty: "Zero activity",
  growing: "Growing",
  reached: "Achieved",
  error: "Unavailable",
  unknownTarget: "Unknown target",
  unknownTotal: "Unknown total",
};

const missionLabels: Record<MissionFixtureKey, string> = {
  loading: "Loading",
  unavailable: "Unavailable",
  empty: "Zero care actions",
  progress: "Below the goal",
  exactlyReached: "Exactly the goal",
  reached: "Above the goal",
};

const identityLabels: Record<IdentityFixtureKey, string> = {
  unconfigured: "No reference configured",
  fictionalReference: "Fictional reference",
};

export function CommunityPreview() {
  const [fixtureKey, setFixtureKey] =
    useState<CommunityFixtureKey>("loading");
  const [missionKey, setMissionKey] = useState<MissionFixtureKey>("progress");
  const [identityKey, setIdentityKey] =
    useState<IdentityFixtureKey>("unconfigured");
  const [retryCount, setRetryCount] = useState(0);

  return (
    <main className={styles.previewPage}>
      <header className={styles.previewHeader}>
        <p className={styles.previewBadge}>UI preview — fictional data</p>
        <h1>Community component preview</h1>
        <p>
          Select a centralized fixture to inspect loading, zero, progress,
          achieved, unavailable, unknown-target, and unknown-total meanings.
        </p>
      </header>

      <Card className={styles.controls} aria-label="Community preview controls">
        <label>
          Community state fixture
          <select
            value={fixtureKey}
            onChange={(event) =>
              setFixtureKey(event.target.value as CommunityFixtureKey)
            }
          >
            {(Object.keys(communityFixtures) as CommunityFixtureKey[]).map(
              (key) => (
                <option key={key} value={key}>
                  {fixtureLabels[key]}
                </option>
              ),
            )}
          </select>
        </label>
      </Card>

      <CommunityPanel community={communityFixtures[fixtureKey]} />

      <header className={styles.previewHeader}>
        <h2>Finale garden and reference</h2>
        <p>
          The garden goal is a cosmetic app rule, not an on-chain reward. The
          reference identity below is fictional and must never reach live UI.
        </p>
      </header>

      <Card className={styles.controls} aria-label="Finale preview controls">
        <label>
          Garden mission fixture
          <select
            value={missionKey}
            onChange={(event) =>
              setMissionKey(event.target.value as MissionFixtureKey)
            }
          >
            {(Object.keys(communityMissionFixtures) as MissionFixtureKey[]).map(
              (key) => (
                <option key={key} value={key}>
                  {missionLabels[key]}
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          Reference identity fixture
          <select
            value={identityKey}
            onChange={(event) =>
              setIdentityKey(event.target.value as IdentityFixtureKey)
            }
          >
            {(Object.keys(communityIdentityFixtures) as IdentityFixtureKey[]).map(
              (key) => (
                <option key={key} value={key}>
                  {identityLabels[key]}
                </option>
              ),
            )}
          </select>
        </label>
        <p>
          Local callback counter · onRetry: <strong>{retryCount}</strong>
        </p>
      </Card>

      <FinaleCommunityPanel
        community={communityFixtures.growing}
        mission={communityMissionFixtures[missionKey]}
        identity={communityIdentityFixtures[identityKey]}
        onRetry={() => setRetryCount((count) => count + 1)}
      />
    </main>
  );
}
