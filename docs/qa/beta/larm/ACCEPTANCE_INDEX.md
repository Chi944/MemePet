# Beta acceptance index

One row per beta checkpoint. Evidence belongs to the named owner and is
**cited, not rerun**, unless the row says Larm ran it. PASS covers only what
the evidence column states. SIMULATED rows use fictional providers and RPC
answers, and none of them stands in for genuine wallet acceptance.

**Updated 3 October 2026 (Singapore)** from `main` at `3148238` (#92) and the
PR list. First compiled 2 October at `ce77d1a` (#87). Update a row only with
new evidence; keep FAIL / NOT RUN rows.

| # | Checkpoint | Owner | Release / PR | Evidence (attributed) | Status |
|---|---|---|---|---|---|
| 1 | B0 foundation: shared types, read budgets, pinned tools, harness | Codex (lead) | [#80](https://github.com/Chi944/memepet/pull/80), merged `99086a3` | Lead: CI run 36972049272 at head `17c357c` (413 app tests, 15 contract tests, 22 helper checks, 1 simulated smoke). [BETA_FOUNDATION](../../evidence/BETA_FOUNDATION_2026-10-02.md) | PASS (automated + SIMULATED) |
| 2 | B4 explicit wallet selection | Codex (lead) | [#81](https://github.com/Chi944/memepet/pull/81), merged `6f6a6c4` | Lead: PR CI 36974992013 and main CI 36975242405; 453 app tests; 3 SIMULATED Chromium cases. [WALLET_SELECTION](../../evidence/WALLET_SELECTION_2026-10-02.md) | PASS (SIMULATED) |
| 3 | Genuine MetaMask / OKX selection on a release | Codex prepares, Deston approves | none yet | None | NOT RUN |
| 4 | Panel adapters and transaction identity helpers | Codex (lead) | [#82](https://github.com/Chi944/memepet/pull/82), merged `16da0ba` | Lead: main CI 36978050643; 594 app tests. Helpers have no live importer | PASS (helpers only) |
| 5 | B2 Recovery and Help panels, simulated regressions | YeeWei | [#83](https://github.com/Chi944/memepet/pull/83), merged `5a84e23` | YeeWei, with lead verification: 623 tests, typecheck, lint, build; 15 SIMULATED browser cases passed, 8 skipped. [B2_REGRESSION](../yeewei/B2_REGRESSION_2026-10-02.md) | PASS (components + SIMULATED) |
| 6 | Read-only pet retry and `/dev/beta` previews | Codex (lead) | [#85](https://github.com/Chi944/memepet/pull/85), merged `b4e9b85` | Lead: main CI 36984936127; 639 app tests; 15 SIMULATED + 3 fictional preview cases; production `/`, `/pet` 200 and `/dev/*` 404. [BETA_PREVIEW_RETRY](../../evidence/BETA_PREVIEW_RETRY_2026-10-02.md) | PASS (automated + SIMULATED) |
| 7 | B1 wallet chooser, onboarding, milestones, garden chapters (components) | Kym | [#90](https://github.com/Chi944/memepet/pull/90), merged `99050c6` | Kym: 736 tests, typecheck, lint, build, 22 helper checks; fictional harness at 320/390/1440 px. Her own NOT RUN list (real wallets, mobile wallet browsers, screen reader, other browsers) stands. [B1_HANDOFF](../kym/B1_HANDOFF_2026-10-02.md) | PASS (components + FICTIONAL) |
| 8 | B1 live integration on `/pet` | Codex (lead) | [#91](https://github.com/Chi944/memepet/pull/91) `300d5cb`, then [#92](https://github.com/Chi944/memepet/pull/92) `3148238` | Lead: 737 tests; 21 production Playwright cases (18 SIMULATED wallet + 3 read-only Help), 8 B5 cases skipped. **Main CI failed** at `99050c6` (run 37029557193) and `300d5cb` (run 37032133277); #92 stabilised the network-rejection regression and main CI 37032767176 passed at `3148238`. [B1_INTEGRATION](../../evidence/B1_INTEGRATION_2026-10-02.md) | PASS at `3148238` (SIMULATED); earlier main CI FAIL kept |
| 9 | B5 receipt validation helpers | Codex (lead) | [#89](https://github.com/Chi944/memepet/pull/89), merged `48ee4c7` | Lead: main CI 36995894401; 44 regressions. No live importer at `3148238` (checked by Larm, see below) | PASS (helpers only) |
| 10 | B3 FAQ content (`HELP_ENTRIES`, `SUPPORT_URL = null`) | Larm | [#87](https://github.com/Chi944/memepet/pull/87), merged `a92416f` | Larm: typecheck, lint, 639 tests, local render check; PR CI 36986537913 passed. Lead edited four sentences when B1 shipped (#91), checked in row 13 | PASS (content + automated) |
| 11 | Public `/help` route and navigation | Codex (lead) | [#88](https://github.com/Chi944/memepet/pull/88), merged `d3941c4` | Lead: 639 tests, build, 3 read-only Help browser cases at 320/390/1440 px; main CI 36989672641. [BETA_HELP](../../evidence/BETA_HELP_2026-10-02.md) | PASS (automated + browser) |
| 12 | Official guidance links in the FAQ | Larm | #87; rechecked on release `3148238` | Larm, 2 and 3 October: all 6 destinations opened, 200, titles/content match (below) | PASS (on 3 October) |
| 13 | FAQ wording and links on the released `/help` | Larm | release `3148238`, this PR | Larm, 3 October: live HTML matches `help.ts` at `3148238` (49/49 strings); 320/390/1440 px layout; real-key keyboard check. Details below | PASS (HOSTED, read-only) |
| 14 | Final genuine wallet acceptance | Deston (private approval), Codex | [FINAL_WALLET_SESSION](../../FINAL_WALLET_SESSION.md) | None | NOT RUN |
| 15 | B5 transaction recovery runtime (8 recovery cases) | Codex, **after row 14** | gated | 8 cases still skipped at `3148238`; "Check status" not wired into any live route or hook | NOT RUN |
| 16 | Combined B1/Help release QA | YeeWei | pending | Not received by 3 October | NOT RUN |
| 17 | Focused released onboarding/progression check | Kym | pending | Not received by 3 October | NOT RUN |
| 18 | Finale combined QA (separate from beta) | Larm | [#86](https://github.com/Chi944/memepet/pull/86), merged `ce77d1a` | Larm: hosted G/O/E and fixture rows PASS; read recovery executed; W1–W6 and E12 NOT RUN. The lead's qualification stands: the local runtime version is unresolved and alias-to-SHA was not proven during that run. [COMBINED_QA](../../finale/larm/COMBINED_QA_2026-10-02.md) | PARTIAL |

## Release check of `/help` — 3 October 2026 (row 13)

Run by Larm, 2 October 16:30–16:40 UTC (3 October 00:30–00:40 Singapore).
Read-only: no wallet, no signing, no chain write.

**Release identity.** `main` = `3148238f5a0d216fa704ad6176135d2e25555cda`.
GitHub's latest Production deployment is 6812922873 for `3148238`, state
`success`. The lead records Vercel deployment `dpl_E5nmo41hachVjySMn7Q6AfPMMQ7g`
behind `memepet.vercel.app` at that SHA (#91/#92). I did **not** prove the
alias myself: the per-deployment URL redirects to a Vercel login, which I did not
pass. The content match below shows the live page serves `help.ts` exactly as
it is at `3148238`.

| Check | Result |
|---|---|
| Live HTML vs `src/content/help.ts` at `3148238` (every question, paragraph, link label and href) | **49 / 49 match**, 10 entries, 10 `<summary>` elements; `SUPPORT_URL` is `null` |
| Support card | "Support contact unavailable. No monitored support contact has been verified yet, so none is listed." |
| Lead's four wording changes checked against code at `3148238` | Local reset label: `OnboardingPanel.tsx` ("Next reset in your local time"; UTC rule unchanged; care panel still `timeZone: "UTC"`). Garden "Retry reading": `FinaleCommunityPanel.tsx`. Milestones 5/10/20 and chapters 20/50/100 on Your pet: `beta-progress.ts`, `ProgressionPanel` mounted in `pet-live-client.tsx` ("Reaching a milestone never resets it"). "The public MemePet app runs on X Layer testnet": matches the public deployment |
| Planned copy still accurate | Recovery stays planned: no live route, hook or component imports `pending-transaction-*` or `TransactionRecoveryPanel` outside `/dev` and its own folder |
| Layout, all FAQs open (Chrome 154 headless, Windows) | 320, 390, 1440 px: `scrollWidth == clientWidth`, no overflowing element; one h1 ("Mochi, made simple."); Help nav item `aria-current="page"`; all 10 FAQs closed on load; smallest text 13 px |
| Keyboard (real key events, 390 px) | Tab reaches the first question with a 2 px lime outline; Enter opens, Enter closes, Space opens; next Tab moves to "Get OKX Wallet" |
| Links | 6 FAQ links plus the footer "View source"; all `https`, `target="_blank"`, `rel="noreferrer"` |
| Console | No errors or warnings |

Screenshots (all FAQs opened for inspection; visitors see them closed):
[320 px](screenshots/help-release-2026-10-03/help-live-320.png),
[390 px](screenshots/help-release-2026-10-03/help-live-390.png),
[1440 px](screenshots/help-release-2026-10-03/help-live-1440.png).

**Observation, not a defect claim:** at 320 px the ↗ after "X Layer testnet
faucet (OKX)" and "X Layer network information" wraps onto its own line.
Readable; it belongs to YeeWei's HelpPanel, so I made no change.

**Not run:** screen readers, other browsers, real phones, OS zoom, and any wallet
flow. Help needs no wallet, so this row says nothing about wallet behaviour.

### Link recheck, 3 October

| Link | Result |
|---|---|
| `https://web3.okx.com/download` | 200, "Download OKX Wallet …" |
| `https://support.metamask.io/start/getting-started-with-metamask/` | 200, "How to install MetaMask \| MetaMask Help Center" |
| `https://web3.okx.com/xlayer/faucet` | 200, "X Layer Testnet Faucet"; says testnet tokens have no actual value |
| `https://web3.okx.com/onchainos/dev-docs/xlayer/developer/build-on-xlayer/network-information` | 200; lists testnet chain ID 1952 and mainnet 196 |
| `https://www.okx.com/web3/explorer/xlayer-test` | 200 after redirect to `web3.okx.com/explorer/x-layer-testnet`, "X Layer - Testnet explorer" |
| `https://support.metamask.io/more-web3/dapps/disconnect-wallet-from-a-dapp/` | 200, "How to disconnect a wallet from a dapp \| MetaMask Help Center" |

No faucet claim, sign-in or wallet action was made on any of these sites.

## Corrections to the 2 October entries

- The #87 handoff said the render check showed "9 links". The FAQ has **6**
  links; that test computed the expected count from the data and passed. Only
  my reported number was wrong.
- #87's local checks ran on dependencies installed from the lockfile. On
  3 October that install reports `next` **16.3.8**, the pinned version. Hosted
  CI on `50ae7bc` is the authoritative record for #87.

## Open questions for the lead

1. **Support contact.** Still none confirmed. GitHub Issues is enabled on the
   public repository, but no one has said it is monitored, so `SUPPORT_URL`
   stays `null`.
2. **Recovery copy.** The "Planned: a Check status option" paragraph stays
   until B5 ships. When it does, I will rewrite it against the released behaviour.
