# Community initial-read recovery — 30 September 2026

F1 follow-up, based on main `08d0e5b4416d18222c46f6bcd4c1b9e62b7d6b3b`.
This record separates an observed live read recovery from a reproduced retry
gap. It does not claim a new wallet transaction or erase the earlier automatic
community-refresh failure.

## Live observation before the patch

Deston reported the unavailable garden on **Overview**, with MetaMask on
X Layer testnet. Codex separately inspected the existing Chrome `/pet` tab:

- Account 2, `0x86F7De84EBB97c875e1494675Bfcd664f0773CE9`, chain **1952**.
- Pet: Buddy, **20 points**, care done today, next care at 1 October 00:00 UTC.
- Header/community garden: **Unknown**, with read-only recovery controls.
- Independently loaded recap: **7 confirmed cares**, block **42322349**, block
  time **15:13:06Z**, observed **2026-09-30T15:13:09.275Z**.
- Clicking **Retry reading** changed the header to **7** and garden to
  **Live, 7 of 20**. No transaction or second care was requested.

Read-only manual recovery: **PASS**. The precise error behind the reported
Overview failure was not captured. The existing tab's loaded revision was not
independently identified; the current deployment record alone cannot prove it.
Buddy is an observed current state, not a witnessed evolution transition.

## Reproduction and repair

A real-viem test with transport retries disabled reproduces a temporary RPC
`-32002 Resource unavailable` error. The initial/latest community read previously
became unavailable after one call; only reads pinned to a care receipt used the
application's transient-error retry helper. Four new hook regressions failed
before the repair and passed afterward.

All community reads now use the same bounded helper: one initial attempt and
at most two retries, delayed by 500 ms and 1,000 ms. The community HTTP transport
uses a 10-second timeout and no nested retries. Receipt reads retain their exact
block; latest reads remain latest. Wallet/network changes discard late results
and stop queued retries. Genuine contract reverts stay terminal. Exhausted
reads remain unknown, with no invented zero or optimistic progress.

The existing receipt helper delegates to the shared implementation without
changing its callers. Contracts, writes, pet artwork and dependencies are unchanged.

## Checks

- Focused hook/helper suite: **38 tests PASS**, including seven new regressions.
- `npm test`: **321 tests / 34 files PASS**.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS, existing ShareImage image-element warning only.
- `npm run test:contracts`: **15 PASS**.
- `node --test docs/qa/counter-check.regression.mjs`: **8 PASS**.
- Independent read-only diff review: no blockers.
- `npm run build`: PASS with explicit public X Layer testnet configuration.
- Local production HTTP: `/` and `/pet` 200; all five development previews 404.
- [PR #64](https://github.com/Chi944/MemePet/pull/64) merged after passing App,
  Contracts and Vercel checks as `cc2f67c994eae357b0785bc803c56923ca58a236`.
- Production deployment **6763346984** reports success at
  **2026-09-30T15:29:59Z** for that commit. The previous good release is
  **6762453804**, commit `08d0e5b4416d18222c46f6bcd4c1b9e62b7d6b3b`.

## Motion observation

On the actual Chrome pet page, `prefers-reduced-motion: reduce` was **true**
and `hover: hover` was **true**. Buddy's image computed animation/transform and
transition as none. Both pet and landing hover movement are deliberately gated
on no reduced-motion preference. Windows/browser preferences were not changed.
This explains the stationary hover; normal-motion playback was not tested.

## Remaining acceptance

Automatic pet/community/recap read-back after a genuine care on the resulting
release remains **NOT RUN**. No connect, signature, rejection, adoption, care,
network/account switch or disconnect was performed during this follow-up.
Kym's personality panel, optional service registration and final rehearsal
remain separate work.
