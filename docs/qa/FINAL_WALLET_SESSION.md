# Final wallet acceptance — one planned session

**Updated 3 October 2026 (Singapore). This is a plan, not a completed run.**
All results in the final table remain **NOT RUN** until their actual steps are
observed on the named runtime. Codex prepares and operates the app; Deston
privately reviews wallet prompts. No keys, passwords or recovery words are
needed. A successful test, receipt read or screenshot is not a wallet approval.

The aim is one genuine care, with automatic read-back, earned forms, recap,
personality and context isolation checked together. Do not repeat the completed
September adoption journey just to fill a new table. Preserve its real results
and failures in [the browser walkthrough](BROWSER_WALKTHROUGH.md),
[Account 3's dated wallet run](evidence/LATEST_RELEASE_QA_2026-09-24.md) and
[Account 2's recording evidence](evidence/FINAL_CAPTURE_2026-09-24.md).

## Named release and prerequisites

The current product implementation is #91/#92, with #93–#95 adding reviewed
QA evidence and judge-answer corrections. The lead verified production
`3148238f5a0d216fa704ad6176135d2e25555cda` at the #92 checkpoint; the current
lead PR records the subsequent release identity. Source paths (`src/`,
`public/`, contracts and dependency/build configuration) must be compared if
using an earlier recording. Documentation-only merges are not new wallet runs.

| Item | Verified preparation value / session requirement |
|---|---|
| Product source after #92 | `3148238f5a0d216fa704ad6176135d2e25555cda` |
| That main CI | [37032767176](https://github.com/Chi944/MemePet/actions/runs/37032767176), passed |
| That production deployment | READY `dpl_E5nmo41hachVjySMn7Q6AfPMMQ7g`, alias-to-SHA verified in #91/#92 release notes |
| Session runtime | Recheck current alias and record the exact SHA before approval; never infer it from this plan |
| App | `https://memepet.vercel.app/pet` |
| Chain / native test gas | X Layer testnet **1952** / **OKB** |
| Registry | `0xe844152262D243a7B90F6e07FF7A67F1d7FeD216` |

Before the session, recheck the alias, successful deployment and source SHA.
Record checkout SHA separately. If subsequent commits change documentation
only, document the product-tree comparison; do not invent a fresh browser run
for those commits. Reload the app before starting, and record which runtime
the session actually exercises. If source changes, name and verify that release
instead. Keep the previous good deployment available for rollback.

### Repeatable preflight before private approvals

Codex runs this free read-only command from the repository with pinned Node 24:

```powershell
node docs/qa/wallet-preflight.mjs
```

See [preflight behavior and limits](WALLET_PREFLIGHT.md). It reads the four
existing public demo accounts, fixed testnet registry and balances at one block;
chain time determines due/cooldown. It rechecks the block before printing any
snapshot. A failed required read yields a failure, never a zero balance or pet.
It cannot fund, connect, sign, claim enough gas, or establish browser acceptance.
Keep the JSON with the session evidence outside Git, and rerun immediately
before the actual session rather than treating a dated result as current.

### Read-only account preflight — historical, recheck before use

The lead captured a public, block-pinned read at
`2026-10-01T20:43:18.767Z`: chain 1952, block **42428557**, block time
`2026-10-01T20:43:14Z`, community total **12**.

| Account | Public address | State at that block |
|---|---|---|
| 1 | `0x3876722934FF2D3dC998656864BD5E8BBe1D5774` | Buddy, 30 points, 3 cares |
| 2 | `0x86F7De84EBB97c875e1494675Bfcd664f0773CE9` | Buddy, 30 points, 3 cares |
| 3 | `0xb7E6D789c39D468CfE3c5dA37C29Bd9852247B3a` | Buddy, 30 points, 3 cares |
| 4 | `0x0A9312A3943A371e8fcA64E8a41769E4766203e6` | Hatchling, 10 points, 1 care |

All four had nonzero testnet gas and cooldown until
**2 October 00:00 UTC / 08:00 Singapore** at that read. Nonzero balance alone
does not guarantee enough gas for the current request. **Account 4 already has
a pet; it is not a fresh adoption account.** No wallet action was performed in
this preflight.

Prefer **A = Account 4** after a fresh chain-time read verifies care is due.
If it still has 10 points, one real care should cross to **Buddy / 20 points**,
covering genuine evolution without a second day's session. Use **B = Account 3**
for the read-only account-switch check. If state has changed, record the actual
baseline and choose a suitable adopted rehearsal account; never assume these
historical counts. Do not send funding or consume care during preparation.

The lead also checked the released Account 3 UI read-only: earned Hatchling
versus current Buddy/30, then Curious/Explore 1 rewording a Standard explanation
without changing its facts or block **42428594**; community remained 12 and
care stayed on cooldown. Playful/0/0 and current Buddy were restored. These
observations do not establish a new care or a genuine account/network switch.

## Prepare before asking for private approvals

1. Complete independent release checks and collect teammate findings. Freeze
   the runtime for this session; do not deploy midway through it.
2. Run the read-only preflight above and recheck A/B's actual state: owner, chain,
   registry, pet, care count, last-care UTC day, block time, balance and total.
   Determine eligibility from chain time, not only the computer's clock.
3. Prepare the evidence destination and a short recording probe. Keep raw
   footage and JSON outside the submitted source tree, for example the private
   `Projects/archive/memepet-submission-2026/video-production/media/capture/`
   directory in a new `finale-<date>-<sha7>/` subfolder. Never overwrite originals.
4. The archived `record-memepet-window.ps1` is reusable only after validating
   the current window handle, FFmpeg path and crop. Its defaults are historical.
   Inspect the probe for readable text, smooth frames, correct window and no
   private content. Process success alone does not prove usable footage.
5. Keep the MemePet tab selected during capture. Do not change Windows motion
   settings. Preserve the user's saved preferences and record any deliberate
   temporary changes so they can be restored.

Reserve the pitch wallet's care **after 08:00 Singapore on 7 October** for the
stage. Use a rehearsal wallet for QA and rehearsal. A shot list or recording
process is not a verified backup; the finished file must exist and play offline.

## Ordered session

### 0. Record the selected wallet app after B4

PR #81 changed provider selection and session isolation. Its local mock tests
are not extension acceptance. Recheck the actual deployed commit first, then
record which wallet extensions are present. If more than one choice appears,
neither should be selected automatically. Selecting a radio option alone must
not open a permission/signature request; **Connect wallet** is separate.

Use the existing prepared demo account in the chosen extension. Do not import
keys or create another wallet merely to fill an acceptance row. Inspect each
request in that selected wallet; a similarly named discovery label alone does
not authenticate an extension. A wallet already holding an open prompt may
still require manual cancellation after a provider change.

If both MetaMask and OKX are already available, check selecting the other app
clears connected pet/answer/view state, then explicitly connect it and inspect
its actual site account. Do not perform an extra adoption/care just for this
switch. Test same-address provider isolation only if that account is already
available in both apps. Otherwise keep that specific row NOT RUN. Return to the
intended provider/account before the single care below. The care proves only
the provider that actually submitted it; do not mark the other brand's write
flow passed by inference.

### 1. Connect A and record the baseline

Ask Deston to select A **for MemePet's site connection**. Check that the app
itself shows A's address and chain 1952. A selection only in MetaMask's general
account menu does not prove a site-account switch. Leave security warnings or
unexpected requests unapproved.

Record actual stage, growth, care count, care availability, garden total and
personality preference. Open a Standard explanation and its **View verified
evidence** disclosure; retain owner, registry, read block and source time.
Immediately before requesting care, run:

```powershell
node docs/qa/counter-check.mjs
```

Save its block as `B0`, UTC time and total. This is a read-only command.

### 2. Request exactly one genuine care

Codex clicks the app's care control only after the baseline and recording are
ready. Deston privately approves only a request from A on **1952**, to the
registry above, with **zero transferred value**, no token-spending approval and
only testnet gas. If any detail differs or a warning appears, leave it unapproved.

Record the actual wallet-awaiting, pending and confirmed states and elapsed
time from approval to the observed result. Confirm that no progress appears
before confirmation. Do not refresh, click Retry or send another transaction
while measuring automatic read-back.

After confirmation, capture the actual pet/growth/cooldown and community result.
For the documented Account 4 baseline, the expected pet result is Buddy/20;
otherwise compare with the newly recorded baseline. Automatic pet and automatic
community reads are **separate results**. A successful transaction is not proof
either read succeeded. Preserve stale, Unknown and error states and their timing.
Before asking another question, also record whether the old recap/answer clears
and refreshed recap facts appear with a receipt-block-or-later source. Record
unavailable or stale evidence; a later manual question cannot prove this update.

If a read fails, record that failure first. Then use the offered read-only Retry
and record recovery separately, without reloading or requesting another care.
Where the app retains the receipt block, verify that scope. A retry or reload
must not turn the preceding automatic-read failure into PASS.

### 3. Verify receipt and attribution independently

Retain the full public transaction hash. Read and verify its successful receipt,
block, sender, target, zero value, decoded `care()` and matching `Cared` event.
Capture pet and community reads at the receipt block, plus the preceding block
where required for attribution. Then run the helper again for an after reading
`B1` and use the two actual block numbers:

```powershell
node docs/qa/counter-check.mjs
# Replace B0 and B1 below with the observed integer block numbers.
node docs/qa/counter-check.mjs B0 B1
```

The [counter procedure](COUNTER_CHECK.md) attributes events in **(B0, B1]**;
the receipt must fall inside that interval. Compare matching owner/hash and all
events against the block-pinned total delta. Multiple events may explain a
larger change; do not attribute other wallets' cares to this one. The helper
does **not** fetch/validate the receipt or automatically compare both totals.
Never infer a successful browser update from this independent chain evidence.

### 4. Check combined features and reload persistence

- Verify cooldown and the actual next eligible UTC time; do not send a duplicate
  care merely to test the disabled control.
- Check the B1 local reset label represents the same confirmed next UTC instant
  in the browser's timezone. It must not independently enable care.
- Compare personal 5/10/20 milestones and community 20/50/100 chapters with the
  independently read confirmed counts. Record actual earned/unearned states;
  do not manufacture enough cares to unlock all levels. Unavailable reads must
  hide earned state rather than substitute zero. A conditional failure branch
  not encountered remains covered by simulated tests, not this genuine run.
- Obtain a fresh **Explain progress** answer. Open **View verified evidence**;
  its snapshot must be at the receipt block or later and match the confirmed
  pet. If a read is unavailable, record that honestly. A manual question refresh
  does not establish automatic recap refresh.
- Change Explore/Practise once with the answer open. Record the reworded Standard
  explanation, unchanged facts and unchanged source block. This is browser-local
  style, not model training or on-chain growth. Retain the preference temporarily
  for the isolation check.
- On the earned-form viewer, select an earlier earned form and return to Current.
  Only viewed artwork/description should change; preserve actual growth, stage
  and target. A future locked form must remain inaccessible. If no earlier form
  is actually earned, mark that specific live check NOT RUN.
- Perform one **normal reload** and record that exact kind of reload. Verify the
  same owner, confirmed pet, cooldown, fresh reads and saved personality. Do not
  call it a hard-refresh test. With multiple providers, B4 deliberately requires
  choosing the provider again after a fresh mount; reconnect explicitly before
  checking the owner's facts. This is separate from persistence of confirmed
  on-chain state and browser-local personality.

### 5. Check A → B → A and network away → back

Immediately before the A → B switch, after the reload check, select A's earlier
earned Hatchling again and open a Standard answer. Leave that earlier form
selected. For the expected A4-after-care and B3 baselines, both current stages
are Buddy: the switch must reset the viewed form even though the stage is equal.
If live stages differ, record that limit rather than claiming same-stage coverage.

Ask Deston to change MemePet's connected account to B without reloading. Observe
the old pet, viewed form and answer clear before B's actual state/preferences
appear. Do not adopt or care as B. Return to A and verify A's saved preference
and current form are restored without B's answer or state leaking across.
Both B and returning A must start at their actual current form, not A's earlier
Hatchling selection. B1 personal badges must clear while the account changes
and then match the selected account's confirmed counts; no old earned state
may leak into the next account.

With A selected, ask Deston to switch to an already-configured alternative
network, without signing or sending. Verify the app actually changes chain,
disables writes, hides B1 progression, and does not retain an actionable
old-context recap/personality panel. Return to X Layer testnet 1952 and verify A's correct state. Merely opening
network settings, or seeing a configured network, does not pass this test.
If protected extension controls cannot be operated, record NOT RUN/BLOCKED;
do not substitute automated isolation tests for the genuine transition.

Restore temporary personality/view preferences. Reset personality only if its
original state was the initial zero-count profile or Deston requests a reset;
do not erase an existing preference merely for a tidy screenshot.

### 6. Disconnect and check the public page

Click **Disconnect** and wait for completed revocation or honest manual guidance.
Verify Not connected, no wallet pet/write controls and an independently readable
community state. Reload once to check disconnection persists. A screenshot of
Disconnecting is not completion evidence.

Open A's actual public URL in a separate unconnected browser. Verify matching
owner/pet/growth and read-only controls, with no signature. If checking Copy link,
record button feedback separately from a verified clipboard paste. Finish with
the site disconnected and preserve all failures, retries and capture gaps.

## Results to fill only after execution

Create a dated evidence file under `docs/qa/evidence/` and link it here. Record
UTC/SG times, source/deployment/browser, baseline, actual observations, receipt
and pinned blocks, raw-source locations and limitations. Use **PASS / FAIL /
NOT RUN / BLOCKED**. No execution result is supplied by this plan.

| Check | Final-session result | Evidence / limit |
|---|---|---|
| Session runtime, alias and fresh due-care baseline | NOT RUN | Preparation observations above must be rechecked |
| Multiple installed providers: explicit choice before permissions | NOT RUN | Conditional on both extensions being present; simulated B4 checks are separate |
| Other provider selection and same-address context isolation | NOT RUN | No key import or extra write solely for this test; record missing coverage |
| Intended site account/network and connection | NOT RUN | App address must match, not just wallet menu |
| Genuine care, receipt and event | NOT RUN | One private approval planned |
| Automatic pet read, +10 and actual evolution | NOT RUN | Keep separate from eventual recovery |
| Automatic community read | NOT RUN | September failure remains historical FAIL |
| Automatic recap invalidation/fresh snapshot | NOT RUN | Observe before another question or manual retry |
| Independent receipt-block reads/counter attribution | NOT RUN | Helper alone does not validate receipt |
| Read-only retry if needed | NOT RUN | Conditional; do not manufacture a production failure |
| Cooldown, fresh recap/evidence and same-snapshot style | NOT RUN | No extra care required |
| B1 local reset, confirmed milestones and account/network clearing | NOT RUN | Compare actual counts and UTC instant; no synthetic unlocks |
| Connected earned forms and return to Current | NOT RUN | Actual earned state only |
| Normal reload and preference persistence | NOT RUN | No hard-refresh claim |
| Site account A → B → A isolation | NOT RUN | Genuine provider transition required |
| Network away → 1952 isolation | NOT RUN | No signatures or transfers |
| Completed disconnect and reload persistence | NOT RUN | Leave site disconnected |
| Unconnected public view / optional verified copy | NOT RUN | Copy feedback is not clipboard proof |
| Final-runtime adoption rejection/adoption | NOT RUN | Already-adopted A; cite September evidence without relabelling it |
| Recorded backup file, decode and offline playback | NOT RUN | A running recorder or shot list is insufficient |

Local failure recovery, fixture checks and teammate presentation reports remain
separate. Reuse those results with their original dates/runtime and limits;
do not repeat all specialist checks or request additional wallet transactions
from teammates to complete this one session.
