# F7 — public links and recap QA (Larm)

Two independent checks on the release at `7d4144b`:

- **Part A:** the public-link check assigned to Larm in `docs/SUBMISSION.md`.
- **Part B:** read-only QA of the recap, the public pet page and the focus-ring repair.

Every row is **PASS / FAIL / NOT RUN / BLOCKED**; nothing is inferred. **No
wallet was connected, nothing was signed, no form was submitted and nothing
was logged into.**

## Run context

| Field | Value |
|---|---|
| Release | `main` at `7d4144b1b8395ec801fe301816a97916afbe986c` |
| Hosted | https://memepet.vercel.app — Vercel production deployment `6767674346`, status success 2026-09-30 18:59:02 UTC |
| Run (UTC) | 2026-10-01, 00:58 → 01:31 |
| HTTP checks | `curl -L` with a desktop Chrome user agent, **no cookies or credentials** |
| Browser | Chromium 152 embedded in the Claude desktop app, not signed in to any site; viewport emulation, **not device testing** |

## Part A — public links

### Scope

Every absolute link in `README.md`, `docs/SUBMISSION.md`, `docs/STATUS.md`,
`docs/finale/*.md` and `docs/qa/finale/larm/*.md`: **37 unique URLs**.
Placeholders (`localhost`, `example.com`) are excluded.

The same files contain **70 repo-relative links**. All 70 resolve to an
existing file in the snapshot.

### Results

| Link | Result | Observed signed out |
|---|---|---|
| App https://memepet.vercel.app | **PASS** | 200 |
| Public pet `/pet/0xb7E6…7B3a` (README) | **PASS** | 200; page renders the pet read-only (Part B) |
| `/api/companion` (OKX.AI packet) | **PASS** | 200 GET metadata; POST checked in Part B |
| Repository `github.com/Chi944/memepet` (and `.git`) | **PASS** | 200 without authentication; `.git` redirects to the repo |
| PR #57, Actions run `36040157500`, `checks.yml` + badge, pinned `DEMO_SCRIPT.md` | **PASS** | 200 each |
| **Video** https://youtu.be/ofPOony4nys | **PASS** | Redirects to the watch page. Signed-out `playabilityStatus` is `OK`; `isPrivate false`, `isUnlisted false`. oEmbed 200: "MemePet \| Small Care, Real Progress \| OKX Dev Day 2026". This reads the signed-out page's own playability flag; the video was not watched through |
| Registry on OKX explorer (`xlayer-test/address/0xe844…D216`) | **PASS** | Redirects to `web3.okx.com/explorer/x-layer-testnet/…`; page shows the address as a contract. RPC check: `eth_getCode` returns 1 397 bytes |
| Deploy tx `0x2ff1…93f9` | **PASS** | Explorer: "Accepted on L2", block 41 543 244. RPC receipt: status 1, `contractAddress` = the registry |
| Demo care tx `0xa340…1a55` | **PASS, intermittent** | **First load redirected to an OKX login page** (`web3.okx.com/account/login?forward=…`). A second load showed "Accepted on L2", block 41 815 415, to `0xe844…`. RPC receipt: status 1, to the registry |
| XDOG mainnet address (`COMMUNITY_CANDIDATE.md`) | **PASS** | Redirects to `x-layer/evm/address/…`. Empty on the first render; full page with the address and "XDOG" after a reload |
| XDOG OKX announcement | **PASS** | 200 (also checked in-app in `INTEGRATED_QA_2026-09-30.md`) |
| OKX builder kit, terms, X Layer network info, four OKX.AI docs pages | **PASS** | 200 each. HTTP status only; their content was not reviewed |
| `rpc.xlayer.tech` | **PASS** | `eth_chainId` → `0xc4` (196) |
| Tool sites (Next.js, React, viem, Vitest, Testing Library, Foundry, Solidity, shields.io badges) | **PASS** | 200 each, some after one redirect |
| **OKX.AI listing reference** (`docs/finale/OKX_AI_SERVICE.md:23`) | **FAIL** | **404.** `okx/onchainos-skills` removed `skills/okx-ai/references/identity-invariants.md` in commit `6ce6e3d` (2026-09-12, "new generation of okx.ai"). The same four-line rule now lives in [`skills/okx-ai/references/identity/service-contract.md`](https://github.com/okx/onchainos-skills/blob/main/skills/okx-ai/references/identity/service-contract.md#servicedescription): `[Service Description]`, `[Parameter Spec]`, `[Request Method]`, `[Request Example]` |
| Google submission form (`docs/SUBMISSION.md:49`) | **NOT RUN** (signed out) | 401 without a Google session. This form is for the team to fill in, not a link for judges. Not opened signed in and not submitted |

### Findings for the owners — files outside F4/F7, so nothing was edited

1. **Codex — `docs/finale/OKX_AI_SERVICE.md:23`.** Replace the 404 link with
   the `service-contract.md#servicedescription` link above. The packet's
   four-part description still matches the current rule.
2. **Deston — `docs/SUBMISSION.md:20` (also `README.md:36`, `STATUS.md:136`).**
   These still describe the video as **Private**, with signed-out playback
   unverified. Signed out, it is now **public and playable**. If public is
   intended, update the wording. If it should be private or unlisted, change
   the YouTube setting. A Private video would block judges.
3. **Everyone — OKX explorer links.** On one of two loads, the demo-tx link
   sent a signed-out visitor to an OKX login page. Before showing an explorer
   link live, load it once on the stage laptop. The RPC receipt is the
   evidence that does not depend on that site.

## Part B — recap, public pet page and focus ring

### Recap API — `POST /api/companion`, demo address `0xb7E6…7B3a`

Read-only and free; no model is called.

| Question | Result | Observed |
|---|---|---|
| `progress` | **PASS** | `facts.kind ready`, `dataMode live`, block 42 359 323. `careCount 2`, `growthPoints 20`, stage `buddy`, `nextStageAt 50`, `communityTotalCares 7`. Reply `source: standard`: "This pet has 2 confirmed care actions, 20 growth points, and is a buddy…" |
| `contribution` | **PASS** | "This pet has contributed 2 confirmed care actions. The confirmed community total is 7." |
| `next-care` | **PASS** (facts) — wording note | `nextCareAtIso` equals the block's own time, because this wallet last cared on UTC day 20726 and care is open again. The reply reads "The next eligible care time is 2026-10-01T01:29:22.000Z (UTC)…" |
| Cross-check | **PASS** | Chain: this owner's `Cared` event at block 42 322 305 carried `careCount 2`. `communityStats(1)` = 7. 2 × 10 = 20 growth matches the Buddy threshold (20) |

**Wording note for YeeWei (F6) / Codex (`src/lib/companion/standard-reply.ts`).**
When care is already open, `next-care` gives the current block time as "the
next eligible care time". That is true, but a judge reads it as a scheduled
time. Suggested wording when `nextCareAtIso === blockTimestampIso`: *"Care is
open now (as of block N)."* No code changed; the file is outside F7.

### `/pet` without a wallet — recap section

| Check | Result | Observed |
|---|---|---|
| State | **PASS** | "Read-only recap · Ask Mochi about your progress · …These questions do not send transactions. · Connect a wallet to read MemePet activity." No pet, no count, no fabricated answer. Polite live region present |
| Controls | **PASS** | No question buttons and no personality panel while disconnected |
| Layout | **PASS** | 1440: 1425/1425, 0 offenders. 390: 390/390, 0 offenders. 320: 320/320, 0 offenders. The garden still reads **7** |
| Ready recap and personality panel in the browser | **NOT RUN** | They need a connected wallet. Codex's `PERSONALITY_INTEGRATION_2026-10-01.md` covers them |

**Copy note (route file, Codex):** while disconnected, the section says "These
questions do not send transactions", but no questions are on screen. Minor.

### Public pet page — `/pet/0xb7E6…7B3a`

| Check | Result | Observed |
|---|---|---|
| Read-only | **PASS** | h1 "Pet of 0xb7E6…7B3a"; "There is no wallet connection and no care action". No care, adopt or connect buttons |
| Data | **PASS** | Stage Buddy, 20 growth points, "20 of 50 points toward Guardian" — matches the API and the chain |
| Motion switch | **PASS** | One "Animate Mochi" switch, `aria-checked="true"` by default. Tab from the switch reaches "Say hello to Mochi" |
| Artwork focus ring | **PASS** | Keyboard focus: `:focus-visible`, `solid 2px`, offset 4.67 px (global). **Nothing intersects the ring** at 1440, 390 or 320. The `PetScene` overlap suspected in `RELEASE_QA_abc0194_2026-09-30.md` **does not reproduce**; no change is needed there |
| Layout | **PASS** | 1440: 1425/1425. 390: 390/390. 320: 320/320. No overflow |

### Landing focus-ring repair (#66) on the hosted release

| Viewport | Result | Observed — keyboard Tab from the switch |
|---|---|---|
| 1440×900 | **PASS** | Offset `-4px`; ring clears the switch and the stage heading by **4.4 px** |
| 390×844 | **PASS** | **2 px** clear of both |
| 320×740 | **PASS** | **2 px** clear of both; 320/320, 0 offenders |

These match the local measurements recorded before the merge. No console
errors on `/`.

## Not run here

- Any wallet-connected state: ready recap in the browser, the personality
  panel, care, and the switch on a connected `/pet`.
- A controlled read failure and recovery (F7 item; needs a safe local setup
  from Codex).
- Screen-reader speech; reduced motion with the OS setting on.
