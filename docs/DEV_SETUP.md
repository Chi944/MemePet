# MemePet development setup

Current setup for the existing Next.js app. Historical scaffolding tasks are complete.

## Requirements

- Node **24.19.x** (`.nvmrc`) and npm **11.19.x** (`packageManager`).
- Foundry for contract tests and local-chain work; the application can run without it.
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
```

With Foundry installed:

```bash
cd contracts
forge install foundry-rs/forge-std --no-git
cd ..
npm run test:contracts
```

`npm test` is a non-interactive Vitest run. CI also starts the production build
and asserts `/` returns 200 and `/dev/pet`, `/dev/landing`, `/dev/community`, `/dev/finale`, `/dev/companion`
return 404. For local production inspection, use `npm run start` after building.
A test pass does not establish a real wallet transaction.
The separate Node regressions check the read-only counter evidence helper's
block selection, interval boundaries and validation; they never sign or write.

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
| `/dev/companion` | YeeWei's companion preview entry point; F0 supplies a replaceable placeholder |

Previews carry **UI preview — fictional data** labels, never award chain progress,
and are unavailable in production. Keep them for repeatable visual and error-state QA.

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
