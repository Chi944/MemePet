# Personality integration — 1 October 2026 (Singapore)

Base `d79df25`: reviewed Kym #67 and Larm #66 merged. Branch
`feat/finale-personality-integration` adds live wiring and updated team handoffs.

## Behavior

- One `useCompanion` instance supplies both personality and recap. The panel is
  offered for a confirmed adopted pet on the correct network while not writing.
- Explore/Practise and reset use versioned browser-local preferences scoped to
  wallet/chain/registry. Confirmed progress and cooldown remain chain facts.
- An existing Standard answer is rephrased from its same snapshot when style
  changes. This performs no extra API/RPC read or wallet action.
- Storage errors stay explicit; no model training or OKX.AI invocation is claimed.

## Automated/local checks

| Command/check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS; existing ShareImage img warning, no errors |
| `npm test` | PASS, 343 tests in 37 files |
| `npm run test:contracts` | PASS, 15 tests |
| `node --test docs/qa/counter-check.regression.mjs` | PASS, 8 checks |
| `npm run build` | PASS with explicit public X Layer testnet configuration |
| Local production `/`, `/pet` | 200 |
| Local production `/dev/pet`, `/dev/landing`, `/dev/community`, `/dev/finale`, `/dev/companion` | 404 |

The route suite's 8 tests include saved-profile remount, A–B–A wallet isolation,
Explore/Practise/style/reset, immediate answer rewording with identical evidence,
unchanged care/growth and hidden controls during writes/network mismatch or
disconnect. The first observed run was green because implementation and tests
were written concurrently; an isolated red run is not claimed. API/RPC/wallet
boundaries in this suite are mocks, not genuine wallet interactions.

## Browser/release checkpoint

Hosted verification is pending at this checkpoint. Kym's component-preview
evidence remains in `src/components/pet/qa/F2-HANDOFF.md`; it does not prove
browser-local persistence on the live integrated route. No adoption, care,
signature, account switch or network switch was performed for this change.
Earlier automatic-read failures and pending final wallet acceptance remain in
their original dated records.
