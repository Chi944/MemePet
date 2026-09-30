"use client";

import { useState } from "react";
import { personalityFixtures } from "@/fixtures/finale-fixtures";
import { PersonalityPanel } from "./PersonalityPanel";
import { careFixtures, petFixtures } from "@/fixtures/ui-fixtures";
import { Card } from "@/components/ui/Card";
import { CarePanel } from "./CarePanel";
import { PetScene } from "./PetScene";
import styles from "./pet.module.css";

type PersonalityFixtureKey = keyof typeof personalityFixtures;

type PetFixtureKey = keyof typeof petFixtures;
type CareFixtureKey = keyof typeof careFixtures;

export function PetPreview() {
  const [personalityKey, setPersonalityKey] = useState<PersonalityFixtureKey>("playful");
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [exploreCount, setExploreCount] = useState(0);
  const [practiseCount, setPractiseCount] = useState(0);
  const [resetCount, setResetCount] = useState(0);
  const [petKey, setPetKey] = useState<PetFixtureKey>("hatchling");
  const [careKey, setCareKey] = useState<CareFixtureKey>("ready");
  const [celebrate, setCelebrate] = useState(false);
  const [careCount, setCareCount] = useState(0);
  const [connectCount, setConnectCount] = useState(0);
  const [switchCount, setSwitchCount] = useState(0);

  return (
    <main className={styles.previewPage}>
      <header className={styles.previewHeader}>
        <p className={styles.previewBadge}>UI preview — fictional data</p>
        <h1>Pet component preview</h1>
        <p>
          Select fixture inputs explicitly. Counters only confirm that a
          callback fired; they do not represent transactions or progress.
        </p>
      </header>

      <Card className={styles.controls} aria-label="Pet preview controls">
        <label>
          Pet stage fixture
          <select
            value={petKey}
            onChange={(event) =>
              setPetKey(event.target.value as PetFixtureKey)
            }
          >
            <option value="hatchling">Hatchling</option>
            <option value="buddy">Buddy</option>
            <option value="guardian">Guardian</option>
            <option value="missingArt">Missing artwork</option>
          </select>
        </label>

        <label>
          Care-action fixture
          <select
            value={careKey}
            onChange={(event) =>
              setCareKey(event.target.value as CareFixtureKey)
            }
          >
            <option value="ready">Ready</option>
            <option value="needsWallet">Needs wallet</option>
            <option value="wrongNetwork">Wrong network</option>
            <option value="cooldown">Cooldown</option>
            <option value="awaitingSignature">Awaiting signature</option>
            <option value="submitting">Submitting</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="rejected">Rejected</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </label>

        <label>
          Personality fixture
          <select value={personalityKey} onChange={(event) => setPersonalityKey(event.target.value as PersonalityFixtureKey)}>
            <option value="playful">Default — playful</option>
            <option value="curious">Exploration-led — curious</option>
            <option value="focused">Practice-led — focused</option>
          </select>
        </label>
        <label className={styles.checkbox}>
          <input type="checkbox" checked={storageUnavailable} onChange={(event) => setStorageUnavailable(event.target.checked)} />
          Browser saving unavailable
        </label>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={celebrate}
            onChange={(event) => setCelebrate(event.target.checked)}
          />
          Show confirmed-success celebration
        </label>
      </Card>

      <div className={styles.previewGrid}>
        <PetScene pet={petFixtures[petKey]} celebrate={celebrate} />
        <CarePanel
          pet={petFixtures[petKey]}
          action={careFixtures[careKey]}
          onCare={() => setCareCount((count) => count + 1)}
          onConnect={() => setConnectCount((count) => count + 1)}
          onSwitchNetwork={() => setSwitchCount((count) => count + 1)}
        />
      </div>

      <PersonalityPanel
        profile={personalityFixtures[personalityKey]}
        storageStatus={storageUnavailable ? "unavailable" : "available"}
        dataMode="fixture"
        onInteract={(interaction) => {
          if (interaction === "explore") setExploreCount((count) => count + 1);
          else setPractiseCount((count) => count + 1);
        }}
        onReset={() => setResetCount((count) => count + 1)}
      />

      <Card className={styles.counters} aria-label="Callback counters">
        <h2>Local callback counters</h2>
        <p>Personality buttons record callback requests only. Choose a fixture to change the displayed style and counts.</p>
        <dl>
          <div><dt>onInteract: explore</dt><dd>{exploreCount}</dd></div>
          <div><dt>onInteract: practise</dt><dd>{practiseCount}</dd></div>
          <div><dt>onReset</dt><dd>{resetCount}</dd></div>
          <div>
            <dt>onCare</dt>
            <dd>{careCount}</dd>
          </div>
          <div>
            <dt>onConnect</dt>
            <dd>{connectCount}</dd>
          </div>
          <div>
            <dt>onSwitchNetwork</dt>
            <dd>{switchCount}</dd>
          </div>
        </dl>
      </Card>
    </main>
  );
}
