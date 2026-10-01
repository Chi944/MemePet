# Kym — earlier earned forms

**Current task F5 · branch `feat/earned-stage-viewer` · assigned 1 October 2026.**
Start a fresh branch from current reviewed `origin/main`; do not reuse the merged
F2 branch. Your personality panel shipped in PR #67. Codex owns its live wiring.

**Allowed:** `src/components/pet/**`. Reuse the three approved `/pets/*.png`
artworks. No new assets, routes, shared types, hooks, storage, RPC, dependencies
or changes to another owner's files.

**Lead checkpoint, 1 October:** PR #73 is under review while your agent is still
working (confirmed by Deston). Keep finishing your branch; do not discard local
changes or restart F5. Codex has separately implemented both route remount keys
and their regression tests. The lead will reconcile current main and your final
head, then verify the combined build. Return your final head/PR and remaining
limits when done; no shared-route changes are required from your agent.

## Build

- Make the existing growth trail let a person view Mochi's **current or earlier
  earned form**. Hatchling offers Hatchling; Buddy also offers Hatchling;
  Guardian offers all three. Future forms remain labelled locked and cannot be
  selected as an earned pet. Derive this solely from the supplied `pet.stage`.
- Default to the current form. Choosing an earlier form changes only artwork
  and its accessible description. Keep the actual current stage, earned points,
  progress bar and next target authoritative and visible. Show a clear notice,
  e.g. "Viewing Hatchling · Your current stage is Buddy", and a return-to-current
  control. This is a form gallery, not an event history; invent no dates/streaks.
- Keep the supplied missing-art placeholder honest; do not replace a missing
  current image with an apparently live pet. Preserve fixture/live labels.
- Preserve `PetSceneProps`, care behavior and Codex's Animate Mochi preference.
  Reset the viewed form on supplied stage changes. Codex will key the route's
  scene by wallet/chain/registry for account changes; request that integration in
  your PR, without adding wallet access or an identity schema to the component.
- Preserve keyboard focus, selected state and understandable locked labels.
  Use native controls, no hover-only interaction. Other effects still respect
  reduced motion; Mochi's explicit on/off exception stays narrow.

## Acceptance and handoff

Test earned/future selection, return to current, stage change, missing art and
unchanged actual growth/care. Inspect labelled previews at 320/390/1440px and
keyboard focus, including the artwork ring beside its motion switch/stage label.
If overlap is reproduced, fix it within this folder and record before/after.
Larm's [readability check](../qa/finale/larm/READABILITY_QA_2026-10-01.md)
also flags the low-contrast empty growth track. Verify it and give the full track
a visible boundary (as in the garden), preserving the actual progress value.
Run component tests, typecheck and lint; report actual visual checks separately.

Target PR by **2 October, Singapore**. No second pet or new progression rule.
Open a draft early; return base/head SHAs, screenshots, commands/results and
unrun cases. Codex handles shared integration, review, merge and release.

## Paste into Kym's agent

```text
Continue MemePet with task F5 in docs/finale/KYM.md. F2/PR #67 is complete; do not rebuild it. Read AGENTS.md, docs/PROJECT_BRIEF.md, docs/OWNERSHIP.md, docs/DEV_SETUP.md and docs/finale/INTEGRATION.md. Preserve existing work, fetch origin, start feat/earned-stage-viewer from the current reviewed origin/main and record its SHA. State intended paths, then build the earned-form viewer and tests only in src/components/pet/**. Preserve authoritative current progress, missing-art honesty, existing props and Animate Mochi. Do not add wallet/RPC/storage logic. Open a draft PR and request the lead's account-scope remount explicitly. Run the listed checks, report genuine browser observations separately, commit/push and return the PR URL. Do not merge or deploy. Target 2 October Singapore.
```
