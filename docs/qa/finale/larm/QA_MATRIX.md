# F4 — independent QA matrix (Larm)

Task **F4**, branch `feat/finale-community`, base `8a811516333a99cd7175e4c5d4b3de6e07639454`.
Every row is **PASS / FAIL / NOT RUN / BLOCKED**. Nothing is inferred; a row
that was not observed says so.

This file covers the component in isolation (fixtures) and lists the
integrated checks that follow once Codex wires live adapters. **No wallet was
connected and nothing was signed.**

## Run context — component pass

| Field | Value |
|---|---|
| Tested | base above + the F4 commits on this branch |
| Run (UTC) | 2026-09-30, 02:40 → 03:15 |
| Browser | Chromium 152 embedded in the Claude desktop app (not standalone Chrome) |
| OS | Windows 11 Home 10.0.26200, DPR 1 |
| Node / npm | v24.19.0 / 11.17.0 (`DEV_SETUP.md` pins npm 11.19.x — deviation) |
| Server | `npm run dev -- -p 3300`, route `/dev/community` |
| Data | **Fictional fixtures only** — `communityMissionFixtures`, `communityIdentityFixtures` |

**Environment limit.** The embedded browser was not painting frames:
`requestAnimationFrame` never fired and CSS animation clocks stayed at
`currentTime 0`, even while `visibilityState` reported `visible`. Layout, DOM,
ARIA, focus and keyboard checks do not depend on painting and are reported
normally. Watching an animation play is **NOT RUN**.

## Automated checks

| Check | Result | Detail |
|---|---|---|
| `npm run typecheck` | **PASS** | exit 0 |
| `npm run lint` | **PASS** | 0 errors; 1 pre-existing warning `@next/next/no-img-element` in `src/components/share/ShareImage.tsx`, outside F4 scope |
| `npm test` | **PASS** | 285 passed across 31 files, incl. 14 in `FinaleCommunityPanel.test.tsx` |

## Mission states — browser, `/dev/community`, 1440×900

Count read from the displayed `<strong>` element, bar from ARIA attributes.

| ID | Result | Fixture | Observed |
|---|---|---|---|
| M1 | **PASS** | Loading | `aria-busy="true"`; "Reading confirmed care actions…"; **no count, no bar, no garden**; badge "Preview data" |
| M2 | **PASS** | Unavailable | Message shown; **no count, no bar, no garden**; "Retry reading" present |
| M3 | **PASS** | Zero (0) | Count **0**; bar `0/20`, fill 0%; garden "bare soil, waiting for the first confirmed care"; "20 more confirmed care actions until it blooms." |
| M4 | **PASS** | Below goal (7) | Count **7**; bar `7/20`, fill 35%; garden "sprouting"; "13 more…" |
| M5 | **PASS** | Above goal (24) | Count **24**; bar **capped** `20/20`, fill 100%; valuetext "24 of 20 confirmed care actions, garden in bloom"; garden "in full bloom" |
| M6 | **NOT RUN** (browser) | Exactly 20 | No shared fixture for 20 exists, so the preview cannot show it. **Covered by an automated test** with a local input (bloom at exactly the target). Fixture requested from Codex on PR #59 |
| M7 | **PASS** (test) | `isComplete` precedence | Automated: total 25 with `isComplete: false` does **not** bloom and reads "Bloom is not confirmed yet." The panel never computes completion itself |
| M8 | **PASS** | Wording | No "user", "holder", "people" or "member" in any mission state's text |

## Retry

| ID | Result | Observed |
|---|---|---|
| R1 | **PASS** | `type="button"`; mouse clicks advance the preview's `onRetry` counter exactly once each: **0 → 1 → 2** |
| R2 | **PASS** | Keyboard: focused, **Enter** then **Space** advanced it **2 → 4** — one call per activation |
| R3 | **PASS** | Labelled "Retrying only reads again. It sends no transaction." The panel has no wallet or transaction capability; `onRetry` is its only callback |
| R4 | **PASS** (test) | No retry is offered while the total is readable |

## Community reference

| ID | Result | Fixture | Observed |
|---|---|---|---|
| I1 | **PASS** | Unconfigured | "No community reference is configured. MemePet shows none rather than guessing one."; no link, no address |
| I2 | **PASS** | Fictional reference | Badge **Preview data**; name, network with chain id, address, source, check time "Jan 1, 2030, 12:00 PM UTC"; disclaimer "not a partnership, endorsement, balance or reward" |
| I3 | **PASS** | Fictional reference | Source link `rel="noopener noreferrer"`, `target="_blank"`, accessible name ends "(opens in a new tab)" |
| I4 | **PASS** (test) | Unsafe source | A `javascript:` source renders as "Source link unavailable", not a link |

## Layout

Widest content: above-goal bloom plus the fictional reference and its long
address. Overflow **measured** — `scrollWidth` vs `clientWidth` and every
element in the panel checked for a right edge past the viewport.

| ID | Result | Viewport | Observed |
|---|---|---|---|
| L1 | **PASS** | 1440×900 | 1425 = 1425; 0 offenders |
| L2 | **PASS** | 390×844 | 390 = 390; 0 offenders; panel right edge 374 |
| L3 | **PASS** | 320×740 | 320 = 320; 0 offenders; panel right edge 304 (16 px gutter) |

Viewport emulation in a desktop browser, **not device testing**.

## Keyboard

| ID | Result | Observed |
|---|---|---|
| K1 | **PASS** | From the last preview control, Tab reaches **Retry reading**, then the **source link**, in visual order |
| K2 | **PASS** | Both show `:focus-visible` with a 2 px solid outline |
| K3 | **PASS** | Next Tab leaves the panel (to Next.js's dev-only overlay portal — development tooling, not app content). No trap |
| K4 | **NOT RUN** | Screen-reader speech. Names, roles and live-region attributes were read from the DOM; that is not a speech test |

## Motion

| ID | Result | Observed |
|---|---|---|
| A1 | **PASS** (structure) | Seven bloom animations exist, `running`, 900 ms, staggered 0/120/240 ms, `fill: both` — correctly attached |
| A2 | **NOT RUN** | Normal-motion playback. Not observed: `requestAnimationFrame` did not fire and `currentTime` stayed 0 after 1 200 ms |
| A3 | **BLOCKED** | True `prefers-reduced-motion: reduce`. The browser tool cannot emulate it, and changing the OS setting is not something this assistant may do. **Deston's reduced-motion preference is the real test case** |
| A4 | **PASS** (simulated) | With `animation: none` applied to the bloom — exactly what the reduced-motion rule sets — all 7 flowers read **opacity 1**. The bloom stays visible without motion. A reduced-motion rule covering the bloom, the loading sweep and the bar is present |

A3, by hand: Windows Settings → Accessibility → Visual effects → **Animation
effects off**, reload `/dev/community`, choose "Above the goal". Expected: the
garden appears already in bloom, with no animation.

## Integrated checks — after Codex wires the live adapters

**Run on 2026-09-30 against `08d0e5b` — results in
[`INTEGRATED_QA_2026-09-30.md`](INTEGRATED_QA_2026-09-30.md):** X1, X2, X6 PASS;
X8 PASS (layout; keyboard partial); X3, X4, X5 NOT RUN; X7 BLOCKED here.

The rows below were written before that run. They needed the integrated release. Record release SHA,
network, account (public address only) and receipt where applicable. Keep the
old automatic-refresh failure in `FINAL_ACCEPTANCE_2026-09-24.md` as is.

| ID | Check | Expected |
|---|---|---|
| X1 | Garden on the hosted release, no wallet | Live total from the registry; badge **Live**; matches `communityStats(1)` read independently |
| X2 | Existing cares count | With the chain total at the time, the garden shows that total — earlier cares included |
| X3 | After one genuine confirmed care | Total rises by one after the receipt, without a manual reload; attribute with `docs/qa/counter-check.mjs` |
| X4 | Read failure on the release | Unavailable state, no number, no bloom; Retry re-reads and recovers |
| X5 | At 20 lifetime cares | Blooms when the data layer reports `isComplete`, not before |
| X6 | Identity | Stays `unconfigured` until Codex verifies a reference; if XDOG is configured, network shows **X Layer mainnet (196)**, distinct from MemePet's testnet |
| X7 | Reduced motion | A3, on the integrated release |
| X8 | 320/390/1440 and keyboard | L1–L3 and K1–K3 repeated on the release |

## Gaps and requests (on PR #59)

1. **Exactly-20 fixture** so M6 can be checked in the browser.
2. **MemePet's own network** as a prop, so the reference card can show both
   networks side by side when they differ — needed if XDOG (mainnet) is used.
