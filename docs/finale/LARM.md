# Larm — finale presentation and recovery readiness

**Latest:** B1/#90 is merged and the lead has prepared live integration.
Use [current beta tasks](../beta/START_HERE.md) for release QA and acceptance;
do not restart delivered feature work.

## Current assignment — 2 October 2026

F7/#70, finale QA/#86 and B3 help content/#87 are merged. Verify real Help wording/links after integration and maintain the acceptance index. Preserve the runtime-version discrepancy and screenshot limits in dated finale evidence.

Use [the current beta brief](../beta/LARM.md)
for new work and [current progress](../STATUS.md#progress-measurement).
The older task instructions below are retained as finale requirements/history;
do not recreate merged branches. Genuine wallet acceptance, backup capture
and rehearsal remain separate from implementation and simulated checks.

**Current assignment:** [B3 support copy and focused verification](../beta/LARM.md).
The 2 October beta brief adds a deliberately smaller lane. Preserve unfinished
finale QA/runbook work below on its existing branch. B0 is merged in #80, so
start B3 now. Codex reviews and merges passing PRs; teammates do not merge.

**Current task F7 combined QA · branch `test/finale-combined-qa` · updated 2 October 2026.**
Garden, landing and QA PRs #59/#60/#63/#66/#70 are merged. PR #70 completed the
initial presentation audit, Ask Mochi landing step, garden-track contrast,
runbook, judge Q&A and backup shot list. Do not redo them or reuse the merged
branch. Start the follow-up from current reviewed `origin/main`; preserve the
lead's counter/retry and block-time corrections.
This lane improves and proves the existing experience; it does not add a new system.
F5/#73, F6/#72/#75 and Kym's completed pet QA/preview fix #78 are merged. The
approved feature scope is complete; verified product source is
`62d487d5d4e1f7c7b26332753f042fcb91a748d8`, production deployment `6794766512`.
Use [status](../STATUS.md) for production verification and the exact release to
check. Final genuine wallet acceptance remains **NOT RUN**.

**Allowed:** `src/components/landing/**`, `src/components/community/**`,
`docs/qa/finale/larm/**`, `docs/finale/COMMUNITY_CANDIDATE.md`.
No pet/recap components, routes, hooks, fixtures, shared types, settings, packages
or deployment changes. Request shared test harness needs from Codex.

## Continue now — order of work

1. Preserve local work, fetch main and continue `test/finale-combined-qa` if it
   is already active and unmerged. Otherwise create that QA branch from current
   reviewed main. Never reuse the merged #70 branch, reset local work or force
   a merge conflict. Record the actual checkout/base/head and runtime.
2. Read the [release identity and handoff](START_HERE.md#release-identity-and-common-handoff)
   and [current lead evidence](../qa/evidence/PET_QA_RELEASE_2026-10-02.md).
   Product `62d487d` is the verified checkpoint, deployment `6794766512`; the
   evidence records the current alias-to-SHA check. Do not assume current main
   is the hosted runtime or that a mutable alias still serves that checkpoint.
   Preserve the earlier combined run as dated historical evidence.
3. Copy [COMBINED_REGRESSION_CHECKLIST.md](../qa/finale/larm/COMBINED_REGRESSION_CHECKLIST.md)
   to `docs/qa/finale/larm/COMBINED_QA_<actual-run-date>.md`. Start rows as NOT RUN,
   record results there and keep the template reusable. Run hosted no-wallet
   rows and local fixture rows, identifying the evidence type for each.
4. Execute [READ_RECOVERY.md](../qa/READ_RECOVERY.md) on the named local build:
   observe a real unavailable read, restore the upstream, click the read-only
   retry and record the result. Run its helper checks and complete its teardown.
   A fixture error or another person's recovery report is not your execution.
5. Fix reproduced landing/community presentation defects only. For pet, recap,
   routes or data defects, include exact steps and refer them to the named owner
   or Codex. Continue independent checks; do not hold all QA for one blocked row.
6. Reconcile [FINALE_RUNBOOK.md](../qa/finale/larm/FINALE_RUNBOOK.md),
   [BACKUP_SHOT_LIST.md](../qa/finale/larm/BACKUP_SHOT_LIST.md) and
   [JUDGE_QA_PREP.md](../qa/finale/larm/JUDGE_QA_PREP.md) with the actual UI.
   Update in place instead of making rival scripts. Resolve the specific notes
   below, keeping the live pitch to about three minutes.
7. Return an evidence/fix PR and coordinate teammate report links in your
   combined report. Kym's [#78 report](../../src/components/pet/qa/PET_RELEASE_QA_2026-10-02.md)
   is complete and ready to cite, retaining its NOT RUN rows. Cite the separate
   lead read-only follow-up only for its stated coverage. YeeWei's combined
   report remains pending until received; do not wait for it to complete your
   independent work. Label external results as cited, never personally rerun.

## Checks to cover

- Check the integrated overview/community at 320/390/1440px and keyboard-only.
  Verify the focus-ring repair, garden total/remaining cares, network distinction
  and reference wording. Fix only reproduced presentation defects in your area.
- Update the three-minute pitch/fallback runbook for the finished loop: real
  care and confirmed growth, the shared garden, local explanation style, and a
  Standard explanation with evidence. Leave timing for confirmations. No claim
  of trained intelligence, organic traction, marketplace listing or partnership.
- Prepare the controlled unavailable-to-recovered read check with Codex. A
  labelled fixture can verify appearance/callback only; genuine recovery needs
  an actual failing read then a successful read on a named runtime. Do not change
  public deployment settings or disable security to cause failure. If the lead
  has not supplied a safe local setup, leave that execution pending and continue
  the independent checks. The [local recovery setup](../qa/READ_RECOVERY.md) is
  now available; it needs no wallet, deployment changes or OS changes. Codex's
  dated execution evidence is separate from your own run and from the final
  combined-release regression.
- Perform one combined presentation regression on Codex's
  release SHA: narrow layouts, source/provenance visibility, clear read-only
  controls, production `/dev/*` gates, motion on/off and keyboard access. Honour
  the approved Mochi-only motion exception; never change Deston's OS setting.
- Prepare a short backup shot list, with permanent "Recorded [date] — not live"
  label. Coordinate transaction capture with Codex's planned lead session;
  read-only shots can be prepared independently. Don't call the plan footage or
  mark unperformed wallet checks passed. Keep original submission media intact.

## Known demo-document updates to verify

- The runbook still describes `7d4144b` and F6 as unmerged. Identify the actual
  checked runtime and reflect the merged layout. Open **View verified evidence**
  before pointing to **Read block** in both the runbook and backup shot 8.
- Align backup zoom/framing with the runbook after checking the real layout:
  the shot list says 100–125%, while the earlier 1080p readability run used 150%.
  This is a verification task, not permission to claim a new zoom check passed.
- The Q&A contains historical totals of 7 and 2 personal cares. Preserve their
  dates; use actual on-screen values in the pitch. Do not attribute later
  community increments to the team without event evidence.
- Keep `QA_MATRIX.md` and dated past runs as historical evidence. The fresh
  combined checklist is the execution plan. Local overview recovery does not
  establish automatic post-care read-back or the final wallet checks.

## Acceptance and handoff

Keep historical failures and dates. Record exact SHA, URL/runtime, viewport,
observed result, reproducible issues and NOT RUN cases. The counter measures
care actions, not people; the recorded demo wallets are already attributed to
Deston in the lead's evidence. Don't ask him to confirm them again.

Target combined QA **3–4 October, Singapore**, backup **5 October**, timed
rehearsal **6 October**. Reuse the completed runbook and shot list; refine them
only to match verified final behavior. No extra feature or Deston coding task.
Run relevant component tests/typecheck/lint for any source fix and record the
actual commands/results. No full test rerun is required merely for editing prose.
Return a small draft PR, even if evidence-only; mark it ready after your owned
checks and handoff are complete, preserving unavailable rows as NOT RUN.
Codex merges/releases. Wallet prompts stay with Deston
in one planned final session, not scattered requests from each lane.

## Paste into Larm's agent

```text
Continue MemePet task F7: combined finale QA and demo readiness. Start now; target completion is 3–4 October, Singapore.

Read AGENTS.md, docs/PROJECT_BRIEF.md, docs/OWNERSHIP.md, docs/DEV_SETUP.md, docs/finale/START_HERE.md, docs/finale/INTEGRATION.md and docs/finale/LARM.md. All approved features and PRs #70/#72/#73/#75/#76/#77/#78 are merged. Preserve local work, fetch origin and safely update your existing unmerged test/finale-combined-qa branch; create it from current reviewed origin/main only if it does not exist. Do not restart finished features or reset/force-push. Record checkout and deployed SHAs separately: 62d487d5d4e1f7c7b26332753f042fcb91a748d8 is the verified product checkpoint, production deployment 6794766512. Read docs/qa/evidence/PET_QA_RELEASE_2026-10-02.md for time-bound alias-to-SHA proof and the lead's read-only follow-up; consult current status for later releases.

Copy docs/qa/finale/larm/COMBINED_REGRESSION_CHECKLIST.md into a dated COMBINED_QA_<actual-run-date>.md result file. Run the no-wallet hosted checks, 320/390/1440px layouts, keyboard/focus, garden/reference labels, public earned forms and production dev-route gates. Use clearly labelled local fixtures for unavailable states. Execute docs/qa/READ_RECOVERY.md for a real local failed-read → read-only retry → recovered-read check, record what happened and complete teardown. Do not treat fixtures or prior reports as your own new verification.

Fix only reproduced presentation defects in src/components/landing/** and src/components/community/**. Evidence and demo documentation belong in docs/qa/finale/larm/**; docs/finale/COMMUNITY_CANDIDATE.md is also allowed. Refer pet/recap/shared-data defects to their owners/Codex. No new features, contracts, RPC adapters, dependencies, deployment settings, wallet requests, paid services or OS-setting changes.

Update the existing FINALE_RUNBOOK.md, BACKUP_SHOT_LIST.md and JUDGE_QA_PREP.md to match verified behavior, following the stale-document notes in your role sheet. Keep the pitch around three minutes, show confirmed progress/garden/local personality/Standard explanation with evidence, and prepare a clearly labelled recorded fallback. Keep historical evidence and original media. Cite Kym's completed src/components/pet/qa/PET_RELEASE_QA_2026-10-02.md report and the separate lead follow-up, preserving each record's limits; do not ask her to repeat the finished brief. Add YeeWei's combined report when received. Do not edit their files or claim cited checks as your own. Final wallet actions and transaction capture follow docs/qa/FINAL_WALLET_SESSION.md in one Codex/Deston session; do not wait for those to finish your independent work.

Commit/push your scoped work and return a small draft PR, including an evidence-only PR if no defects are found. Report base/head SHAs, runtime, actual checks/screenshots, FAIL/NOT RUN rows and precise lead requests. Mark ready when your owned work is complete. Codex reviews/merges/releases. Backup target: 5 October; rehearsal: 6 October. No routine coding work is assigned to Deston.
```
