# Testnet beta: four people, independent build lanes

Approved by Deston on **2 October 2026**, after the finale feature handoff.
This is additional scope, not unfinished work retroactively assigned to the
finale. Preserve the existing release and its dated evidence. Final genuine
wallet acceptance in [the session plan](../qa/FINAL_WALLET_SESSION.md) is still
**NOT RUN**. New simulated tests cannot close it.

**Deston merges the reviewed, passing PRs.** Codex does the shared engineering,
reviews, conflict repairs and release preparation. The teammates open PRs and
never merge themselves. No routine coding is assigned to Deston.

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

1. Codex supplies the B0 PR. Review it, then **Deston merges** when its checks pass.
   Teammates can read the briefs beforehand. Do not branch from an unreviewed
   sibling PR or silently cherry-pick its interfaces.
2. Each teammate preserves local work, fetches `origin`, and starts the named
   branch from reviewed `origin/main` containing B0. Record the actual base SHA.
   Separate clones/worktrees are required for simultaneous coding sessions.
3. B1/B2/B3 build simultaneously using the shared props/fixtures. YeeWei can use
   test-only FAQ samples while Larm writes content. No lane is blocked on another
   lane's presentation. Open a small draft PR early; split component/scenario
   commits for review. Existing finale QA reports remain valid only for the
   releases they actually tested; finish their outstanding rows separately.
4. Codex reviews exact heads, runs integrated checks and prepares conflict fixes.
   Deston merges B3, B1 and B2 when ready; order between independent UI PRs is
   flexible. B4 wires actual providers, counts and routes after the components
   land. A fixture-ready component is not yet a released live feature.
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
| Final genuine wallet acceptance; new provider/recovery acceptance | NOT RUN / Codex prepares, Deston privately approves |
| Beta lanes integrated and regression suite green | B0 prepared; B1–B5 remain assigned, not claimed delivered |
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
