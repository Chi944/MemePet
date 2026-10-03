# B0–B5 shared contracts and release gates

## Current handoff — 3 October, after scoped wallet acceptance

The [repaired-release evidence](../qa/evidence/READ_REPAIR_2026-10-03.md) records
**scoped genuine wallet acceptance PASS on `fa07032`**. The prerequisite for
B5 runtime integration is satisfied; the lead may begin implementation. B5
runtime remains unimplemented at this checkpoint and requires its own tests,
review and genuine acceptance on the changed release. Backup delivery/playback
and rehearsal are separate unfinished deliverables, not engineering gates.
The evidence preserves historical controls, initial OKX connection failures,
user-confirmed manual OKX cleanup and unverified, nonblocking Account 3 cosmetic
restoration; this is not blanket approval of every provider path.

## Earlier handoff after B1 integration

The live B1 integration replaces WalletProviderPicker with WalletChooser
and mounts OnboardingPanel/ProgressionPanel using mapBetaPanelState from one
hook render. Failed-read retry is guarded against writes, provider changes and
loading; it reads only. OnboardingPanel's optional connectDisabled prevents
connection before a provider is selected. Its loading retry stays focusable
but inert. Progression hides while disconnected/on a wrong network. The old
picker and unused setup CSS are removed; its regression cases now target the
replacement. /dev/beta includes fictional B1 inputs/counters. B5 remains gated.

## Earlier requirements and handoffs

**2 October integration checkpoint:** #80–#88 are merged. Help/#88 supplies
the real `/help` route and navigation using B2 + B3. It does
not connect the recovery panel to persistence. Kym's B1 integration remains
next; do not duplicate the existing provider picker or pure panel mapper.
The development-preview description below is historical to #85; `/dev/beta`
remains fictional and production-hidden. Current checks belong in the lead
Help evidence, not in earlier teammate reports.

Read [scope and order](START_HERE.md), [ownership](../OWNERSHIP.md) and
[setup](../DEV_SETUP.md). The lead owns adapters, storage, wallet/RPC clients,
routes, packages, shared fixtures and CI. Existing finale contracts stay intact.

## Foundation supplied for parallel UI work

- `src/types/beta.ts`: `WalletChooserProps`, `OnboardingPanelProps`,
  `ProgressionPanelProps`, `TransactionRecoveryPanelProps`, `HelpPanelProps`
  and `HelpEntry`. Import these; do not invent competing interfaces.
- `src/fixtures/beta-fixtures.ts`: fictional onboarding, wallet choice,
  personal milestone, garden and recovery states. Tests and development previews
  only. Never import these into live routes or use them after failed reads.
- `src/lib/beta-progress.ts`: pure derivation from confirmed lifetime counts.
  First bloom remains 20. Later chapters 50 and 100 are new cosmetic app rules;
  no contract reward, unique-user metric, streak reset, invented completion date
  or fourth pet stage. Personal 5/10/20 badges grant no money or extra points.

B0 is merged in #80 (`99086a3`). These interfaces/mappings are available on main;
all three teammate lanes can begin now. Their presence does not claim
that new panels, adapters or recovery are already rendered in production.

## Exact component handoff

| Owner | Export / file | Data source after lead wiring |
|---|---|---|
| Kym | `WalletChooser` in `src/components/onboarding/WalletChooser.tsx` | Discovered provider IDs/labels, selected ID, busy and `onSelect` |
| Kym | `OnboardingPanel` in `src/components/onboarding/OnboardingPanel.tsx` | Lead-derived wallet/network/read/cooldown state and explicit callbacks |
| Kym | `ProgressionPanel` in `src/components/progression/ProgressionPanel.tsx` | Personal and community `MilestoneState`, read-only retry |
| YeeWei | `TransactionRecoveryPanel` in `src/components/recovery/TransactionRecoveryPanel.tsx` | Validated transaction hash/state, read-only `onCheckStatus` |
| YeeWei | `HelpPanel` in `src/components/help/HelpPanel.tsx` | `HelpEntry[]`, optional verified support URL |
| Larm | `HELP_ENTRIES`, `SUPPORT_URL` in `src/content/help.ts` | Plain factual copy; `SUPPORT_URL: string \| null`, null until verified |

Components use existing `Button`, `Card`, `Badge` and typography. Co-located
tests/CSS modules are allowed. Keep the black/lime MemePet identity and Mochi
assets. No new generated assets, dependencies, telemetry or paid calls. Keep
keyboard focus, readable resting states, narrow layouts and current motion
controls. Formatting local reset time changes its label, not chain eligibility.

Teammates can develop with component tests and fictional fixtures immediately.
Request a preview route from the lead if needed; do not add production preview
routes. Root will wire `/help`, shell links and combined live panels once reviewed.

The lead now supplies `/dev/beta` for the merged Help/recovery components:
all nine recovery states, care/adoption labels, fictional FAQ/empty content,
callback counter and reset. It uses no wallet, RPC or storage and returns 404
in production. Run `npm run test:e2e:previews` for separate fictional Chromium
checks at 320/390/1440px. This preview unblocks B2 visual/keyboard review;
it does not enable B5 or the live Help route. `/dev/companion` also has the
requested `careAvailable` fixture. The lead owns preview server/CI config;
YeeWei may extend scenarios under `e2e/dev-preview/`.

## B4: selected wallet must remain selected

Use [EIP-6963 discovery](https://eips.ethereum.org/EIPS/eip-6963) with bounded
legacy fallback for `window.ethereum` / `window.okxwallet`. Treat announcements,
names and `rdns` as untrusted metadata, not proof of an authentic brand. Do not
render injected HTML/SVG icons. Discovery must not request account permissions.

When several providers exist, require the user's choice. Pin the provider object
for connect, listeners, chain switching, wallet client, writes and permission
revocation. Deduplicate announcements; remove listeners on change/unmount.
Invalidate older reads/replies/operations even if switching providers with the
same account and chain. Do not let a late old connect overwrite the new choice.
No implicit reconnect may override a locally saved disconnect. Unsupported
revocation still gives truthful manual wallet instructions.

Automated cases: zero/one/two providers, duplicate and late announcements,
unselected-provider events, same-account provider swap, rejected connect,
late resolution, provider disappearance, wrong network and failed revoke.
Genuine MetaMask/OKX browser checks remain separate acceptance rows.

The B4 lead implementation supplies `choices`, `selectedId`, `selectionRequired`,
`selectionBusy`, `providerSessionKey` and `selectWallet(id)` on `useWallet`.
Check the reviewed implementation before writing dependent browser assertions;
provider discovery/selection landed in #81 at `6f6a6c4`; its real-extension
acceptance remains NOT RUN. Kym's
chooser keeps the existing `WalletChooserProps`: the lead maps `selectionBusy`
to `busy` and `selectWallet` to `onSelect`. The initial lead-owned
`src/components/ui/WalletProviderPicker.tsx` and `wallet-picker.module.css` are
temporary integration UI, not a request for Kym to edit the route or hook.
YeeWei owns browser scenarios after the adapter lands; a same-address provider
change must still invalidate old answers through the lead session key.

### Prepared panel adapter

`src/lib/beta-panel-state.ts` supplies pure `mapBetaPanelState({ deployment,
wallet, registry, community })`. Pass current values from the same live hook
render/session; do not combine a cached previous owner's pet with a new wallet.
It returns `onboarding` and `progression.personal/community` using the existing
component contracts. The lead supplies callbacks separately when integrating
the reviewed B1 panels; the helper is not yet wired into live routes.

Unknown/failed reads cannot become an adoption prompt or zero-count unlock.
Pending wallet/write operations suppress ready actions and milestone display.
The community can be read without connecting. Care availability uses the
hook's confirmed chain-clock result, never the viewer's clock; Kym formats the
provided ISO reset in local time without changing eligibility. `isTestnet=false`
alone does not mean mainnet: local Anvil is identified by its network label.

`usePetRegistry.retryPet()` supplies explicit failed-read recovery for B1's
future retry callback. It only runs from the current valid session's error
state, locks duplicate activations and exposes loading through `readStatus`.
It never asks a wallet or resets transaction state. `/pet` already uses this
callback for **Retry pet read**. Background refresh remains separate. An
in-memory receipt-block floor prevents retry/background reads from using a
lagging state older than this session's confirmed transaction; it is neither
a persistent journal nor recovery after refresh.

## B5: recover the transaction, never repeat it automatically

**Runtime integration waits until final wallet acceptance is recorded.** The
lead may prepare pure helpers and simulated cases now. Only persist the public
hash and minimal version/action/scope metadata after the wallet returns a hash;
never persist keys, signatures, balance, credentials or claimed game progress.

**3 October gate status:** the scoped acceptance record linked above satisfies
that prerequisite. Runtime implementation can begin; this does not pass B5's
separate implementation, regression or changed-release acceptance checks.

- Persist scope by chain/registry/account so it survives refresh. Use the active
  provider-session generation only as an in-memory stale-result guard, not as
  an ephemeral persistent key. Validate and bound untrusted storage input.
  Storage failure must not prevent a write or
  hide its returned hash. Do not read a record from another wallet as this pet.
- Before associating a saved hash, read the transaction and validate chain,
  sender, destination, zero value and the expected allowed method. Receipt
  success alone cannot establish that an arbitrary hash was this care/adoption.
- On refresh, check the existing hash with bounded read retries. Pending,
  timeout, temporarily missing transaction and dropped/replacement uncertainty
  are **not confirmed failure**. Disable repeat submission while unresolved.
- A successful receipt still needs receipt-bound fact reads. Keep
  `confirmed-awaiting-facts` and read-only retry if those reads fail. Award no
  optimistic progress and preserve existing stale-session guards.
- Handle reverted receipts and replacement/cancellation distinctly. Never
  request a signature, send a transaction, change networks or fund a wallet
  automatically during recovery. No timer or expiry may silently resubmit.
- Test corrupted/oversized/foreign records, storage unavailable, refresh while
  pending, success/revert, replacement, failed read-back and account/network/
  provider changes before a genuine changed-release acceptance.

### Prepared pure recovery validation (not a running journal)

`pending-transaction-record.ts` defines version-1 public records and stable
chain/registry/account keys, a bounded parser and a strict serializer. It rejects
extra fields, invalid/foreign records and oversized input. It does not touch
storage. `pending-transaction-validation.ts` matches a validated record against
a viem-formatted transaction plus an independently read RPC chain ID. It checks
hash, sender, registry, zero value and exact `care()` or `adopt(1)` calldata.
`matched` establishes only request identity, never receipt success or progress;
missing/unverifiable transactions remain `unverified`, not failed.

`pending-transaction-receipt.ts` adds a pure receipt validator. Supply the
saved record/current scope, viem-formatted transaction and receipt, a fresh
block header fetched by the receipt's **block number**, and independently read
RPC chain ID. It first reuses transaction identity validation, then requires
matching receipt hash/from/to, transaction/receipt block hash and number,
transaction index, header hash/number, and explicit success/reverted status.
Missing, malformed or conflicting evidence remains `unverified`; it cannot
be classified as dropped, cancelled, or safe to submit again.

A `receipt` result only describes observed inclusion and status. It does not
prove finality, current session, confirmed pet facts or awarded growth. Future
runtime must guard the provider/account generation, perform receipt-bound fact
reads and recheck the header after those reads. Replacement/cancellation,
storage and refresh recovery are still unimplemented. This helper has no I/O
or live imports; tests use fictional input only.

These helpers have no live route/hook import. **B5 runtime remains disabled.**
After final acceptance, the lead still needs storage-failure handling, bounded
reads, replacement/cancellation semantics, receipt-bound facts, refresh/session
guards and their separate runtime acceptance. Do not use these helpers as proof
that transaction recovery already works.

## B2 browser regression and evidence

Use local Chromium, controlled EIP-1193 providers and deterministic RPC/API
fixtures. [Playwright browser API simulation](https://playwright.dev/docs/mock-browser-apis)
supports this approach. Output/report headings must say **SIMULATED WALLET
BROWSER REGRESSION**. A browser running mocks is not genuine wallet acceptance.

YeeWei owns account A→B and A→B→A races, stale replies, failed pet/community
reads and combined panel consistency. Extend with provider selection and
pending refresh as those adapters land. Block unexpected remote requests; tests
must not need real funded accounts, wallet extensions or live mutable counters.
Use user-visible assertions, not assertions only on mocked function calls.

B4's focused `e2e/simulated-wallet/provider-selection.spec.ts` remains lead-owned
until handoff. It covers explicit choice, correct-provider operations and
ignored unselected-provider events. YeeWei should cite that test, extend the
broader account/race/combined scenarios in separate specs, and avoid duplicating
or editing this active lead file without coordination.

Root owns Playwright/package/CI configuration and production preview gates.
Harness setup or a smoke pass alone does not complete YeeWei's scenario suite.

## Lead review and merge checklist

1. Review exact PR head and scope; reconcile changed interfaces centrally.
2. Run typecheck, lint, app tests, production build/dev-route gate, relevant
   contract/helper tests and simulated browser suite. Report actual outcomes.
3. Preserve old genuine QA as history. Record current checkout and deployed
   revision separately; a preview/CI build is not proof of the public alias.
4. Under the latest 2 October authorization, Codex may merge reviewed, passing,
   in-scope PRs. Leave unfinished or failing PRs open with a concrete blocker;
   teammate agents never merge. Give Deston a concise result and PR link.
5. After merge, verify deployment and only the newly required live cases.
   B5 requires its own changed-release acceptance; unfinished beta features
   remain off the finale release.
