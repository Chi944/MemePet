# Finale: four lanes, one working product

**Approved 29 September 2026.** The team reports selection for the 7 October
finale and permission from OKX developers to continue building. This folder is
the current assignment set. It supersedes the earlier downloaded proposal where
scope differs; it does not claim these features have shipped.

## What we are building

One clear demonstration: **care → confirmed progress → shared garden → Mochi
explains the evidence in a personality shaped by your interactions.**

1. Codex fixes and verifies the existing automatic community read-back failure.
2. Larm builds a credible community reference and a garden that blooms at **20
   lifetime confirmed care actions** from the configured registry. Existing cares
   count; this is a new cosmetic app rule, not a contract reward or token launch.
3. YeeWei builds a bounded MemePet recap with evidence and useful questions.
4. Kym makes Explore/Practise interactions visibly shape Mochi's explanation
   style, reusing the three existing stage artworks.
5. Codex supplies verified data, isolated local personality storage, standard
   explanations and integration. A real free OKX.AI service can expose the same
   deterministic recap if registration and invocation succeed; optional model
   wording needs a separate access/budget/abuse-control decision.

No second pet, token launchpad, contract migration, trading, autonomous signing,
new application or chat-history database. No invented community partnership,
holders, retention or model-training claims. Standard explanations are labelled.

## Assignments

| Human + coding agent | Build | Branch / instructions |
|---|---|---|
| Kym | Pet interactions, personality and stage presentation | `feat/finale-pet` · [KYM.md](KYM.md) |
| Larm | Community reference, 20-care garden, landing and independent QA | `feat/finale-community` · [LARM.md](LARM.md) |
| YeeWei | Read-only recap, questions, evidence and response states | `feat/finale-companion-ui` · [YEEWEI.md](YEEWEI.md) |
| Codex in Deston's session | Reliability, shared interfaces/data, integration, tests, reviews and release | [CODEX.md](CODEX.md) |

**Deston:** privately handle necessary account setup, genuinely approve wallet
prompts, and run the final integrated check/rehearsal. Codex handles routine
coding, PR triage, conflict resolution and release work. The teammates each run
their own coding session, review its result and return a PR link.

## Start together without conflicts

1. Codex lands the reviewed **F0 foundation** first. Do not build against the old
   main while F0 is in review. Its PR and merge commit are the start signal.
2. In a clean checkout, fetch `origin` and create your assigned branch from that
   reviewed `origin/main`. Record `git rev-parse HEAD` as the base in the PR. No
   base SHA is invented here; every lane uses the actual merged F0 revision.
3. Read [AGENTS](../../AGENTS.md), [scope](../PROJECT_BRIEF.md),
   [ownership](../OWNERSHIP.md), [setup](../DEV_SETUP.md),
   [shared contract](INTEGRATION.md) and your role sheet. Paste the starter prompt
   from your sheet into your agent. Each task builds real components and tests.
4. Open a draft PR early. Shared changes go to Codex as exact requests; do not
   create local substitutes for shared types or edit another owner's area.
5. Return each PR URL to the integration session. Codex cannot automatically see
   or control separate teammates' Claude sessions. These committed handoffs plus
   the PRs are the coordination record; messages are not assumed delivered.

Each teammate can proceed against labelled fixtures while Codex builds live
adapters. Fixtures stay in tests/development previews, never as live fallbacks.
Only Codex merges reviewed passing changes. A feature is not release-complete
because its isolated preview looks good.

## Milestones and evidence

| Target, Singapore time | Deliverable |
|---|---|
| 29 September | Merge foundation; three teammates start their branches |
| 30 September–1 October | Components/adapters; resolve reads; free OKX.AI service feasibility and optional model decision |
| 2 October | Integrated feature-complete build; stop expanding scope |
| 3–4 October | Real wallet checks, recovery, later-day progress and usability |
| 5 October | Code freeze except blockers; record a labelled backup demo |
| 6 October | Timed three-minute rehearsal and venue/network fallback |
| 7 October | Finale; invitation says arrive by 11am |

Known starting main is `fa78ed0459f9e1cddd9a84e5100c91da682339d1`. It is a
**known pre-finale baseline, not proof of the exact submitted commit**. Preserve
the original video and dated QA. [Previous wallet evidence](../qa/evidence/LATEST_RELEASE_QA_2026-09-24.md)
records a genuine automatic community refresh failure followed by successful
read-only retry; do not change that record to a pass. Network-away/back and
normal-motion playback were not run. Respect Deston's reduced-motion preference.

The [status](../STATUS.md) separates the submission release from the new finale
work. New PRs and dated evidence describe later changes. Complete the attendance
step in the actual invitation; its link/deadline were not visible in the crop.
