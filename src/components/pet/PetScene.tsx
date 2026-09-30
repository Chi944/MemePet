"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";
import type { PetSceneProps, PetStage } from "@/types/view-models";
import { DataModeBadge } from "@/components/ui/Badge";
import { MochiMotionControl } from "@/components/ui/MochiMotionControl";
import { useMochiMotion } from "@/hooks/useMochiMotion";
import styles from "./pet.module.css";

const STAGE_LABEL: Record<PetStage, string> = {
  hatchling: "Hatchling",
  buddy: "Buddy",
  guardian: "Guardian",
};

const STAGE_ORDER: readonly PetStage[] = ["hatchling", "buddy", "guardian"];

function getProgress(growthPoints: number, nextStageAt: number | null) {
  if (nextStageAt === null) {
    return null;
  }

  if (
    !Number.isFinite(growthPoints) ||
    !Number.isFinite(nextStageAt) ||
    nextStageAt <= 0
  ) {
    return undefined;
  }

  return Math.min(100, Math.max(0, (growthPoints / nextStageAt) * 100));
}

export function PetScene({ pet, celebrate }: PetSceneProps) {
  const { enabled, setEnabled } = useMochiMotion();
  const [greeting, setGreeting] = useState(false);
  const canAnimate = enabled && Boolean(pet.artSrc);
  if (!canAnimate && greeting) setGreeting(false);
  useEffect(() => {
    if (!greeting || !canAnimate) return;
    const timer = window.setTimeout(() => setGreeting(false), 650);
    return () => window.clearTimeout(timer);
  }, [canAnimate, greeting]);
  const progress = getProgress(pet.growthPoints, pet.nextStageAt);
  const progressStyle =
    typeof progress === "number"
      ? ({ "--pet-progress": `${progress}%` } as CSSProperties)
      : undefined;
  const currentIndex = STAGE_ORDER.indexOf(pet.stage);
  const nextStageLabel =
    currentIndex >= 0 && currentIndex < STAGE_ORDER.length - 1
      ? STAGE_LABEL[STAGE_ORDER[currentIndex + 1]]
      : null;

  return (
    <section
      className={`${styles.scene} ${celebrate ? styles.celebrating : ""}`.trim()}
      aria-labelledby="pet-name"
      data-mochi-motion={canAnimate ? "on" : "off"}
    >
      <div className={styles.motionBar}>
        <MochiMotionControl enabled={enabled} onChange={setEnabled} />
      </div>
      <div className={styles.artFrame}>
        {celebrate ? <span className={styles.evolutionGlow} aria-hidden="true" /> : null}
        {pet.artSrc ? (
          <button
            className={`${styles.artInner} ${styles.artButton}`}
            type="button"
            aria-label={`Say hello to ${pet.displayName}`}
            disabled={!enabled}
            data-greeting={greeting ? "true" : "false"}
            onClick={() => setGreeting(true)}
            onAnimationEnd={(event) => {
              if (event.target !== event.currentTarget) setGreeting(false);
            }}
          >
            <Image
              className={styles.art}
              data-stage-art={
                pet.artSrc === `/pets/${pet.stage}.png` ? pet.stage : undefined
              }
              src={pet.artSrc}
              alt={`${pet.displayName}, the ${pet.stage} pet`}
              width={480}
              height={480}
              sizes="(max-width: 760px) 80vw, 28rem"
              priority
            />
          </button>
        ) : (
          <div className={styles.artInner}>
            <div
              className={styles.placeholder}
              role="img"
              aria-label={`${pet.displayName} artwork placeholder`}
            >
              <span aria-hidden="true">✦</span>
              <strong>Pet artwork coming soon</strong>
            </div>
          </div>
        )}
      </div>

      <div className={styles.sceneDetails}>
        <div className={styles.sceneHead}>
          <p className={styles.kicker}>{pet.communityName}</p>
          <DataModeBadge mode={pet.dataMode} />
        </div>
        <h2 id="pet-name">{pet.displayName}</h2>
        <div role="status" aria-live="polite" aria-atomic="true">
          {celebrate ? (
            <p className={styles.celebration}>
              {pet.displayName} grew into {STAGE_LABEL[pet.stage]}!
            </p>
          ) : null}
        </div>

        <ol className={styles.stageTrail} aria-label="Growth stages">
          {STAGE_ORDER.map((stage) => {
            const index = STAGE_ORDER.indexOf(stage);
            const state =
              index < currentIndex
                ? styles.stagePast
                : index === currentIndex
                  ? styles.stageCurrent
                  : styles.stageFuture;

            return (
              <li key={stage} className={state} aria-current={index === currentIndex ? "step" : undefined}>
                {STAGE_LABEL[stage]}
                {index === currentIndex ? (
                  <span className={styles.srOnly}> (current stage)</span>
                ) : null}
              </li>
            );
          })}
        </ol>

        <p className={styles.stageLabel}>Stage: {STAGE_LABEL[pet.stage]}</p>
        {/* Single text node: co-located tests match this exact string. */}
        <p className={styles.growth}>{pet.growthPoints} growth points</p>

        {progress === null ? (
          <p className={styles.finalStage}>
            {STAGE_LABEL[pet.stage]} is the final stage.
          </p>
        ) : typeof progress === "number" ? (
          <div className={styles.progressGroup}>
            <div
              className={styles.progressTrack}
              role="progressbar"
              aria-label="Growth toward next stage"
              aria-valuemin={0}
              aria-valuemax={pet.nextStageAt ?? undefined}
              aria-valuenow={pet.growthPoints}
            >
              <span className={styles.progressFill} style={progressStyle} />
            </div>
            <p className={styles.progressCaption}>
              {pet.growthPoints} of {pet.nextStageAt} points
              {nextStageLabel ? ` toward ${nextStageLabel}` : ""}.
            </p>
          </div>
        ) : (
          <p className={styles.unavailable}>Next-stage target unavailable.</p>
        )}
      </div>
    </section>
  );
}
