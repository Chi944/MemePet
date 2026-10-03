# Genuine wallet acceptance — 3 October 2026

**Session closed; automatic read-back FAILED.** One genuine Account 4
care confirmed. The automatic pet and community reads failed before recovery;
this is not an acceptance pass. B5 runtime remains gated.

## Runtime and public baseline

- Browser: Chrome, actual MetaMask selected; multiple installed provider choices.
- Alias: `https://memepet.vercel.app/pet`.
- Source: `988ed94f2c0add579a987bc6641a5e03c2db5975`.
- Deployment: READY `dpl_4NiXm1uDHntqviFrqgF9wu5De3sD`; Vercel alias, source
  metadata and READY state rechecked during this session.
- [Main CI 37102394417](https://github.com/Chi944/MemePet/actions/runs/37102394417)
  completed successfully at that exact SHA.
- Chain: X Layer testnet 1952; registry
  `0xe844152262D243a7B90F6e07FF7A67F1d7FeD216`.
- A: Account 4, `0x0A9312A3943A371e8fcA64E8a41769E4766203e6`.
- B: Account 3, `0xb7E6D789c39D468CfE3c5dA37C29Bd9852247B3a`.

`node docs/qa/wallet-preflight.mjs` exited 0. At block **42550077**, chain time
`2026-10-03T06:28:34.000Z` (14:28:34 Singapore), A was Hatchling/10, one care,
care due; B was Buddy/30, three cares, care due. Community total was **12**.
A had `0.199998387439919372` testnet OKB; gas sufficiency is unverified.
Block hash: `0xa839042047706ac2d5920c55658f3590b315ff990962b91c942526b0e61b023c`.

Raw JSON is outside Git at
`C:/Users/User/Documents/Projects/archive/memepet-submission-2026/qa/preflight-2026-10-03-42550077.json`.
This is public read evidence, not a transaction or browser pass.

## Observations before care

1. Discovery settled with four unselected, enabled choices: MetaMask, OKX
   Wallet, OKX Wallet, MetaMask. Connect was disabled before selection.
   Selecting the first MetaMask choice did not connect; the separate Connect
   action restored the already-authorized Account 3. No write was requested.
   Duplicate brand labels are ambiguous: object-identity deduplication preserves
   distinct announced/legacy provider objects. Do not claim four distinct brands
   or authenticate a provider solely by these labels.
2. Account 3 read as Buddy/30, three cares, available; community 12; local
   Playful preference, Explore 0 / Practise 0. The user then selected Account 4
   for the site. The observed page address matched A, but reported **chain 1**.
   It showed Switch network to view, Unknown community, Wrong network and
   disabled care through the absence of an available care action. Pet artwork
   was a labelled mascot invitation; old pet, recap/personality and progression
   were absent. This was an actual network mismatch, not a mocked scenario.
3. Clicking the app's Switch network restored **1952** through the existing
   permitted wallet call, without an observed wallet approval prompt. The
   network approval-prompt UI was not exercised. Reading/loading states
   appeared before A's actual Hatchling/10 and one care returned. Community
   returned to 12. No financial transaction or signature was submitted.
4. A's initial personality was Playful, Explore 0 / Practise 0. Explain progress
   produced a Standard explanation of Hatchling/10, one care, next stage 20.
   Expanded evidence showed A, the correct registry and chain, block **42550065**,
   block time `2026-10-03T06:28:22.000Z`, observed at
   `2026-10-03T06:28:24.650Z`, and community 12. The answer was held open for the
   subsequent automatic invalidation check.
5. The historical capture handle was not showing MemePet. The recorder refused
   to start before capturing anything. This initial attempt produced no usable
   video; the later foreground-tab handoff and actual capture are recorded below.

## Recorded care and recovery

After the user kept MemePet selected, the six-second framing probe completed
with exit 0 and its extracted frame was visually reviewed. A continuous
30 fps, no-audio window capture was started as `account4-final-care-take1.mp4`
in `video-production/media/capture/finale-2026-10-03-988ed94/` under the private
archive. The MetaMask side panel is included; review before distribution.

A fresh preflight at block **42551655** (06:54:52 UTC) still showed A's
Hatchling/10, one care and community 12. Immediately before Care, the counter
baseline **B0 = 42551752**, 06:56:29 UTC, was **12**. The app showed awaiting
wallet approval and explicitly no awarded progress; recap and milestones
cleared to loading/unknown. Deston confirmed that he approved the care.

Transaction:
`0x64c86a31ebefc1517e1b52d3e0e04e9b09d4c9d232fc3258b9e7107f1e58256e`.

The public receipt verifier checked exact Account 4 sender, chain 1952,
committed registry, zero value, exact `care()` (`0x093a37ff`), successful
receipt and matching `Cared` owner/community/count/day. Receipt block:
**42551837**, 06:57:54 UTC; block hash
`0x3370b6a862588717b1fab7f2630b90431668a8fc466a1f9fcbd9b9a0b5a25b43`.
Gas used: 35017. Previous-block state was Hatchling/10/one care/community 12;
receipt-block state was Buddy/20/two cares/community 13. Both block hashes
were rechecked. Raw JSON: `qa/receipt-A4-2026-10-03.json` in the private archive.

After reading **B1 = 42551870**, 06:58:27 UTC, total **13**,
`node docs/qa/counter-check.mjs 42551752 42551870` found exactly one Cared
event, matching A and this transaction: community 1, count 2, UTC day 20729.
An earlier event query mistakenly used an unobserved future endpoint and
returned HTTP 400; it supplies no event evidence. Only the actual B0/B1 range
above is used for attribution.

### Browser result, independent of the successful receipt

- **Automatic pet read: FAIL.** The app showed “Care confirmed on chain, but
  refreshing the pet failed” and retained explicitly stale Hatchling/10.
- **Automatic community read: FAIL.** Total became Unknown with read-only
  retry, and shared milestones were unavailable rather than zero/earned.
- **Automatic recap refresh: PASS.** Before a new question/retry, the old
  answer had cleared and the recap showed Buddy/20/two cares at receipt block
  42551837, next eligible care 4 October 00:00 UTC.
- Pet recovered to Buddy/20 on a later background refresh. An attempted click
  on the removed Retry pet read control returned a detached-node error and
  did not establish a manual recovery. No new transaction was sent.
- Clicking **Retry community total** recovered 13 on the same page. This
  successful manual retry does not turn automatic read-back into PASS.
- Cooldown showed 4 October 00:00 UTC; onboarding showed the matching
  **4 October 08:00 Singapore**. Care was disabled. Personal two-care and shared
  13-care totals left all 5/10/20 and 20/50/100 milestones unearned, correctly.
- Explain progress after recovery used the receipt-block snapshot. Expanded
  evidence matched A, registry, chain, count, stage and community 13; observed
  at 06:57:57.476 UTC. Explore changed Playful/0 to Curious/1 and reworded the
  answer without changing its facts or block.
- Earned Hatchling changed only the viewed form; actual Buddy/20 and recap
  remained. Return to current restored Buddy; Guardian remained disabled.
- A normal reload required explicit MetaMask selection/Connect again. A's
  Buddy/20/two cares, cooldown, community 13 and Curious/1 returned. Fresh
  recap block was 42552063. Before the account switch, Hatchling was selected
  again and an answer was opened to test clearing between same-stage accounts.

### Account, provider and disconnect follow-up

- **A to B with a network change:** selecting Account 3 for the site changed
  the app to B and actual chain **1**. Old account-specific content cleared;
  wrong-network state blocked the old care context. The app's Switch network
  returned to **1952**, after which B read as **Buddy/30/three cares**, with
  its own **Playful, Explore 0 / Practise 0** preference. Its current Buddy
  form replaced A's previously selected Hatchling view, and A's old answer
  was absent. This transition exercised account and network changes together;
  it does **not** establish a standalone A-to-B switch on an unchanged chain.
- **B to A on the same chain:** Account 4 returned on **1952** with
  **Buddy/20/two cares** and its own **Curious, Explore 1** preference. The
  current Buddy form and cleared old answer confirmed the observed return
  context. Reset personality restored A's original **Playful, Explore 0 /
  Practise 0** settings without changing confirmed progress.
- **Other-provider selection:** choosing an OKX Wallet radio cleared the
  connected account and its pet/recap/personality/progression state. This
  selection-clearing behavior passed. An actual OKX connection, transaction
  or same-address switch between providers was **NOT RUN**; brand labels
  alone do not establish provider identity.
- **Disconnect:** completed site permission revocation cleared the connected
  state. A normal reload remained disconnected. This is completed disconnect
  evidence, separate from the earlier provider-selection clearing check.
- **Public page:** the unconnected in-app browser read Account 4 as
  **Buddy/20**, matching the confirmed state without requesting a signature.
- **Copy link:** the app displayed copied feedback, but an independent
  clipboard read was empty. The actual copied URL is **NOT VERIFIED**; the
  feedback alone is not a clipboard-content pass.

### Recording closure and diagnostic QC

The recorder stopped automatically when the MemePet tab was no longer selected.
Metadata records start `2026-10-03T06:56:19.6615954Z` and stop
`2026-10-03T07:05:57.2591309Z` (14:56 to 15:05 Singapore), exit 0. The source is
**577.200 seconds**, 1920 × 856, H.264, 30 fps, no audio, 9,427,594 bytes.
Full FFmpeg decoding passed without errors.

A continuous **70–230s** trim was created outside Git as
`account4-care-read-recovery-DIAGNOSTIC-70-230s.mp4` in the same private capture
folder. It is 160 seconds at normal speed, 1920 × 1080 after adding a label area,
with no audio. Persistent labels say **“Recorded 3 Oct 2026 - QA / NOT LIVE”**
and explicitly preserve **automatic refresh failed; read-only recovery follows**.
Its full decode and label-placement inspection passed. It is diagnostic footage,
**not a finished finale backup or an automatic-update acceptance pass**.

The last two source seconds were sampled at 10 fps, with an additional near-final
full-resolution inspection. No unrelated content was observed in those samples;
this is not an exhaustive frame-by-frame privacy clearance. The diagnostic trim
excludes that entire tail. Some sampled frames show text/cursor ghosting, so
polished presentation quality is not claimed. Detailed QC, hashes and sample
observations remain in the private capture folder's `QC_ACCOUNT4_2026-10-03.md`.

### Read failure investigation

A separate read-only Node/viem probe reproduced an RPC response for a
not-yet-available block: HTTP 400 with JSON-RPC code **-32019**, message
**“block is out of range”**. Viem exposes this as RpcRequestError through its
contract-read wrappers. The tested release's retry classifier omits this code
and thus does not retry it. The targeted repair at **`f527153`** passed
**749 local app tests** and independent review. [PR #100](https://github.com/Chi944/MemePet/pull/100)
merged as `b908ab7dec1928c7786e778e461cdc003225f445` after
[CI 37105717596](https://github.com/Chi944/MemePet/actions/runs/37105717596)
passed: typecheck/lint, unit/helper/contract tests, build, 21 simulated browser
cases (8 B5 cases skipped), 6 fictional preview cases and production preview
route gates. A verified production release and genuine care recheck remain
required; these checks do not convert the failed browser run into acceptance.
The original browser did not expose its RPC error body, so this is a concrete
reproduced retry gap consistent with the failure, not proof of its exact cause.
Current pinned historical reads and origin/CORS probes succeeded independently.

## Completion status

| Check | Result at this checkpoint |
|---|---|
| Exact runtime and fresh public due-care baseline | PASS |
| Multiple providers: explicit choice, separate Connect | PASS for observed MetaMask path |
| Intended account and returned testnet state | PASS |
| Actual network mismatch blocks old-context actions | PASS; chain 1 to 1952 observed |
| Other provider selection clears old state | PASS for radio selection only |
| Actual OKX connection/write and same-address provider isolation | NOT RUN |
| Genuine care, receipt/event | PASS |
| Automatic pet/community reads | FAIL; later background/manual recovery recorded separately |
| Automatic recap invalidation and receipt snapshot | PASS |
| Receipt-bound facts and counter attribution | PASS |
| Post-care cooldown/local reset, milestones and earned forms | PASS after recovery |
| Personality rewording, normal reload and reset to original preference | PASS |
| A to B isolation coupled with actual network change | PASS for observed chain 1 then app switch to 1952; standalone same-chain A-to-B NOT RUN |
| B to A return on the same chain | PASS; Buddy/20, Curious/1, current form and cleared old answer |
| Completed disconnect and normal reload remain disconnected | PASS |
| Unconnected public Account 4 read without signatures | PASS; Buddy/20 matches confirmed state |
| Copy-link clipboard contents | NOT VERIFIED; feedback appeared, independent clipboard read was empty |
| Final-runtime adoption/rejection | NOT RUN; preserve September evidence |
| Current diagnostic capture and file decode | PASS with privacy/quality limits above; failure preserved |
| Finished finale backup playback and timed rehearsal | NOT RUN |
| RPC repair | PR #100 merged after review/CI; production verification and genuine acceptance pending |

The existing 185.088-second submission video is historical, not proof of the
new finale features. Larm's four documented read-only clips have not been
delivered locally. Neither file inventory nor preparation earns acceptance or
rehearsal credit. This checkpoint does not change the weighted 90/100 overall
or 41/51 lead-lane progress.
