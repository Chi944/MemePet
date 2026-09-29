# Larm — community value, shared mission and QA

**Task F4 · branch `feat/finale-community` · base: reviewed F0 merged into main.**
Build the community experience and verify it independently after integration.

**Allowed:** `src/components/landing/**`, `src/components/community/**`,
`docs/qa/finale/larm/**`, `docs/finale/COMMUNITY_CANDIDATE.md`.
Do not edit other QA records, root task sheets, routes, shared types/fixtures,
hooks, data/model clients, global CSS, dependencies, contracts or deployment.

## Deliver

- Export `FinaleCommunityPanel` using `FinaleCommunityPanelProps` from
  `src/types/finale-community.ts`. Preserve existing exports/navigation callbacks
  and improve the landing story around the working care loop.
- A garden that blooms at **20 lifetime confirmed registry care actions**.
  Existing cares count toward this newly approved cosmetic app rule. Render the
  supplied mission total and `isComplete`; never call the counter users/holders
  or imply token rewards. Personal care contribution belongs in YeeWei's recap.
- Loading, zero, growing, achieved and unavailable states. No percentage/bloom
  inferred from unknown data. `onRetry` is a read-only callback, not a transaction.
- A community reference card with sourced links and explicit reference wording.
  Research one realistic candidate in `COMMUNITY_CANDIDATE.md`: official sources,
  network/address if applicable, useful proposed interaction, branding permission
  status and unverified facts. Codex verifies before live display. A reference
  is not a partnership. Do not make a transaction to obtain a badge.
- Extend `CommunityPreview` using the shared mission and identity fixtures.
  Their illustrative identity is not a real token and must not reach live UI.
- An independent QA matrix and three-minute/network-failure runbook under your
  own QA folder. A recorded backup must be labelled, never passed off as live.

## Accept when

- Mission 0, below 20, exactly 20 and above 20 render accurately. The bar may cap
  at 100%; the actual total does not. Loading/error cannot show an earned bloom.
- No invented unique people, retention, organic usage or token-holder metrics.
- Unconfigured identity is explicit. Do not ship placeholder contracts, token
  logos or unsourced claims as verified. Distinguish a reference asset's network
  from MemePet's testnet when they differ.
- Retry calls its callback once and cannot create a transaction.
- Inspect 320/390/1440px, keyboard access and reduced motion. Component tests,
  typecheck and lint pass; actual browser checks remain a separate evidence log.
- Integrated wallet QA records release/network/account/receipt where available.
  Preserve the old failure and keep unperformed wallet checks NOT RUN. Codex
  provides the integrated release for this follow-up.

## Handoff

Open a draft PR early with actual commands/results, state screenshots, sources
and remaining integration requests. Hand it and later QA evidence to Codex; do
not merge, deploy, change another person's OS preference or sign on their behalf.

## Paste into Larm's coding session

```text
Implement MemePet task F4 from docs/finale/LARM.md on feat/finale-community, based on the reviewed merged F0 foundation on origin/main. Read AGENTS.md, scope, ownership, setup, docs/finale/INTEGRATION.md, actual shared types/fixtures and previous wallet evidence first. Record your base SHA and preserve existing work. State intended files before editing.

Own only src/components/landing/**, src/components/community/**, docs/qa/finale/larm/** and docs/finale/COMMUNITY_CANDIDATE.md. Build FinaleCommunityPanel, meaningful tests and preview states. The new garden goal is 20 lifetime confirmed care actions; previous cares count and the outcome is cosmetic only. Render supplied identity/counts/callbacks; never fetch or manufacture progress. Research one sourced reference integration for lead verification, without claiming partnership or unsupported token identity.

Prepare independent browser QA and a short finale fallback runbook in your QA folder. Respect reduced motion and honest unknown states. Open a draft PR early, commit/push assigned work, then report actual checks, screenshots, sources, failures and unrun rows. Request shared changes from Codex precisely. Return the PR URL; Codex handles integration, conflicts, review, merge and release. Do not merge/deploy yourself or mark unperformed wallet actions as passing.
```
