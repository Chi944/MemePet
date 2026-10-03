# B5 controlled local wallet acceptance — 3 October 2026

## Status and scope

**PASS — adoption and care recovery with real MetaMask on controlled Local Anvil;
cleanup complete.** Deston
explicitly chose a controlled Local Anvil run after the X Layer attempts
confirmed before a pending state could be observed.

The check used a **real MetaMask extension and user-approved local transactions**,
with Anvil mining controlled locally so each returned public hash remained
pending through a reload. It is separate from the fictional wallet
fixtures in the automated browser suite. It is also separate from the public
X Layer testnet: a local pass would not establish pending-refresh recovery under
X Layer's block timing or hosted RPC conditions.

The local production build uses exact runtime source
`4a40275ceed86438e527bac8bba26a86493e06f7`, with the isolated local chain
and registry configuration below. The prior genuine public attempts remain in
[B5 transaction evidence](B5_RECOVERY_2026-10-03.md).

## Session identity

| Item | Status |
|---|---|
| Application runtime source | Production build from `4a40275ceed86438e527bac8bba26a86493e06f7` |
| App origin | `http://127.0.0.1:3400/pet`; loopback Next process PID `29540` |
| Wallet | Real MetaMask automatically reconnected using existing permission |
| Chain | Observed Local Anvil, 31337; RPC `http://127.0.0.1:18545`, PID `46588` |
| Registry | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| Registry deployment transaction | `0xa265c024700ed6454cd98e590aae043bba84dd283f65ff4683f06fe882f17acc` |
| Sender | Imported Account 1, `0x2ec8471290793FeB64792861Ce3102d291ce1CA1` |
| Initial displayed state | No pet; community 0 |
| Local test funding | 1 local ETH assigned to the actual connected account with `anvil_setBalance` |
| Mining control | `evm_setAutomine false`; `anvil_getAutomine` verified `false`; latest sender nonce `0` |
| Adoption hash | `0xe5f270169d02db85843067e7b9d8e78a6dd51e3329c3e6dcdee9d696d4d3c2f1` |
| Care hash | `0xab9179fa99f972b4a5a07fd6e9fc44d4b69640ee883f39bed67fdbf75641cb2a` |

No signing secrets, exported wallet data or credentials belong in this record.

The setup initially funded Account 5, but the actual test uses the already
connected Imported Account 1 to avoid unnecessary account-switch steps. Funding
and mining controls act only on the isolated loopback Anvil chain; this is not
a public testnet funding transaction. Public setup JSON is retained outside Git
under `archive/memepet-submission-2026/local-recovery-2026-10-03/`.

## Observed adoption recovery

Deston explicitly confirmed that the local adoption was approved. The returned
transaction was from Imported Account 1 to the local registry above, nonce `0`,
chain `31337`, zero value and the exact `adopt(1)` input. At
**2026-10-03T11:05:18.9310315Z**, independent local RPC reads showed automine
`false`, transaction block fields `null`, receipt `null`, one pending transaction,
no queued transactions and chain head `1`.

The lead reloaded `/pet`, reselected MetaMask and reconnected using its existing
permission. The same hash returned in **Waiting for confirmation / Pending**.
No recovery storage warning appeared; adoption and care writes were unavailable.
Pet facts stayed unconfirmed, with the page showing its unavailable/read-failed
state rather than an adopted pet. Community remained `0`.

The lead used **Check status** while mining remained paused. The same transaction
stayed pending. Immediately before mining at **11:06:47 UTC**, its receipt was
still `null` and the pool still contained exactly one pending transaction.
One local `evm_mine` call included that same transaction:

| Verified adoption result | Value |
|---|---|
| Receipt status | `0x1` (success) |
| Block number | `2` |
| Block hash | `0x433f81b71cdaad599125c6155141a1ad2037e4f92a7ab87cb403d70e557a5cf2` |
| Registry event | One `Adopted` event for Imported Account 1 and community `1` |
| Sender nonce after mining | `1` |
| Transaction pool after mining | Pending `0`, queued `0` |

After another **Check status**, the UI showed **Confirmed** for the same hash,
Hatchling at `0` growth points, care available, community `0`, and recap confirmed
at block `2`. A second reload/reconnect displayed the adopted pet and enabled
care, with no restored transaction hash or recovery panel. This establishes
**functional journal clearance**; browser storage contents were not inspected
directly. The single pending transaction, one mined adoption and nonce `0` to `1`
corroborate that reload and status checks did not submit another operation.

Evidence retained outside Git: `adoption-before-refresh.json`,
`adoption-restored-pending.txt` / `.jpg`, `adoption-mined.json`,
`adoption-confirmed.txt` / `.jpg`, and `adoption-cleared-after-reload.txt` in the
archive directory above. The subsequent care sequence is recorded below.

## Observed care recovery

Deston explicitly approved the local care. Its hash was
`0xab9179fa99f972b4a5a07fd6e9fc44d4b69640ee883f39bed67fdbf75641cb2a`,
from Imported Account 1 to the same local registry, nonce `1`, chain `31337`,
zero value and exact `care()` input `0x093a37ff`. At
**2026-10-03T11:08:38.8386322Z**, local RPC reads verified automine `false`,
receipt `null`, transaction block fields `null`, one pending transaction, no
queued transactions and chain head `2`. The app displayed the real pending hash.

The lead reloaded, selected MetaMask and reconnected using existing permission.
**Waiting for confirmation / Pending** restored the same care hash. Adoption and
care writes were absent; unverified pet facts were withheld. **Check status**
kept the same transaction pending while mining remained paused. The receipt
was still `null` and the pool contained one transaction immediately before the
single local `evm_mine` call at **2026-10-03T11:09:30.5307295Z**.

| Verified care result | Value |
|---|---|
| Receipt status | `0x1` (success) |
| Block number | `3` |
| Block hash | `0x55e82614bc0d0bdeef2e7039101b41064d42c3dc2ed82a66dc8422779afb045d` |
| Registry event | One `Cared` event for Imported Account 1, care count `1`, UTC day `20729` |
| Sender nonce after mining | `2` |
| Transaction pool after mining | Pending `0`, queued `0` |

The lead used **Check status** and observed **Confirmed** for that same hash,
Hatchling at **10 points**, **one personal care**, **community 1**, recap block
`3`, and care cooldown until **2026-10-04T00:00:00Z / 08:00 Singapore**.
Independent block-specific reads corroborated the change:

| Confirmed read | Block 2 | Block 3 |
|---|---|---|
| `petOf` (exists, community ID, care count, last care day) | `(true, 1, 0, 0)` | `(true, 1, 1, 20729)` |
| Community care total | `0` | `1` |

A second reload/reconnect retained 10 points, one personal care, community 1
and the cooldown. No transaction hash or recovery panel returned, and **Care
unavailable** remained disabled. This proves functional journal clearance and
persistence of confirmed facts, not direct inspection of browser storage. One
care event, nonce `1` to `2` and the emptied pool corroborate that recovery did
not resubmit the operation.

Evidence retained in the same private archive: `care-before-refresh.json` /
`.txt` / `.jpg`, `care-restored-pending.txt` / `.jpg`, `care-mined.json`,
`care-confirmed.txt` / `.jpg`, `care-cleared-after-reload.txt`, and
`receipt-block-facts.json`. No application source change was made for this run.

## Required observations

| Check | Result |
|---|---|
| Verify runtime, local registry and selected wallet scope | OBSERVED as recorded above |
| User approves each local operation; application receives its real hash | Adoption and care PASS |
| Observe genuinely pending transaction before reload | Both PASS: null receipt/block fields with mining paused |
| Reload and reconnect the same scope; restore the same hash without a second submission | Both PASS, demonstrating persisted recovery |
| Unresolved recovery blocks duplicate writes; Check status performs reads only | Both PASS with one transaction still pending for each operation |
| Resume local mining and independently verify transaction, receipt and block identity | Adoption PASS at block 2; care PASS at block 3 |
| Receipt-bound pet facts, independent community read and applicable cooldown settle correctly | PASS, including block-specific facts and care cooldown |
| Confirm exactly one intended operation and no recovery-triggered wallet submission | Both PASS: one event each, nonce 0 to 1 to 2, empty pool after each |
| Record final journal state and local-test cleanup | PASS: both functional clearances observed after second reload; local disconnect/shutdown/archive complete; direct storage inspection NOT RUN |

Record the actual order and distinguish direct UI observations, public RPC
verification and user reports. Do not inject a fabricated journal or receipt,
force a public-network failure, or describe the controlled local run as a public
X Layer pending-refresh pass.

## Cleanup and retained evidence

Before shutdown, the lead used the local app's **Disconnect** control. The
recorded page showed **Not connected** and the message **“Wallet account access
was revoked for this site.”** The local browser tab was then closed. This does
not claim token approvals were revoked; neither local transaction requested one.

At **2026-10-03T11:14:40.1244366Z**, the final local read snapshot rechecked and
matched block `3`'s header, retained the confirmed pet/community facts and chain
`31337`, and verified automine remained `false`. No private state dump was taken.

Cleanup completed at **2026-10-03T11:15:37.2136264Z**. The setup owner verified the
exact command lines and stopped Anvil PID `46588` and Next PID `29540`; ports
`18545` and `3400` were closed. The clean checkout, dependencies and build were
preserved with `git worktree move` into the private archive's
`local-recovery-2026-10-03/checkout/`. The original active-folder checkout is
absent, archived source remains `4a40275ceed86438e527bac8bba26a86493e06f7`, and
tracked/untracked cleanliness was verified before and after. No deletion was used.

The production page still displayed Account 5 `0xaE345…5C57`, chain `1952` and
community `18`. No public-network transaction was submitted as part of the local
test. These are separate production observations, not a public recovery result.
Cleanup evidence is retained as `local-disconnected.txt`,
`cleanup-chain-snapshot.json` and `cleanup-evidence.json` in the private archive.

## Outcome

The user-agreed controlled local wallet recovery gate is **PASS**, covering both
adoption and care on the unchanged runtime with real MetaMask approvals and
completed cleanup. This closes the remaining two points of the agreed finale /
testnet delivery checklist: **B5 8/8, lead 51/51, overall 100/100**. Backup
delivery/playback and the user-reported timed rehearsal remain complete and do
not need repeating. This is scope completion, not a universal readiness score.

Public X Layer pending-refresh recovery is still **NOT OBSERVED**. This local
result must not be presented as a hosted X Layer pending-refresh pass, mainnet
readiness, or proof of every wallet/network condition.
