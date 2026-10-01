# Controlled read recovery — local, public testnet data

F7 setup for Larm and Codex. This exercises a real failing app read followed by
a real successful X Layer testnet read. It is neither a fixture nor a wallet
transaction test. Never use this proxy as a wallet RPC or deploy it publicly.

## Start from the reviewed revision

Record `git rev-parse HEAD` and any uncommitted source changes. Use the pinned
Node version from [setup](../DEV_SETUP.md). Stop any app server sharing this
checkout before starting another. Do not edit `.env.local` or public deployment
settings. No wallet connection is needed for this check.

In a dedicated terminal, from the repository root:

```powershell
node docs/qa/rpc-recovery.mjs
```

The proxy binds only `127.0.0.1:18952`, starts in **fail** mode, and accepts the
terminal commands `recover`, `fail` and `status`. Mode cannot be changed over
HTTP. The only upstream is `https://testrpc.xlayer.tech/terigon`. It permits
`eth_chainId`, `eth_blockNumber`, `eth_getBlockByNumber` and `eth_call`; a batch
containing a write/signing method is rejected before forwarding any call.

In a second, new PowerShell terminal, set these process-only overrides. They
explicitly replace any previous local Anvil configuration for this app process:

```powershell
$env:NEXT_PUBLIC_MEMEPET_DEPLOYMENT_STATUS='testnet'
$env:NEXT_PUBLIC_MEMEPET_NETWORK_NAME='X Layer testnet (local recovery QA)'
$env:NEXT_PUBLIC_MEMEPET_CHAIN_ID='1952'
$env:NEXT_PUBLIC_MEMEPET_REGISTRY_ADDRESS='0xe844152262D243a7B90F6e07FF7A67F1d7FeD216'
$env:NEXT_PUBLIC_MEMEPET_RPC_URL='http://127.0.0.1:18952/rpc'
$env:NEXT_PUBLIC_MEMEPET_EXPLORER_BASE_URL='https://www.okx.com/web3/explorer/xlayer-test'
$env:NEXT_PUBLIC_MEMEPET_CURRENCY_SYMBOL='OKB'
npm run dev -- --hostname 127.0.0.1 --port 3462
```

Only browser origins `http://127.0.0.1:3462` and `http://localhost:3462` are
accepted, alongside requests without an Origin header for server-side reads.
The proxy checks its loopback Host, limits bodies, batches and concurrency, and
ends stalled reads after eight seconds. Upstream failure remains a failure;
`recover` never manufactures a successful result.

## Genuine browser sequence

1. Open `http://127.0.0.1:3462/` in a separate browser tab. Do not connect a wallet.
   Wait for the bounded initial retries to settle. At **Community**, expect
   **Unknown**, unavailable copy, no numeric total, no blooming garden and
   **Retry reading**. Record the actual result and UTC time.
2. Type `recover` in the proxy terminal. Click **Retry reading** once on the
   same page, without reloading. Expect a confirmed total and remaining care
   count, or an honest unavailable state if the real upstream is still failing.
   Record the number actually returned; do not expect a hard-coded total.
3. For a repeat check, type `fail`, reload the app and verify Unknown returns.
   Type `recover` and use **Retry reading** again. Capture both states.
4. Optional: use an already-known public pet URL to check that a failed read is
   not described as a missing pet. A public read requires no connected wallet.
5. Record SHA, runtime/URL, viewport, actual observations and screenshots in a
   dated evidence file. This proves local overview read recovery only. Keep
   production automatic post-care read-back and wallet checks separate.

## Teardown and automated checks

Stop both processes with Ctrl+C and close their dedicated terminals. This
removes the process-only environment overrides; no saved settings need changing.
Rebuild with the normal deployment settings before production inspection.

```powershell
node --test docs/qa/rpc-recovery.regression.mjs
```

These regressions use a mocked upstream to verify boundaries, cancellation and
mode changes. They do not prove live RPC availability or a browser pass. The
proxy contains no signing keys and refuses writes; it does not restrict a
separate wallet provider, which is why this walkthrough never connects one.
