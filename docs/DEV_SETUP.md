# MemePet development setup

**Help integration checks:** after a production build, run
`npm run test:e2e:simulated` for the existing simulated-wallet cases plus
three explicitly READ-ONLY Help cases at 320/390/1440px. Help uses real copy,
blocks unexpected API/external requests and must not inspect a wallet.
Run `npm run test:e2e:previews` separately for fictional development panels.
B5 recovery scenarios now run in the simulated suite. They do not count as
genuine wallet acceptance; use the dated B5 evidence for the changed-release gate.

Current setup for the existing Next.js app. Historical scaffolding tasks are complete.

## Requirements

- Node **24.19.x** (`.nvmrc`) and npm **11.19.x** (`packageManager`).
- Foundry **v1.8.3** for contract tests and local-chain work; the application can run without it.
- Network access for live RPC reads and build-time Google Fonts downloads.

## Install and run

From the repository root:

```bash
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The committed
[`DEPLOYMENT`](../src/lib/deployment.ts) points to X Layer testnet, chain **1952**,
registry `0xe844152262D243a7B90F6e07FF7A67F1d7FeD216`. No environment override is
needed for the public testnet setup. Browsing needs no wallet; transactions need
an injected wallet and testnet gas.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
node --test docs/qa/counter-check.regression.mjs
node --test docs/qa/rpc-recovery.regression.mjs
node --test docs/qa/wallet-preflight.regression.mjs
```

Contract checks use Foundry **v1.8.3** (commit
`cae51ad458f6abb64852b7709eb784352429825d`) and forge-std **v1.16.2**
(commit `bf647bd6046f2f7da30d0c2bf435e5c76a780c1b`). CI pins both;
Solidity is already pinned to **0.8.24** in `contracts/foundry.toml`.
Install/select the same Foundry release with `foundryup --install v1.8.3`
using your installed Foundry manager, or use the matching official release binary.
Check `forge --version` before running the tests; it should report 1.8.3.

Then, from the repository root:

```bash
cd contracts
forge install foundry-rs/forge-std@rev=bf647bd6046f2f7da30d0c2bf435e5c76a780c1b --no-git
cd ..
npm run test:contracts
```

The library stays unvendored in the ignored `contracts/lib/` directory. If that
directory already contains a different/local copy, preserve any local work and
use a fresh checkout with the pinned install command for reproducible checks.
Do not use an unqualified install or a moving `stable`/`nightly` toolchain.
To upgrade, change the CI install (including its retry) and this setup together,
then rerun contract checks. The Foundry installer action is also pinned to its
v1.9.1 commit, rather than the moving `v1` tag.

Upstream references: [Foundry v1.8.3](https://github.com/foundry-rs/foundry/releases/tag/v1.8.3),
[forge-std v1.16.2](https://github.com/foundry-rs/forge-std/releases/tag/v1.16.2),
[toolchain version inputs](https://github.com/foundry-rs/foundry-toolchain#inputs).

`npm test` is a non-interactive Vitest run. CI also starts the production build
and asserts `/` returns 200 and `/dev/pet`, `/dev/landing`, `/dev/community`, `/dev/finale`, `/dev/companion`, `/dev/beta`
return 404. For local production inspection, use `npm run start` after building.
A test pass does not establish a real wallet transaction.

### Simulated browser regression

```bash
npx playwright install chromium
npm run build
npm run test:e2e:simulated
```

Playwright **1.63.0** is pinned in the lockfile. The harness starts/stops its own
local production server on `127.0.0.1:3417`; leave that port free. CI installs
Chromium with `--with-deps` and runs the same script after the build. Vitest
excludes `e2e/**` because Playwright owns those specs. Browser output is labelled
**SIMULATED WALLET BROWSER REGRESSION**. It uses controlled inputs without a
wallet extension or signing and cannot establish genuine acceptance. See
[the scenario handoff](../e2e/simulated-wallet/README.md) for implemented versus
remaining coverage. Reports/traces are local ignored output.

The separate Node regressions check the read-only counter evidence helper's
block selection, interval boundaries and validation; they never sign or write.
The recovery regressions use a mocked upstream to test a local read-only fault
proxy. For actual browser failure/recovery, follow [the controlled setup](qa/READ_RECOVERY.md).

## Read-only recap API

After starting the app, `GET /api/companion` returns public API metadata and the
configured chain/registry. `POST /api/companion` accepts JSON such as:

```json
{"address":"0xb7E6D789c39D468CfE3c5dA37C29Bd9852247B3a","question":"progress"}
```

The questions are `progress`, `next-care` and `contribution`. Omit the question
for facts only. An optional decimal-string `blockNumber` reads a historical or
receipt snapshot; use its source timestamp rather than implying current state.
No wallet signature, API key or model account is needed. The endpoint cannot
accept another RPC URL, registry, chain or arbitrary prompt.

HTTP 200 contains a verified pet snapshot or a genuine no-pet result; failed
reads use 503. Invalid JSON/input, a stalled body, excessive body size and wrong
content type use 400/408/413/415. A busy instance returns 429. Bodies are limited
to 1 KiB; requests and RPC calls have deadlines. Four distinct active reads per
instance and identical-query coalescing limit load, but are not distributed rate
limiting or a hosting-quota guarantee. There are no paid model calls.

See [adapter wiring](finale/INTEGRATION.md) and
[OKX.AI registration preparation](finale/OKX_AI_SERVICE.md). Marketplace listing
and an actual OKX.AI invocation are separate from a direct API request.

## Developer previews

Run the development server and open:

| Route | Purpose |
|---|---|
| `/dev/pet` | Fictional stage/care states, celebration and callback counters |
| `/dev/landing` | Landing presentation and navigation callback |
| `/dev/community` | Loading, zero, growing, achieved, unavailable and unknown-target states |
| `/dev/finale` | Shared fictional companion, personality and garden inputs for parallel finale work |
| `/dev/companion` | Recap/evidence workbench with fictional ready, unknown, stale-reply and failure states |
| `/dev/beta` | Fictional recovery, Help, onboarding, wallet choice and milestone states with callback counters; no recovery runtime |

Previews carry **UI preview — fictional data** labels, never award chain progress,
and are unavailable in production. Keep them for repeatable visual and error-state QA.

`npm run test:e2e:previews` starts a separate local development server on
`127.0.0.1:3418` and tests `/dev/beta` in Chromium at 320/390/1440px.
Leave that port free. These are **FICTIONAL UI PREVIEW** checks: no network
reads, wallet or signing is involved. The production suite remains separate;
CI also checks that `/dev/beta` returns 404 in a production build. In
`/dev/companion`, `careAvailable` supplies the requested available-at-read
example; the viewer's computer clock does not establish eligibility.

Run the simulated suite before previews when retaining both reports. Preview
artifacts use `test-results/dev-preview` and `playwright-report/dev-preview`,
so they preserve the preceding simulated run. Rerunning the simulated suite
clears those parent output folders; copy any evidence you need first.

## Separate local Anvil setup

Use this only for an isolated local test. Local state is not X Layer evidence.

1. Start `anvil` on its default loopback RPC `http://127.0.0.1:8545` (chain 31337).
2. Deploy using an **unlocked local Anvil account's public address**:

   ```bash
   forge create --root contracts src/PetRegistry.sol:PetRegistry \
     --rpc-url http://127.0.0.1:8545 --broadcast --unlocked \
     --from <LOCAL_TEST_ACCOUNT_ADDRESS>
   ```

3. Copy [`.env.example`](../.env.example) to `.env.local`; fill the local status,
   name, chain, RPC and actual deployed registry address together. Set the local
   gas symbol to `ETH`. Never add signing material or an invented address.
4. Restart development, or rebuild production. `NEXT_PUBLIC_*` configuration is
   baked into the client bundle.
5. Follow the [wallet walkthrough](qa/BROWSER_WALKTHROUGH.md), labelling every
   observation as local. Use [wallet setup](qa/WALLET_SETUP.md) for human preparation.

Remove local overrides when returning to the committed X Layer configuration.
Keep Anvil bound to loopback; do not use unlocked-node commands on a public network.
Public deployment procedures remain in [the X Layer runbook](deploy/XLAYER_TESTNET.md).

## Troubleshooting

- Stop a running Next.js server before `npm ci` on Windows if it reports `EPERM`.
- Resolve an occupied port rather than leaving duplicate test servers running.
- If `forge` is unavailable, check the Foundry installation/PATH. UI-only work does
  not require it.
- `next/font` needs network access during a clean production build.
- Use the pinned Node/npm versions and committed lockfile when reproducing CI.

## Evidence and current work

Current acceptance work lives in [STATUS.md](STATUS.md). Actual checks and their
limits are in [dated QA evidence](qa/evidence/) and linked GitHub CI runs.
The old setup file's unique local-node and automated results are preserved in
[the dated verification history](https://github.com/Chi944/memepet/blob/a8c14cb8a54181487d41ab752212407fab3c1c64/docs/DEV_SETUP.md#actual-verification).
Those records remain historical; no browser pass is inferred from them.
