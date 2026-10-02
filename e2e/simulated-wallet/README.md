# Simulated wallet browser regressions

This suite runs a fresh, extension-free Chromium browser against a **local
production build**. It does not connect a real wallet, sign, submit, or establish
genuine wallet acceptance. Keep `SIMULATED` in test/report labels. Actual wallet
evidence belongs in the separate [acceptance session](../../docs/qa/FINAL_WALLET_SESSION.md).

## Run

```bash
npm ci
npx playwright install chromium
npm run build
npm run test:e2e:simulated
```

Linux CI uses `npx playwright install --with-deps chromium`. The exact
`@playwright/test` version and its browser revision are pinned by the lockfile.
Playwright owns port **3417**, starts/stops the production server and refuses
to reuse an existing process. Rebuild after product changes. It never targets
the live alias or a user's browser profile. Reports, screenshots and traces
stay in ignored `playwright-report/` and `test-results/` folders.

The initial smoke covers no-provider guidance and a simulated failed community
read remaining unknown. It intercepts all external browser requests and local
API requests before navigation. Local app/assets still load normally; no public
RPC availability is needed. The existing Next.js build may download fonts.

The lead-owned `provider-selection.spec.ts` adds 390px and 1440px cases with
two fictional providers. It covers duplicate discovery, no default choice,
selection without a permission request, provider-specific connect/network/revoke,
ignored unselected-provider events and narrow-screen layout. It does not test a
real extension or submit a transaction. Keep that file unchanged during B2;
add broader scenarios in separate specs.

These fixtures expect the committed X Layer testnet configuration (1952).
If your local build uses an Anvil override, rebuild with the documented public
testnet values in process-local environment variables first; preserve private
local configuration files. A mock network switch must match the actual build's
declared network, not merely change the expected assertion to hide a mismatch.

## YeeWei's remaining B2 scenarios

Implement these as separate small tests; they are planned, **not covered yet**:

- Account A → B and A → B → A while old pet/recap answers are still pending.
- Failed pet, community and recap reads, then read-only retry/recovery.
- Combined pet, personality, recap and garden panels agree on the active scope.
- Extend the lead's two-provider smoke with the same address/network in both
  providers and pending pet/recap results; verify stale facts never carry across.
- After lead recovery integration: refresh with a saved public hash; pending,
  confirmed, reverted, malformed, wrong-scope and unavailable-storage cases.
  Retry must check confirmation, never submit another transaction.

Inject fake provider APIs/events with `page.addInitScript` before navigation;
stub every RPC and `/api/companion` response. Do not add fixture fallbacks to the
application, use personal wallet addresses/keys, attach an extension, or replay
transactions against a public network. Keep fictional inputs in test files.
Use deterministic delayed responses to demonstrate that stale results are
discarded. Assertions should check visible behavior and intercepted request
counts, rather than reproducing hook internals.

Lead owns package/CI/config changes; YeeWei owns additional scenarios under
this folder. Follow the shared beta interfaces before testing future behavior.

References: [browser API simulation](https://playwright.dev/docs/mock-browser-apis),
[managed web server](https://playwright.dev/docs/test-webserver).
