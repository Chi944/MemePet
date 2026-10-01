# Kym — pet release QA

**Task PET-RELEASE-QA · F2 and F5 complete · QA branch `test/pet-release-qa` · updated 2 October 2026.**
Your personality panel (#67) and earned-form viewer (#73) are merged. Codex's
live/public account-scope wiring is also merged. Start the QA follow-up from
current reviewed `origin/main`; do not reuse either merged feature branch.
If this QA branch already contains unmerged work, continue it safely instead of
recreating it or discarding changes.

**Allowed:** `src/components/pet/**`. Reuse the three approved `/pets/*.png`
artworks. No new assets, routes, shared types, hooks, storage, RPC, dependencies
or changes to another owner's files.

**Verified product source, 2 October:** `d0fc02057eb9d06350c598220a62c68960cd8ab2`
contains F5 and F6. Main subsequently includes the documentation-only #76 merge
at `aede952`; fetch the latest reviewed main rather than pinning to either SHA.
The lead's combined automated checks and local browser
gallery checks passed; [status](../STATUS.md) records the exact coverage and
production verification. Final genuine wallet acceptance remains **NOT RUN**.
Preserve [your original handoff](../../src/components/pet/qa/F5-HANDOFF.md).

## Begin without losing work

1. Read the repository instructions, scope, ownership, setup and shared contract.
   State task `PET-RELEASE-QA` and the intended files before editing. Inspect
   `git status --short`, the current branch and any existing PR first.
2. Fetch `origin`. If the working tree is clean and no active QA branch exists,
   create `test/pet-release-qa` from reviewed `origin/main`. If the QA branch is
   active, preserve its commits and uncommitted work; when clean, merge reviewed
   `origin/main` into it. Do not reset, force-push or overwrite an existing branch.
   Ask Codex to resolve confusing shared-file conflicts while continuing any
   independent QA that is safe to run.
3. Record the actual base/head SHA, browser, runtime URL, date and viewport for
   each run. A production alias does not prove its deployed commit; cite the
   lead's matching deployment evidence or label the revision unverified.

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
Run `npm test -- src/components/pet`, `npm run typecheck` and `npm run lint`;
report actual visual checks separately. If only evidence changes, report which
checks you actually ran without copying another person's passing result.

Create `src/components/pet/qa/PET_RELEASE_QA_<YYYY-MM-DD>.md` using the actual
run date, with a small screenshot set in a sibling dated subfolder. If a report
already exists, add a clearly dated run rather than replacing historical results.
The report must separate **local fictional previews**, **production read-only
observations** and **wallet checks NOT RUN**. No wallet prompts are assigned to
this lane. For unsupported controls, browser access or states, record the exact
limitation and continue the independent checks.

Completion checklist:

- [ ] Earned/current/locked forms, return focus, stage changes and missing art
  checked at 320/390/1440px; actual growth and care remain unchanged by browsing.
- [ ] Gallery, personality and care checked together; motion on/off and the
  narrow artwork exception recorded without changing the user's OS preference.
- [ ] Production read-only checks labelled separately from local fixtures;
  wallet account/network changes and signing left NOT RUN unless performed in
  the separate lead session and linked to that evidence.
- [ ] Exact commands/results, screenshots, runtime/SHA, reproduced defects and
  remaining NOT RUN rows recorded in the dated report.
- [ ] Small draft PR opened with allowed presentation fixes and/or evidence.
  An evidence-only PR is the expected result when no defect is found.

Give Larm the PR/report link and a short list of blockers for his combined
checklist. Do not edit his checklist, another member's evidence or shared status.
Cross-route, wallet/data and shared-type issues go to Codex with reproduction
steps; this lane cannot fix them by adding its own adapter.

Combined QA target **3–4 October, Singapore**. No second pet or new progression
rule. Return base/head SHAs, screenshots, commands/results and unrun cases.
Codex reviews and releases fixes; backup capture is planned for 5 October and
the timed rehearsal for 6 October. No extra coding work is assigned to Deston.

## Paste into Kym's agent

```text
Continue task PET-RELEASE-QA in docs/finale/KYM.md. F2/#67, F5/#73, the lead's route scope keys and handoff #76 are merged; do not rebuild them. Read AGENTS.md, scope, ownership, setup and docs/finale/INTEGRATION.md. Inspect local changes, branch and existing PR before fetching origin. Preserve active unmerged QA work; reconcile reviewed origin/main when clean. Only create test/pet-release-qa if no active QA branch exists. Never reset/discard work, force-push or reuse a merged feature branch. Record actual base/head SHAs and runtime details. Verify combined gallery/personality/care presentation at 320/390/1440px and with keyboard access, preserving actual progress, missing-art honesty and Animate Mochi. Fix only reproduced defects in src/components/pet/**. Create its qa/PET_RELEASE_QA_<actual-date>.md report with screenshots, exact checks and NOT RUN cases, separating local fictional previews, production read-only observations and wallet evidence. Do not trigger wallet prompts or change OS settings. Run the documented checks, then open a small draft PR, including an evidence-only PR if no fixes are needed. Return the PR/report link for Larm's combined checklist and precise shared-change requests to Codex; do not edit other lanes. No new assets/features/RPC/storage/shared props/packages, paid services or deployment changes. Codex reviews/merges/releases and runs one final genuine wallet session with Deston. QA target 3–4 October Singapore; backup 5 October, rehearsal 6 October.
```
