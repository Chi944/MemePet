# Finale panel integration — 30 September 2026

Lead integration task F6, based on merged PR #59 (`defef473`) and PR #61
(`e173c98`). PR #61 includes narrow lead accessibility fixes: a persistent
polite reply region, readable error color and long-value wrapping. This report
does not alter the historical automatic community-refresh failure.

## Delivered behavior

- The overview and wallet page use Larm's shared garden with the confirmed total.
- The wallet page mounts YeeWei's bounded recap through `useCompanion`; pending
  transactions and account/network changes hide obsolete facts and explanations.
- Questions use standard explanations and displayed evidence. No model, signing,
  new token, new contract, paid provider or new dependency was added.
- The exactly-20 preview is added to the lead fixture set. Preview data stays
  visibly fictional and all preview routes remain gated in production.
- Kym's personality panel is not present yet. Its local-state adapter is ready;
  the existing companion hook must supply both panels when hers is integrated.

## Community reference verification

Text-only XDOG reference, not endorsement, partnership, holder check or asset
licence. No XDOG artwork is used. Its token address is distinct from the MemePet
registry. Other local/future deployments do not inherit the reference.

- Official source: [OKX XDOG/PENGUIN listing announcement](https://web3.okx.com/help/announcement-on-xdog-and-penguin-listing-on-okx-boost-ranking).
- Token: `0x0cc24c51BF89c00c5afFBfCf5E856C25ecBdb48e`.
- Network: X Layer mainnet **196**, independently queried via `https://rpc.xlayer.tech`.
- Check at **2026-09-30T14:27:07.577Z**, block **72009389** (block time 14:27:05Z): code 12,619 bytes; name/symbol XDOG; decimals 18; total supply 10^27 base units.
- Independent second read at **14:27:27.629Z**, block **72009409**, hash `0x0dfa50d70e18478f2409c2184a8f0648dc41db17bd461b060c31db2534636732`, agreed on metadata.
- The UI separately labels MemePet care on X Layer testnet **1952** and states that no token ownership is checked or required.

These reads establish identity at the checked time, not asset safety, permission
to use branding, market quality or community adoption.

## Automated verification

- `npm run typecheck`: PASS.
- `npm run lint`: PASS, zero errors; existing ShareImage `<img>` warning remains.
- `npm test`: **312 tests / 33 files PASS**.
- `npm run test:contracts`: **15 PASS**.
- `node --test docs/qa/counter-check.regression.mjs`: **8 PASS**.
- Six route integration tests use the actual pet route/hooks/components with
  mocked wallet/RPC/API boundaries. They cover receipt-block garden refresh
  despite stale latest reads, unknown-state retry without a second transaction,
  standard questions without new requests/signing, pending-write clearing,
  late account responses and wrong-network/disconnected state.
- Ten reference tests prevent the verified identity leaking to another registry,
  network, local deployment or unconfigured deployment.

- `npm run build`: PASS with explicit public testnet configuration.
- Local production HTTP: `/` and `/pet` 200; all five `/dev/*` previews 404.
- Local production recap POST at **14:42:18.878Z**: Account 3, block **42320498**,
  one care / 10 points / Hatchling / community 4; contribution answer labelled
  `standard` and cites that block. This was read-only HTTP, not wallet QA.

## Browser observations

Local development server `127.0.0.1:3451`, explicit public X Layer testnet
configuration; Codex in-app browser without an injected wallet. No private env
file was read or changed. Effective reduced-motion preference stayed enabled.

- Real `/pet` read: header **4**, garden **4 of 20**, sprouting, 16 remaining.
  Disconnected recap asks for a wallet; no personal facts were fabricated.
- `/pet`: no horizontal overflow at **320px and 1440px**; full mobile page
  visually inspected. Reference address wraps and both networks are readable.
- `/dev/companion`: standard answer visibly labelled; no horizontal overflow at
  **320px and 390px**. Changing facts to unavailable removes the prior answer.
  Retry increments the preview's callback counter once. This is fixture QA.
- `/dev/community` at **320px**: exactly 20 shows a bloom and 20-of-20 progress;
  all seven plant animations compute to `none` under reduced motion. Unavailable
  hides the progress bar/garden, says total unknown, and offers read-only retry.
- Local production homepage at **1440px**: real garden reads 4, sourced reference
  is readable, and no horizontal overflow was observed.

No real connection, rejection, adoption, care, account/network switch or
disconnect was performed. Screen-reader speech output and normal-motion
playback were not run. Automated/fixture passes are not wallet acceptance.

## Remaining release acceptance

Integrate Kym's reviewed personality panel, then run one genuine final wallet
walkthrough on the resulting release: due care, automatic pet/community/recap
read-back, refresh, account/network isolation, failure recovery and disconnect.
Preserve the earlier failure until a real later run proves recovery. Later-day
evolution, pitch rehearsal and backup recording remain separate checks.

## Hosted release verification

PR #62 merged as **`6f50a9eb29345c0e417b2f8cbce7c1ef9f25c2e9`** after
[App/Contracts checks](https://github.com/Chi944/MemePet/actions/runs/36731260847)
and Vercel preview passed. GitHub production deployment **6762354307** records
that commit and success at **2026-09-30T14:45:57Z**. Previous good production:
**6762133252**, commit `e173c983b320d4466ab6dd26f4576db9fa9a33f8`.

- Public browser `/pet` visibly contains the recap and garden, with the accurate
  disconnected state in a browser with no wallet extension. No wallet was opened.
- Public HTTP `/` and `/pet` return 200; all five previews return 404.
- Public recap at **14:46:37.921Z**, Account 3: block **42320758**, one care,
  10 points, Hatchling and shared total 4. Progress answer is `standard` with
  the matching block/time. This is a fresh API read, not new care.
- Deston confirmed Kym has not started her new personality panel. Her role sheet
  now points to the integrated main branch and unchanged shared props.

The separate landing-copy PR #60 is synchronized with this release and names the
20-care garden in How it works. Its two targeted copy tests passed locally;
combined hosted checks must pass before merge. Its source change does not alter
wallet, contract or adapter behavior.
