# Combined presentation regression — results, 2 October 2026 (F7)

Results copy of [`COMBINED_REGRESSION_CHECKLIST.md`](COMBINED_REGRESSION_CHECKLIST.md).
Run by Larm's agent on **2 October 2026, 16:07–16:28 Singapore
(08:07–08:28 UTC)**. Every row records how it was checked. Rows that need a
wallet stay **NOT RUN**; nothing here is wallet evidence. Screenshots are in
[`combined-qa-2026-10-02/`](combined-qa-2026-10-02/).

**Evidence types used below**

| Tag | Meaning |
|---|---|
| **HOSTED** | Real data on `https://memepet.vercel.app`, no wallet, read-only |
| **FIXTURE** | Local fictional preview (`/dev/*`) on the checked source. Proves appearance and callbacks only |
| **LOCAL-RECOVERY** | `docs/qa/READ_RECOVERY.md` on the checked source: real failing read, then real X Layer testnet read |
| **CHAIN** | Read-only RPC/API reads (`counter-check.mjs`, `eth_getTransactionReceipt`, `POST /api/companion`) |
| **CITED** | A teammate's or the lead's dated report. Not rerun by me |

## Runtime and identity (G1)

| Item | Value |
|---|---|
| Checkout | `origin/main` **`5a84e23052ab568ec97740336081926efd99d8ec`** (merge of #83), read from a GitHub source snapshot of that commit. The branch base is `1a2b120ac408b7e243aaede345c19fdf1f3e4fd5`, which adds only YeeWei's docs to `5a84e23` |
| Hosted runtime | `https://memepet.vercel.app`. GitHub Production deployment **6803705884** for `5a84e23`, state `success` at 2026-10-02T07:40:12Z. A docs-only deployment **6804130471** for `1a2b120` (merge of #84, YeeWei's report; no product source change from `5a84e23`) was created at 08:08:19 UTC, during this run, so hosted rows may have been served by either; the product source is identical |
| Alias → SHA | **Not independently resolved.** The per-deployment URLs return HTTP 302 to a Vercel login and I have no Vercel API access. The latest lead-verified alias proof is `62d487d` / deployment `6794766512` ([evidence](../../evidence/PET_QA_RELEASE_2026-10-02.md)); later deployments (#81–#83) changed source. Codex: please record the alias resolution for the release you name for the finale |
| Local runtime (reported; version unresolved) | Larm's run reports `npm ci` on the same snapshot, Node 24.19.0, npm 11 and a Next.js 16.3.5 dev server. The cited commit actually pins Next.js **16.3.8**, so the local dependency/runtime identity is **not verified**. Fixtures used `127.0.0.1:3463`; recovery used `127.0.0.1:3462` with process-only overrides |
| Browser | Headless Chrome 154.0.8037.59 on Windows 11, driven over CDP with real key/mouse events. A fresh isolated profile per run, so no saved motion choice. OS settings untouched; no reduced-motion emulation |

**Lead review qualification (2 October):** the local version discrepancy above
cannot be resolved from screenshots. Local fixture/recovery rows below retain
Larm's reported observations; they are not independently reproduced passes on
the named checkout's installed dependencies. Recheck those rows on the named
finale release with its actual installed version recorded. Hosted observations
also retain G1's alias limitation. Do not turn either gap into a verified release
identity or wallet pass.

## Setup

| ID | Result | Evidence |
|---|---|---|
| G1 | **PARTIAL** | See table above: deployment record matches `5a84e23`; alias-to-SHA not independently established |
| G2 | **PASS** — HOSTED | 08:07:10 UTC: `/`, `/pet`, `/pet/0xb7E6D789c39D468CfE3c5dA37C29Bd9852247B3a`, `/api/companion` → 200. `/dev/pet`, `/dev/landing`, `/dev/community`, `/dev/finale`, `/dev/companion` → **404**. Also probed non-existent `/dev/beta`, `/dev/help`, `/dev/recovery` → 404 |
| G3 | **PASS** — HOSTED | No console errors, exceptions or warnings on `/`, `/pet` or the public page at 1440, 390 and 320 |
| G4 | **PASS** — CHAIN | `node docs/qa/counter-check.mjs` at 08:07:25 UTC: block **42469608**, `communityStats(1) = 12` |

## Overview and community (F7)

| ID | Result | Evidence |
|---|---|---|
| O1 | **PASS** — HOSTED | `/`, `/pet` and the public page at 1440/390/320: `scrollWidth = clientWidth` (1440/1440, 390/390, 320/320); 0 elements past the right edge |
| O2 | **PASS** — HOSTED | Four steps, step 04 "Ask Mochi". 1 row × 4 at 1440; 2 × 2 at 1000 and 800; one column at 560, 390 and 320 |
| O3 | **PASS** — HOSTED | Keyboard Tab from "Animate Mochi" to "Say hello to Mochi" (8 Tabs from load). The 2 px ring (offset −4 px) does not intersect the switch or the stage heading. Clearance **4.1 px** at 1440, **2.0 px** at 390 and 320 (earlier record on `7d4144b`: 4.4 / 2 px). Screenshots `overview-art-ring-*.png` |
| O4 | **PASS** — HOSTED + CHAIN | Badge **Live**. Progress bar `aria-valuenow 12` of 20, "8 more confirmed care actions until it blooms" (= 20 − 12). Chain read at block 42469608 also gave 12, two seconds earlier. No bloom message, correctly, below 20. Screenshot `overview-garden-live-1440.png` |
| O5 | **PASS** — HOSTED | "Care network: X Layer testnet (chain 1952). The XDOG reference is on X Layer mainnet (chain 196). No token ownership is checked or required." Canonical address `0x0cc24c51BF89c00c5afFBfCf5E856C25ecBdb48e` (no `0x0eae…83ca`). Source link `target=_blank`, `rel="noopener noreferrer"`. Disclaimer "A reference only — not a partnership, endorsement, balance or reward…" present. Checked "Sep 30, 2026, 2:27 PM UTC" |
| O6 | **PASS** — HOSTED | Fresh profile with no saved key: `aria-checked=true`, "On". Space → Off, saved as `memepet.mochi-motion.v1 = off`, greeting button disabled; reload keeps Off. Enter → On, greeting enabled. Test key cleared afterwards. OS setting not changed |
| O7 | **PASS** — HOSTED | Reference link reached by Tab with a visible 2 px lime outline (offset 5 px); Tab continues to "View source" and wraps to "Skip to content": no trap. Screenshot `overview-reference-link-focus-1440.png` |

## F5 — earned forms

Starting state recorded before interacting (HOSTED, public page, 08:15 UTC):
**Stage: Buddy · 30 growth points · 30 of 50 points toward Guardian** (CHAIN:
the API at block 42469610 gave `careCount 3`, `growthPoints 30`, `stage buddy`).

| ID | Result | Evidence |
|---|---|---|
| E1 | **PASS** — HOSTED | "Current form: Buddy"; Buddy `aria-pressed=true`; artwork `data-stage-art=buddy` |
| E2 | **PASS** — HOSTED | Hatchling "Earned" selectable; Guardian "Locked", `disabled`. A real mouse click on Guardian changed nothing, and keyboard Tab skips it |
| E3 | **PASS** — HOSTED | Keyboard Enter on Hatchling: notice "Viewing Hatchling · Your current stage is Buddy", artwork `hatchling`, Hatchling `aria-pressed=true`. "Stage: Buddy", "30 growth points" and "30 of 50 points toward Guardian." unchanged. Screenshot `public-viewing-hatchling-1440.png` |
| E4 | **PASS** — HOSTED | Keyboard Enter on "Return to current form" restores "Current form: Buddy"; focus lands on the "Buddy Current" button (visible 2 px lime outline), not the page top |
| E5 | **PASS** — HOSTED | Native `button`s with `aria-pressed`; the Tab order is complete; nothing is hover-only |
| E6 | **PASS** — HOSTED | No "evolved on", streak or date text in the page body |
| E7 | **PASS** — HOSTED | Art button ring (2 px, offset −4 px) vs the motion switch / form notice: 83.4 / 39 px clear at 1440, 75.4 / 31 px at 390, 87.9 / 43.5 px at 320, no intersection. Screenshots `public-art-ring-390/320.png` |
| E8 | **PASS** — HOSTED | No overflow at 1440/390/320 (O1); stage labels not truncated (`scrollWidth ≤ clientWidth`) |
| E9 | **PASS** — HOSTED | Space → Off (`data-mochi-motion=off`, greeting disabled); Enter → On. Control behaviour only; frame-by-frame playback not assessed |
| E10 | **PASS** — FIXTURE | `/dev/pet`, "Missing artwork": placeholder shown, no stage image; "Current artwork unavailable. Earlier forms cannot be viewed while current artwork is missing."; earlier/later forms disabled. Screenshot `fixture-pet-missing-art-1440.png` |
| E11 | **CITED** | Kym's [#78 report](../../../../src/components/pet/qa/PET_RELEASE_QA_2026-10-02.md): fixture stage change resets the viewed form at 320/390/1440. Live stage crossing needs a wallet: NOT RUN |
| E12 | **NOT RUN** | Needs two wallets (final wallet session) |

## F6 — recap

The ready recap needs a connected wallet, so these are FIXTURE rows on
`/dev/companion` (`5a84e23`), except R7 needs-wallet and R12.

| ID | Result | Evidence |
|---|---|---|
| R1 | **PASS** — FIXTURE | `ready`: stage, growth, "Next stage at 20 points" and "Your confirmed cares 1" visible with the disclosure closed. Next care is in the future at the fixture block, so it shows "Next eligible care · 2030-01-02 00:00 UTC" (see R11) |
| R2 | **PASS** — FIXTURE | Question buttons (top 1031 px) and the Standard explanation (1138 px) sit above the closed disclosure (1252 px) |
| R3 | **PASS** — FIXTURE | Native `details`, summary "View verified evidence". Keyboard Enter opens, Space closes. Inside: network, wallet, registry, read block, block time, observed at, care actions, growth points, stage, next stage, next care time, community total. Screenshot `fixture-recap-unknown-total-1440.png` |
| R4 | **PASS** — FIXTURE | Closed state keeps the account, "Chain 1952", "MemePet activity only", "Confirmed at block 100" and the source label visible |
| R5 | **PASS** — FIXTURE | `standardAnswer` labelled **"Standard explanation"**. The `aiAnswer` fixture is separately labelled "AI response … FICTIONAL AI-STYLE PREVIEW — no model was called". The page is labelled "UI preview — fictional data" |
| R6 | **PASS** — FIXTURE | `unknownCommunity`: evidence row "Community total (all pets): **Unknown**"; personal cares stay 1; `zeroActivity` shows 0. This matches the F6 design (`F6_EVIDENCE_LAYOUT.md`: null → "Unknown", supplied 0 → "0"). The words "not zero" belong to the Contribution answer text, not this label, so the template line was corrected (see below) |
| R7 | **PASS** — FIXTURE | Distinct copy: needs wallet "Connect a wallet to read MemePet activity."; loading "Loading MemePet activity…"; wrong network "Switch to chain 1952…"; no pet "No pet found in this wallet at the checked registry."; unavailable "Fictional read failure. No pet facts are available." + "Retry read". Hosted `/pet` needs-wallet state not separately re-captured in this run |
| R8 | **PASS** — FIXTURE | Reply `unavailable` with ready facts: "Fictional reply failure. The confirmed facts remain available." + Retry; stage, growth, cares and evidence still shown |
| R9 | **PASS** — FIXTURE | No streak, retention, transaction hash or holder text. "Wallet history" appears only in the disclaimer "not full wallet history" |
| R10 | **PASS** — FIXTURE | Long fictional addresses, evidence open: no overflow at 1440/390/320. Screenshot `fixture-recap-long-address-320.png` |
| R11 | **PARTIAL** | FIXTURE: the future-at-block branch reads "Next eligible care" with UTC time. All fixtures use a future next-care time, so the **eligible "Care at this read / Available" branch was not seen in a browser: NOT RUN**. CHAIN: the API for the stage pet at block 42469610 returned `nextCareAtIso` equal to that block's time, which `CompanionPanel.tsx` (`careAvailableAtRead`) treats as eligible. That is a code reading, not a UI observation. Browser-clock change: NOT RUN. YeeWei's merged report covers a clock check (cited below) |
| R12 | **PASS** — HOSTED/CHAIN | `POST /api/companion` (08:07:26 UTC): keys `schemaVersion, scope, facts, reply`; facts `ready/live`; snapshot fields unchanged (`blockNumber, blockTimestampIso, careCount, chainId, communityTotalCares, contextKey, growthPoints, nextCareAtIso, nextStageAt, observedAtIso, registryAddress, stage, walletAddress`); `reply.source = standard` |

## READ_RECOVERY.md — my own execution (LOCAL-RECOVERY)

On `5a84e23`, following the document exactly: proxy `node docs/qa/rpc-recovery.mjs`
(127.0.0.1:18952, started in **fail** mode), app `npm run dev` equivalent on
127.0.0.1:3462 with the seven `NEXT_PUBLIC_MEMEPET_*` process-only overrides.
No wallet connected. No `.env.local` or deployment setting touched. Proxy
modes changed only through its own `recover` / `fail` commands.

| Step (UTC) | Observed |
|---|---|
| 08:18:53 — open `/`, fail mode, after bounded retries settled | Garden badge **Unknown**; "Confirmed community progress is unavailable. Retry the read."; "No total is shown in its place…"; **Retry reading** present; no total, no bloom. Header "X Layer testnet (local recovery QA)". Browser console: real `503` responses from `127.0.0.1:18952/rpc` |
| 08:18:55 — proxy `recover`, then **one** real mouse click on Retry reading, same page, no reload | — |
| 08:19:07 | Badge **Live**, **12 confirmed care actions**, "8 more confirmed care actions until it blooms." The genuine upstream value matches the independent CHAIN read (12) |
| 08:19:14 — proxy `fail`, reload | **Unknown** again, Retry present. Screenshot `recovery-3-unknown-again-local-1440.png` |
| 08:19:16–08:19:28 — proxy `recover`, one Retry click | **Live, 12** again. Screenshots `recovery-2-…` and `recovery-4-…` |

The proxy log confirms the mode sequence fail → recover → fail → recover.
**Helper checks:** `node --test docs/qa/rpc-recovery.regression.mjs` → 14 tests,
14 pass, 0 fail (08:20 UTC). **Teardown:** both processes stopped; nothing
listening on 3462 or 18952 afterwards. The overrides were process-only.

Limits, as the document states: this proves local overview read recovery
only. It does not establish automatic post-care read-back, the production
alias, or any wallet check.

## Wallet session — not run

| ID | Result |
|---|---|
| W1–W6 | **NOT RUN** — reserved for the single Codex/Deston session in [`FINAL_WALLET_SESSION.md`](../../FINAL_WALLET_SESSION.md). No wallet prompt was initiated |

## Runbook and shot-list sync

| ID | Result |
|---|---|
| S1 | **Confirmed (FIXTURE).** "Read block" is inside the closed "View verified evidence"; the closed header shows "Confirmed at block N". Runbook and shot 8 now say: open the disclosure, then point at Read block |
| S2 | **Confirmed (FIXTURE).** Question labels: "Explain progress", "Next care time", "Contribution" |
| S3 | **Confirmed (HOSTED).** "Viewing Hatchling · Your current stage is Buddy" on the public page. Added as an optional 10-second beat and an optional shot |
| S4 | **Updated.** `JUDGE_QA_PREP.md` keeps the 1 October figures with their dates and adds this run's observations |

**Zoom (layout only, emulated):** at a 1920 × 1080 output with Chrome
emulating 100 / 125 / 150 % zoom (CSS 1920 × 1080, 1536 × 864, 1280 × 720),
`/` and the public page have no overflow. The smallest rendered text is
about 10 px of output at 100 %, about 13 px at 125 % and about 15 px at 150 %.
The shot list now uses the runbook's 150 % start. This is not a projector or
back-of-room readability check; that stays with the 6 October rehearsal.
Screenshots `zoom150-*.png`.

## Defects found

**None reproduced in landing/community presentation**, so no source change.
One template correction in my own folder: checklist row R6 expected the label
"(not zero)", but the approved F6 design labels a null total "Unknown"
(the Contribution answer says "not zero"). The template now matches.

Nothing to refer to pet, recap or shared-data owners from this run.

## Cited reports (not rerun by me)

- **Kym — [PET_RELEASE_QA_2026-10-02.md](../../../../src/components/pet/qa/PET_RELEASE_QA_2026-10-02.md)**
  (#78, merged): fixture earned/locked, keyboard return, stage change and
  missing art at 320/390/1440; her NOT RUN rows stand, including combined
  gallery + recap + personality + care on one live page, the genuine wallet
  flow, playback and screen reader.
- **Lead — [PET_QA_RELEASE_2026-10-02.md](../../evidence/PET_QA_RELEASE_2026-10-02.md):**
  alias-to-SHA proof for `62d487d` / deployment `6794766512` and the lead's
  read-only follow-up, for their stated coverage only.
- **YeeWei — [COMBINED_QA_2026-10-02.md](../yeewei/COMBINED_QA_2026-10-02.md)**
  ([PR #84](https://github.com/Chi944/MemePet/pull/84), merged as `1a2b120`
  during this run): her own recap/companion checks, including the clock
  check. Cited for its stated coverage; I did not rerun it, and it does not
  replace the R11 eligible-branch browser observation.

## Remaining NOT RUN and lead requests

1. **Alias identity:** please record the Vercel alias → SHA for the release named for the finale. I could not resolve it (G1).
2. **Wallet rows W1–W6, E12, live E11, R11 eligible branch in a browser, X3 automatic read-back:** the single final wallet session.
3. **Rerun on the named final release:** if Codex names a release other than `5a84e23`, the hosted rows here (G, O, E) should be repeated on it during 3–4 October.
4. **Projector readability and reduced-motion playback on Deston's machine:** rehearsal, 6 October.
