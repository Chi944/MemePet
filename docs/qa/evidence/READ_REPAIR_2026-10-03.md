# Genuine read-repair retest — 3 October 2026

**Focused care retest: automatic settled pet/community/recap reads PASS, with
the observation limits below.** Account 3's genuine care changed Buddy/30/three
cares to Buddy/40/four cares and the community total from 13 to 14. No lead
Retry, reload or new recap question intervened. Deston explicitly confirmed
approval and that the page updated without Retry or refresh.

This is a new, unrecorded retest of the released repair. It does not rewrite
the [earlier Account 4 automatic read-back failure](FINAL_WALLET_2026-10-03.md).
**Scoped genuine wallet acceptance PASS for `fa07032`: the prerequisite for
B5 runtime integration is satisfied.** The account/provider checks below have
completed, and Deston confirmed manual OKX permission removal. This acceptance
covers the observed paths and the historical controls identified below; it is
not a pass for every provider path or for unimplemented B5 recovery. Backup
delivery/playback and rehearsal remain separate unfinished work and do not
block B5 engineering.

## Identified runtime

- Browser: Chrome, actual MetaMask, `https://memepet.vercel.app/pet`.
- Source: **`fa07032a40ea7197e453262871d5ec1db1616106`**.
- Deployment: READY **`dpl_HihTUE6Fw4kr3d2tW5opMyh8QwDb`**; the lead checked
  the production alias and source identity before this retest.
- [Main CI 37106177054](https://github.com/Chi944/MemePet/actions/runs/37106177054)
  passed at the tested source.
- Runtime code equals repair release **`b908ab7dec1928c7786e778e461cdc003225f445`**
  from PR #100. The subsequent PR #99 changes only documentation;
  `git diff --name-only b908ab7 fa07032` confirms no runtime-source change.
- Chain: X Layer testnet **1952**; registry
  `0xe844152262D243a7B90F6e07FF7A67F1d7FeD216`.
- Account 3: `0xb7E6D789c39D468CfE3c5dA37C29Bd9852247B3a`.

## Preparation and actual action order

1. The fresh public preflight was read at **08:18:26 UTC** (16:18:26
   Singapore). Its source block **42556668**, time **08:18:25 UTC**, showed
   Account 3 as **Buddy/30/three cares**, community **13**.
2. The browser accessibility snapshot independently showed Account 3 on
   **1952**, Buddy/30/three cares and its own **Playful, Explore 0 / Practise 0**
   preference. An existing Explain progress answer used block **42556631**.
3. **Deston independently clicked Care during preparation, before the lead
   opened a care request. The lead did not click Care during this retest.**
   The lead subsequently noticed an unexpected community increase to **14**
   at block **42556720**, **08:19:17 UTC**, and inspected the page.
4. The page then showed **Buddy/40/four cares**, cooldown until **4 October
   00:00 UTC**, community **14** and garden **14**. The old answer had cleared.
   The recap's new source block was **42556718**.
5. No lead Retry, reload or new recap question occurred between those
   observations. Asked about the action, Deston explicitly replied:
   **“Yes—approved care; it updated without Retry or refresh”.**

The settled result and Deston's confirmation support the focused automatic
read-back pass. The pending wallet UI and the entire transition were **not
continuously observed**. No approval-screen-content, intermediate-animation or
read latency claim is made. The 08:19:17 counter observation is not a measured
UI completion time.

## Independently verified public receipt and state

Transaction:
`0xe690cb807bfccfab113d2a6e1913a18db102a89bf31943655213e2e8efb268be`.

The read-only verifier confirmed the exact Account 3 sender, chain **1952**,
the committed registry, **zero sent value**, exact `care()` calldata
(`0x093a37ff`), successful receipt and matching `Cared` event. Gas used was
**35017**. Receipt block **42556715**, **08:19:12 UTC**, has hash:
`0x91cc4be9d3e4d6669071fb3ae02302964a12b12da8e743325272924da289f555`.

Pinned previous-block and receipt-block reads showed:

| State | Block 42556714, 08:19:11 UTC | Block 42556715, 08:19:12 UTC |
|---|---|---|
| Account 3 stage | Buddy | Buddy |
| Personal growth | 30 | 40 |
| Confirmed personal cares | 3 | 4 |
| Community cares | 13 | 14 |

Exactly one matching `Cared` event occurred in **(42556668, 42556720]**. It
identifies this transaction, Account 3, community **1**, care count **4** and
UTC day **20729**. Therefore this transaction contributes exactly **one** care
to the observed community increase. It is not a stage evolution; both sides
are Buddy. The previous and receipt block hashes were rechecked and stable.

Raw verification JSON is outside Git at:
`C:/Users/User/Documents/Projects/archive/memepet-submission-2026/qa/receipt-A3-repair-2026-10-03.json`.
It was observed at `2026-10-03T08:20:51.313Z`. Its verifier ABI is pinned to
commit `988ed94f2c0add579a987bc6641a5e03c2db5975`; a Git diff confirms that ABI
and contract source are unchanged through the tested release `fa07032`.
This ABI provenance is separate from the identified browser deployment.

## Follow-up context checks on the repaired release

After Account 3's care, the lead opened Explain progress, selected its earned
Hatchling view and used Explore once, setting its local preference to
**Curious / Explore 1**. Deston then selected Account 4 for the site, explicitly
keeping **1952** selected.

The subsequent browser accessibility snapshot showed Account 4's address
ending `203e6` and **chain 1952 unchanged**. It displayed **Buddy/20/two cares**,
the **current Buddy** form, its own **Playful, Explore 0 / Practise 0** preference,
community **14**, recap block **42556905** and its cooldown. Account 3's answer
was absent. This establishes the observed **same-chain Account 3 to Account 4
isolation PASS**, separately from the earlier account/network-coupled test.
Deston then returned the site to Account 3, again on **1952**. The browser
showed its own **Buddy/40/four cares**, saved **Curious / Explore 1**, current
Buddy form and cleared answer, with recap block **42557014**. The observed
same-chain **Account 3 to Account 4 to Account 3 sequence PASS**. The lead
requested reset to the original Playful/0/0 before the provider check, but
restoration was not independently observed. Later Account 1 observations cannot
verify Account 3's preference. This cosmetic cleanup remains unverified and is
nonblocking for the scoped wallet-acceptance gate.

Deston reports that an existing OKX account is ready. Selecting the first OKX
entry cleared the MetaMask account-specific state. Connect immediately showed
“Wallet connection failed.” The second distinct OKX-labelled choice was then
selected; its Connect attempt left the site disconnected with manual revocation
guidance. The page did not expose a provider error reason. Console inspection
only showed unrelated MetaMask extension warnings, not a causal OKX error.
Deston then confirmed the actual OKX prompt opened and connection was approved.
The subsequent page had the first OKX-labelled radio selected, Account 1
`0x3876722934FF2D3dC998656864BD5E8BBe1D5774`, chain **1952**, Buddy/40/four
cares, Playful/0/0 and community **15**. The intervening user-operated steps
were not continuously observed, so this does not identify the cause of the
initial failed attempt or prove both duplicate-labelled paths work.

Deston separately confirmed that he also clicked and approved Care for Account 1.
The lead did not request or click that care. Public verification of transaction
`0x9431123599118381351a6327bb0d3b821b993cc8726284984543bb500b492b3f`
confirmed the exact Account 1 sender, chain, registry, zero-value `care()`,
success and matching event at block **42557189**, **08:27:06 UTC**. Previous
and receipt-block facts changed Buddy/30/three cares/community 14 to
Buddy/40/four cares/community 15; hashes were rechecked. Exactly that one event
occurred in (42556720, 42557192]. The archive holds
`qa/receipt-A1-okx-observed-2026-10-03.json`. User-reported OKX approval and
chain evidence are distinct; signing software cannot be inferred from a receipt.
This additional care does not alter the attribution of the earlier A3 retest.

### Same-address provider isolation and disconnect

The lead returned to MetaMask, and Deston selected Account 1 for the site on
1952. The page showed Buddy/40/four cares, Playful/0/0 and recap block **42557397**.
Explain progress and the earlier earned Hatchling view were opened. Selecting
the first OKX-labelled choice immediately cleared account, pet, answer,
personality and milestones to the disconnected state. Explicit Connect then
restored **the same Account 1 on the same chain 1952** through OKX, with
**current Buddy**, no old answer, four cares and fresh recap **42557469**.
Community returned to 15. This genuine same-address provider-switch check passed.
No care was requested during this switch.

OKX Disconnect completed locally and displayed honest manual permission-removal
guidance, rather than claiming confirmed revocation. Deston was asked to remove
MemePet in OKX's connected-sites UI and subsequently confirmed **“MemePet
disconnected in OKX Wallet”**. This is user-confirmed manual cleanup, not an
independently observed or automatic OKX revocation. The lead separately
selected MetaMask, restored the existing Account 1 connection and clicked
Disconnect. The app confirmed account-access revocation, cleared its wallet
state, and remained **Not connected** after a normal reload. All providers
were unselected; community remained independently readable at **15**.

A fresh, unconnected in-app browser independently loaded Account 3's public
page as **Buddy/40** on this release. It exposed no Connect or Care action and
requested no signature. The **current-release public read-only check PASS**
is separate from the connected MetaMask page's care result.

## Focused completion record

| Check | Result and limit |
|---|---|
| Released repair and runtime identity | PASS for source/deployment above |
| Fresh Account 3 baseline | PASS; browser and public preflight recorded separately |
| Genuine care and exact receipt/event identity | PASS; public receipt independently verified |
| Automatic settled pet read | PASS; Buddy/40/four cares without Retry or refresh, corroborated by Deston |
| Automatic settled community/garden read | PASS; 14 without Retry or refresh, corroborated by Deston |
| Old recap answer cleared and new facts loaded | PASS; new snapshot block 42556718 |
| Cooldown following care | PASS; 4 October 00:00 UTC |
| Wallet pending UI and continuous transition timing | NOT OBSERVED continuously; no latency or prompt-content claim |
| Same-chain Account 3 to Account 4 isolation | PASS; identity-specific facts, personality, current form and answer clearing observed on 1952 |
| Return Account 4 to Account 3 / full two-way sequence | PASS on unchanged 1952; owner facts, saved preference, current form and cleared answer restored |
| Actual OKX connection | PASS for the final selected path; user confirmed actual extension approval; initial failed attempt preserved |
| Same-address MetaMask to OKX isolation | PASS; same A1/1952, old answer and viewed form cleared, current facts restored |
| Additional Account 1 care | User confirmed self-initiated OKX approval; public receipt verified; not a continuously observed approval/read-back run |
| OKX Disconnect | Local disconnect/manual guidance observed; Deston confirmed manual permission removal; no automatic-revocation claim |
| MetaMask Disconnect and normal reload | PASS; completed revocation observed and disconnected state persisted |
| Fresh unconnected public Account 3 page | PASS; Buddy/40, no Connect/Care action or signature request |
| Account 3 original personality restoration | Requested but not independently observed; nonblocking cosmetic cleanup |
| New video of this care | NOT RECORDED; recording is not required to establish this care result |
| Delivered finale backup and rehearsal | Separate work; not established by this retest |
| Prerequisite for B5 runtime integration | Scoped genuine wallet acceptance PASS for `fa07032`; B5 runtime is not yet implemented or accepted |

## Acceptance scope and remaining work

This record closes the repaired-release automatic read-back recheck and the
previously missing same-chain account round trip, actual OKX connection and
same-address provider isolation for the observed final path. The initial OKX
connection failures remain unexplained; neither duplicate-labelled path is
claimed universally reliable. The additional Account 1 care has its own public
receipt evidence and user-reported approval, not a continuously observed
automatic-read-back pass. No claim is made about the precise cause of the
original Account 4 browser failure.

Network-mismatch protection, earned-form and personality/reload controls from
the [earlier `988ed94` session](FINAL_WALLET_2026-10-03.md) remain supporting
evidence for unchanged controls with their original dates and limits. They
were not all rerun on `fa07032`. Adoption/rejection remains covered only by the
dated September reports, not a new repaired-release adoption/rejection pass.
Optional copied-link clipboard contents remain unverified. The earlier failed
read-back, pending UI and recording observations are not relabelled by this
acceptance.

The [B5 prerequisite](../../beta/INTEGRATION.md#b5-recover-the-transaction-never-repeat-it-automatically)
is now recorded as satisfied. Codex may begin runtime integration; implementation,
automated regressions, review and a separate genuine acceptance on the changed
B5 release remain required. B5 stays at **2/8** preparation credit. The final
acceptance/backup/rehearsal row is **2/4**: two points for scoped wallet acceptance,
one still pending for a delivered and independently playable backup, and one
still pending for rehearsal. Overall progress is **92/100** and the lead lane
is **43/51 (about 84%)**. These are planning weights, not mainnet readiness.

No new transaction was submitted by the evidence verifier. The existing
Account 4 failure and diagnostic footage remain unchanged historical evidence
of release `988ed94`; this successful focused retest belongs to `fa07032`.
