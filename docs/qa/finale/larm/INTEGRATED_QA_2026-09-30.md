# F4 — integrated QA on the hosted release (Larm)

Independent pass over the integrated finale release, rows **X1–X8** from
`QA_MATRIX.md`. Every row is **PASS / FAIL / NOT RUN / BLOCKED**; nothing is
inferred. **No wallet was connected and nothing was signed.**

## Run context

| Field | Value |
|---|---|
| Release | `main` at `08d0e5b4416d18222c46f6bcd4c1b9e62b7d6b3b` (includes #59, #60, #62) |
| Hosted | https://memepet.vercel.app — Vercel deployment `6762453804`, status success 2026-09-30 14:50:26 UTC |
| Run (UTC) | 2026-09-30, 15:16 → 15:21 |
| Browser | Chromium 152 embedded in the Claude desktop app (not standalone Chrome); viewport emulation, **not device testing** |
| OS | Windows 11 Home 10.0.26200, DPR 1, reduced motion **off** |
| Data | **Live** — the hosted site reading X Layer testnet (chain 1952). No fixtures |
| Chain reads | `node docs/qa/counter-check.mjs`, read-only |

This complements Codex's `docs/qa/evidence/FINALE_INTEGRATION_2026-09-30.md`,
whose hosted check was on `6f50a9e` (before #60). This run is on the later SHA.

## Independent chain reads

| Block | Block time (UTC) | `communityStats(1)` | Source |
|---|---|---|---|
| 42 320 758 | — | **4** | Codex's integration note |
| 42 322 573 | 15:16:50 | **7** | this run, start |
| 42 322 780 | 15:20:17 | **7** | this run, end |

`Cared` events between 42 320 758 and 42 322 780: **3**, from three different
wallets, 44 blocks apart, all on UTC day 20726, each wallet's second care:

| Block | Owner | Tx |
|---|---|---|
| 42 322 305 | `0xb7e6d789c39d468cfe3c5da37c29bd9852247b3a` | `0xe6a50d34a81b9b52ddf158c5557ad047db20c7bb69d1e2e7cf7ae11e66ddb8ef` |
| 42 322 322 | `0x3876722934ff2d3dc998656864bd5e8bbe1d5774` | `0xca6dc2e34f6ccd721805a5cbf870083e838a1d6581a23d2a3d1d13fd5b5f787f` |
| 42 322 349 | `0x86f7de84ebb97c875e1494675bfcd664f0773ce9` | `0x1601a661acc5ce882c12ec2f68c0bd4f88989b14f5be3056d82b86666da7f6f8` |

**Not attributed.** The timing looks like coordinated activity, but who owns
these wallets is not known from the chain. Deston should confirm before any
pitch line: if they are team wallets, the total is **team cares, not community
adoption** (`FINALE_RUNBOOK.md`).

## Routes

| Route | Result |
|---|---|
| `/` | 200 |
| `/pet` | 200 |
| `/dev/pet`, `/dev/landing`, `/dev/community`, `/dev/finale`, `/dev/companion` | **404** each |

## Integrated rows

| ID | Result | Observed |
|---|---|---|
| X1 | **PASS** | No wallet. On `/` and `/pet`: badge **Live**; count `<strong>` **7**; bar `aria-valuenow 7 / aria-valuemax 20`; garden label "sprouting"; "13 more confirmed care actions until it blooms." Matches the independent read of **7** |
| X2 | **PASS** | The total includes cares made before this session: 4 before Codex's baseline plus the 3 events above = 7 on screen |
| X3 | **NOT RUN** | Needs one genuine confirmed care and watching the total rise without a reload. Deston is the only signer. The three cares above happened while no page was being watched; this run saw only the result after a fresh load, which does not test live refresh |
| X4 | **NOT RUN** | No controlled read-failure run on this SHA. The unavailable state is covered by component tests (M2, R1–R4) and was not reachable live — the registry read succeeded throughout |
| X5 | **NOT RUN** | Total is 7; the bloom at 20 cannot be observed live. Covered only by automated tests (exactly 20, 24, `isComplete` precedence) |
| X6 | **PASS** | XDOG configured. Address `0x0cc24c51BF89c00c5afFBfCf5E856C25ecBdb48e` — the **canonical** one from `COMMUNITY_CANDIDATE.md`, **not** the copycat `0x0eae…83ca`. Network shown as X Layer mainnet (196). Route note: "Care network: X Layer testnet (chain 1952). The XDOG reference is on X Layer mainnet (chain 196). No token ownership is checked or required." Source link is the OKX announcement, `target="_blank"`, `rel="noopener noreferrer"`. Disclaimer "not a partnership…" present |
| X7 | **BLOCKED** (this run) | Reduced motion is off on this machine and the browser tool cannot emulate it. **Codex's** evidence reports reduced motion enabled in their environment with all 7 plant animations computing to `none` — that is their observation, not this run's |
| X8 | **PASS** (layout, keyboard partial) | See below |

### X8 — layout

`scrollWidth` vs `clientWidth`, plus every element checked for a right edge
past the viewport. One `<h1>` on each page.

| Route | 1440×900 | 390×844 | 320×740 |
|---|---|---|---|
| `/` | not measured (content checked only) | 390 = 390, 0 offenders | 320 = 320, 0 offenders |
| `/pet` | 1425 = 1425, 0 offenders | 390 = 390, 0 offenders | 320 = 320, 0 offenders |

### X8 — keyboard, `/pet` at 1440

| Check | Result | Observed |
|---|---|---|
| Reach the source link | **PASS** | From "Connect wallet", one **Tab** lands on the reference source link (accessible text ends "(opens in a new tab)") |
| Visible focus | **PASS** | `:focus-visible` true; outline `solid 2px rgb(198, 255, 0)`. Contrast of the ring against its background was not measured |
| No trap | **PASS** | Next **Tab** leaves the reference card ("View source ↗") |
| Retry reading | **NOT RUN** | Only rendered in the unavailable state, which did not occur live |
| Screen-reader speech | **NOT RUN** | DOM names and roles only |

No console errors on `/pet`.

## Open items

1. **X3** — Deston's genuine walkthrough; attribute the +1 with
   `node docs/qa/counter-check.mjs <before> <after>`.
2. **X7** — reduced motion on the release on a machine with the OS setting on
   (Codex's run covers this; a second machine would be independent).
3. **Wallet ownership** of the three cares above — Deston to confirm so the
   pitch wording is honest.
4. **Cooldown trap** — any pitch-wallet care after 08:00 SGT on 7 October
   blocks the on-stage care (`FINALE_RUNBOOK.md`).
