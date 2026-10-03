# Testnet beta: four people, independent build lanes

## Current handoff — 3 October, B5 released; genuine recovery check pending

The [repaired-release retest](../qa/evidence/READ_REPAIR_2026-10-03.md) records
**scoped genuine wallet acceptance PASS for `fa07032`** and satisfies the B5
integration prerequisite. The [earlier Account 4 read-back failure](../qa/evidence/FINAL_WALLET_2026-10-03.md)
remains historical FAIL. Initial OKX connection failures and observation limits
remain explicit; the pass covers the observed final paths, not every wallet path.
Reviewed B5 [PR #102](https://github.com/Chi944/MemePet/pull/102) merged at
`36b9ba8` from runtime head `4477df2`, after all PR CI and the Vercel preview
passed. Main CI also passed, and the production alias was independently
resolved to a READY deployment built from `36b9ba8`.
[B5 evidence](../qa/evidence/B5_RECOVERY_2026-10-03.md) records 815 passing app
tests, eight passing recovery browser cases and all 29 passing simulated browser
cases. Genuine changed-release B5 recovery remains **NOT RUN**. This does not
reopen completed teammate implementation or inherit the earlier wallet pass.

B0–B4 are integrated through #92. Reviewed #93/#95 complete Larm's released
Help verification and YeeWei's combined B1/Help QA. Kym's implementation is
complete. Do not restart their completed feature or QA branches.

The reviewed merge earns the four implementation points: **96/100 overall,
47/51 lead (about 92%), B5 6/8**. Remaining: genuine B5 recovery acceptance (2 points),
a delivered and independently playable backup (1), and rehearsal (1). The earlier
scoped wallet acceptance retains its 2 points. Backup and rehearsal do not gate
B5 engineering.
Codex handles acceptance preparation; Deston retains private approvals,
product review and rehearsal, with no routine coding assigned.

- Kym: finish the focused released B1 visual check if not already done; report
  only new reproducible findings. No extra features or repeated full QA sweep.
- YeeWei: retain #95 evidence and cite the lead's eight passing B5 simulated
  scenarios. Do not rebuild the adapter or repeat completed QA; report only new
  scoped defects. Genuine B5 acceptance remains lead-coordinated.
- Larm: deliver the actual four documented read-only clips to Deston outside
  Git, then rehearse the updated runbook/Q&A. Clip filenames/checksums alone
  do not establish delivery or offline playback.

Use each named brief for the paste-ready continuation. External sessions have
not automatically received these changes. Mainnet and paid services remain out
of scope.

## Earlier requirements and handoffs

Approved by Deston on **2 October 2026**, after the finale feature handoff.
This is additional scope, not unfinished work retroactively assigned to the
finale. Preserve the existing release and its dated evidence. Final genuine
wallet acceptance follows [the session plan](../qa/FINAL_WALLET_SESSION.md);
the latest result is linked above. New simulated tests cannot close it.

**Latest authorization, 2 October:** the lead Codex session now merges reviewed,
passing PRs as well as handling shared engineering, conflicts and release
checks. This supersedes the earlier same-day Deston-only merge instruction.
The teammates open PRs and never merge themselves. Deston retains final product
checks and private wallet approvals; no routine coding is assigned to him.

**Start now:** B0 is merged in [PR #80](https://github.com/Chi944/memepet/pull/80)
at `99086a3`. The shared types, fixtures, read budgets, pinned tooling and
simulated-browser harness are available on main. B1/B2/B3 are independent and
do not need to wait for B4 wallet integration. B4 is the current lead task;
its implementation, merge and live acceptance are separate checkpoints.

**Current checkpoint — after #88:** B0/#80, B4 provider selection/#81,
pure adapter/recovery preparation/#82, YeeWei B2/#83 and recap QA/#84,
lead retry/preview integration/#85, Larm finale QA/#86 and B3/#87 are merged.
Help integration #88 is merged and live at `/help`, connecting Larm's real
content to YeeWei's HelpPanel. Its main CI and deployment checks passed. Kym's B1
has no pushed handoff verified at this checkpoint; Deston confirms she is
working locally. Keep her lane intact.
Recovery presentation exists, but B5 persistence/runtime remains gated.

**Current tasks:** Kym continues B1; YeeWei reviews the integrated Help page
and later B1 combined panels; Larm verifies rendered copy/links and updates his
acceptance index. Codex integrates, tests and merges. Deston has only final
review, private wallet approvals and rehearsal: [his brief](DESTON.md).
Use [the weighted progress table](../STATUS.md#progress-measurement) rather
than comparing old finale percentages with this larger beta scope.
The start-branch table below records original lanes; named role sheets take
precedence for completed branches and their follow-up work.

## Work split

| Lane | Deliverables | Start branch | Brief |
|---|---|---|---|
| B0 / Codex | Shared contracts/fixtures; bounded reads; pinned tools; browser-test harness | `feat/beta-foundation-and-team-briefs` | [Integration](INTEGRATION.md) |
| B1 / Kym | Wallet-choice and onboarding UI; local reset-time explanation; post-Guardian milestones and garden chapters | `feat/beta-onboarding-progression` | [Kym](KYM.md) |
| B2 / YeeWei | Recovery UI, Help UI and automated browser scenarios | `feat/beta-recovery-help-regression` | [YeeWei](YEEWEI.md) |
| B3 / Larm | Verified FAQ/support copy and a focused acceptance index | `docs/beta-help-and-acceptance` | [Larm](LARM.md) |
| B4 / Codex | Provider discovery/selection, adapters, routes and component integration | `feat/beta-wallet-selection` | [Integration](INTEGRATION.md) |
| B5 / Codex, **after acceptance** | Public-hash journal and read-only transaction recovery integration | `feat/beta-pending-recovery` | [Integration](INTEGRATION.md) |

Kym and YeeWei each have two substantial product areas. Larm's lane is
deliberately smaller: no new feature component, wallet code or browser harness.
These are workload assignments, not completion percentages. The work is free
local/open-source engineering; there is no new paid provider or infrastructure.

## Coverage of both requests

| Requested improvement | Owner / completion gate |
|---|---|
| Easier onboarding, mobile guidance, test gas, local care time | B1 UI + B4 adapter; mobile wallet's browser supported first, no unimplemented WalletConnect promise |
| A reason to return after Guardian / first garden bloom | B1; purely cosmetic milestones at 5/10/20 personal cares and garden chapters at 20/50/100 lifetime community cares |
| Interrupted transaction recovery / resume after refresh | B2 presentation + B5 runtime; one task, **not two implementations**; only after final acceptance |
| Help, support and on-chain versus local explanation | B3 content + B2 Help UI + B4 `/help` route/navigation |
| Consistent slow-network recovery | B0 explicit request/total budgets, transient retry policy and stale-result tests |
| Reproducible contract checks | B0 fixed Foundry, installer and forge-std references; real clean-install tests |
| Browser regression for account/stale/failure/combined cases | B0 harness, B2 scenarios; all labelled simulated wallet tests |
| Explicit MetaMask or OKX selection | B1 chooser + B4 pinned provider; no automatic preference when both are installed |

## Parallel start and delivery order

1. B0 is already reviewed and merged in #80 (`99086a3`). Do not branch from an
   unreviewed sibling PR or silently cherry-pick its interfaces.
2. Each teammate preserves local work, fetches `origin`, and starts the named
   branch from reviewed `origin/main` containing B0. Record the actual base SHA.
   Separate clones/worktrees are required for simultaneous coding sessions.
   If the named branch already has unpublished work, preserve it and continue
   there; inspect before reconciling current main. Never reset, force-push or
   discard changes to satisfy a start instruction.
3. B1/B2/B3 build simultaneously using the shared props/fixtures. YeeWei can use
   test-only FAQ samples while Larm writes content. No lane is blocked on another
   lane's presentation. Open a small draft PR early; split component/scenario
   commits for review. Existing finale QA reports remain valid only for the
   releases they actually tested; finish their outstanding rows separately.
4. Codex reviews exact heads, runs integrated checks and prepares conflict fixes.
   Codex merges passing B3, B1 and B2 PRs when ready; order between independent
   UI PRs is flexible. B4 supplies actual provider selection and initial lead
   route controls while Kym develops the full chooser/onboarding presentation.
   Codex replaces the initial controls with her components and wires counts
   and Help after those PRs land. A fixture-ready component is not yet a
   released live feature.
5. Complete the existing genuine wallet acceptance on an identified release
   before enabling B5. Finish its pure helpers/mock tests in advance if useful,
   but do not ship persistence/recovery runtime before that gate.
6. Changes to wallet behavior require a new scoped acceptance on the changed
   release. Do not inherit an earlier pass. Freeze a reviewed finale candidate
   for the 5 October capture / 6 October rehearsal; unfinished beta work stays
   on branches and must not destabilize the 7 October demonstration.

Every handoff includes PR URL, base/head, changed files, commands/results,
viewing steps or screenshots, limitations and requested lead work. Preserve
FAIL/NOT RUN rows. External teammate Claude sessions are not automatically
messaged; send each person the prompt in their brief and return their PR here.

## How far from mainnet (the earlier item 6)?

This is still a **testnet product**, not a mainnet release candidate. There is
no meaningful mainnet percentage from the finale feature-completion number.
The additions above make a better beta; mainnet requires these separate gates:

| Gate | Present status / owner |
|---|---|
| Final genuine wallet acceptance; new provider/recovery acceptance | Scoped `fa07032` wallet acceptance PASS; genuine changed-release B5 recovery NOT RUN |
| Beta lanes integrated and regression suite green | B0–B5 implementation merged, checked and production verified through #102; genuine B5 recovery NOT RUN |
| Small real-user pilot with repeat use and support feedback | Not started / team recruits consented testers; no fabricated retention metrics |
| Focused independent contract/security review; material findings resolved | Not completed / coordinate review, no automatic paid commission |
| Decide fresh mainnet start versus testnet migration | Undecided / team decision; migration is separate contract/product scope |
| Support owner/contact, read-only health checks and release/rollback runbook | To establish / Larm content and lead operations; alerts only if actually configured |
| Mainnet configuration/deployment verification and gas budget | Not authorized or deployed / Deston approval required before spending |

Planning estimate, **not a deadline promise**: roughly **1–2 weeks of parallel
engineering/integration**, then a **7–14 day pilot** plus review and corrections.
Allow about **3–5 calendar weeks** for a small mainnet beta if those gates pass;
review availability, real user feedback or a migration can extend it. We can
run a useful public testnet pilot sooner without real-money exposure. A token
launchpad, marketplace, second pet, deposits, approvals or autonomous signing
are outside this scope. Mainnet gas costs money even if all tooling is free.

X Layer [official network information](https://web3.okx.com/onchainos/dev-docs/xlayer/developer/build-on-xlayer/network-information)
distinguishes mainnet **196** from testnet **1952**. Changing that ID does not
deploy this registry, migrate pets or establish release readiness.
