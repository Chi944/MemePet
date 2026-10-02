# B0 beta foundation verification — 2 October 2026

Base: `c945ca37507aaeee5e3e6d275f5f95ffbb38d52a`.
Branch: `feat/beta-foundation-and-team-briefs`. PR commits identify the final
head; this file does not claim the public alias has deployed these changes.
Deston retains the merge. No wallet action was performed in this run.

## Implemented in this branch

- Remaining initial pet, receipt-bound pet and public pet reads use explicit
  4-second HTTP requests with no transport retry, at most three temporary-error
  attempts and a 15-second snapshot budget. Existing stale-scope guards and
  honest unknown/error states remain. Wallet approval and receipt-confirmation
  timing are not put inside this short read deadline; writes are never retried.
- Foundry v1.8.3 and forge-std v1.16.2 are pinned, including the installer action
  SHA. Local setup and CI agree. No contract logic/deployment was changed.
- Shared beta UI contracts, fictional fixtures and tested cosmetic lifetime
  milestone mappings let the three teammates build without changing hooks.
- Playwright 1.63.0 local production harness, one explicitly simulated browser
  smoke, CI steps and separate Vitest discovery. Remaining B2 scenarios are
  listed honestly in `e2e/simulated-wallet/README.md`.
- Next.js and matching lint config updated 16.3.5 → 16.3.8. The dependency
  audit reported [GHSA-vcvr-r3jv-pc5j](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j),
  affecting certain Node ImageResponse SVG inputs in versions before 16.3.6.
  The patched dependency is used. This is not a claim of observed exploitation.
- New B1/B2/B3 instructions, exact ownership and paste-ready prompts. Current
  policy is Deston merges; Codex reviews and supplies shared engineering.

## Actual local checks

| Command / observation | Actual result |
|---|---|
| `npm run typecheck` | PASS, including the final shared-interface review fixes |
| `npm run lint` | PASS; existing native `<img>` warning in Satori ShareImage remains, no errors |
| `npm test` | PASS, 407 tests / 41 files at the first integrated run |
| `npx vitest run src/lib/beta-progress.test.ts` after review additions | PASS, 22 tests including six added personal-boundary cases; CI will check the complete final head |
| `npm run test:contracts` | PASS, 15 tests |
| Fresh isolated pinned forge-std install and `forge test --root <temporary-copy> -vv` | PASS, 15 tests; clean solc 0.8.24 compile, executed by B0-CI agent |
| `node --test docs/qa/counter-check.regression.mjs docs/qa/rpc-recovery.regression.mjs` | PASS, 22 helper tests |
| `npm run build` | PASS, Next.js 16.3.8 production build |
| Production server on 127.0.0.1:3418 | Home 200; all five `/dev/*` routes 404; server stopped after checks |
| `npm run test:e2e:simulated` against the fresh build | PASS, 1 Chromium smoke: no provider guidance and failed community read remains unknown |
| `npm audit --omit=dev` after update | PASS, zero reported vulnerabilities at check time; not a complete security audit |

Read regressions include never-settling requests, exhausted temporary retries,
terminal errors, late continuations, old-account invalidation and manual
read-only recovery. Two internal reviews checked runtime changes and team
handoff; connecting, FAQ-link and replacement/cancellation display contracts
were clarified before the handoff.

## Limits and outstanding work

**SIMULATED WALLET BROWSER REGRESSION**, not genuine wallet acceptance. No funded
account, extension approval, signature, adoption, care or actual refresh while
a live transaction was pending was exercised here. The current
[final wallet session](../FINAL_WALLET_SESSION.md) stays NOT RUN.

Kym's onboarding/progression UI, YeeWei's recovery/help/full browser scenarios,
Larm's support copy, selected-provider adapter and persistent recovery runtime
are assigned follow-up work. Beta fixtures/helpers do not make those features
live. B5 runtime waits for final acceptance; the existing pre-receipt generic
transaction-error behavior has not been redesigned in B0.

PR CI/preview checks are separate from these local results. A successful preview
does not establish a production alias SHA. No mainnet readiness or zero-risk
guarantee is asserted; the beta brief lists the remaining release gates.
