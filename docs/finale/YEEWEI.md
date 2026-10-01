# YeeWei — a recap judges can read quickly

**Task COMPANION-COMBINED-QA · F6 and its release QA fix merged in #72/#75 · branch `test/companion-combined-qa` · updated 2 October 2026.**
Your F3 and F6 implementation is complete. The lead's F6 review also corrects
already-available care wording and narrow-card date overflow. Preserve those
changes and #75's evidence-focus correction. Start any follow-up from current
reviewed `origin/main`; both the feature and previous release-QA branches are
merged. Do not reuse them or build another recap. Preserve and continue any
active unmerged combined-QA branch rather than recreating it.

**Allowed:** `src/components/companion/**`, `docs/qa/finale/yeewei/**`.
No routes, hooks, shared schemas/fixtures, API/RPC, persistence, dependencies or
other owners' files. Reuse installed components and supplied callbacks.

## Next: combined QA, 3–4 October

The approved feature scope is complete. Verified product source
`62d487d5d4e1f7c7b26332753f042fcb91a748d8` contains F5, F6 and Kym's completed
pet QA/preview fix #78, with production deployment `6794766512`. The
[current release evidence](../qa/evidence/PET_QA_RELEASE_2026-10-02.md) records
the time-bound alias-to-SHA check and a separate lead read-only combined check.
Fetch current reviewed main rather than pinning to this checkpoint. Check
[status](../STATUS.md) for production verification and the exact release to test.
Final genuine wallet acceptance is **NOT RUN** and belongs to one lead session.

Kym's [dated pet report](../../src/components/pet/qa/PET_RELEASE_QA_2026-10-02.md)
is complete. Cite it or the lead's follow-up only within their stated limits;
they do not replace your owned recap acceptance or establish a wallet pass.

- Verify the released recap at narrow/desktop widths and with keyboard access.
  Record the actual release SHA and URL. Use the existing labelled workbench
  for states you cannot genuinely obtain on the wallet route.
- Confirm questions and answers remain easy to reach, evidence opens/closes,
  full addresses remain readable, and care availability is attributed to its
  recorded block. Do not infer current eligibility from browser time.
- Help Larm's combined pass with the now-merged F5 gallery. Fix only reproduced companion
  presentation defects within your area; request shared changes from Codex.
- No fresh feature, model integration or wallet transaction is assigned here.
  Preserve unrun screen-reader/cross-browser/zoom checks until actually executed.

## Begin without losing work

1. Read the repository instructions, scope, ownership, setup and shared contract.
   State task `COMPANION-COMBINED-QA` and intended files before editing. Inspect
   `git status --short`, the current branch and any existing PR first.
2. Fetch `origin`. In a clean checkout with no active QA branch, create
   `test/companion-combined-qa` from reviewed `origin/main`. If that QA branch
   already has work, preserve it and, when clean, merge reviewed `origin/main`
   into it. Never reset, force-push or overwrite the branch. Bring confusing
   shared-file conflicts to Codex and continue independent checks meanwhile.
3. Record base/head SHAs, date, browser, runtime URL and viewport. A production
   URL alone does not verify its deployed SHA; use matching lead deployment
   evidence or mark that revision unverified. Existing dated reports remain
   historical evidence and are not automatically passes for the new run.

## Implemented F6 scope (reference)

- Rework the ready card so its first view answers "Where is my pet now?":
  current stage, growth, personal confirmed cares and next eligible care time.
  Keep question controls and the answer easy to reach. Do not bury them below
  a twelve-row technical table.
- Put detailed registry/block/observation evidence in a keyboard-accessible
  native `details` disclosure, "View verified evidence". Retain every existing
  source field. Keep the account, network, scope (MemePet activity only), and
  standard/AI/fixture provenance understandable even when details are closed.
- Use only supplied facts; do not calculate care-ready from browser time or add
  streaks, retention, transaction hashes, holder status or full-wallet history.
  Unknown community total remains unknown, distinct from personal care count.
- Preserve all current empty/loading/wrong-network/failure states and safe text
  rendering. A failed explanation cannot erase valid facts. Obsolete-context
  replies stay hidden. Source `standard` remains "Standard explanation".
- Kym owns the separate personality controls. Consume the supplied style as
  today; do not duplicate Explore/Practise, persistence or model calls.

## Acceptance and handoff

Test disclosure keyboard access, preserved evidence, answer visibility,
unknown/no-pet/failure distinctions and obsolete reply isolation. Inspect
320/390/1440px with long addresses and actual question/answer states. Keep
callback IDs and `CompanionPanelProps` unchanged. Run
`npm test -- src/components/companion`, `npm run typecheck` and `npm run lint`;
separate automated results from browser observations. Evidence-only updates
still report actual commands and limitations without claiming someone else's run.

Create `docs/qa/finale/yeewei/COMBINED_QA_<YYYY-MM-DD>.md` with the actual run date
and a small screenshot set in a sibling dated subfolder. If the day's report
exists, append a clearly dated run without overwriting previous observations.
Separate **local fictional previews**, **production read-only observations**
and **wallet checks NOT RUN**. Use the existing `/dev/companion` and
`/dev/finale` workbenches locally for otherwise inaccessible states; never imply
those routes or their data are production features. Browser/access limitations
are valid NOT RUN entries, not permission to invent coverage.

Completion checklist:

- [ ] Recap, bounded questions, answer and native evidence disclosure checked
  at 320/390/1440px, including keyboard focus and long addresses.
- [ ] Care-at-read wording, full source fields, source labels, unknown/no-pet/
  failed reads and obsolete-context reply isolation retain their distinctions.
- [ ] Recap checked beside F5 and personality; supplied facts and callbacks
  remain unchanged. Wallet context changes are reserved for the lead session.
- [ ] Actual commands/results, screenshots, runtime/SHA, defects and NOT RUN
  rows recorded with fixture versus production evidence clearly separated.
- [ ] Small draft PR opened for allowed fixes and/or evidence. If nothing needs
  fixing, an evidence-only PR is the expected completion artifact.

Give Larm the PR/report link and any blockers for his combined checklist; do not
edit his checklist or another member's reports. Send Codex exact reproductions
for shared types, adapters, routes or data faults instead of widening this lane.

Follow-up QA target **3–4 October, Singapore**. Return base/head SHAs,
screenshots, actual checks, limitations and precise shared integration requests.
Codex handles review, conflicts, merge and release.
Support backup capture on **5 October** and the timed rehearsal on **6 October**.
No additional coding is assigned to Deston; mock tests are not wallet evidence.

## Paste into YeeWei's agent

```text
Continue task COMPANION-COMBINED-QA in docs/finale/YEEWEI.md. F3/F6, #72/#75, handoffs #76/#77 and Kym's pet QA #78 are merged; do not rebuild them or reuse merged feature/release-QA branches. Read AGENTS.md, scope, ownership, setup, docs/finale/INTEGRATION.md and dated evidence. The verified product checkpoint is 62d487d5d4e1f7c7b26332753f042fcb91a748d8, production deployment 6794766512; docs/qa/evidence/PET_QA_RELEASE_2026-10-02.md records the time-bound alias-to-SHA proof and lead read-only check. Kym's src/components/pet/qa/PET_RELEASE_QA_2026-10-02.md is complete; cite its limits without repeating her brief or substituting it for your recap acceptance. Inspect local changes, branch and existing PR before fetching origin. Preserve active unmerged QA work; reconcile reviewed origin/main when clean. Only create test/companion-combined-qa if no active QA branch exists. Never reset/discard work, force-push or overwrite a branch. Record actual base/head SHAs and runtime details, checking current status for later releases. Verify recap/disclosure/answer readability, keyboard focus, source labels and unknown/stale states at 320/390/1440px, alongside F5 and personality. Fix only reproduced companion defects in src/components/companion/**. Create docs/qa/finale/yeewei/COMBINED_QA_<actual-date>.md with screenshots, commands/results and NOT RUN rows, separating local fictional previews, production read-only observations and wallet evidence. Preserve care-at-read wording, date-width and #75 focus fixes. Do not trigger wallet prompts, change OS settings or add features, fetching/storage/models/routes/shared props/packages or paid services. Run documented checks and open a small draft PR, including an evidence-only PR if no fixes are needed. Return the PR/report link for Larm's combined checklist and exact shared-change requests to Codex; do not edit other lanes. Codex reviews/merges/releases and coordinates the prepared docs/qa/FINAL_WALLET_SESSION.md with Deston. QA 3–4 October Singapore; backup 5 October, rehearsal 6 October.
```
