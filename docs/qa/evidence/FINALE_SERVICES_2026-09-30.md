# Finale shared services — 30 September 2026

Singapore date; UTC observations below are on 29 September. Base:
`ddd7f7ed7363e36d07946895d149ec592ec3a3b6`. Work branch:
`feat/finale-companion-services`. This is new finale work, not original
submission evidence. No browser wallet connection, signature or transaction
was performed for this checkpoint.

## Delivered code

- `/api/companion`: public GET metadata and bounded POST for one public wallet.
  Only the configured registry/RPC is allowed. Body, input, concurrency and
  timeout limits apply; no paid model, secret or signing operation is used.
- Reader: checks chain ID, pins pet/shared facts to one block and rechecks its
  hash. Pet read failure is unavailable; optional community failure stays null.
- Companion adapter: initial/receipt/manual reads, checked API version and
  identity, monotonic block floor, stale-session cancellation and standard
  local explanations. No periodic polling or fixture fallback.
- Personality adapter: resettable local preferences scoped by chain, registry
  and wallet. Invalid storage, failed writes, cross-tab events and A–B–A
  transitions have regression coverage. Local interactions do not earn growth.
- Community adapter: cosmetic 20-care mission, truthful unknown states and
  unconfigured reference identity. Review found and fixed endless loading on
  initially unsupported networks/missing settings and on retry in those states.

The teammate UI components and route wiring remain pending. The API and adapters
alone do not make a new panel visible. OKX.AI registration/listing/invocation is
NOT RUN; direct HTTP calls are not proof of that integration.

## Automated verification

| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS, one existing `ShareImage.tsx` image-element warning |
| `npm test` | PASS, 271 tests across 30 files |
| `node --test docs/qa/counter-check.regression.mjs` | PASS, 8 |
| `forge test --root contracts` | PASS, 15 |
| `npm run build` | PASS |
| `git diff --check` | PASS |

Independent source reviews covered API/reader truthfulness and personality/
community state handling. Hook and route tests use controlled inputs; they are
not browser-wallet evidence. Vitest reports an advisory about future Vite config
loading; no check was disabled to suppress it.

## Genuine local HTTP and public-chain reads

Started a local production server on `127.0.0.1:3450`. Its first metadata check
correctly revealed old private Anvil overrides (31337), so that run was stopped
before a testnet query. Rebuilt using explicit committed public X Layer values;
no private environment file was read or changed. Metadata then confirmed chain
1952 and registry `0xe844152262D243a7B90F6e07FF7A67F1d7FeD216`.

At **2026-09-29T18:19:49.667Z**, a real POST for public demo Account 3
`0xb7E6D789c39D468CfE3c5dA37C29Bd9852247B3a` with question `contribution`
returned HTTP 200, live facts and a `standard` explanation:

| Fact | Observed value |
|---|---|
| Source block | 42247147 |
| Block hash | `0x72fb791c8ac7944800fe2af4d67c6efbf54c8957354721de53056e4d03b5bafe` |
| Chain block time | 2026-09-29T18:19:44.000Z |
| Pet | Existing, community 1, care count 1 |
| Progress | 10 points, hatchling, next stage at 20 |
| Community total | 4 |
| Care eligibility | Available as of the source block, not a newly performed care |

An independent viem client queried chain ID, block, `petOf` and
`communityStats(1)` at that exact block. All matched; raw `lastCareDay` was
20720. This proves a read, not a new successful care or user activity metric.

Additional real HTTP checks at approximately **18:20:22Z**:

- Requested receipt block **41815415**: HTTP 200, source time
  2026-09-24T18:24:12Z, one care/10 points, community total 4, next eligible
  time 2026-09-25T00:00:00Z. Explanation included its historical block/time.
- Zero address: HTTP 200 with genuine `no-pet`; no fabricated default pet.
- An extra `rpcUrl` input: HTTP 400 before it could select another endpoint.
- `/` returned 200; `/dev/pet`, `/dev/community`, `/dev/landing`, `/dev/finale`
  and `/dev/companion` each returned 404 in production.

## Public release verification

[PR #57](https://github.com/Chi944/MemePet/pull/57) passed App, Contracts and
Vercel checks at head `be1b46467a37fd49aae5bdde6a13a51701a70ac9`, then merged as
`3c9cdd0243636ebf1159ceafdb59940ba3a133d3` at 2026-09-29T18:25:25Z. GitHub's
Vercel deployment record **6742315810** associates that commit with Production
and reports success at **18:26:10Z**. The previous main `ddd7f7e` remains the
rollback baseline; no force-push or deployment-setting change was used.
[Post-merge Checks](https://github.com/Chi944/MemePet/actions/runs/36611948361)
also passed App and Contracts on that exact merge commit.

At **18:26:46.540Z**, the public alias
`https://memepet.vercel.app/api/companion` returned HTTP 200 with `no-store`,
schema version 1, chain 1952 and the expected registry. The Account 3 progress
question returned one care, 10 points, hatchling and community total 4 at block
**42247566**, timestamp **2026-09-29T18:26:43Z**, hash
`0x4265366ea4f181f9599585c45285daf559791cf28a78d48511100ffc1d29af04`.
An independent RPC client matched that source block, pet and total. The reply
was labelled `standard`; metadata explicitly said `not-registered` for OKX.AI.

Public `/`, `/pet` and Account 3's read-only pet route returned 200; all five
development previews returned 404. The public zero-address query returned
genuine no-pet with HTTP 200. An extra `chainId` field was rejected with HTTP
400. These were HTTP checks, not foreground UI or extension observations.

## Remaining acceptance

The existing genuine-wallet gaps remain unchanged, including automatic
community refresh on a fresh care, network away/back and later-day evolution.
Respect the user's reduced-motion preference. Final component/browser QA is
required after the three teammate PRs are integrated.
