# Combined finale QA — rerun on release `3148238` (3 October 2026)

Run by Larm, 2 October 16:40–17:00 UTC (3 October 00:40–01:00 Singapore).
The lead asked in #86 for a rerun if the finale release changed, and it did:
B1 onboarding/milestones (#90/#91), `/help` (#88) and #92 landed after
`5a84e23`. This file follows
[COMBINED_REGRESSION_CHECKLIST.md](COMBINED_REGRESSION_CHECKLIST.md). The
[2 October results](COMBINED_QA_2026-10-02.md) stay as dated history,
including the lead's qualifications.

No wallet was connected and nothing was signed. Rows that need Deston's
wallet session are **NOT RUN**.

## Evidence types

| Label | Meaning |
|---|---|
| **HOSTED** | `https://memepet.vercel.app`, no wallet |
| **FIXTURE** | Local dev build of `3148238`, `/dev/companion` and `/dev/pet` (fictional data) |
| **CHAIN** | Read-only RPC/API reads |
| **CITED** | Another person's report, not rerun by me |

## Runtime and identity (G1)

| Item | Value |
|---|---|
| Checkout | `main` **`3148238f5a0d216fa704ad6176135d2e25555cda`** (#92), from a GitHub source snapshot |
| Hosted runtime | GitHub Production deployment **6812922873** for `3148238`, state `success` at 2026-10-02T16:16:38Z. No newer Production deployment was listed during the run |
| Later deployment (3 Oct) | After this run, GitHub lists Production deployments for `4e48f94` (#93/#95) and then **6824015621** for `a83f342` (#94), `success` at 2026-10-03T06:00:17Z. `3148238...a83f342` changes 45 files, all under `docs/qa/`, and no app code, config or content, so the checked app source is unchanged. These remain historical results, not a browser rerun or independent verification of the current alias. Not rerun on `a83f342` |
| Alias → SHA | **Not independently resolved.** The per-deployment URL redirects to a Vercel login, which I did not pass. The lead records `dpl_E5nmo41hachVjySMn7Q6AfPMMQ7g` behind the alias at `3148238` (#91/#92 release notes). Supporting content evidence: live `/help` matches `src/content/help.ts` at `3148238` word for word (49/49 strings, B3 follow-up #93) |
| Local runtime (fixtures) | **Recorded this time:** Node **v24.19.0**, Next.js **16.3.8** (dev server banner "▲ Next.js 16.3.8 (Turbopack)" and `node_modules/next/package.json`), matching the pinned `next` 16.3.8. Dependencies are an install from the unchanged committed lockfile. Server `127.0.0.1:3463`, no environment overrides |
| Browser | Headless Chrome 154 on Windows 11 over CDP with real key/mouse events; fresh isolated profiles; OS settings untouched |

## Setup

| ID | Result | Evidence |
|---|---|---|
| G2 | **PASS** — HOSTED | 16:42 UTC: `/`, `/pet`, `/help`, public page → 200. `/dev/pet`, `/dev/landing`, `/dev/community`, `/dev/finale`, `/dev/companion`, `/dev/beta` → **404**. These six are all the `/dev` routes in the source |
| G3 | **PASS** — HOSTED | No console errors, exceptions or warnings on `/`, `/pet`, the public page or `/help` at 1440, 390 and 320 |
| G4 | **PASS** — CHAIN | `node docs/qa/counter-check.mjs`: chain 1952, block **42 500 495** (16:42:12 UTC), `communityStats(1)` = **12**. Later reading: still **12** at block 42 548 305 (3 October 05:59:02 UTC) |

## Overview and community (hosted)

| ID | Result | Evidence |
|---|---|---|
| O1 | **PASS** — HOSTED | `/`, `/pet`, public page and `/help` at 1440/390/320: `scrollWidth = clientWidth`, no element past the right edge. `/pet` now includes the wallet chooser and onboarding card. Screenshots `home-*`, `pet-*`, `pub-*`, `help-*` |
| O2 | **PASS** — HOSTED | Four steps, step 04 "Ask Mochi": 1 row × 4 at 1440; 2×2 at 1000 and 800; one column at 560 and 390 |
| O3 | **PASS** — HOSTED | Tab from "Animate Mochi" to "Say hello to Mochi" (9 presses from load; one more than 2 October because the nav now has Help). Ring clear of the switch and stage heading: **4.1 px** at 1440, **2.0 px** at 390 and 320, unchanged. Screenshots `O3-ring-*` |
| O4 | **PASS** — HOSTED + CHAIN | Badge **Live**; progress bar `aria-valuenow 12` of 20; "12 confirmed care actions"; "8 more confirmed care actions until it blooms" (= 20 − 12); no bloom message. Chain read at G4 also 12. Screenshot `O4-garden-1440.png` |
| O5 | **PASS** — HOSTED | "Care network: X Layer testnet (chain 1952). The XDOG reference is on X Layer mainnet (chain 196). No token ownership is checked or required." Address `0x0cc24c51BF89c00c5afFBfCf5E856C25ecBdb48e`; source link `noopener noreferrer`, new tab; disclaimer present; "Checked Sep 30, 2026, 2:27 PM UTC" |
| O6 | **PASS** — HOSTED | Fresh profile: default On, nothing saved. Space → Off, saved `memepet.mochi-motion.v1 = off`, greeting disabled; reload keeps Off; Enter → On, greeting enabled. Storage cleared afterwards |
| O7 | **PASS** — HOSTED | Reference link reached by Tab with a 2 px lime outline (offset 5 px); Tab continues to "View source" then wraps to the page start. No trap |

## F5 — earned forms (public page, hosted)

Starting state (16:48 UTC): **Stage: Buddy**, **30 growth points**, "30 of 50
points toward Guardian." Same as 2 October.

| ID | Result | Evidence |
|---|---|---|
| E1 | **PASS** — HOSTED | "Current form: Buddy", artwork `buddy`, Buddy `aria-pressed=true` |
| E2 | **PASS** — HOSTED | Hatchling "Earned", enabled. Guardian "Locked", `disabled`; a real mouse click on it changes nothing; keyboard Tab skips it |
| E3 | **PASS** — HOSTED | Keyboard Enter on Hatchling: "Viewing Hatchling · Your current stage is Buddy", artwork `hatchling`; stage, growth and "30 of 50" unchanged. Screenshot `E3-viewing-hatchling-1440.png` |
| E4 | **PASS** — HOSTED | "Return to current form" by keyboard restores Buddy; focus lands on the Buddy button (visible outline), not the page top |
| E5 | **PASS** — HOSTED | Native buttons with `aria-pressed`; Tab order Hatchling → Buddy; nothing hover-only |
| E6 | **PASS** — HOSTED | No "evolved on", streak or dates |
| E7 | **PASS** — HOSTED | Art ring vs switch / form notice: 83.4 / 39 px at 1440, 75.4 / 31 px at 390, 87.9 / 43.5 px at 320; no intersection. Screenshots `E7-art-ring-*` |
| E8 | **PASS** — HOSTED | 1440/390/320: no overflow; stage labels not truncated |
| E9 | **PASS** — HOSTED | Off: switch false, art button disabled, `data-mochi-motion="off"`; On restores all three |
| E10 | **PASS** — FIXTURE | "Missing artwork": placeholder, no stage image, "Current artwork unavailable. Earlier forms cannot be viewed while current artwork is missing."; other forms disabled. Screenshot `E10-missing-art-fixture-1440.png` |
| E11 | **CITED** | F5 unit tests (Kym, #73); a live stage change needs a care that crosses a stage |
| E12 | **NOT RUN** | Needs two wallets (wallet session) |

## F6 — recap (fixtures unless noted)

| ID | Result | Evidence |
|---|---|---|
| R1 | **PASS** — FIXTURE | `ready`: stage, growth, "Next stage at 20 points", "Your confirmed cares 1" and "Next eligible care 2030-01-02 00:00 UTC" visible with evidence closed |
| R2 | **PASS** — FIXTURE | Questions (top 1061 px) and "Standard explanation" (1167 px) above the closed disclosure (1282 px) |
| R3 | **PASS** — FIXTURE | Native `details`, "View verified evidence"; Enter opens, Space closes. All nine fields present inside. Screenshot `R3-evidence-open-1440.png` |
| R4 | **PASS** — FIXTURE | Closed state keeps the account, "Chain 1952", "MemePet activity only", "Confirmed at block 100" and the source label |
| R5 | **PASS** — FIXTURE | `standardAnswer` → "Standard explanation"; `aiAnswer` → "AI response · FICTIONAL AI-STYLE PREVIEW — no model was called"; page labelled fictional |
| R6 | **PASS** — FIXTURE | `unknownCommunity`: community total "Unknown" in the evidence; personal cares stay 1; `zeroActivity` shows 0 |
| R7 | **PASS** — FIXTURE + HOSTED | Fixture: five distinct states as on 2 October. **Hosted `/pet` without a wallet (new this run):** recap "Connect a wallet to read MemePet activity."; chooser "No wallet is available in this browser…"; onboarding "Bring your wallet"; Daily care "Connect a wallet to adopt and care for a pet."; the milestones panel is hidden until connected, as designed |
| R8 | **PASS** — FIXTURE | Reply failure keeps the facts: "Fictional reply failure. The confirmed facts remain available." + Retry |
| R9 | **PASS** — FIXTURE | No streak, retention, transaction hash or holder text; "wallet history" only in "not full wallet history" |
| R10 | **PASS** — FIXTURE | Long fictional addresses with the evidence **verified open at the moment of each screenshot**: two full addresses in the evidence, no overflow at 1440/390/320. Screenshots `R10-long-address-open-*.png`. This closes the 2 October gap where the 320 px image showed the disclosure closed |
| R11 | **PASS** — FIXTURE + CHAIN | **Eligible branch, new this run:** fixture `careAvailable` (next care = block time) shows "Care at this read · Available · Check Daily care for current status." Screenshot `R11-care-available-fixture-1440.png`. **Future branch:** `ready` shows "Next eligible care 2030-01-02 00:00 UTC". **Browser clock:** with the page clock moved to 2031-06-01 (after the fixture's next-care time), `ready` still shows "Next eligible care 2030-01-02 00:00 UTC" and no "Available", so eligibility follows the block, not the clock. CHAIN: at block 42 500 519 the stage pet's `nextCareAtIso` equals its block time |
| R12 | **PASS** — HOSTED/CHAIN | `POST /api/companion` (16:42:34 UTC): keys `schemaVersion, scope, facts, reply`; facts `ready/live`; snapshot fields unchanged; `careCount 3`, `growthPoints 30`, `stage buddy`, `communityTotalCares 12` at block 42 500 519; `reply.source = standard`. API and companion library source are unchanged since `5a84e23` |

## Read recovery

**NOT RERUN on `3148238`.** My 2 October run on `5a84e23` stands as dated
history, with the lead's qualification. The community read path
(`FinaleCommunityPanel`, `useCommunityStats`) is unchanged since then. The pet
read retry changed in #85, and the lead's simulated tests cover it, not a real
failing read.

## Wallet session (Deston) — NOT RUN

W1–W6 are **NOT RUN**. The 7 October care will also be the first live view of
the new onboarding cooldown card ("Your next little care", local reset time)
and the milestones panel with a real wallet. Those panels are verified only in
the lead's and Kym's SIMULATED/FICTIONAL runs, cited in
[the beta index](../../beta/larm/ACCEPTANCE_INDEX.md).

## Runbook and shot-list sync

| ID | Result |
|---|---|
| S1 | "Read block" is inside "View verified evidence" (R3). Runbook and shots already say to open it first |
| S2 | Question labels unchanged: "Explain progress", "Next care time", "Contribution" |
| S3 | Earned-form viewer unchanged (E3/E4). Optional beat kept |
| S4 | `JUDGE_QA_PREP.md` updated for milestones, `/help`, mobile and today's readings |
| S5 (new) | `/pet` now shows the wallet chooser, the onboarding card and, once connected, the milestones panel. The runbook adds wallet selection to pre-flight and an optional milestones line |

## Observations (not defects)

- The no-wallet onboarding text suggests opening MemePet in a mobile wallet's
  browser. Real mobile wallet browsers are **NOT RUN** in Kym's B1 report and
  in the lead's B1 evidence. Do not demo or promise mobile on stage.
- With no wallet installed, the two "Connect wallet" buttons stay enabled. The
  chooser text explains that no wallet is available. Not a finale-path issue;
  noted for the lead.

Screenshots: [`combined-qa-2026-10-03/`](combined-qa-2026-10-03/).
