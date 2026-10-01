# Kym — pet release QA

**Task PET-RELEASE-QA complete · F2/F5 and QA PR #78 merged · updated 2 October 2026.**
Your personality panel (#67), earned-form viewer (#73), lead account-scope wiring
and pet QA/preview-selector fix (#78) are merged. No new coding or full repeat
of the QA brief is assigned. Do not reuse the merged `test/pet-release-qa` branch.

Your [dated report](../../src/components/pet/qa/PET_RELEASE_QA_2026-10-02.md)
is the completed handoff for Larm. Retain its NOT RUN rows. The lead subsequently
verified the exact production alias and the live same-page gallery/personality/
recap/cooldown combination in a separate [read-only follow-up](../qa/evidence/PET_QA_RELEASE_2026-10-02.md).
Those later observations do not rewrite your historical results or establish
the final signed-care/account/network session.

**Allowed:** `src/components/pet/**`. Reuse the three approved `/pets/*.png`
artworks. No new assets, routes, shared types, hooks, storage, RPC, dependencies
or changes to another owner's files.

**Verified product source, 2 October:** `62d487d5d4e1f7c7b26332753f042fcb91a748d8`
includes #78. Its exact-head/main CI and production deployment passed. For any
specifically requested follow-up, fetch current reviewed main and use a fresh
branch rather than pinning to this historical checkpoint.
The lead's combined automated checks and local browser
gallery checks passed; [status](../STATUS.md) records the exact coverage and
production verification. Final genuine wallet acceptance remains **NOT RUN**.
Preserve [your original handoff](../../src/components/pet/qa/F5-HANDOFF.md).

## If a reproduced pet regression needs a follow-up

1. Read the repository instructions, scope, ownership, setup and shared contract.
   State the focused regression and intended files before editing. Inspect
   `git status --short`, the current branch and any existing PR first.
2. Fetch `origin`. If the working tree is clean and no active follow-up exists,
   create a fresh descriptive branch from reviewed `origin/main`. If a follow-up is
   active, preserve its commits and uncommitted work; when clean, merge reviewed
   `origin/main` into it. Do not reset, force-push or overwrite an existing branch.
   Ask Codex to resolve confusing shared-file conflicts while continuing any
   independent QA that is safe to run.
3. Record the actual base/head SHA, browser, runtime URL, date and viewport for
   each run. A production alias does not prove its deployed commit; cite the
   lead's matching deployment evidence or label the revision unverified.

## Completed scope and remaining team acceptance

The following is the original QA scope, retained to guide targeted regressions.
Its actual completed checks and limitations are in the dated report, not implied
by this list. Larm coordinates remaining specialist checks and the lead owns
the [single final wallet session](../qa/FINAL_WALLET_SESSION.md).

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

## Validation for any requested follow-up

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

Original acceptance checklist (consult the report for actual results):

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

## Paste into Kym's agent after the merge

```text
Read the updated docs/finale/KYM.md. PET-RELEASE-QA PR #78 is reviewed, merged and deployed; your assigned implementation and QA handoff are complete. Preserve any unrelated local work and your original dated report, including NOT RUN rows. Do not reuse the merged branch or repeat the entire brief. Provide Larm the #78/report link for his combined checklist. Codex's separately dated live follow-up covers only its stated read-only same-page and alias checks; it does not establish final wallet acceptance. No new feature is assigned. If the lead supplies a reproducible pet regression, use a fresh branch from reviewed origin/main, fix only src/components/pet/**, run relevant checks, add dated evidence and open a small draft PR. Otherwise report that your lane is ready for final review/rehearsal. Do not initiate wallet prompts, change OS settings, edit other lanes, call paid services or merge/deploy yourself.
```
