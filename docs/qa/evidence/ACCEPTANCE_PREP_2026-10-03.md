# Acceptance preparation — 3 October 2026

## Reviewed handoffs

- #93 (B3 released Help) merged at `aed1a29`.
- #95 (B2 combined Help/B1 QA) merged at `4e48f94`.
- #94 (F7 finale evidence/runbook) merged at `a83f342`, including lead
  corrections that only attributed actions may be called team demo cares.
- #96 adds dated source comparison and a historical counter reading. Lead
  wording preserves the difference between unchanged source and a new browser run.

The reports support B2/B3 assigned completion. Kym's implementation is complete;
her separate focused release check is still unreported. Historical wallet gaps,
conditional scenarios and teammate inability to verify an alias remain explicit.
Read-only clip hashes are documented by Larm; files have not been delivered or
independently played on Deston's machine. No backup/rehearsal credit was added.

Lead verified `memepet.vercel.app` at READY deployment
`dpl_DmEnQrDvAFC4fGPscUuejBUF87a8`, source
`a83f3426b3482b4c91ec1e6ed43680a0087f1e55`. Main CI
[37101598505](https://github.com/Chi944/MemePet/actions/runs/37101598505) passed.
Git comparison against `3148238` found no changes in `src`, `public`, contracts,
package/lockfile or Next configuration. This is release bookkeeping, not a
new wallet or visual acceptance. The current lead PR records its own final
source, CI and deployment checks.

## New read-only preflight

`wallet-preflight.mjs` uses the committed public deployment and ABI; no private
environment loading, wallet provider or transaction method. Request/body reads
are bounded at 5 seconds and the whole run at 25 seconds by default, with a
64 KiB response ceiling and no automatic retries. The command rejects arguments.
All required registry/pet/balance reads use one explicit block; a final header
and chain recheck rejects inconsistent snapshots. Failures print no partial
snapshot. Code presence is checked, not identity or security audit.

Local checks: **44 Node helper regressions passed** (22 existing + 22 preflight),
full ESLint passed with the existing ShareImage warning, and diff checks passed.
Independent code review and a second 22-case run found no blocking issue.
Native Node TypeScript loading emits an informational module-format warning;
no project configuration was changed to hide it. App/contract/browser CI is
recorded on the associated PR; simulated coverage remains separate from genuine.

## Actual public read — not a wallet run

Command: `node docs/qa/wallet-preflight.mjs`, exit 0.
Block **42548794**, hash `0x352a79d385398edc16f081452eb28cb4253ab9f57383279621b2abd6f48c5844`,
chain time **2026-10-03T06:07:11.000Z** (14:07:11 Singapore).
Chain 1952, committed registry, approved community 1, total **12**.

| Account | State at the recorded block | Care | Next-care evolution |
|---|---|---|---|
| 1, ending 5774 | Buddy, 30 points, 3 cares | Due | None |
| 2, ending 3CE9 | Buddy, 30 points, 3 cares | Due | None |
| 3, ending 7B3a | Buddy, 30 points, 3 cares | Due | None |
| 4, ending 203e6 | Hatchling, 10 points, 1 care | Due | Buddy if a care confirms |

All four have nonzero public testnet OKB; this does not prove gas sufficiency.
Account 4 is a suitable candidate only after rechecking immediately before the
session. No care, funding, wallet connection or signature was performed here.
B5 recovery remains disabled; every genuine-session results row stays NOT RUN.

Raw public JSON is outside Git at
`C:/Users/User/Documents/Projects/archive/memepet-submission-2026/qa/preflight-2026-10-03-42548794.json`.
SHA-256: `8b71b7e5f68c8b67496d1c0b0425edd378168635785d7acedfc1188a5c6c1820`.

## Remaining work

One coordinated genuine session must verify actual provider choice, care,
automatic pet/community/recap reads, B1 local-reset/milestones, isolation,
reload and disconnect. Then B5 runtime may be integrated and checked separately.
Deliver/play the real backup and complete the timed rehearsal. Preparation
has not increased these completion weights: total remains **90/100**.
