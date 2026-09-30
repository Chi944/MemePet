# Finale: four lanes, one working product

**Approved 29 September 2026.** The team reports selection for the 7 October
finale and permission from OKX developers to continue building. This folder is
the current assignment set. It supersedes the earlier downloaded proposal where
scope differs. **Updated 1 October 2026:** the first wave of teammate components
is merged, including Kym's personality panel (#67) and Larm's release QA/focus
repair (#66). Their merge does not by itself establish integrated release or
wallet acceptance.

## What we are building

One clear demonstration: **care → confirmed progress → shared garden → Mochi
explains the evidence in a personality shaped by your interactions.**

The garden and bounded recap already use live adapters. The garden blooms at
**20 lifetime confirmed care actions** from the configured registry, including
earlier cares; this is a cosmetic app rule, not a contract reward. Explore and
Practise change a browser-local explanation style without changing earned
growth. Personality integration shipped in #68 (`3cd4b0a`); its live browser
checks and separate remaining wallet acceptance are recorded in [status](../STATUS.md).

The remaining build is deliberately small: an earlier-earned-form viewer, a
clearer recap/evidence layout, and combined presentation/recovery QA. Codex owns
integration, reliability and final release verification. A free OKX.AI service
can expose the same deterministic recap if authentication, registration and
invocation succeed; the registration packet is prepared, not an approved listing.
Optional model wording still needs a separate access/budget/abuse-control decision.

No second pet, token launchpad, contract migration, trading, autonomous signing,
new application or chat-history database. No invented community partnership,
holders, retention or model-training claims. Standard explanations are labelled.

## Assignments

| Human + coding agent | Build | Branch / instructions |
|---|---|---|
| Kym · F5 | View current/earlier earned forms while preserving actual progress | `feat/earned-stage-viewer` · [KYM.md](KYM.md) |
| Larm · F7 | Presentation/recovery QA, timed runbook and backup shot list | `test/finale-presentation-recovery` · [LARM.md](LARM.md) |
| YeeWei · F6 | Concise recap with accessible verified-evidence disclosure | `feat/companion-evidence-layout` · [YEEWEI.md](YEEWEI.md) |
| Codex in Deston's session | Reliability, shared interfaces/data, integration, tests, reviews and release | [CODEX.md](CODEX.md) |

**Deston:** privately handle necessary account setup, genuinely approve wallet
prompts, and run the final integrated check/rehearsal. Codex handles routine
coding, PR triage, conflict resolution and release work. The teammates each run
their own coding session, review its result and return a PR link.

## Start together without conflicts

1. Preserve any local work. The F0 foundation and first component PRs are already
   merged; do not rebuild them or reuse their merged branches for F5/F6/F7.
2. In a clean checkout, fetch `origin` and create your new assigned branch from
   the **current reviewed `origin/main`**, including later integration fixes.
   Record `git rev-parse HEAD` as the actual base in the PR. Do not reset to the
   original F0 commit or start from an unreviewed sibling branch.
3. Read [AGENTS](../../AGENTS.md), [scope](../PROJECT_BRIEF.md),
   [ownership](../OWNERSHIP.md), [setup](../DEV_SETUP.md),
   [shared contract](INTEGRATION.md) and your role sheet. Paste the starter prompt
   from your sheet into your agent. Each task builds real components and tests.
4. Open a draft PR early. Shared changes go to Codex as exact requests; do not
   create local substitutes for shared types or edit another owner's area.
5. Return each PR URL to the integration session. Codex cannot automatically see
   or control separate teammates' Claude sessions. These committed handoffs plus
   the PRs are the coordination record; messages are not assumed delivered.

Each teammate can proceed against the existing stable props and labelled
fixtures while Codex completes shared integration. Fixtures stay in
tests/development previews, never as live fallbacks.
Only Codex merges reviewed passing changes. A feature is not release-complete
because its isolated preview looks good.

**Completed foundation/history:** F0 interfaces merged in PR #55 (`c296e9e`);
[PR #57](https://github.com/Chi944/MemePet/pull/57) added the live adapters.
The garden (#59), recap (#61), live integration (#62), landing copy (#60),
read recovery (#64), motion control (#65), release QA/focus repair (#66) and
personality component (#67) are merged. Dated evidence records what each run
actually checked. [Exact adapter wiring](INTEGRATION.md#lead-adapters--30-september)
stays with Codex; teammates add no RPC calls, persistence, model client or API.
Personality's release checks are recorded in status; F5/F6/F7 need their own checks.
The historical automatic community-refresh failure remains recorded; genuine
wallet acceptance on the final combined release has not been replaced by tests.

## Milestones and evidence

| Target, Singapore time | Deliverable |
|---|---|
| 29 September | Merge foundation; three teammates start their branches |
| 30 September–1 October | Components/adapters; resolve reads; free OKX.AI service feasibility and optional model decision |
| 2 October | F5/F6 initial PRs and F7 runbook/QA; integrated feature-complete build; stop expanding scope |
| 3–4 October | Real wallet checks, recovery, later-day progress and usability |
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
