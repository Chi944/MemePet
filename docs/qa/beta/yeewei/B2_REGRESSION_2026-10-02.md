# B2 recovery, help and browser regression — 2 October 2026

> **SIMULATED WALLET BROWSER REGRESSION.** Every browser result below uses
> fictional EIP-1193 providers, fictional RPC answers and a fictional
> `/api/companion` in local Chromium against a local production build. No
> wallet extension, signature, transaction or public network was used. This is
> **not** genuine wallet acceptance and does not close
> [the final wallet session](../../FINAL_WALLET_SESSION.md).

- Branch: `feat/beta-recovery-help-regression`
- Base: `origin/main` at `6f6a6c4` (contains #80 and #81)
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

## Automated results (actual)

| Command | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass (0 errors; 1 existing warning in `ShareImage.tsx`) |
| `npm test` | Pass — 46 files, 482 tests (includes 29 new panel tests) |
| `npm run build` | Pass |
| `node --test docs/qa/counter-check.regression.mjs` | Pass — 8/8 |
| `node --test docs/qa/rpc-recovery.regression.mjs` | Pass — 14/14 |
| `npm run test:e2e:simulated` | 15 passed, 8 skipped (fixme / NOT RUN) |
| `npx playwright test account-races same-address combined failed-reads --repeat-each 3` | 36/36 passed (flakiness check) |

Before the build, local `node_modules` predated #80; `npm ci` from the
committed lockfile fixed the missing `@playwright/test`. No package changed.

### Browser scenarios (SIMULATED)

| Scenario | Result |
|---|---|
| A → B: A's held pet answer is delivered after B renders; B's 80 points / 8 cares remain | Pass |
| A → B → A: original A answer (3 cares) delivered late; newer A read (4 cares) remains | Pass |
| Account list emptied: previous facts removed, recap asks to connect | Pass |
| Failed pet/community/recap reads: “Read failed” / “Unknown” / alert; no Adopt button, no zero total, no garden bar | Pass |
| Genuine no-pet and zero total render as “None yet” / “0”, unlike failures | Pass |
| Retry recovery: community and recap via their retry buttons; pet via the existing 30 s refresh (page clock advanced) | Pass |
| Combined agreement A then B: pet growth, recap, recap evidence, community cares and garden match at 390px and 1440px | Pass |
| Failed community read is “Unknown” in meta, garden and recap evidence (390px, 1440px) | Pass |
| Same address/chain via second provider: first provider's late answer ignored | Pass |
| Same address/chain: first provider's failed read not shown after switching | Pass |
| No unexpected network request (every non-local, non-RPC request blocked and asserted empty) | Pass in every new test |
| No send/sign/switch/revoke provider call in read and retry flows | Pass |

Late recap fetches are aborted by the app on scope change; the pet RPC answer is
asserted as actually delivered, so those tests do exercise the stale-result guard.
The lead's `provider-selection.spec.ts` passed unchanged in the same run (390px,
1440px); its explicit-choice coverage is cited, not duplicated.


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
