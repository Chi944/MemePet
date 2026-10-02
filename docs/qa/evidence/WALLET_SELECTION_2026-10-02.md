# B4 wallet selection — 2 October 2026

Lead implementation on `feat/beta-wallet-selection`, based on reviewed main
`99086a3fa2b20b6179183e560f4816ae4d2e47c6` (#80). The associated PR identifies the
exact final head and release checks. This record reports local checks against
the implementation in this commit; it does not assert a later live-wallet run.

## Behavior delivered

- Bounded EIP-6963 discovery and legacy fallbacks deduplicate provider objects.
  Announcements are untrusted: only short text labels are displayed; no wallet
  HTML, SVG icons or branding-authenticity claims are accepted.
- Multiple providers require a deliberate choice. Discovery/selection never
  asks for account permission; Connect is a separate action. A single provider
  can restore previously granted access unless local disconnection is saved.
- Connect, network switch, events, permission revocation and wallet-client
  requests use the chosen provider. Old clients check session validity before
  and after each request; a late chain read cannot lead to a stale send.
- Pet/community/recap state and earned-form viewing reset on provider-session
  changes, including the same account/chain in two providers. Browser-local
  personality remains scoped to chain/registry/account and is preserved.
- Late connect/revoke/network responses cannot replace newer state or release
  newer busy locks. Disconnect supersedes a stalled network-switch request.
  Saved disconnect intent does not transfer a revocation claim to another wallet.
- A minimal native radio picker is integrated on `/pet`, using the shared B1
  interface. Kym still owns the fuller onboarding/chooser presentation.

No contract, ABI, deployment configuration, dependency or payment integration
changed. Provider choice is intentionally session-local: with multiple wallets,
a fresh page/route mount asks for a choice again. Already-open wallet prompts
must still be handled in the wallet; invalidating a client cannot retract a
request that has already reached an extension.

## Actual checks

Environment: Windows; Node 24.19.0; npm 11.19.0; Foundry 1.8.3 at
`cae51ad458f6abb64852b7709eb784352429825d`; local production build.

| Command / observation | Result |
|---|---|
| `npm test` | PASS: 453 tests, 44 files |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS: zero errors; existing `ShareImage.tsx` img warning |
| `npm run build` | PASS, explicit public X Layer testnet values for this process |
| `npm run test:contracts` | PASS: 15 tests |
| `node --test docs/qa/counter-check.regression.mjs docs/qa/rpc-recovery.regression.mjs` | PASS: 22 tests |
| `npm run test:e2e:simulated` | PASS: 3 local Chromium cases, no extension |
| Generated browser screenshots at 390px and 1440px | Inspected: readable picker, selected state, no horizontal overflow in the checked flow |

The focused wallet/discovery group contains 45 tests. Additional hook tests
exercise old signatures/receipts/replies, A→B→A provider sessions, receipt-floor
reset and preservation of real browser-local personality settings. They remain
unit simulations, not evidence of a real wallet signature or chain write.

### Browser evidence scope: SIMULATED WALLET BROWSER REGRESSION

The pre-existing no-provider test passed. Two new cases use fictional MetaMask
and OKX providers at 390px and 1440px. They prove no default selection or account
requests before Connect, duplicate discovery collapse, OKX connection, ignored
MetaMask events while OKX is selected, then MetaMask connection/network switch
and revocation. Assertions inspect both visible state and provider request counts.
No signing/send method occurs. All external browser and local API requests are
intercepted; unavailable facts remain unavailable.

Screenshots/reports remain ignored local output under `test-results/` and
`playwright-report/`. The provider-selection spec captures choice and connected
views on every run. They contain fictional addresses, not personal wallet data.

### Failures resolved during verification

1. Initial browser run: no-provider passed, both provider tests failed because
   the local build used Anvil 31337 while the fixture expected testnet 1952.
   The UI correctly switched to its configured Anvil network. Rebuilt using
   the committed deployment's public values in process-local environment
   variables; preserved the private local configuration file and kept the
   expected testnet assertion. All three cases then passed.
2. Rerunning lint after a failed browser trace tried to lint Playwright's
   generated third-party viewer JavaScript. Added only generated report/result
   directories to ESLint ignores; app and `e2e/` source remain checked. Lint
   then passed with the existing share-image warning.

## Acceptance and remaining work

- Genuine MetaMask and OKX connection/provider-switch/write/revoke acceptance
  on this release: **NOT RUN**. Earlier real-wallet passes do not carry over.
- Final session in `docs/qa/FINAL_WALLET_SESSION.md`: **NOT RUN** here.
- B5 public-hash persistence/recovery runtime: **NOT ENABLED**, still gated.
- B1 full onboarding/progression, B2 help/recovery UI and broader browser cases,
  B3 actual help content: assigned teammate work, not completed by this PR.
- No claim that the production alias runs this B4 code until its PR is merged
  and deployment metadata is verified. #80's prior public alias was independently
  verified READY at `99086a3`; B4's release result belongs in the PR handoff.
