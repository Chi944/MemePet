# B2 recovery, help and browser regression — 2 October 2026

> **SIMULATED WALLET BROWSER REGRESSION.** Every browser result below uses
> fictional EIP-1193 providers, fictional RPC answers and a fictional
> `/api/companion` in local Chromium against a local production build. No
> wallet extension, signature, transaction or public network was used. This is
> **not** genuine wallet acceptance and does not close
> [the final wallet session](../../FINAL_WALLET_SESSION.md).

- Branch: `feat/beta-recovery-help-regression`
- Started from `origin/main` at `6f6a6c4` (#80, #81); reconciled by merging
  `origin/main` at `16da0ba` (#82). Final head: see PR #83.
- Runtime: macOS, Node v24.21.0 (`.nvmrc` pins 24.19.x), Playwright 1.63.0 from the lockfile

## Delivered

| Item | Files |
|---|---|
| `TransactionRecoveryPanel` (idle, checking, pending, confirmation unknown, confirmed awaiting facts, confirmed, reverted, cancelled, replaced) | `src/components/recovery/**` |
| `HelpPanel` (FAQ disclosures, https-only links, support-unavailable state) | `src/components/help/**` |
| Simulated chain/API and provider fakes | `e2e/simulated-wallet/support/**` |
| Account races, failed reads, combined panels, same-address provider swap | `e2e/simulated-wallet/*.spec.ts` (not `provider-selection.spec.ts`) |

Recovery has one operation, **Check status**, which reads the existing hash.
It is focusable but inert while checking (`aria-disabled`), hidden once the
outcome is settled (confirmed, reverted, cancelled), and never offers resend,
dismissal, signing or storage. A replacement hash is rendered separately and
never as confirmation. Explorer and help links render only for `https:` URLs.
Help answers are plain text; a null or non-https `supportUrl` shows
“Support contact unavailable”. Test FAQ entries are local fictional samples;
Larm's `src/content/help.ts` was not read into or edited by this lane.

## Automated / unit results (actual, final code incl. #82)

| Command | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass (0 errors; 1 existing warning in `ShareImage.tsx`, not B2) |
| `npm test` | Pass — 49 files, 623 tests |
| `npx vitest run src/components/recovery src/components/help` | Pass — 2 files, 29 tests (new) |
| `npm run build` | Pass |
| `node --test docs/qa/counter-check.regression.mjs` | Pass — 8/8 |
| `node --test docs/qa/rpc-recovery.regression.mjs` | Pass — 14/14 |

Local `node_modules` predated #80; `npm ci` from the committed lockfile fixed
the missing `@playwright/test`. No package changed.

## Author's earlier simulated results (before lead harness correction)

The run counts below are the author's results. The lead subsequently found
that resolving Playwright `route.fulfill()` did not prove browser delivery:
Chromium can suppress cancellation errors. Delivery classifications from these
earlier runs are superseded by the lifecycle-observed lead results below.

| Command | Result |
|---|---|
| `npm run test:e2e:simulated` | 15 passed, 8 skipped (fixme / NOT RUN), 0 failed |
| `npx playwright test account-races same-address combined failed-reads --repeat-each 5` | 60/60 expected, 0 unexpected, 0 flaky |

| Scenario | Spec | Result |
|---|---|---|
| A → B: old answers released after B renders; B's 80 points / 8 cares remain | `account-races` | Pass; delivery classification superseded |
| A → B → A: original A answer (3 cares) delivered late; newer A read (4 cares) remains | `account-races` | Pass |
| Account list emptied: previous facts removed, recap asks to connect | `account-races` | Pass |
| Failed pet/community/recap reads: “Read failed” / “Unknown” / alert; no Adopt, no zero total, no garden bar | `failed-reads` | Pass |
| Genuine no-pet and zero total render as “None yet” / “0”, unlike failures | `failed-reads` | Pass |
| Retry recovery: community and recap via their retry buttons; pet via the existing 30 s refresh (page clock advanced) | `failed-reads` | Pass |
| Combined agreement A then B: pet growth, recap, recap evidence, community cares and garden match (390px, 1440px) | `combined-panels` | Pass |
| Failed community read is “Unknown” in meta, garden and recap evidence (390px, 1440px) | `combined-panels` | Pass |
| Same address/chain via second provider: first provider's late pet and recap answers ignored | `same-address-provider` | Pass |
| Same address/chain: first provider's failed read not shown after switching | `same-address-provider` | Pass |
| No unexpected network request (all non-local, non-RPC traffic blocked and asserted empty) | all new specs | Pass |
| No send/sign/switch/revoke provider call in read and retry flows | all new specs | Pass |

The earlier harness labelled recap answers delivered in 15/15 repeated cases.
That label was inferred from fulfillment, not observed network completion,
and is withdrawn. It does not prove that late recap bodies reached the page.
The lead's `provider-selection.spec.ts` (unchanged) passed in the same suite
run at 390px and 1440px; its explicit-choice coverage is cited, not duplicated.

No flaky test was reported in that run. The lead's two fixture/evidence
corrections and additional assertions are recorded next.

## Lead integration verification — Windows, 2 October 2026

Reviewed B2 head `48fefc7` combined with main `16da0ba` (#82). The final
repair head and release identifiers are recorded in PR #83.

- Held replies now observe the exact Request's `requestfinished` or
  `requestfailed` event before classifying delivery/abort. Observers register
  before the test changes account; unexpected errors and uncompleted holds
  fail the test. Fulfillment success alone proves neither outcome.
- Pet RPC and companion fixtures now agree that yesterday's care is eligible
  today. The fixture no longer silently increases a community total.
- Combined cases assert visible, enabled care and matching recap eligibility.
  All new read-only scenarios explicitly assert no write/sign/network-change/
  revocation calls, including the empty-account and failed-provider cases.
- `npm test`: **623 tests / 49 files passed**. Typecheck, lint and production
  build passed; lint retains the existing share-image warning. Build used
  process-local public testnet values without changing private local config.
- Counter/RPC helper checks: **22 passed**.
- Full simulated Chromium suite: **15 passed, 8 skipped**, no failures.
  Skips remain the gated B5 runtime cases, not acceptance passes.
- With actual request events, the three late pet responses completed and
  were ignored by the newer session; all three old recap requests were
  **aborted**. These recap cases prove cancellation and visible isolation,
  not delivery of an old recap body to the application.
- Repeated `account-races` and `same-address-provider` three times each after
  the final assertions: **15/15 passed**, no failures or flaky cases. All nine
  late recap requests were observed aborted; late pet delivery assertions passed.

This remains simulated evidence. No genuine wallet action was performed.

## Evidence

- [Combined panels for account B at 390px](simulated-combined-b-390.png) — SIMULATED
- [Failed reads at 1280px](simulated-failed-reads-1280.png) — SIMULATED
- Full Playwright HTML report and traces: local ignored `playwright-report/`, `test-results/`

## NOT RUN

- **Transaction recovery after refresh** (8 `test.fixme` cases in
  `recovery-refresh.spec.ts`): awaits the lead's B5 adapter, which is gated on
  genuine final wallet acceptance.
- **Panels in a real page**: no `/help` route or preview route renders
  `HelpPanel` / `TransactionRecoveryPanel`, so narrow-screen browser screenshots
  of these panels were not taken. Keyboard/focus behaviour is covered by jsdom
  tests (native `<details>`, focusable `aria-disabled` button) only.
- **Kym's `WalletChooser` route integration**: not wired yet.
- **Genuine MetaMask/OKX checks**: out of scope for this lane.

## Requested lead integration

1. Wire `/help` with `HelpPanel` and Larm's reviewed `HELP_ENTRIES` / `SUPPORT_URL`.
2. Optionally add a development preview for both panels so 320/390px browser
   evidence can be captured; I will add specs once it exists.
3. After B5 acceptance: supply the recovery adapter and the state that maps to
   `TransactionRecoveryState`; I will replace the fixme cases with real specs.
