# Browser wallet walkthrough

Run against the declared deployment with a human-operated browser wallet.
Automated tests, read-only chain calls and fixture previews do not establish a
wallet action. Record only what was actually performed.

## Environment and evidence

- Hosted app: [MemePet pet home](https://memepet.vercel.app/pet).
- Network: **X Layer testnet, 1952**; test gas **OKB**.
- Registry: **0xe844152262D243a7B90F6e07FF7A67F1d7FeD216**.
- Record UTC time, deployed revision, browser, public account identifier and
  before/after state. Never capture passwords, recovery words or signing keys.
- Use a human-prepared demo wallet with testnet gas. A public address alone
  cannot sign. See [wallet setup](WALLET_SETUP.md).
- A local Anvil run is separate evidence; follow [development setup](../DEV_SETUP.md)
  and label its chain, registry and results as local. No time travel on testnet.

For the finale, use the [final wallet session plan](FINAL_WALLET_SESSION.md)
and [current release/preflight evidence](evidence/PET_QA_RELEASE_2026-10-02.md).
The 2 October release passed read-only combined checks; its new signed-care and
account/network acceptance rows remain NOT RUN. Consult [status](../STATUS.md)
for subsequent releases and re-establish the actual deployed SHA before a run.

## Historical September wallet checkpoint

The [24 September release run](evidence/LATEST_RELEASE_QA_2026-09-24.md) owns
the following historical results. The [recorded Account 2 run](evidence/FINAL_CAPTURE_2026-09-24.md)
contains genuine rejection/adoption/care, receipts, later read-back and public
viewing, including read failures and explicit capture gaps. Neither record
upgrades a step that it did not actually exercise. [Earlier evidence](evidence/README.md)
remains dated and separately accessible.

That run's tested product revision was **af886a75**, deployed successfully as
**6644949897** on 24 September at 18:17:39 UTC. Account 3 genuinely rejected,
adopted and cared: the pet automatically reached 10 points/cooldown, but the
community header became Unknown. **Retry community total** recovered 4 without
a reload or another transaction. Manual read-only recovery and a subsequent
normal reload passed; automatic community refresh failed. A separate unconnected
browser displayed the correct Account 3 address, read-only live Hatchling and
10 points with no care action: PASS. Hosted Disconnect then completed with the
account-access revocation notice, Not connected, no live pet/write actions and
total 4. A normal reload preserved that state: PASS. The action used the loaded
`af886a75` runtime; the reload used documentation-only **edae08a**, deployment
**6645345099** (18:37:56 UTC), with no runtime source difference. The site was
left disconnected and no new connection request was issued.

Network away/back remains **NOT RUN**. The wallet screenshots showed network
management settings, and the app still showed 1952 before disconnect. Automation
could not operate extension controls; configured networks alone do not prove a
site network switch.

Reduced-motion and missing-art/unknown-total previews passed; normal-motion
foreground playback is **NOT RUN by user preference**. Release CI passed 123
application tests, 15 contract tests, 8 counter checks, typecheck, lint, build and
production-route checks (`/` 200; all three development routes 404). These
checks remain separate from each actual browser-wallet result.

## Repeatable test matrix

| Check | Procedure and expected observation |
|---|---|
| Read-only visit | Open without connecting. No invented pet/growth; unavailable totals stay unknown, not zero. |
| Connect | Human approves only the intended account/site. Verify the displayed address; leave any security warning unapproved. |
| Network switch | Review the wallet's network details. App shows 1952 before any write; wrong-network state offers a switch. |
| Reject adoption | Use an account with no pet. Request adoption, reject in the wallet, then verify the declined message and unchanged no-pet state. No transaction hash exists for a rejected request. |
| Adopt | Human approves a zero-value request to the registry. Retain the successful receipt and matching Adopted event; verify the same account's Hatchling at zero points after a fresh read. Record any read error/recovery. |
| Care | Capture the baseline first. Human approves zero-value care to the registry; verify successful receipt, Cared event, fresh pet count and ten-point increment. A transaction does not pass merely because a button was clicked. |
| Community increment | Pin reads before and at the receipt block and attribute matching Cared events with [the counter helper](COUNTER_CHECK.md). Independently record whether the browser updates promptly, remains stale or shows Unknown. |
| Read-only counter recovery | If a confirmed care leaves the total Unknown, use Retry community total. Verify it rereads the same receipt block, preserves growth/cooldown and recovers the confirmed total without a reload or another wallet transaction. Record recovery separately from automatic refresh. |
| Same-day cooldown | Observe disabled care and the explicit next UTC-day time. Do not submit a duplicate just to prove a disabled control. Contract rejection is covered separately by tests. |
| Refresh | Human performs the chosen normal/hard refresh; after reads settle, verify the same account, pet, growth, cooldown and total. Record which refresh was actually performed. |
| Switch account | Switch in the wallet with the page open; verify the old account's pet is cleared and the new account's real state appears without a reload. No adoption/care is needed. |
| Switch away/back | Change network, verify writes are disabled, then return to 1952 and verify the correct state. Account-switch success alone does not prove this row. |
| Copy/public view | Record Copy link feedback separately from actual clipboard verification. Disconnect, open the public address URL, and confirm the same read-only pet without a new signature. |
| Disconnect | Observe account-access revocation or honest manual-disconnect guidance. Reload to check persistence; a Disconnecting screenshot alone is not completion proof. |
| Read failure | In a controlled local environment, make reads unavailable. No fabricated zero/pet/progress. A confirmed write with failed refresh stays distinguished from a failed transaction; never repeat the write automatically. |
| Later-day evolution | Optional for this film: a second real care on a later UTC date must produce 20 points/Buddy. Artwork previews or local time travel do not prove live evolution. |

## Recording a result

Use **PASS / FAIL / NOT RUN / BLOCKED** with environment/revision, actual steps,
expected/observed state, UTC time, source references and limitations. For a
confirmed write, retain full transaction hash, receipt status/block, account,
registry, value, decoded method/events and block-pinned reads. Save untouched
sources privately; a labelled original still proves an observed state, not a
continuous action sequence. Preserve transient failures even if a reload recovers.

The [acceptance checklist](../QA_CHECKLIST.md) also covers responsive layouts,
keyboard/reduced-motion behavior and production 404 gates. Historical walkthrough
prose is retained at the [pre-cleanup snapshot](https://github.com/Chi944/memepet/blob/19c3fac1f097955f2b6e409ab2f4ab988abc0cee/docs/qa/BROWSER_WALKTHROUGH.md).
