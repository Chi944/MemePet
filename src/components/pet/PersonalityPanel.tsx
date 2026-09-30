"use client";

import { useId } from "react";
import type { PersonalityPanelProps, PersonalityStyle } from "@/types/companion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./personality.module.css";

const DELIVERY: Record<PersonalityStyle, { label: string; description: string }> = {
  playful: { label: "Playful", description: "A light, playful way to explain the same confirmed facts." },
  curious: { label: "Curious", description: "An exploratory way to explain the same confirmed facts." },
  focused: { label: "Focused", description: "A direct, focused way to explain the same confirmed facts." },
};

export function PersonalityPanel({ profile, storageStatus, dataMode, onInteract, onReset }: PersonalityPanelProps) {
  const id = useId();
  const delivery = DELIVERY[profile.style];
  const reason = profile.style === "curious"
    ? "Explore interactions lead, so Mochi uses a curious explanation style."
    : profile.style === "focused"
      ? "Practise interactions lead, so Mochi uses a focused explanation style."
      : profile.exploreCount === 0 && profile.practiseCount === 0
        ? "Start with either interaction. Mochi begins playful."
        : "Explore and Practise are balanced, so Mochi uses a playful explanation style.";

  return (
    <Card className={styles.panel} aria-labelledby={`${id}-title`}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Explanation style</p>
        <Badge tone={dataMode === "fixture" ? "preview" : "neutral"}>
          {dataMode === "fixture" ? "Preview data" : "Browser preference"}
        </Badge>
      </div>
      <h2 id={`${id}-title`}>Mochi, your way</h2>
      <p className={styles.intro}>Choose how Mochi explains your progress. The facts stay the same.</p>

      <div className={styles.delivery} role="status" aria-live="polite" aria-atomic="true">
        <h3>{delivery.label}</h3>
        <p>{delivery.description}</p>
        <p className={styles.reason}>{reason}</p>
      </div>

      <div className={styles.interactions}>
        <div className={styles.interaction}>
          <dl><dt>Explore interactions</dt><dd>{profile.exploreCount}</dd></dl>
          <p id={`${id}-explore`}>Encourage a curious explanation style.</p>
          <Button tone="secondary" aria-describedby={`${id}-explore`} onClick={() => onInteract("explore")}>Explore</Button>
        </div>
        <div className={styles.interaction}>
          <dl><dt>Practise interactions</dt><dd>{profile.practiseCount}</dd></dl>
          <p id={`${id}-practise`}>Encourage a focused explanation style.</p>
          <Button tone="secondary" aria-describedby={`${id}-practise`} onClick={() => onInteract("practise")}>Practise</Button>
        </div>
      </div>

      <p className={styles.boundary}>These preferences do not earn growth points, change care cooldown, or train a model.</p>
      <div className={styles.storage} role="status" aria-live="polite" aria-atomic="true">
        {storageStatus === "unavailable" ? (
          <p className={styles.unavailable}>Browser saving is unavailable. Changes and resets are not confirmed saved. Your last available counts are shown. Try again when browser saving is available.</p>
        ) : dataMode === "fixture" ? (
          <p>Fictional preview: interactions only increment callback counters below. No personality preferences are saved here.</p>
        ) : (
          <p>Preferences are local to this browser and wallet context. They do not sync across devices.</p>
        )}
      </div>
      <div className={styles.reset}>
        <Button tone="quiet" onClick={onReset} aria-describedby={`${id}-reset`}>Reset personality</Button>
        <p id={`${id}-reset`}>Requests a reset of these preferences only. Earned growth stays unchanged.</p>
      </div>
    </Card>
  );
}
