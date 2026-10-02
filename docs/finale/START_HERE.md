# Finale: four lanes, one working product

**New assignment override, 2 October:** the user added the
[testnet beta lanes](../beta/START_HERE.md). Use those role prompts for new
features and retain this folder for finale acceptance/history. Deston now merges
PRs; older Codex-merge wording below is superseded. Final wallet acceptance is
still separate and unrun, and live transaction recovery must wait for it.

**Approved 29 September 2026.** The team reports selection for the 7 October
finale and permission from OKX developers to continue building. This folder is
the current assignment set. It supersedes the earlier downloaded proposal where
scope differs. **Updated 2 October 2026:** the approved feature scope is complete.
Kym's earned-form viewer (#73), its lead route wiring, YeeWei's recap (#72),
evidence-focus follow-up (#75) and Kym's pet QA/preview fix (#78) are merged.
Verified product source is `62d487d5d4e1f7c7b26332753f042fcb91a748d8`.
See [status](../STATUS.md) for exact
release verification; merging and automated tests do not establish final wallet
acceptance, which remains **NOT RUN**.

## What we are building

One clear demonstration: **care → confirmed progress → shared garden → Mochi
explains the evidence in a personality shaped by your interactions.**

The garden and bounded recap already use live adapters. The garden blooms at
**20 lifetime confirmed care actions** from the configured registry, including
earlier cares; this is a cosmetic app rule, not a contract reward. Explore and
Practise change a browser-local explanation style without changing earned
growth. Personality integration shipped in #68 (`3cd4b0a`); its live browser
checks and separate remaining wallet acceptance are recorded in [status](../STATUS.md).

The earned-form gallery and clearer recap/evidence layout are implemented. The
remaining work is combined presentation/recovery QA, one final wallet session,
backup capture and rehearsal. Codex owns reliability and release verification.
A free OKX.AI service
can expose the same deterministic recap if authentication, registration and
invocation succeed; the registration packet is prepared, not an approved listing.
Optional registration/invocation remain unverified and are not release blockers.
Paid integrations are not authorized for this work and stay inactive. No billable model
call, purchase or trial is authorized. The working Standard explanation is the
release path.

No second pet, token launchpad, contract migration, trading, autonomous signing,
new application or chat-history database. No invented community partnership,
holders, retention or model-training claims. Standard explanations are labelled.

## Assignments

| Human + coding agent | Next responsibility | Branch / instructions |
|---|---|---|
| Kym · F2/F5 and pet QA complete | #78 handed off; available for reproduced pet regressions only | Do not reuse merged `test/pet-release-qa` · [KYM.md](KYM.md) |
| Larm · F7 | Combined presentation/recovery QA; final runbook and backup coordination | `test/finale-combined-qa` · [LARM.md](LARM.md) |
| YeeWei · F6 complete | Recap/disclosure combined QA; preserve #75 focus repair | `test/companion-combined-qa` · [YEEWEI.md](YEEWEI.md) |
| Codex in Deston's session | Exact release verification, fixes/reviews, one final wallet session and freeze | [CODEX.md](CODEX.md) |

**Deston:** privately handle necessary account setup, genuinely approve wallet
prompts, and run the final integrated check/rehearsal. Codex handles routine
coding, PR triage, conflict resolution and release work. The teammates each run
their own coding session, review its result and return a PR link.

## Start together without conflicts

**Start now; 3–4 October is the completion target, not a start gate.** Each
teammate can run their independent checks without waiting for another lane.

1. Preserve any local work. F0 and the approved feature PRs are merged; do not
   rebuild them or reuse merged feature/QA branches. Preserve an active Larm
   follow-up and reconcile it safely rather than restarting it.
2. Inspect status/branch and fetch `origin`. Start a new task from the **current
   reviewed `origin/main`**, including later integration fixes. If the assigned
   unmerged QA branch already has work, preserve it and reconcile main safely;
   do not restart it or overwrite a dirty checkout. Record the actual base/head
   in the PR. Do not reset to F0 or use an unreviewed sibling branch.
3. Read [AGENTS](../../AGENTS.md), [scope](../PROJECT_BRIEF.md),
   [ownership](../OWNERSHIP.md), [setup](../DEV_SETUP.md),
   [shared contract](INTEGRATION.md) and your role sheet. Paste the starter prompt
   from your sheet into your agent. Current tasks verify the combined build and
   fix reproduced defects; no new features are assigned.
4. Open a small draft PR for evidence or necessary fixes. Shared changes go to Codex as exact requests; do not
   create local substitutes for shared types or edit another owner's area.
5. Return each PR URL to the integration session. Codex cannot automatically see
   or control separate teammates' Claude sessions. These committed handoffs plus
   the PRs are the coordination record; messages are not assumed delivered.

Each teammate can proceed with independent combined QA against the existing
stable props and labelled fixtures. Fixtures stay in tests/development previews,
never as live fallbacks. Earlier reports that F5/F6 were unstarted or still under
construction are superseded by merged #72/#73/#75. Lead account-scope wiring is
also merged. Use the updated role sheets from current main rather than an old
copied build prompt; retain NOT RUN rows and keep mock tests separate from real
wallet evidence. Final wallet prompts belong to one planned Codex/Deston session.
Only Codex merges reviewed passing changes. A feature is not release-complete
because its isolated preview looks good.

## Release identity and common handoff

The verified product checkpoint is `62d487d5d4e1f7c7b26332753f042fcb91a748d8`,
Production deployment `6794766512`. Vercel's API resolved the public alias to
READY deployment `dpl_28SRHMBY4m1ojxe8c5zCRpwEXriG` at this SHA. Its PR/main
checks passed. Fetch current main before starting and consult [status](../STATUS.md)
and [current release evidence](../qa/evidence/PET_QA_RELEASE_2026-10-02.md).
Later docs-only commits do not imply that another browser run occurred.
Record checkout SHA and deployed SHA separately. If a hosted SHA cannot be
established, say so; never infer it merely from a successful local build.

Each lane returns one small PR with:

- A dated report under its allowed QA folder: actual runtime/URL, SHA, viewport,
  browser, commands/results, screenshots and PASS/FAIL/NOT RUN rows.
- Reproduced defects with steps and expected/actual behavior. Fix only owned
  presentation files; refer shared defects to Codex and keep working elsewhere.
- Links to original evidence for any reused result. A teammate's report is
  cited evidence, not a check personally rerun by the receiving agent.
- Any changes to the existing demo material required by verified behavior.
  If no defect is found, return an evidence-only PR; do not invent code changes.
- A final handoff with PR URL, base/head commits, remaining blockers and exact
  lead requests. Start as draft and mark ready when the agreed work is complete;
  retain justified NOT RUN rows rather than claiming unavailable checks passed.

Kym's [completed #78 report](../../src/components/pet/qa/PET_RELEASE_QA_2026-10-02.md)
and the lead's live same-page follow-up are ready for Larm to cite. Her unrun
cases remain explicit; the lead's follow-up closes only its stated read-only gap.
The [final wallet session](../qa/FINAL_WALLET_SESSION.md) is prepared; private
approvals stay consolidated there. No teammate needs to initiate wallet prompts.

Larm maps the three reports into the combined checklist; Kym and YeeWei keep
their own results in their folders to avoid simultaneous edits. Codex owns
shared fixes, release verification and the single genuine wallet session.
All observed counts/stages are time-bound snapshots, not permanent demo values.

**Completed foundation/history:** F0 interfaces merged in PR #55 (`c296e9e`);
[PR #57](https://github.com/Chi944/MemePet/pull/57) added the live adapters.
The garden (#59), recap (#61), live integration (#62), landing copy (#60),
read recovery (#64), motion control (#65), release QA/focus repair (#66) and
personality component (#67) are merged. Dated evidence records what each run
actually checked. [Exact adapter wiring](INTEGRATION.md#lead-adapters--30-september)
stays with Codex; teammates add no RPC calls, persistence, model client or API.
Personality's release checks and later F5/F6 checks remain dated in status;
final combined acceptance and F7 follow-up are separate remaining work.
The historical automatic community-refresh failure remains recorded; genuine
wallet acceptance on the final combined release has not been replaced by tests.

## Milestones and evidence

| Target, Singapore time | Deliverable |
|---|---|
| 29 September | Merge foundation; three teammates start their branches |
| 30 September–1 October | Components/adapters; resolve reads; free OKX.AI service feasibility and optional model decision |
| 2 October | F5/F6 merged; approved features complete; combined checks and release verification |
| 3–4 October | Teammate combined QA and recovery; one planned final lead wallet session; later-day progress where genuinely available |
| 5 October | Code freeze except blockers; record a labelled backup demo |
| 6 October | Timed three-minute rehearsal and venue/network fallback |
| 7 October | Finale; invitation says arrive by 11am |

Known starting main is `fa78ed0459f9e1cddd9a84e5100c91da682339d1`. It is a
**known pre-finale baseline, not proof of the exact submitted commit**. Preserve
the original video and dated QA. [Previous wallet evidence](../qa/evidence/LATEST_RELEASE_QA_2026-09-24.md)
records a genuine automatic community refresh failure followed by successful
read-only retry; do not change that record to a pass. Network-away/back and
normal-motion playback were not run at that checkpoint. Later motion evidence
is separate. Respect the device preference outside Deston's explicitly approved
Mochi-artwork exception and preserve the saved Animate Mochi off control.

The [status](../STATUS.md) separates the submission release from the new finale
work. New PRs and dated evidence describe later changes. Complete the attendance
step in the actual invitation; its link/deadline were not visible in the crop.
