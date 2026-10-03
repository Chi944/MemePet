# Read-only demo-wallet preflight

Run from the repository using its pinned Node 24 and installed dependencies:

```powershell
node docs/qa/wallet-preflight.mjs
```

No arguments, environment overrides, keys or browser wallet are needed. The
helper uses the committed public X Layer testnet deployment and the four
public demo addresses in the final session plan. It is preparation, not a
wallet acceptance test, receipt proof or authority to send a transaction.

It checks the network, registry code and approved community, then reads all
pet states, balances and community total at the same numbered block. The final
header check rejects a changed hash/time/number. Care eligibility uses that
block's UTC day, never the workstation date. A second care at count 1 would
reach Buddy; a fifth at count 4 would reach Guardian. These predictions do not
award progress or prove that a transaction will succeed.

Required read failures, malformed responses, inconsistent state or changed
headers fail the entire snapshot. Bounded requests cannot wait indefinitely.
The command exits nonzero and prints a sanitized error instead of a partial
success. Re-run only as a new read; do not fund or send care because a read failed.
A positive testnet OKB balance does not establish gas sufficiency.

Keep the resulting public JSON with the session evidence outside the submitted
source tree. It contains public addresses and balances, not signing material.
Recheck the current deployment separately and run the preflight again just
before the [final wallet session](FINAL_WALLET_SESSION.md). A previous valid
block can become stale; this script does not prove RPC consensus/finality,
current extension selection, UI behavior or successful wallet acceptance.

Deterministic regressions make no remote requests:

```powershell
node --test docs/qa/wallet-preflight.regression.mjs
```

B5 transaction persistence/recovery remains disabled until final acceptance.
