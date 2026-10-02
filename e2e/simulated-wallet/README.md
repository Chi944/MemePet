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

## YeeWei's B2 scenarios

Shared fakes live in `support/`: `simulated-chain.ts` answers the configured
RPC URL and `/api/companion` from fictional state, can hold one answer until
the test releases it, and blocks and records every other non-local request.
`simulated-provider.ts` injects fictional EIP-1193 providers; send/sign/switch
requests are rejected and recorded.

| Spec | Covered (SIMULATED) |
|---|---|
| `account-races.spec.ts` | A → B and A → B → A with held old answers; pet delivery and recap delivery/abort observed from exact request events; emptied account list |
| `failed-reads.spec.ts` | Failed pet/community/recap reads stay unknown; genuine no-pet and zero total differ; read-only retry recovery |
| `combined-panels.spec.ts` | Pet, recap (and its evidence) and garden agree for A then B; failed community read is unknown everywhere; 390px and 1440px |
| `same-address-provider.spec.ts` | Same address/chain via a second provider: old late answers and old failures do not carry across |
| `recovery-refresh.spec.ts` | **NOT RUN / fixme** until the lead's gated B5 recovery adapter lands |

Held-response fulfillment is not evidence of browser delivery. The harness
observes the exact request's finished/failed events, fails unexpected errors
and unfinished holds, and records aborted recaps separately. An aborted recap
proves cancellation/isolation; it does not prove an old body reached React.
Combined-panel cases also compare care eligibility, not only displayed counts.

Failed pet reads now have a read-only **Retry pet read** action. Its recovery
test holds the response and verifies loading, retained focus, inert repeated
activation and no provider write before restoring confirmed facts. The existing
30-second background refresh remains. Kym's `WalletChooser` route integration and a
`/help` route are not wired yet, so their browser cases are not written.

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
