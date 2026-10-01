# Kym — pet release QA

**F2 and F5 complete · QA branch `test/pet-release-qa` · updated 2 October 2026.**
Your personality panel (#67) and earned-form viewer (#73) are merged. Codex's
live/public account-scope wiring is also merged. Start the QA follow-up from
current reviewed `origin/main`; do not reuse either merged feature branch.

**Allowed:** `src/components/pet/**`. Reuse the three approved `/pets/*.png`
artworks. No new assets, routes, shared types, hooks, storage, RPC, dependencies
or changes to another owner's files.

**Combined candidate, 2 October:** `d0fc02057eb9d06350c598220a62c68960cd8ab2`
contains F5 and F6. The lead's combined automated checks and local browser
gallery checks passed; [status](../STATUS.md) records the exact coverage and
production verification. Final genuine wallet acceptance remains **NOT RUN**.
Preserve [your original handoff](../../src/components/pet/qa/F5-HANDOFF.md).

## Next: combined pet QA, 3–4 October

- On the named combined release, check earned/locked forms, return-to-current
  focus, missing art, authoritative progress/care and Animate Mochi at
  320/390/1440px. Use labelled fixtures for unavailable live states and identify
  them clearly. Do not present fixture selection as wallet evidence.
- Check the gallery alongside the recap and personality panel. Fix only
  reproduced pet presentation defects; preserve existing progression and props.
- Record the actual SHA, runtime, screenshots, checks and NOT RUN cases under
  `src/components/pet/qa/`. Existing evidence remains dated historical evidence.
- Send precise shared-route defects to Codex. Wallet prompts belong to one
  planned lead session, not a separate round of requests from each teammate.

No new feature or artwork is assigned. The approved feature scope is complete.

## Implemented F5 behavior to preserve

- The growth trail lets a person view Mochi's **current or earlier
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
  Reset the viewed form on supplied stage changes. Both routes now key the
  scene by normalized owner/chain/registry for account changes. Preserve that
  boundary without adding wallet access or an identity schema to the component.
- Preserve keyboard focus, selected state and understandable locked labels.
  Use native controls, no hover-only interaction. Other effects still respect
  reduced motion; Mochi's explicit on/off exception stays narrow.

## Acceptance and handoff

Test earned/future selection, return to current, stage change, missing art and
unchanged actual growth/care. Inspect labelled previews at 320/390/1440px and
keyboard focus, including the artwork ring beside its motion switch/stage label.
If a new defect is reproduced, fix it within this folder and record before/after.
F5 repaired the focus-ring clipping and empty-track boundary originally recorded
in Larm's [readability check](../qa/finale/larm/READABILITY_QA_2026-10-01.md).
Preserve those fixes and the actual progress value.
Run component tests, typecheck and lint; report actual visual checks separately.

Combined QA target **3–4 October, Singapore**. No second pet or new progression
rule. Return base/head SHAs, screenshots, commands/results and unrun cases.
Codex reviews and releases fixes; backup capture is planned for 5 October and
the timed rehearsal for 6 October. No extra coding work is assigned to Deston.

## Paste into Kym's agent

```text
Continue the pet release QA in docs/finale/KYM.md. F2/#67 and F5/#73 are merged, including the lead's route scope keys; do not rebuild them. Read AGENTS.md, scope, ownership, setup and docs/finale/INTEGRATION.md. Preserve local work, fetch origin and start test/pet-release-qa from current reviewed origin/main; record its SHA. Verify the combined gallery/personality/care presentation at 320/390/1440px and with keyboard access, keeping actual progress, missing-art honesty and Animate Mochi intact. Fix only reproduced defects in src/components/pet/** and record exact evidence in its qa folder. Distinguish labelled fixtures and mock tests from real wallet checks. Request shared changes from Codex, retain NOT RUN cases, run relevant checks and return a small draft PR if changes are needed. No new assets/features/RPC/storage/shared props, wallet requests or deployment changes. Codex handles review/merge/release and one final genuine wallet session. QA target 3–4 October Singapore; backup 5 October, rehearsal 6 October.
```
