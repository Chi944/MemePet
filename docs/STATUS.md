# Current delivery status

Updated 3 October 2026 (Singapore). Team **The four musketeers**: Deston,
Kym, Larm and YeeWei. The recorded release and the 25 September follow-up run remain
separate evidence; see [September wallet QA](qa/evidence/LATEST_RELEASE_QA_2026-09-24.md).

## Wallet discovery release — 3 October, latest checkpoint

[PR #104](https://github.com/Chi944/MemePet/pull/104) merged at **09:57:05 UTC**
as `4a40275ceed86438e527bac8bba26a86493e06f7`; its tree matches reviewed runtime
head `824e964f59ccc1299ccade9c68f49aedef684a2d`. Wallet discovery now uses the
EIP-6963 announced list when available, with legacy injection only as fallback.
This removes duplicate compatibility wrappers without guessing provider identity
from wallet names. Late discovery cannot silently replace a selected signer.

[PR CI 37114597414](https://github.com/Chi944/MemePet/actions/runs/37114597414)
passed **822 app tests, 30 simulated browser cases, six fictional preview cases
and the contract checks**. The local browser run passed 29 cases; its no-provider
case failed because a Next.js chunk could not load (`ERR_NO_BUFFER_SPACE`). That
isolated case passed unchanged on rerun. This was not a passed 30-case local run.

The production alias resolved to READY deployment
`dpl_5zM3ByeCVAyYQtRWzTUsHBzr9hdG` from merge `4a40275`. The hosted picker showed
one **OKX Wallet** choice and one **MetaMask** choice. Selecting MetaMask and
connecting restored Account 2 on chain 1952, Buddy/30 points and community 15.
Deston then approved one genuine Account 2 care. Before any refresh or Retry,
the hosted page showed the confirmed transaction, Buddy **30 to 40 points**,
**three to four cares**, community **15 to 16**, cooldown until **4 October
00:00 UTC (08:00 Singapore)** and recap block `42562986`. Main CI
[37114761697](https://github.com/Chi944/MemePet/actions/runs/37114761697) passed.

Confirmation finished before the planned reload. After reload and MetaMask
reconnection, Account 2 retained 40 points/four cares, cooldown and community 16;
recap block was `42563043`. No transaction panel was restored. This verifies
ordinary pet persistence, **not genuine B5 hash recovery**. A bounded counter
check found exactly one matching Account 2 care event at block `42562983`.
Independent public transaction/receipt reads verified the same zero-value care,
correct sender/registry, chain 1952 and successful receipt at 10:03:40 UTC.

The original care recording failed to finalize and is not playable (`moov` atom
missing). A locally salvaged segment retains approval through pending only;
its timing was reconstructed at nominal 30 fps and it does not show confirmation
or reload. A labelled 134.333-second backup edit combines that segment with later
40-point footage and explicitly identifies the gap. Export, all-frame decode and
full local playback passed; the player reached the end at 10:35 UTC without
seeking or interruption, reporting four dropped frames out of 4,030 (about 0.1%).
The [backup record](qa/evidence/FINALE_BACKUP_2026-10-03.md) identifies the exact
artifact, playback proof and recording limits. This earns one delivered-backup
point; it does not establish venue playback or human rehearsal. Direct UI observations and
public receipt evidence remain separate from the incomplete recording.
No additional care was planned at that checkpoint.

Deston subsequently confirmed on **3 October 2026** that the timed team rehearsal
was finished: **USER-REPORTED PASS**. No exact duration, time or venue playback is
claimed. That closes the separate rehearsal point; no repeat video or rehearsal
is required by the remaining gate.

**Overall is 98/100; lead 49/51 (about 96%); B5 remains 6/8.** One genuine B5
recovery acceptance check accounts for the remaining two points. See the
[updated B5 evidence](qa/evidence/B5_RECOVERY_2026-10-03.md).

The [later Imported Account 1 attempt](qa/evidence/B5_RECOVERY_2026-10-03.md#later-imported-account-1-care-attempt--3-october-1044-utc)
confirmed successfully at 10:44:50 UTC with automatic 30-point/three-care display
and community 17. The next observed state was already confirmed, so the pending
guard prevented a reload. Genuine recovery was **NOT OBSERVED**, not an
application failure; the score remains **98/100**.

## B5 runtime released — 3 October, earlier checkpoint

B5 transaction recovery was reviewed and merged in [PR #102](https://github.com/Chi944/MemePet/pull/102)
at **`36b9ba8d9b93c84e2036c121a377fb0837a24b10`**, from runtime head
`4477df2377c49038db7be8dda146c0b617ce3ca4`. All [PR CI checks](https://github.com/Chi944/MemePet/actions/runs/37112343616)
and the Vercel preview passed. [Main CI](https://github.com/Chi944/MemePet/actions/runs/37112562198)
also passed. The production alias was
independently resolved to READY deployment `dpl_ABJum39qAz9ebj8GL9u12Q31YdBG`
built from that merge. The [B5 evidence](qa/evidence/B5_RECOVERY_2026-10-03.md)
records the public-hash journal, bounded read-only recovery, receipt-bound facts,
stale-context protection and storage-failure behavior. **815 app tests, eight
focused recovery browser cases and all 29 simulated browser cases passed.**
These automated checks do not establish genuine changed-release recovery.

The earlier scoped `fa07032` wallet acceptance remains PASS and satisfied the
prerequisite for this implementation. **Genuine B5 recovery acceptance is NOT RUN**
and must use the identified released B5 source. Backup delivery/playback and
rehearsal remain separate unfinished deliverables, not engineering gates.

The reviewed merge earns four B5 implementation points:
**B5 6/8, overall 96/100, lead 47/51 (about 92%)**. The remaining four points are
genuine B5 acceptance (2), a delivered/playable backup (1), and rehearsal (1).
Completed teammate scores are unchanged.

## Scoped wallet acceptance — 3 October, earlier checkpoint

The [repaired-release retest](qa/evidence/READ_REPAIR_2026-10-03.md) records
**scoped genuine wallet acceptance PASS on `fa07032`**. Account 3's care changed
Buddy/30/three cares to Buddy/40/four cares and community 13 to 14, with automatic
settled pet/community/recap updates corroborated by Deston and an independently
verified receipt. Same-chain account isolation, the final OKX connection path,
same-address provider isolation, disconnect and public read checks followed.
Deston confirmed manual OKX permission removal. The initial OKX failures,
incomplete transition observation and unverified Account 3 cosmetic reset remain
explicit limits; historical network/adoption/rejection evidence was not rerun.

The B5 integration prerequisite is satisfied. Codex may implement the runtime;
B5 remains **2/8** until its implementation and separate changed-release acceptance
are complete. Backup delivery/playback and rehearsal remain separate unfinished
work. Weighted progress is **92/100 overall, 43/51 lead (about 84%)**; completed
teammate lanes are unchanged. This is testnet delivery progress, not mainnet readiness.

## Genuine wallet session — 3 October, earlier checkpoint

Account 4's care confirmed on the frozen `988ed94` release: Hatchling/10 became
Buddy/20 and the independently attributed community total changed from 12 to
13. **Automatic pet and community read-back failed.** The recap refreshed
automatically; subsequent background pet recovery and manual community retry
are recorded separately. Account return, cooldown, earned forms, personality,
disconnect/reload and an unconnected public page were also checked, with
their limits in [the genuine evidence](qa/evidence/FINAL_WALLET_2026-10-03.md).

PR #100 repairs a reproduced retry-classification gap for X Layer's exact
`-32019` / `block is out of range` response. The original browser error body
was not captured, so this is not proof of its precise cause. A focused genuine
care on the verified repaired release is still required. B5 runtime remains
gated. The captured failure/recovery clip is diagnostic evidence, not a polished
finale backup. Weighted progress stays **90/100 overall, 41/51 lead** until the
remaining deliverable gates pass; completed teammate lanes are unchanged.

## Release QA and acceptance preparation — 3 October, earlier checkpoint

Larm's B3 release review #93 and YeeWei's combined B1/Help review #95 are
reviewed and merged. Their dated reports cover rendered Help, narrow layouts,
disconnected onboarding and simulated/fictional scenarios. They close B2/B3's
assigned QA deliverables, without claiming genuine wallet acceptance or real
mobile-wallet coverage. Larm's F7 follow-up #94 preserves those limits and the
unattributed-care caveat in judge answers. Read-only backup clips documented on
his machine are not yet a delivered, independently played finale backup.

The lead adds a bounded, read-only wallet preflight command for the final
session. It checks the four existing public demo accounts against one pinned
block, rechecks the header, and derives care availability from chain time.
No wallet action, funding, signing, persistence or B5 runtime is enabled.
The associated lead PR records checks, source/merge/deployment identity and
any actual preflight result. [Dated preflight evidence](qa/evidence/ACCEPTANCE_PREP_2026-10-03.md)
records block 42548794: all four accounts due, Account 4 at 10 points. Recheck
before use. Preparation itself earns no acceptance credit.

## Live onboarding and progression — 3 October, earlier checkpoint

Kym's B1 PR #90 is reviewed and merged at `99050c6`. The lead integration
replaces the temporary wallet picker, mounts her onboarding and cosmetic
progression panels on `/pet`, and expands `/dev/beta` for fictional inspection.
Local reset time formats the same confirmed UTC reset; it never enables care.
Milestones use confirmed personal/community reads, hide on disconnect/wrong
network, and clear old earned state during account changes or unavailable reads.
Read-only retries retain focus and cannot submit a transaction.

[Integration evidence](qa/evidence/B1_INTEGRATION_2026-10-02.md) records actual
checks and screenshots; the associated PR records merge/deployment identity.
Kym's implementation is complete. YeeWei now checks the combined release;
Larm verifies changed Help wording and official links. Codex prepares the final
genuine session. No new wallet transaction or persisted recovery is enabled.

## Receipt validation preparation — 2 October, earlier checkpoint

After Help/#88, the lead added pure B5 receipt validation and 44 regressions.
The helper verifies saved transaction identity, receipt ownership/inclusion
and a matching observed block header. Success is a receipt result, not pet
progress; missing or contradictory reads remain unverified. No runtime import,
storage, automatic retry or new wallet action is enabled. The associated PR
records final test/merge/release results. See [the integration contract](beta/INTEGRATION.md).

Deston confirms **Kym is working on B1 locally**; no pushed handoff is yet
available to review. Her files remain untouched. Overall remains **73%** under
the existing weights: this strengthens already-counted B5 preparation and does
not close runtime or acceptance work. The eight B5 browser cases remain skipped.

## Help integration and current assignments — 2 October, earlier checkpoint

Larm's final QA #86 and B3 content #87 are merged; #87's merge is
`a92416f`. No open PR remained at that checkpoint. The lead integration connects
his ten real FAQ entries to YeeWei's HelpPanel at `/help`, adds navigation,
and preserves narrow-screen layout. Help needs no wallet or chain read.
Planned features and the unverified support contact remain explicit.
[Integration evidence](qa/evidence/BETA_HELP_2026-10-02.md) and its linked PR
record actual checks and release identity. Earlier dated reports below remain
historical; they are not claims about the latest deployment.

Kym's B1 handoff is not yet visible on a pushed branch/PR; she is working
locally, as confirmed by Deston. YeeWei and Larm continue focused release checks from their updated
briefs, rather than rebuilding merged work. Codex handles integration and
merges. Final genuine wallet acceptance is **NOT RUN**, and eight B5 runtime
browser cases remain skipped. No persisted recovery is enabled.

## Progress measurement

These are **planning estimates for the expanded approved testnet scope**,
weighted by deliverables, not elapsed time, code quality, readiness or mainnet
completion. They supersede earlier estimates with smaller denominators.
B1/B4 are merged; B2/B3 QA credit follows reviewed #93/#95. B5 implementation
credit follows reviewed merge #102 and the verified production deployment;
genuine changed-release acceptance remains a separate gate. The delivered backup
and completed local playback earn one additional point. Deston's 3 October
confirmation that the timed team rehearsal finished earns its separate point
as **USER-REPORTED PASS**, without claiming an observed duration or venue playback.

| Deliverable | Completed weight / total | Remaining |
|---|---:|---|
| Existing core and finale feature implementation | 45 / 45 | Final acceptance is a separate row |
| B0 shared foundation | 10 / 10 | Complete |
| B1 onboarding/progression | 12 / 12 | Implementation and integration complete; release QA remains below |
| B2 presentation and regression | 8 / 8 | Assigned combined QA complete; genuine acceptance separate |
| B3 help copy/verification | 4 / 4 | Released wording/link review complete |
| B4 provider/retry/Help integration | 9 / 9 | B1 wired; genuine acceptance separate |
| B5 recovery | 6 / 8 | Reviewed implementation merged in #102; genuine B5 acceptance remains 2 points |
| Genuine final acceptance, backup and rehearsal | 4 / 4 | Wallet acceptance: 2 complete; delivered/playable backup: 1 complete; timed team rehearsal: 1 complete (USER-REPORTED PASS, 3 October) |
| **Overall after team rehearsal confirmation** | **98 / 100 — 98%** | One genuine B5 recovery acceptance check remains, worth 2 points; not mainnet readiness |

| Member's assigned lane | Weighted progress | Next action |
|---|---:|---|
| Deston / Codex | 49 / 51 — **about 96%** | Codex coordinates the remaining genuine B5 acceptance check; Deston reviews private prompts only when needed |
| Kym | 22 / 22 — **100% implementation** | Focused released onboarding/progression check; no new feature assignment |
| YeeWei | 16 / 16 — **100% assigned implementation/QA** | Retain #95; cite the lead's eight passing B5 scenarios and report only new scoped defects |
| Larm | 11 / 11 — **100% assigned implementation/QA** | Keep the delivered labelled backup and accurate judge answers ready; no repeat rehearsal required |

The existing finale feature implementation is complete. Recorded beta engineering
is 49/51 (about 96%) after reviewed B5 merge #102; that does not erase completed
finale work. Deston's
percentage includes work delegated to Codex, not a personal coding obligation.
Use [current role briefs](beta/START_HERE.md) for paste-ready teammate prompts.
External agent sessions have not automatically received these updates.

## Direct pet read retry and beta preview — 2 October, earlier checkpoint

YeeWei's evidence-only companion QA PR #84 merged at
`1a2b120ac408b7e243aaede345c19fdf1f3e4fd5`. It records actual fixture and
disconnected-page observations at its stated earlier revision; it does not
close genuine wallet acceptance or establish current deployment identity.

The next B4 handoff adds **Retry pet read** on `/pet`, with loading feedback,
duplicate-click protection and no wallet action. Retry/background reads cannot
use a block older than this session's confirmed receipt, even after the
transaction notice is dismissed. The block floor is memory-only; refreshing
the page still does not resume an unresolved transaction.

`/dev/beta` supplies the requested help/recovery workbench and a separate
fictional browser suite, while production keeps it hidden. A narrow-screen
FAQ focus-spacing issue was corrected from actual screenshot review. The
companion preview now includes `careAvailable` for the remaining wording case.
See [verification and screenshots](qa/evidence/BETA_PREVIEW_RETRY_2026-10-02.md).
Local checks: **639 app tests / 50 files**, typecheck, lint, production build,
**15 simulated wallet cases** and **3 fictional preview cases** passed.
Eight B5 runtime cases remain explicitly skipped. The associated PR records
the final source, CI and deployment checks.

YeeWei can continue focused preview QA using her updated brief. Kym continues
B1; Larm continues B3. The lead integrates their UI/content after reviewed
handoffs. No routine coding is assigned to Deston; genuine wallet approvals,
final product review and rehearsal remain his hands-on tasks. No new genuine
wallet action was performed here, and B5 runtime remains disabled.

## B2 review and integration checks — 2 October, earlier checkpoint

Lead preparation PR #82 merged at `16da0bae3ef54719819222a5550954be217fb16f`.
Its post-merge CI passed and Vercel resolved the public alias to READY deployment
`dpl_8VvjipqmA6hYFokhqNQVZtafAtPC` at that SHA.

YeeWei delivered B2 in PR #83: recovery/help presentation and broader simulated
browser regressions. Lead review corrected two test issues: fulfillment was
being mistaken for browser delivery, and pet/recap fixtures disagreed about
care eligibility. New assertions cover visible eligibility and read-only
provider calls. The final PR records the reviewed head and merge/deployment.

Combined verification: **623 app tests / 49 files, 22 helper checks,
typecheck, lint and production build passed**. The simulated browser suite
passed **15 cases**, with **8 explicitly unrun B5 cases**. Real wallet
acceptance remains **NOT RUN**. See the
[B2 report](qa/beta/yeewei/B2_REGRESSION_2026-10-02.md) for corrected evidence.
The new Help/recovery panels are not routed yet; their component tests do not
establish live integration or transaction recovery after refresh.

Kym continues B1; Larm continues B3. YeeWei can retain her B2 handoff and wait
for the lead's panel preview/live adapters before the next browser extension
of her suite. Deston has no routine coding task: forward the existing briefs
if needed, then perform private wallet approvals and final checks in the
coordinated session. B5 runtime stays disabled until that acceptance.

## Beta integration preparation — 2 October, earlier checkpoint

PR #81 is merged at `6f6a6c47e2dd2e304cb9dcaf53a9b145281d7332`; exact-head
and main CI passed. Vercel resolved the public alias to READY deployment
`dpl_BRybjNyXYsxuYDGPTfkbFdCtor6v` at that SHA. `/` and `/pet` returned 200;
all five `/dev/` preview routes returned 404. These are release checks, not a
real-wallet acceptance result.

The next lead preparation adds `mapBetaPanelState` for the agreed B1 inputs,
and strict pure B5 record/transaction identity validators. The panel mapper
rejects unavailable/stale facts and derives cosmetic goals only from confirmed
care counts. It preserves chain-derived cooldowns rather than using the
computer clock. Recovery helpers validate bounded public records and match
network, hash, sender, registry, zero value and exact care/adoption calldata.
A match is request identity, **not confirmation or awarded progress**.

These helpers are **not imported by live routes/hooks**. No storage journal,
automatic recovery or new UI panel is enabled. The latest integration PR
records the final source/release identifiers. Local verification on the
preparation branch based on `6f6a6c4`: **594 app tests / 47 files, typecheck,
lint, production build and 3 simulated Chromium cases passed**. Lint retains
the existing share-image warning. The new cases comprise 32 panel-state,
48 record-validation and 61 transaction-identity tests. No wallet action was
performed, and B5 runtime remains gated on genuine final acceptance.

The three teammates continue their existing B1/B2/B3 briefs. They can read the
updated [adapter contract](beta/INTEGRATION.md) without changing interfaces or
taking over lead-owned helpers. Deston's immediate task is to forward those
prompts if not already done; the lead will coordinate the private wallet
session after the release prerequisites are ready. The
[session plan](qa/FINAL_WALLET_SESSION.md) now includes explicit provider choice
and distinguishes reload/reconnection from on-chain pet persistence.

## Wallet selection and current handoffs — 2 October, earlier checkpoint

The only open PR at this run's start, **#80**, was reviewed and merged at
`99086a3fa2b20b6179183e560f4816ae4d2e47c6`. Its post-merge CI passed and Vercel
resolved the public alias to READY deployment `dpl_4LEpnMxLAZ2C7HZm1pjwoRB39oom`
at that exact SHA. Deston reauthorized the lead Codex session to merge reviewed,
passing PRs; teammates still open PRs without merging.

B4 provider selection is implemented and locally verified: multiple wallets
require a choice, requests stay with the selected provider, and changing the
provider invalidates old reads/answers/clients even for the same address.
The initial picker uses Kym's agreed interface so her full onboarding component
can replace its presentation without rewriting the wallet adapter.

Checks: **453 app tests, 15 contract tests, 22 helper tests, typecheck, production
build and 3 simulated browser cases pass**. Lint passes with one existing
share-image warning. Mobile/desktop screenshots were inspected. These are local
automated/fixture checks, not real wallet acceptance. See the
[B4 evidence record](qa/evidence/WALLET_SELECTION_2026-10-02.md); its associated
PR records the final head, CI and merge/deployment state.

| Member | Current next assignment |
|---|---|
| Kym | B1: full wallet chooser, onboarding, local care-time guidance and cosmetic progression. |
| YeeWei | B2: recovery/help presentation and broader stale-account/read/combined-panel browser cases. |
| Larm | B3: factual help entries, verified links and a concise acceptance index. |
| Codex | Review/merge passing PRs and wire the approved panels/routes. |
| Deston | Private approvals in the coordinated genuine wallet session, final product check and rehearsal; no routine coding. |

All three teammate lanes can start from current reviewed main now. Role briefs
preserve unpublished work and contain paste-ready prompts. External agents were
not automatically contacted. Final genuine wallet acceptance remains **NOT RUN**;
B5 persisted transaction recovery remains gated on that acceptance. Help,
onboarding and progression panels remain assigned work, not released claims.

## Beta foundation and parallel assignments — 2 October, new scope

Deston approved the [beta backlog](beta/START_HERE.md) in addition to the finale.
Kym owns onboarding/progression; YeeWei recovery/help/browser scenarios; Larm
the smaller support-copy/acceptance-index lane. Codex owns shared engineering.
At this earlier checkpoint Deston retained merges; the latest authorization
above delegates reviewed merges to lead Codex. Role sheets contain executable prompts; external
teammate sessions have not been automatically notified or started.

B0 prepares bounded pet/public reads, fixed contract tool versions, shared
beta interfaces/fixtures/cosmetic mappings and a simulated browser-test harness.
See the [B0 verification record](qa/evidence/BETA_FOUNDATION_2026-10-02.md) for
actual check outcomes. New panels/provider selection/recovery are assigned
follow-up work, not claimed live features. Recovery runtime explicitly waits
for [final genuine wallet acceptance](qa/FINAL_WALLET_SESSION.md), still NOT RUN.
The earlier approximately 92% was finale readiness, **not mainnet readiness**;
the beta has its own gates and does not inherit a completion percentage.

## Pet QA merged; final wallet session prepared — 2 October, earlier checkpoint

Kym's **PET-RELEASE-QA PR #78 is complete and merged** at
`62d487d5d4e1f7c7b26332753f042fcb91a748d8`. It fixes a narrow-screen selector
inside the development preview and records her pet/gallery/personality checks.
Exact-head and main CI passed. Production deployment **6794766512** succeeded;
Vercel independently resolved the public alias to READY deployment
`dpl_28SRHMBY4m1ojxe8c5zCRpwEXriG` with that exact SHA.

On this release, the lead checked the connected Account 3 page: earned
Hatchling viewing and Curious personality wording preserved actual Buddy/30,
the Done today cooldown, community 12 and the recap's verified source/facts.
Original personality and current-form settings were restored. This is a real
read-only combined check, not a new wallet transaction or automatic care pass.
[Release evidence](qa/evidence/PET_QA_RELEASE_2026-10-02.md) separates cited CI,
Kym's checks, lead observations and outstanding acceptance.

The [final session plan](qa/FINAL_WALLET_SESSION.md) consolidates the remaining
wallet checks. At the recorded public preflight, all four accounts had testnet
gas and were in cooldown until **2 October, 08:00 Singapore / 00:00 UTC**.
Account 4 already had Hatchling/10 points; if still eligible and unchanged, its
next care can verify automatic read-back and a genuine Buddy evolution together.
Recheck at session time. No new wallet action or funding was performed here.

| Member | Planning estimate | Next owned work |
|---|---:|---|
| Kym | 100% of assigned implementation/pet QA handoff | #78 complete. Available for a focused fix only if combined QA reproduces a pet defect; do not repeat the finished brief. |
| YeeWei | 98% | Finish her combined recap/evidence/answer accessibility report. |
| Larm | 85% | Cite Kym's report and lead evidence; finish independent recovery/presentation checks, runbook and backup coordination. |
| Codex / Deston's engineering lane | 96% | Final genuine wallet acceptance, review incoming findings and freeze. Deston retains private approvals and final review/rehearsal. |

**Overall finale readiness: approximately 92%.** These are planning estimates,
not measured scores. Remaining: final wallet automatic read-back and context
changes, remaining combined sign-offs, a real labelled backup and timed rehearsal.
Unrun specialist browser cases remain explicit; Kym's completed handoff does not
turn them into passes. Approved features are complete; optional OKX.AI listing
and invocation stay unverified and outside the working-product completion gate.

## Combined F5/F6 release — 2 October, earlier checkpoint

The four role briefs now contain executable continuation prompts, explicit dated
QA deliverables and owner handoffs. Larm can start immediately using his existing
combined checklist and local recovery setup; no teammate feature is blocking his
independent work. See [team instructions](finale/START_HERE.md). This is a planning
update, not new executed QA, and does not change the progress estimates below.

Both open teammate PRs are reviewed and merged: Kym's earned-form viewer **#73**
and YeeWei's evidence focus repair **#75**. Shared owner/chain/registry isolation
was already supplied in #74. Combined product source is
`d0fc02057eb9d06350c598220a62c68960cd8ab2`; its Vercel production deployment
`6790243257` succeeded. The approved feature scope is implemented. New feature
expansion stops while the team completes acceptance and rehearsal.

The combined local run passed **379 app tests / 38 files, 15 contract tests,
22 helper regressions, typecheck, lint and production build**. One existing
share-image lint warning remains. Root browser checks covered the earned gallery
at 320/390/1440px, keyboard selection/return, stage-change reset, missing artwork
and the recap focus repair. These local cases used labelled fixtures.

On production, the public Account 2 page and connected Account 3 page both
showed Buddy at 30 points; selecting earned Hatchling preserved current stage,
growth and locked Guardian, and Return restored focus. Account 3's read-only
recap showed 3 personal cares and community total 12 at block 42415259. Before
reloading, the older tab's Unknown community total recovered to 11 through
read-only Retry; the later fresh read returned 12. Neither observation proves
automatic post-transaction refresh. No care/adoption/signature was performed.
[Dated evidence](qa/evidence/COMBINED_RELEASE_2026-10-02.md) records the runtime,
checks and limitations; the release handoff PR records final CI/deployment.

| Member | Planning estimate | Next owned work |
|---|---:|---|
| Kym | 95% | Pet/gallery/motion/keyboard regression on the combined release; fix reproduced pet presentation defects only. |
| YeeWei | 98% | Combined recap/evidence/answer readability and accessibility pass; preserve source-time semantics. |
| Larm | 85% | Coordinate the combined checklist and local recovery run, update the three-minute pitch/backup plan. |
| Codex / Deston's engineering lane | 95% | Review findings, coordinate one final real-wallet run and release/freeze; Deston handles private approvals and final review/rehearsal. |

**Overall finale readiness: approximately 90%.** These are estimates of remaining
scope/acceptance, not measured scores or a claim that all QA passed. Still needed:
combined teammate sign-off, genuine final-release wallet acceptance (including
automatic read-back and context changes), a real labelled backup and timed
rehearsal. Optional OKX.AI registration/invocation remains unverified and does
not block the approved working-product scope. Updated role sheets contain fresh
QA branches/prompts; separate teammate agent sessions are not automatically notified.

## F6 released; F5 shared wiring prepared — 1 October, earlier checkpoint

F6 PR #72 merged as `e1f5011426dde77bf58025ec9b24de4405073f20`.
Its final-head CI (`36884279163`), main CI (`36884552164`) and production
deployment (`6788282844`) passed. After reload, Chrome displayed the connected
Account 2's Buddy, 20 points, 2 personal cares and shared total 7 at block
42409755. The new recap, read-only Standard explanation and expanded full
evidence were observed. No new wallet transaction was performed.

Deston confirms Kym is **still working** on F5 PR #73. At reviewed draft head
`4f3bf148a18f8e9557231b43f600aafec6ac9050`, it now includes earned-form
regressions and her local browser evidence; green draft checks are not a final
handoff. Codex has separately implemented the requested live/public scene
keys, isolated by owner, deployment chain and registry. Eight route tests verify
state resets for changed scope and preservation for unchanged scope/casing.
This shared wiring does not include or release her unfinished component branch.
The lead wiring PR records its exact final checks and release result.
Local integrated checks pass **368 app tests / 38 files**, typecheck and lint
(the same existing image warning). The route tests use a stateful scene double;
they prove page reconciliation, not a new real-wallet interaction.

Current planning estimates (scope and remaining acceptance, not measured scores):
**overall 85%; Codex/Deston 90%; Kym 85%; Larm 85%; YeeWei 95%.**
YeeWei moves to release/combined QA, Kym finishes and hands off #73, Larm prepares
the combined pass, and Codex integrates/reviews/releases. Final genuine wallet
acceptance, a labelled backup and rehearsal remain outstanding. Deston has no
routine coding or merge work assigned.

## F6 delivery details

YeeWei completed F6 in PR #72: the compact recap keeps stage, growth, personal
cares and care timing in view, places questions/answers nearby, and preserves
every existing source field in a native **View verified evidence** disclosure.
Her own automated and human observations remain in her dated QA record.

Lead review corrected two integration issues before release: already-eligible
care is described as available **at the verified read**, with a reminder to
check Daily care; narrow cards no longer overflow on the UTC date. The correction
uses source-block time, never the browser clock. Props, adapters, stale-response
protection and transaction behavior are unchanged.

The integrated check passed **360 app tests / 37 files, 15 contract tests and
22 helper regressions**, typecheck and lint (one existing image warning).
Chrome keyboard and layout checks covered 320/390/600/1440px; an in-app browser
visual check used labelled fixtures. [Lead evidence](qa/evidence/F6_INTEGRATION_2026-10-01.md)
records capture limitations and separates these checks from live wallet QA.
The PR records the exact final CI, merge and deployment results.

| Member | Current completion | Next step |
|---|---|---|
| YeeWei | F3 and F6 implementation complete | Verify the released recap and help Larm with the combined QA; no additional feature assigned. |
| Kym | F2 complete; F5 draft PR #73 has tests/evidence, but her agent remains active | Finish and hand off #73. Lead account-scope wiring is prepared separately; final integrated review remains. |
| Larm | Initial F7 presentation/runbook work merged in #70 | Use the recovery setup; finish combined QA after F5. |
| Codex / Deston | Shared adapters, recovery and F6 integration complete | Integrate F5, review/release and coordinate one final genuine wallet session. Deston retains private approvals/rehearsal. |

**Planning estimate: about 85% finale-ready.** F6 moves from not started to
implemented and integrated. Remaining work is F5, final combined browser/wallet
acceptance, a genuine labelled backup and rehearsal. Optional OKX.AI registration
and invocation are still unverified and do not block this working-product scope.
Teammates should use the updated role sheets; their separate agent sessions are
not automatically notified by these committed instructions.

## F7 presentation and read recovery — 1 October, earlier checkpoint

Larm's PR #70 is reviewed and merged as `9fa6438`. It adds the Ask Mochi landing
step, visible garden-track boundary, initial presentation checks, timed runbook,
judge Q&A and backup shot list. The combined checklist remains NOT RUN until
F5/F6 are integrated; a shot list is not recorded footage.

Codex supplied a bounded local-only read-recovery proxy, a reproducible handoff
and CI regressions. Actual browser testing observed Unknown during deliberate
read failure, then **7 confirmed cares / 13 remaining** after Retry reading
without reloading or connecting a wallet. Repeated failure/recovery passed.
The read-only recap also recovered from HTTP 503 to a real block-pinned 200.
Standard next-care wording now distinguishes care available at the verified
block from a future cooldown time. [Dated evidence](qa/evidence/READ_RECOVERY_2026-10-01.md)
preserves the test-tool defect found and repaired during verification.

| Lane | Completed | Remaining |
|---|---|---|
| Kym | F2 personality panel, integrated by Codex | F5 earned-form viewer **not started**, confirmed by Deston; growth-track visibility check. |
| YeeWei | F3 recap, integrated by Codex | F6 concise recap/evidence layout **not started**, confirmed by Deston. |
| Larm | Garden, landing and initial F7 presentation/runbook PR #70 | Recovery follow-up and final combined QA after F5/F6; actual backup capture is separate. |
| Codex / Deston | Shared facts/adapters, integration, retry protection, motion, preference verification and recovery setup | Review/integrate F5/F6, final release checks and one genuine wallet/rehearsal session with Deston. |

**Planning estimate: about 80% finale-ready**, not a measured acceptance score.
The first teammate wave is complete; two small follow-up features and final
combined acceptance still remain. Role sheets are current. Teammates should
fetch reviewed main and use their assigned fresh branches; Larm's old F7 branch
is merged, so his next branch is `test/finale-combined-qa`. No messages to their
separate Claude sessions are assumed delivered.

The README/submission notes now distinguish Larm's 1 October signed-out public
video-access check from the historical private upload. Full human playback,
attendance receipt, optional OKX.AI registration and invocation are not claimed.

## Personality integration — 1 October

Kym completed F2 in reviewed PR #67, now merged (`a82eafd`). Larm's focus-ring
repair/QA #66 also merged (`d79df25`) after the lead corrected runbook claims
about retries, remaining cares and already-known demo-wallet ownership.

The lead integration mounts Explore/Practise, style counts, reset and honest
storage states on the wallet pet page using the existing local preference
adapter. Already-open Standard explanations immediately follow the current
style using the same verified snapshot. Interactions neither fetch again nor
award growth. Pending writes, wrong networks, disconnected/unconfirmed/no-pet
states do not offer the controls.

Local checks pass: **343 app tests / 37 files, 15 contract tests, 8 counter
regressions**, typecheck, lint (one existing image warning), production build,
public-page 200s and all five production preview 404 gates. Integration tests
exercise persistence, reset and A–B–A wallet isolation. PR #68 merged as
`3cd4b0a`; production deployment `6767546180` succeeded. Hosted Chrome verified
Explore/Practise, immediate answer rewording, saved counts after reload and reset
back to the initial zero-count profile. Account 2 remained Buddy/20 points and
the community stayed at 7. [Release evidence](qa/evidence/PERSONALITY_INTEGRATION_2026-10-01.md)
records the exact runtime and limits; no new wallet action was performed.

Next assignments are executable in [the four-person handoff](finale/START_HERE.md):
Kym F5 earned-form viewer, YeeWei F6 concise recap/evidence disclosure, Larm F7
presentation/recovery QA. Codex owns shared integration and releases. Target
feature-complete 2 October, QA 3–4 October, freeze 5 October. These new tasks are
assigned, not claimed started or finished. Deston keeps only private approvals
and the final review/rehearsal. The free OKX.AI packet is updated against official
documentation; registration, review and an actual OKX.AI invocation remain pending.

## Finale integration — 30 September

The [initial-read follow-up](qa/evidence/COMMUNITY_INITIAL_READ_2026-09-30.md)
records genuine read-only recovery from Unknown to **7 cares** in Chrome and
adds bounded automatic retries to initial/latest community reads. **321 app
tests / 34 files** pass. Buddy with 20 points was observed, but no new care or
evolution transition was performed. Automatic read-back after a genuine care
on the resulting release remains pending. Reduced motion initially explained
the stationary hover. Deston then explicitly requested default-on Mochi motion
for everyone, with a saved off control. The [motion follow-up](qa/evidence/MOCHI_MOTION_2026-09-30.md)
records the narrow artwork exception, keyboard/hover verification and **331 app
tests / 35 files**. Other UI still respects reduced motion; Windows was unchanged.

Reviewed and merged Larm's garden PR #59 and YeeWei's recap PR #61. The lead
fixed answer announcements and error contrast in #61, then connected both panels
to verified data on the real overview/pet routes. The garden reads 4 confirmed
cares in the local browser against the public testnet. Exactly-20 bloom and
unavailable states were checked separately as labelled fixtures. XDOG's token
address was independently checked against an official OKX source and mainnet
RPC; its reference network (196) is explicitly separate from care network 1952.

Combined checks: **312 app tests / 33 files, 15 contract tests, 8 counter
regressions**, typecheck and lint pass (one existing image warning). Browser
checks preserve reduced motion and distinguish real reads from fixtures.
[Integration evidence](qa/evidence/FINALE_INTEGRATION_2026-09-30.md) records the
build, release and browser boundaries. No fresh wallet action was performed.

At the 30 September checkpoint Kym had not started the new personality panel.
That checkpoint is superseded by completed F2/#67 above; her earlier pet/art
contribution remains separate.
Larm's landing-copy PR #60 follows the integrated garden release in #62. The optional
OKX.AI service is still prepared, not registered or invoked.

## Foundation history — 29 September

The team shared its selection invitation for the **7 October 2026** live finale
and authorized continued building. This establishes finalist selection, not
approval of every proposed technical integration or an attendance receipt.

[Start the four-person build](finale/START_HERE.md). Kym owns pet personality
presentation, Larm community presentation and reference research, YeeWei the
activity recap presentation. Codex handles shared data/services, integration,
review and release work under Deston's authorization. Deston retains product
decisions, private setup, wallet approvals and final rehearsal.

F0 supplies shared interfaces, fictional fixtures, a development-only workbench,
and pure standard-reply/personality/mission helpers. At this milestone these helpers
were not yet wired into the public product. The automatic community-refresh defect remains
open; no additional real wallet QA was performed for the foundation change.
[Foundation checks](qa/evidence/FINALE_FOUNDATION_2026-09-29.md) passed: 132 app
tests, 15 contract tests, 8 counter regressions, typecheck, lint, build and five
production preview gates. The existing lint warning remains.

The [F1 retry follow-up](qa/evidence/FINALE_RECEIPT_RETRY_2026-09-29.md) repairs a
reproduced viem classification gap for a temporary `header not found` RPC error.
Fourteen added regressions bring the suite to 146 app tests. The original live
failure's precise cause remains unproven, and automatic community read-back on
the new release still needs genuine browser-wallet verification.

## Shared services — 30 September

Codex implemented the public read-only recap API and browser adapters for the
three teammate panels. Facts are pinned to one block with a final hash check;
responses are validated against wallet/chain/registry and obsolete sessions are
discarded. Standard explanations require no model account. Resettable personality
preferences stay local to this browser and wallet context. The garden uses the
confirmed total; its community identity was unconfigured at this milestone.

Review also repaired an endless-loading case when the community hook starts on
an unsupported network or without complete deployment settings. All 271 app
tests, 15 contract tests, 8 counter regressions, typecheck, lint and build passed.
Lint retains one existing image warning. A real local HTTP recap matched an
independent X Layer RPC read: Account 3 had one care, 10 points and community
total 4 at block 42247147. [Service evidence](qa/evidence/FINALE_SERVICES_2026-09-30.md)
records the exact source and limits.

[PR #57](https://github.com/Chi944/MemePet/pull/57) merged after green checks;
production deployment 6742315810 records commit `3c9cdd0`. The public HTTPS
recap was verified at 29 September 18:26:46Z against independent RPC block
42247566. Its real pet/total matched, no-pet and invalid-input cases behaved
correctly, public routes returned 200 and all five preview gates returned 404.

Teammate panels were not yet wired into the live wallet page at this milestone. No fresh wallet
action was performed for this work, so the automatic community refresh,
network-away/back and other pending browser acceptance rows remain open.
The [free OKX.AI registration packet](finale/OKX_AI_SERVICE.md) is prepared, but
the service is not registered or invoked through OKX.AI. Website model replies
remain optional; no model account, included credits or budget is assumed.

The 25 September submission/access checklist below is historical and must not
be mistaken for a new check of video access or submitted declarations.

## Delivered — original submission evidence

- Wallet-linked adoption, one care per UTC day, confirmed growth and a shared care counter on X Layer testnet.
- Responsive black/lime overview, pet home, stage artwork, read-only public pet and share images; development previews return 404 in production.
- Genuine Account 2 rejection/adoption/care, receipts, later pet read-back, cooldown, manual refresh and disconnected public viewing. [Capture evidence](qa/evidence/FINAL_CAPTURE_2026-09-24.md) retains read failures and capture limitations.
- Completed **185-second 1080p30 video**, four portraits, three 130-word voices and 66-caption SRT. Technical decode/audio/caption and bounded visual checks passed; human full playback is not claimed.
- [Video upload](https://youtu.be/ofPOony4nys) observed in YouTube Studio on 25 September: saved as **Private**, processing/checks complete with no issues reported. This is not a rights clearance or a signed-out playback pass. Thumbnail and square team portrait are prepared in the private submission pack.
- Reduced-motion preview passed with the effective preference enabled: Buddy, success and celebration states kept visible artwork with computed animation disabled. Missing-art and unknown-total previews passed. Normal-motion foreground playback remains NOT RUN by user preference.
- Account switching cleared the previous account's pet without a reload. Earlier Account 1 care confirmed with 10 points/cooldown but left the community header **Unknown**; this failure remains in the evidence.
- A separate unconnected browser displayed Account 3's public page with the correct address, Read only, Live Hatchling, 10 points and no care action: PASS.
- On release **af886a75**, Account 3 genuinely rejected adoption, then adopted and cared. The pet automatically reached **10 points / cooldown**. The community header became **Unknown**, then **Retry community total** recovered **4** without reloading or another transaction. Manual read-only recovery passed; automatic community refresh failed. A normal reload retained Account 3, 10 points, cooldown and total 4.

- Hosted **Disconnect** at approximately 24 September 18:41 UTC completed with account-access revocation, Not connected, no live pet or write actions, and total 4. A normal reload preserved the disconnected state and revocation notice: PASS. The site was left disconnected; no new connection request was issued.

The tested product revision is **af886a75** (PR #51), separate from later
documentation-only revisions. Disconnect ran on this loaded runtime; the following
normal reload used documentation-only **edae08a**, deployment **6645345099**
(18:37:56 UTC), with no runtime source difference. Production deployment **6644949897** succeeded at
**24 September, 18:17:39 UTC**; the public app served the new recovery control.
[Post-merge CI](https://github.com/Chi944/memepet/actions/runs/36040157500)
passed **123 app tests / 21 files, 15 contract tests, 8 counter checks,
typecheck, lint and production build**. Lint has one existing image-element
warning and no errors. Production-route checks passed: `/` returned 200 and
all three development routes returned 404. Automated checks do not erase the
observed automatic counter-refresh failure.

## Original submission follow-ups — last checked 25 September

| Work | Owner / evidence needed |
|---|---|
| Latest-release browser follow-up | Network away/back is NOT RUN: the wallet showed network-management settings and the page remained on 1952 before disconnect. Extension controls were unavailable to automation. Genuine adoption/care, manual recovery, public viewing and disconnect/reload passed; the site remains disconnected |
| Remaining visual QA | Reduced-motion and missing-art/unknown-total fixtures passed in the follow-up run; normal-motion foreground playback is NOT RUN because the user prefers to keep reduced motion enabled. Four viewport layouts and keyboard checks passed in Larm's audit |
| Team video review and access | All four watch/listen and confirm names/portraits/claims. MP4 is uploaded privately; add corrected SRT/thumbnail, make it judge-accessible and check signed-out playback |
| Submission | Deston completes exact roster/route/origin/declarations and retains receipt; Kym resolves asset-input provenance; Larm verifies public links |

[Submission details and checklist](SUBMISSION.md) contain only current form,
rights and delivery fields. The complete scripts/editing pack is preserved in
private production records and [pinned Git history](https://github.com/Chi944/memepet/blob/19c3fac1f097955f2b6e409ab2f4ab988abc0cee/docs/demo/DEMO_SCRIPT.md).
No new feature prompt, full voice retake or optional evolution capture is
required for the original edit. No organic usage metrics are claimed; the later
finalist invitation is recorded above, separately from this evidence.

Use the [wallet walkthrough](qa/BROWSER_WALKTHROUGH.md), [acceptance checklist](QA_CHECKLIST.md),
[component worksheet](qa/COMPONENT_QA_WORKSHEET.md) and [evidence index](qa/evidence/README.md)
for repeatable verification. Tests, mocks, previews and chain reads are not
substitutes for actual browser-wallet actions.
