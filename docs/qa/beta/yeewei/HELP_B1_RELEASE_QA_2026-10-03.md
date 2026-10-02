# Help and B1 combined release QA — 3 October 2026

> **Evidence only.** No source, test, config or content file changed. Local
> browser suites are a **SIMULATED WALLET BROWSER REGRESSION** (fictional
> providers/RPC) or **FICTIONAL UI PREVIEW**. The production review used plain
> Chromium with no wallet provider and no Connect click. None of this is
> genuine wallet acceptance or closes
> [the final wallet session](../../FINAL_WALLET_SESSION.md).

- Branch: `test/beta-help-integration`
- Tested SHA: `3148238f5a0d216fa704ad6176135d2e25555cda` (`origin/main`, #92 merge;
  includes Help #88 and B1 #90/#91)
- Run: 3 October 2026, 01:20–01:40 SGT (2 October 17:20–17:40 UTC)
- Runtime: macOS, Node v24.21.0 (`.nvmrc` pins 24.19.x), npm 11.19.0,
  Playwright 1.63.0 from the lockfile

## Production identity

| Evidence | Value |
|---|---|
| Alias | `https://memepet.vercel.app` (served by Vercel, `x-vercel-id: sin1::…`) |
| GitHub Production deployment record | id `6812922873`, SHA `3148238f5a0d…`, created 2026-10-02T16:16:38Z, status `success` (rechecked 17:36 UTC; still latest) |
| Deployment URL on that record | `memepet-bsukefvjf-chi944s-projects.vercel.app` (302: Vercel protection) |
| Vercel deployment ID | `dpl_E5nmo41hachVjySMn7Q6AfPMMQ7g`, as recorded by the lead in #92 |
| Main CI on tested SHA | App and Contracts passed, [run 37032767176](https://github.com/Chi944/MemePet/actions/runs/37032767176) |

**Limit:** the alias → `dpl_E5nm…` → `3148238` mapping was **not proven
directly**. The Vercel CLI is not installed, the deployment URL is protected,
and the served HTML contains no build/deployment identifier. Identity rests on
GitHub's latest Production deployment record and the lead's #92 note.

## Production HTTP (checked twice, 17:23 and 17:36 UTC)

| Path | Status |
|---|---|
| `/`, `/pet`, `/help` | 200 |
| `/dev/beta`, `/dev/community`, `/dev/companion`, `/dev/finale`, `/dev/landing`, `/dev/pet` | 404 |

## Local checks on the tested SHA

| Command | Result |
|---|---|
| `npm run typecheck` | Pass (exit 0) |
| `npm run lint` | Pass (exit 0; 0 errors, 1 existing `<img>` warning in `ShareImage.tsx`) |
| `npm test` | Pass — 54 files, 737 tests |
| `npm run build` | Pass — 17 routes incl. `/help`, `/pet` and six `/dev/*` |
| `npm run test:e2e:simulated` | Pass — 21 passed, 8 skipped (the B5 `recovery-refresh.spec.ts` TODOs). **SIMULATED** |
| `npm run test:e2e:previews` | Pass — 6 passed (`beta.spec.ts`, `onboarding.spec.ts` × 320/390/1440). **FICTIONAL** |
| `npm run test:contracts` | **NOT RUN** — Foundry (`forge`) is not installed locally; main CI's Contracts job passed on this SHA |

The preview suite's first attempt in the repository did not start because an
unrelated `next dev` server (started 30 September) was already running in that
directory. It was left untouched. The suite was rerun from a clean `git archive`
export of the tested SHA in a temporary folder, where it started its own server.

## Existing coverage cited, not duplicated

| Spec (owner) | What it already proves (local build) |
|---|---|
| `e2e/simulated-wallet/help.spec.ts` | `/help` at 320/390/1440: title, h1, `aria-current`, 10 FAQ entries, support-unavailable, Enter opens / Space closes, all entries open, no overflow, 6 official https `noreferrer` links, no wallet access, no API/off-origin requests, no page errors |
| `e2e/simulated-wallet/beta-integration.spec.ts` (lead) | Live B1 milestones/garden chapters follow account A→B, failed read clears Earned, read-only retry, disconnect hides milestones, no signing calls, at 320/390/1440 |
| `e2e/dev-preview/onboarding.spec.ts` (lead) | Fictional wallet choice by keyboard, local reset time, all-reached/unavailable milestones, retry, no overflow, at 320/390/1440 |
| `e2e/dev-preview/beta.spec.ts` | Fictional recovery states, Help keyboard focus-visible and outline clearance, no overflow |
| `e2e/simulated-wallet/combined-panels.spec.ts` | Pet, recap and garden agree for A then B; failed community read is Unknown everywhere, at 390/1440 |
| `e2e/simulated-wallet/no-provider.spec.ts` | No-provider setup guidance, Connect explains no wallet found, no Adopt, failed community read Unknown (desktop width) |

`provider-selection.spec.ts`, `beta-integration.spec.ts` and
`onboarding.spec.ts` were run, not modified.

## Production `/help` — 320 / 390 / 1440px

| Check | Observation (all three widths unless noted) |
|---|---|
| Status, title | 200, `Help · MemePet`; no `window.ethereum` present |
| Headings, readability | h1 “Mochi, made simple.” (36px at 320/390, 76px at 1440); h2 “Frequently asked questions”, “Support”; FAQ questions and answers 16px; full-page screenshots readable |
| Keyboard order | Skip to content → MemePet → Overview → Your pet → Community → Help → Go to your pet → 10 FAQ summaries → View source → wraps. Every stop `:focus-visible` with a visible ring |
| Open/close | All 10 start closed; Enter opens and Space closes each one |
| Links | 6 official links plus View source: `target="_blank"`, `rel="noreferrer"`, https; all 7 returned HTTP 200. Internal links to `/`, `/pet`, `/#community`, `/help` |
| Support | “Support contact unavailable. No monitored support contact has been verified yet, so none is listed.” |
| Overflow | None with entries closed or all open (`scrollWidth` = viewport; no element outside it) |
| Console/network | 0 console errors/warnings, 0 page errors, 0 failed requests, 0 off-origin requests |

## Production disconnected `/pet` — 320 / 390 / 1440px

**No-wallet state only; not connected-wallet acceptance.** Connect was not clicked.

- 200, `Pet home · MemePet`; no wallet provider present.
- 0 console errors/warnings, 0 page errors, 0 failed requests; no overflow.
- Status card: Wallet “Not installed”, Chain “Unknown”, Pet “Connect to view”,
  Community cares **12**. That value is a public read; the only off-origin request was
  `POST https://testrpc.xlayer.tech/terigon`. No `/api/companion` request.
- B1 onboarding: “Choose your wallet” states no wallet is available and that
  selecting is not connecting; “Bring your wallet” shows the UTC-day care rule
  and an expandable “Wallet and network setup” with official MetaMask, OKX and
  faucet links and a seed-phrase warning.
- B1 progression: Personal milestones and Garden chapters regions are hidden
  (0 regions). No Adopt button. Companion: “Connect a wallet to read MemePet activity.”
- Keyboard order: nav → Connect wallet (chooser) → Connect wallet (care panel)
  → Wallet and network setup → 3 official links → Community reference source → View source.
  All stops show a visible focus ring.

Observations, not defects:

- The `web3.okx.com (opens in a new tab)` stop is the intended Community reference
  source (`src/lib/community-reference.ts`, `docs/finale/COMMUNITY_CANDIDATE.md`).
- Two consecutive tab stops share the name “Connect wallet” (chooser and care
  panel). Both are visually separated and lead to the same action; a possible
  accessible-name refinement for the lead/Kym, not a release blocker.

## Result

- **No defect reproduced.**
- **No new spec added.** The only state lacking automated narrow-width coverage
  is no-provider `/pet` (its spec runs at desktop width). Disconnected milestone
  hiding and narrow layout are already covered by `beta-integration.spec.ts`
  with a simulated wallet, and this report adds production evidence at 320/390px.

## Screenshots (production, read-only)

Folder: [`help-b1-release-2026-10-03/`](help-b1-release-2026-10-03/)

| File | Shows |
|---|---|
| `prod-help-320.png` | `/help` at 320px, entries closed |
| `prod-help-390-all-open.png` | `/help` at 390px, all 10 entries open |
| `prod-help-1440.png` | `/help` at 1440px |
| `prod-pet-disconnected-320.png` | `/pet` at 320px, no wallet |
| `prod-pet-disconnected-1440.png` | `/pet` at 1440px, no wallet |

## NOT RUN

- Final genuine wallet acceptance (real wallet connect, adopt, care, signatures) — lead-owned
- Live connected-wallet B1 personal milestones and garden chapter progress
- The 8 B5 `recovery-refresh.spec.ts` cases (await the B5 adapter and genuine acceptance)
- Clicking Connect wallet on production
- Direct alias-to-deployment proof (Vercel CLI unavailable)
- Safari, Firefox and real mobile devices (Chromium only)
- Local contract tests (`npm run test:contracts`; Foundry not installed)
