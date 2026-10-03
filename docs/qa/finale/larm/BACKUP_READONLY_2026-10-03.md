# Read-only backup clips — 3 October 2026

Four short **read-only** clips of the live site, recorded by Larm for the
backup plan in [`BACKUP_SHOT_LIST.md`](BACKUP_SHOT_LIST.md). They need no
wallet. **They are not the backup care recording.** The care, receipt,
before/after totals and recap shots still need Deston's genuine session.

## How they were made

- Release `3148238` (GitHub Production deployment 6812922873), `https://memepet.vercel.app`.
  The alias was not independently resolved to a commit
  ([rerun](COMBINED_QA_2026-10-03.md#runtime-and-identity-g1)).
- Headless Chrome 154, viewport 1280×667 CSS at device scale 1.5. The page is
  1920×1000 px, the same scale as 150% browser zoom on a 1080p output. Below it
  is a separate 80 px bar with the label, so the label hides no app content.
- **Permanent label, burned into every frame:** "RECORDED 03 Oct 2026 HH:MM SGT —
  NOT LIVE", plus "Read-only, no wallet · memepet.vercel.app · release 3148238 · HH:MM UTC".
- Frames come from Chrome's screencast with their own timestamps, resampled to
  30 fps without cuts or speed changes. Clip length equals elapsed real time.
- Inputs were real mouse events. "Animate Mochi" was On (fresh profile).
- No edits to numbers, no fixtures, no `/dev/*`.

## Clips

| File | Recorded (UTC, 2 Oct) | Length | Shows | Shot list |
|---|---|---|---|---|
| `memepet-backup-readonly-overview-garden-3148238-2026-10-03.mp4` | 17:10:45 | 10.3 s | Overview hero, then a scroll to the garden: **Live**, "12 confirmed care actions", "8 more confirmed care actions until it blooms." | Context for shot 1. **Not** the "before" number for a recorded care |
| `memepet-backup-readonly-say-hello-3148238-2026-10-03.mp4` | 17:11:05 | 5.7 s | Overview Mochi, "Say hello to Mochi" pressed | Shot 10 (optional) |
| `memepet-backup-readonly-public-earned-forms-3148238-2026-10-03.mp4` | 17:11:21 | 17.6 s | Public page of `0xb7E6…7B3a`: "Current form: Buddy" → Hatchling selected → "Viewing Hatchling · Your current stage is Buddy" with Hatchling art → "Return to current form" → Buddy. Stage, growth (30) and "30 of 50" unchanged | Shot 11 (optional) |
| `memepet-backup-readonly-help-3148238-2026-10-03.mp4` | 17:11:46 | 10.7 s | `/help`, scroll, open "Are there rewards, tokens or anything to buy?"; support shown as unavailable | For the Q&A, not the pitch |

SHA-256:

```text
8e3a0f0d8ed8e6c8b1065c03e5d09d1bd4ab1f2a526c468fa0574c40ecff5451  memepet-backup-readonly-overview-garden-3148238-2026-10-03.mp4
31e994192a8eedf5eeec03949d0398595a1d466adddfff4fa6dff77bbf3112c0  memepet-backup-readonly-say-hello-3148238-2026-10-03.mp4
f46a71b7572ddb14e72695ca00b32eeef2e1c498b7758eb8d0be5ec806ed37df  memepet-backup-readonly-public-earned-forms-3148238-2026-10-03.mp4
73b5ebfed2d66027dfb4c875e41686d1ec6ef85ab02b33c65e818b977360dc9c  memepet-backup-readonly-help-3148238-2026-10-03.mp4
```

The video files are **not committed** (about 3 MB in total). Larm holds them;
copy them to the demo laptop and play them offline. Verify the checksums
before use.

## Checks done on the files

- 1920×1080, 30 fps, H.264. Frames sampled at 3/45/72/97% of each clip; the
  label bar is present and the content matches the table.
- The greeting in the say-hello clip is subtle at this frame size. Use it only
  if it reads on the projector.

## Limits

- Recorded from a headless browser, not Deston's machine. Projector legibility
  is still a rehearsal check.
- If the release changes before 7 October, re-record or say on stage that
  these are from release `3148238`. Production moved to `a83f342` on
  3 October (deployment 6824015621); `3148238...a83f342` touches only
  `docs/qa/`, so the app in the clips is unchanged. Re-record only if a
  later release changes app code.
- The garden number is a dated observation (12 at 17:10 UTC on 2 October). On
  stage, read the live number.
