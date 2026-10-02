"use client";

import { useId, useState } from "react";
import { WalletChooser } from "@/components/onboarding/WalletChooser";
import { OnboardingPanel } from "@/components/onboarding/OnboardingPanel";
import { ProgressionPanel } from "@/components/progression/ProgressionPanel";
import { gardenChapterFixtures, onboardingFixtures, personalMilestoneFixtures, walletChoiceFixtures } from "@/fixtures/beta-fixtures";
import { Card } from "@/components/ui/Card";
import styles from "./beta.module.css";

/** Fictional callback inspection only; never imports wallet/data hooks. */
export function OnboardingWorkbench() {
  const id = useId();
  const [onboarding, setOnboarding] = useState<keyof typeof onboardingFixtures>("connect");
  const [personal, setPersonal] = useState<keyof typeof personalMilestoneFixtures>("empty");
  const [garden, setGarden] = useState<keyof typeof gardenChapterFixtures>("beforeBloom");
  const [selected, setSelected] = useState<string | null>(null);
  const [calls, setCalls] = useState(0);
  const [walletMode, setWalletMode] = useState("available");
  const count = () => setCalls((n) => n + 1);
  return <section aria-label="Fictional onboarding and progression">
    <Card className={styles.controls}>
      <h2>Fictional onboarding and progression</h2>
      <div className={styles.fields}>
        <label className={styles.field}>Onboarding preview state
          <select value={onboarding} onChange={(e) => setOnboarding(e.target.value as typeof onboarding)}>
            {Object.keys(onboardingFixtures).map((key) => <option key={key}>{key}</option>)}
          </select>
        </label>
        <label className={styles.field}>Personal milestone preview
          <select value={personal} onChange={(e) => setPersonal(e.target.value as typeof personal)}>
            {Object.keys(personalMilestoneFixtures).map((key) => <option key={key}>{key}</option>)}
          </select>
        </label>
        <label className={styles.field}>Garden chapter preview
          <select value={garden} onChange={(e) => setGarden(e.target.value as typeof garden)}>
            {Object.keys(gardenChapterFixtures).map((key) => <option key={key}>{key}</option>)}
          </select>
        </label>
        <label className={styles.field}>Wallet preview availability
          <select value={walletMode} onChange={(e) => setWalletMode(e.target.value)}>
            <option value="available">available</option><option value="busy">busy</option><option value="empty">empty</option>
          </select>
        </label>
      </div>
      <p className={styles.note}>All values are fictional. Controls only change these examples. Setup links lead to official external guidance.</p>
      <p><label htmlFor={`${id}-count`}>Onboarding/progression callbacks: </label><output id={`${id}-count`} aria-live="polite">{calls}</output></p>
    </Card>
    <div className={styles.panels}>
      <WalletChooser choices={walletMode === "empty" ? [] : walletChoiceFixtures} selectedId={selected} busy={walletMode === "busy"} onSelect={(value) => { setSelected(value); count(); }} />
      <OnboardingPanel state={onboardingFixtures[onboarding]} connectDisabled={selected === null || walletMode !== "available"} onConnect={count} onSwitchNetwork={count} onRetry={count} />
    </div>
    <ProgressionPanel personal={personalMilestoneFixtures[personal]} community={gardenChapterFixtures[garden]} onRetry={count} />
  </section>;
}
