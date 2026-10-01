# Combined presentation regression — checklist (F7)

Written **before** F5 and F6 exist, so the combined check on 3–4 October can
start immediately. It is drawn from the acceptance criteria in
`docs/finale/KYM.md` (F5), `docs/finale/YEEWEI.md` (F6) and
`docs/finale/LARM.md` (F7).

**Every row is NOT RUN until it is run.** Copy this file to a dated results
file and fill in that copy; do not edit results into this checklist.

## Where each row can be checked

| Where | What it can prove | Who |
|---|---|---|
| **Hosted, no wallet** — `/`, `/pet`, the public page `/pet/0xb7E6D789c39D468CfE3c5dA37C29Bd9852247B3a` (a **Buddy**, so earlier and locked forms both exist) | Real data, layout, keyboard, labels | Larm |
| **Local fixtures** — `npm run dev` on the release SHA, `/dev/pet` and `/dev/companion` (404 in production by design) | States that cannot be reached live without a wallet: ready recap, missing art, failures. Fixture evidence only | Larm |
| **Wallet session** — Deston's single planned final session | Anything that needs a connected wallet or a transaction | Deston |

## Setup

| ID | Check | Expected |
|---|---|---|
| G1 | Release | Codex names the SHA; Vercel production deployment for that SHA is `success`. Record both |
| G2 | Routes | `/`, `/pet`, public page: 200. `/dev/pet`, `/dev/landing`, `/dev/community`, `/dev/finale`, `/dev/companion` (and any new `/dev/*`): **404** |
| G3 | Console | No errors on `/`, `/pet`, the public page |
| G4 | Chain baseline | `node docs/qa/counter-check.mjs` — note the block and `communityStats(1)` |

## Overview and community (F7, hosted)

| ID | Check | Expected |
|---|---|---|
| O1 | Layout | `/` and `/pet` at 1440, 390 and 320: `scrollWidth = clientWidth`, no element past the right edge |
| O2 | How it works | Four steps; one row at 1440, 2×2 at ≤1000 px, one column at ≤560 px; step 04 "Ask Mochi" |
| O3 | Landing artwork ring | Keyboard Tab from "Animate Mochi" to "Say hello to Mochi": ring clear of the switch and stage heading (2 px at 390/320, 4.4 px at 1440 on `7d4144b`) |
| O4 | Garden | Badge **Live**; count equals G4; "N more…" equals 20 − total; bar caps at 20 |
| O5 | Network and reference | "Care network: X Layer testnet (chain 1952)… XDOG reference … mainnet (chain 196)"; XDOG address `0x0cc24c51…b48e` (canonical, not `0x0eae…83ca`); link `noopener noreferrer`; disclaimer present |
| O6 | Motion switch | Default On; Space → Off, saved, reload keeps Off, greeting button disabled; Enter → On. Clear the saved choice afterwards |
| O7 | Keyboard | Reference source link reachable with visible focus; no focus trap |

## F5 — earned forms (Kym)

Live rows on the **public page** (Buddy, no wallet), fixture rows on `/dev/pet`.

| ID | Check | Expected | Where |
|---|---|---|---|
| E1 | Default | The current form (Buddy) is shown and selected | Hosted |
| E2 | Earned vs locked | Hatchling selectable; **Guardian labelled locked and not selectable**, by mouse or keyboard | Hosted |
| E3 | Viewing an earlier form | Only artwork and its description change. Stage, **20** growth points, the 20/50 progress bar and the next target stay as they were. Notice reads like "Viewing Hatchling · Your current stage is Buddy" | Hosted |
| E4 | Return to current | The return control restores Buddy; focus is not lost to the page top | Hosted |
| E5 | Keyboard and state | Native controls; selected state exposed (`aria-pressed`, radio or equivalent); nothing hover-only | Hosted |
| E6 | No invented history | No dates, streaks or "evolved on" claims | Hosted |
| E7 | Artwork ring | Keyboard focus on the artwork: ring does not overlap the motion switch or stage label at 1440/390/320 (measure intersecting elements) | Hosted |
| E8 | Layout | Public page at 1440/390/320: no overflow, labels not truncated | Hosted |
| E9 | Motion | "Animate Mochi" still works on the public page; other effects unchanged | Hosted |
| E10 | Missing art | The placeholder stays a placeholder; no live-looking pet replaces it | Fixture |
| E11 | Stage change resets the viewed form | Covered by F5's tests; live needs a stage-crossing care | Fixture / wallet |
| E12 | Account switch remount | Codex's integration; needs two wallets | Wallet |

## F6 — recap (YeeWei)

The ready recap renders only with a connected wallet, so most rows are fixture
rows on `/dev/companion` at the release SHA.

| ID | Check | Expected | Where |
|---|---|---|---|
| R1 | First view | Stage, growth, personal confirmed cares and next eligible care time visible **without** opening anything | Fixture |
| R2 | Questions first | Question controls and the answer sit above the evidence, reachable without scrolling past a table | Fixture |
| R3 | Evidence disclosure | Native `details`, summary "View verified evidence"; Enter/Space toggles; every source field present inside: registry, read block, block time, observed at, care actions, growth, next stage, next care time, community total | Fixture |
| R4 | Closed-state context | Account, network, "MemePet activity only" scope, and provenance stay visible with the disclosure closed | Fixture |
| R5 | Provenance | `standard` still reads **"Standard explanation"**; fixture data labelled | Fixture |
| R6 | Unknown total | Community total unknown shows unknown "(not zero)", distinct from the personal care count | Fixture |
| R7 | States | Needs-wallet, loading, wrong network, no pet, unavailable: all still present and distinct | Fixture + hosted `/pet` (needs-wallet) |
| R8 | Failed explanation | Valid facts stay visible when the answer fails | Fixture |
| R9 | Nothing invented | No streaks, retention, transaction hashes, holder status, wallet history | Fixture |
| R10 | Long address | 1440/390/320 with a full address: no overflow | Fixture |
| R11 | "Next care" wording | Note whether the "next eligible care time" wording now handles "open now" (reported in `LINKS_AND_RECAP_QA_2026-10-01.md`) | Fixture + `curl` |
| R12 | API unchanged | `POST /api/companion` for the demo address still returns the same fields and `source: standard` | Hosted |

## Wallet session (Deston) — listed so nothing is assumed

| ID | Check |
|---|---|
| W1 | Genuine care: badge "In your wallet" → "Pending" → "Confirmed". Time it (runbook buffer) |
| W2 | **X3:** growth and the garden total update without a reload, or record that Retry/reload was needed |
| W3 | Ready recap live: ask "Explain progress"; open "View verified evidence"; the read block matches the receipt's block or later |
| W4 | Explore/Practise rewords the **same** answer with the same read block; Reset personality leaves growth unchanged |
| W5 | Earned-form viewer on the connected pet; switch wallet → viewer resets (E12) |
| W6 | Attribute the care: `node docs/qa/counter-check.mjs <G4 block> <after>` |

## Runbook and shot-list sync — after F6 merges

| ID | Check | If different |
|---|---|---|
| S1 | Is "Read block" now inside "View verified evidence"? | Runbook beat 1:55 and shots 8–9: **open the disclosure first**, then point at the read block |
| S2 | Question labels ("Explain progress", "Next care time", "Contribution") | Update the runbook and shot list wording |
| S3 | Earned-form viewer | Optional extra beat or shot: "Viewing Hatchling · Your current stage is Buddy" shows earned progress without inventing history. Only if time allows |
| S4 | Q&A sheet | Update `JUDGE_QA_PREP.md` if any answer's source changed |
