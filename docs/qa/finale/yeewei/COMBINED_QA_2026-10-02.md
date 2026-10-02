# COMPANION-COMBINED-QA — combined companion QA

**Task COMPANION-COMBINED-QA · branch `test/companion-combined-qa` · owner YeeWei**
**Run date:** 2 October 2026, Singapore (browser runs 07:3x–07:43 UTC).
This is the actual run date. It is earlier than the planned 3–4 October QA window
and is not backdated or forward-dated.

**Result: evidence only. No companion presentation defect was reproduced, and no
code was changed.**

## Revisions

| Item | Value |
|---|---|
| Branch | `test/companion-combined-qa`. Already existed: reflog `Created from origin/main` at 2026-10-02 15:35:46 +0800, with no commits and no PR before this run. |
| Base = head of inspected code | `16da0bae3ef54719819222a5550954be217fb16f` (#82). Equals reviewed `origin/main` after `git fetch origin`. |
| Companion/pet code since verified checkpoint | `git diff 62d487d 16da0ba` has no changes under `src/components/companion`, `src/components/pet`, `src/app/dev/companion` or `src/app/dev/finale`. |
| Verified product checkpoint | `62d487d5d4e1f7c7b26332753f042fcb91a748d8`, Production deployment 6794766512 ([time-bound proof](../../evidence/PET_QA_RELEASE_2026-10-02.md)). |
| Later alias evidence in repo | [STATUS](../../../STATUS.md): public alias resolved to `dpl_BRybjNyXYsxuYDGPTfkbFdCtor6v` at `6f6a6c47…` (#81). |
| Latest GitHub Production deployment | 6803418406 at `16da0ba`, status `success` 2026-10-02T07:21:00Z. **UNVERIFIED for the public alias.** This run has no alias-to-SHA evidence. The production observations below are therefore tied to an unverified revision. |
| `origin/main` after the run | Advanced to `5a84e23052ab568ec97740336081926efd99d8ec` (#83) before commit. It changes only beta recovery/help components, simulated e2e specs and beta docs, with nothing under companion, pet, `src/app/dev`, fixtures, companion types or shared UI. These results are for `16da0ba` and were not re-run on `5a84e23`. |

## Runtime

- **Local fictional previews:** a clean `git archive` of `16da0ba` in a
  machine-local scratch directory, `npm ci` from the lockfile, Next.js
  **16.3.8** `next dev`, Node v24.21.0. Driven by Playwright 1.63.0 headless
  Chromium 153.0.8010.12 (no extensions) on macOS 14 (Darwin 23.6.0).
  - An existing teammate/user `next dev` on :3000 was running Next.js 16.3.5,
    started 30 September. It was not stopped and not used as evidence.
  - Screenshots show Next.js's dev-mode "N" indicator. That is a tool overlay,
    not product UI.
- **Production read-only:** `https://memepet.vercel.app`, same Chromium, clean
  profile, `window.ethereum` undefined. Only navigation, Tab focus movement and
  screenshots were used. Nothing was activated: no connect, care, adopt or
  question buttons were clicked.
- **Viewports:** 320×900, 390×900 and 1440×900 CSS px. No OS settings, zoom or
  motion preferences were changed.

## Automated checks (repo checkout at `16da0ba`)

| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS, 0 errors, 1 existing warning (`@next/next/no-img-element`) |
| `npm test` | PASS, 47 files / 594 tests |
| `node --test docs/qa/counter-check.regression.mjs` | PASS, 8/8 |
| `node --test docs/qa/rpc-recovery.regression.mjs` | PASS, 14/14 |
| `npm run build` | PASS, Next.js 16.3.8. It warned about a `package-lock.json` outside the repository, a machine-local file that was not touched. |
| `npm run test:e2e:simulated` | PASS, 3/3 SIMULATED (no provider; provider selection at 390/1440). This is not real-wallet evidence. |
| `npm run test:contracts` | **NOT RUN.** `forge` is unavailable on this machine. This PR changes no contract code; PR CI is reported separately. |

## A. Local fictional previews (`/dev/companion`, `/dev/finale`, `/dev/pet`)

All values are fictional and labelled **UI preview — fictional data** / **Fixture**.
The page had 0 px horizontal overflow in every state checked at each width, and no
console or page errors.

| Check | 320 | 390 | 1440 |
|---|---|---|---|
| Recap readable: Stage / Growth / Your confirmed cares / Next eligible care; date wraps as `2030-01-02` / `00:00 UTC` | PASS | PASS | PASS (single row of four) |
| Questions → answer stay adjacent. Gap from question group to answer region: 46 px, which holds only the "Mochi's style" line. | PASS | PASS | PASS |
| "Standard explanation" label on standard answer; "AI response" label on AI-style fixture, never both | PASS | PASS | PASS |
| Questions disabled while the reply is loading; reply failure keeps the recap visible, with a Retry button | PASS | PASS | PASS |
| Full addresses: long fictional 42-char wallet/registry render in full in the evidence, wrapping inside the card without clipping. The recap shows `0xF1C7…F1C7` with the full value in `title`. | PASS | PASS | PASS |
| Unknown community (`null`) shows **Unknown**; confirmed zero shows **0** | PASS | PASS | PASS |
| No-pet ("No pet found in this wallet at the checked registry.") vs failed read (alert text + "Retry read") vs needs-wallet / wrong-network / loading: all distinct | PASS | PASS | PASS |
| Obsolete-context answer stays hidden, with no provenance label shown for it | PASS | PASS | PASS |
| Personality line follows the input: Playful / Curious / Focused | PASS | PASS | PASS |

**Care-at-read wording follows the read block, not browser time.** At 390 px the
browser clock was fixed at `2040-01-01T00:00:00Z` (Playwright `clock.setFixedTime`).
That is later than the fixture's next care time of `2030-01-02T00:00Z`. The recap
still showed **Next eligible care · 2030-01-02 00:00 UTC**, because the fixture block
time is 2030-01-01 12:00. The "Care at this read · Available" branch has no
workbench fixture. Unit tests cover it with system times of 2000 and 2040, and both
pass within the 594 tests above. The lead's care-at-read wording and the date-width
fix are unchanged.

**Contrast spot check.** The quiet "Retry read" button measured
`rgb(179,179,179)` on `rgb(17,17,17)`, a ratio of 9.01:1.

### Keyboard

Tab order was identical at all three widths: back link → facts radios → reply
radios → personality radios → two checkboxes → Explain progress → Next care time →
Contribution → **View verified evidence**.

- The summary matched `:focus-visible` with a `solid 2px` outline at offset `-4px`.
- **Enter** opened the disclosure, and **Space** closed it.
- The #75 fix holds: the outline's bottom edge sits above the first evidence line
  at every width (320: 1984 ≤ 1986; 390: 1819.1 ≤ 1821.1; 1440: 1186.2 ≤ 1188.2 px).
  The screenshots show the outline inside the disclosure border and clear of the
  text.

### `/dev/finale` and `/dev/pet` (F5 / personality beside the companion)

- `/dev/finale` is an independent fixture inspector, not a combined render. All
  five inspectors fit at 320/390/1440. The keyboard-focused select changed the
  JSON, and `unknownCommunity` showed `"communityTotalCares": null`.
- `/dev/pet` showed the F5 stage strip (Hatchling CURRENT, Buddy and Guardian
  LOCKED), "10 of 20 points toward Buddy", daily care and the "Mochi, your way"
  personality panel, with no overflow at any width.
- As in Kym's report, **no single preview renders gallery + recap + personality
  together**. That same-page check needs a live connected wallet (see C). This
  report does not substitute for her pet acceptance.

## B. Production read-only observations (no wallet in browser)

Observed 2026-10-02T07:43:03–07:43:30Z. The serving SHA is **UNVERIFIED** (see
Revisions). This is not wallet acceptance.

| Check | Result |
|---|---|
| `GET /`, `/pet` | 200 / 200 (`x-vercel-cache: HIT`, age 128 s) |
| `GET /dev/pet`, `/dev/landing`, `/dev/community`, `/dev/finale`, `/dev/companion` | 404 ×5 |
| `/pet` at 320/390/1440 | 0 px overflow, no console errors. Wallet "Not installed", chain "Unknown", community cares **12**. |
| Companion ("Ask Mochi about your progress") with no wallet | Shows "Connect a wallet to read MemePet activity." There is no recap, questions, evidence, fixture label or AI label. This is the correct needs-wallet state. |
| Keyboard (Tab only, nothing activated) | Skip link → nav → Get OKX Wallet → Connect wallet ×2 → OKX link → View source, then wrapping |

The live recap, evidence disclosure, F5 earned forms and personality controls are
not visible without a connected wallet, so they were not observed in production.

## C. Wallet evidence — NOT RUN

**Wallet acceptance: NOT RUN.** No wallet prompt was triggered. No adoption, care,
purchase or signing took place.

- **NOT RUN:** live connected recap, standard/AI answers, evidence disclosure and
  source labels against a real snapshot at 320/390/1440.
- **NOT RUN:** live stale/obsolete answer after a real snapshot change.
- **NOT RUN:** live unknown community from a real failed community read.
- **NOT RUN:** combined gallery + recap + personality + care on one live page (same
  gap as Kym's report).
- **NOT RUN:** care/adoption, rejection, receipt read-back, refresh persistence,
  account/chain/registry switching and disconnect. These belong to
  [FINAL_WALLET_SESSION](../../FINAL_WALLET_SESSION.md) (Codex with Deston).
- **NOT RUN:** proof that alias `memepet.vercel.app` serves `16da0ba` / deployment
  6803418406.
- **NOT RUN:** screen reader, OS zoom, reduced-motion/high-contrast OS settings,
  other browsers and physical mobile devices. Narrow widths are resized desktop
  Chromium.
- **NOT RUN:** `npm run test:contracts` (see above).

## Screenshots (`combined-qa-screenshots/`)

**Local preview, fictional data only (`/dev/*`):**
- `companion-standard-320.png`, `companion-standard-390.png`, `companion-ai-1440.png`
- `companion-evidence-focus-open-{320,390,1440}.png`
- `companion-long-address-evidence-320.png`
- `companion-unknownCommunity-390.png`, `companion-zeroActivity-390.png`
- `companion-noPet-390.png`, `companion-unavailable-390.png`
- `companion-obsolete-hidden-390.png`
- `companion-clock-2040-390.png`
- `pet-390.png`, `finale-390.png`

**Production, read-only, no wallet:** `prod-pet-{320,390,1440}.png` (full page).

## Requests to Codex (shared changes)

None are required for the companion lane. Optional: add a ready fixture whose
`nextCareAtIso` ≤ `blockTimestampIso`. That would let the "Care at this read ·
Available" branch be inspected visually in `/dev/companion`; it is shared fixture
work and not mine to make.
