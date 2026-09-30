"use client";

import { Button } from "./Button";

type Props = {
  readonly enabled: boolean;
  readonly onChange: (enabled: boolean) => void;
};

export function MochiMotionControl({ enabled, onChange }: Props) {
  return (
    <Button tone="secondary" role="switch" aria-label="Animate Mochi"
      aria-checked={enabled} onClick={() => onChange(!enabled)}>
      Animate Mochi <span aria-hidden="true">{enabled ? "On" : "Off"}</span>
    </Button>
  );
}
