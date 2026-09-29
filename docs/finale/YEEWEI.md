# YeeWei — grounded companion interface

**Task F3 UI · branch `feat/finale-companion-ui` · base: reviewed F0 merged into main.**
Build the useful read-only explanation surface, not a second application.

**Allowed:** `src/components/companion/**`, `docs/qa/finale/yeewei/**`.
Include co-located tests/CSS modules. No API/RPC clients, wallet libraries,
localStorage, hooks, routes, shared types/fixtures, global CSS, dependencies,
contracts, deployment or other owners' files.

## Deliver

- Export `CompanionPanel` using `CompanionPanelProps` from
  `src/types/companion.ts`. Three controls call `onAsk` with `progress`,
  `next-care` or `contribution`. A Hatchling can use recap immediately.
- A fact/evidence card showing the supplied network, wallet, registry, read
  block/time, care count, growth/stage and care eligibility where known. Label
  the scope **MemePet activity**, not full wallet history. Community total may
  be unknown even when personal facts are ready. F0 has no receipt links: do
  not invent them; ask Codex for any extension.
- Safe response text and personality context. Display `standard` answers as
  **Standard explanation**; label actual `ai` answers distinctly. A fictional
  AI fixture is not a real provider result or an OKX.AI integration.
- All facts/reply variants, including needs-wallet, wrong-network, loading,
  no-pet, unavailable, pending and answered. Facts remain readable when only the
  explanation fails. Ignore loading/answer replies with an obsolete `contextKey`.
- Replace F0's minimal `CompanionPreview` stub with a real state inspector using
  shared facts/reply/personality fixtures. `/dev/companion` is already wired for
  this work and blocked in production; do not edit its route or fixture schema.

## Accept when

- A question fires one callback with the correct ID. Pending/non-ready controls
  do not issue duplicate or inapplicable requests; retry is read-only.
- Unknown stays unknown. No inferred streaks, dates, fees, transfer history or
  unsupplied transaction proof appears. Standard/model/fixture provenance is clear.
- An old account/snapshot reply is hidden when its context differs from facts.
- Read and reply failures are separate; valid facts survive explanation failure.
- Response text cannot execute HTML. Long text/addresses do not overflow and
  keyboard focus/status announcements are usable at 320/390/1440px.
- Meaningful tests cover unavailable facts, no-pet, pending input, stale reply,
  safe text and provenance. Run component tests, typecheck/lint and report actual
  visual checks separately.

## Handoff

Open a draft PR early with state screenshots/viewing steps, actual checks and
exact integration requests. After integration, record a few consented usability
observations in your QA folder. These are small tests, not retention or organic
traction evidence. Codex reviews, merges and releases.

## Paste into YeeWei's coding session

```text
Implement MemePet task F3 UI from docs/finale/YEEWEI.md on feat/finale-companion-ui, starting from the reviewed merged F0 foundation on origin/main. Read AGENTS.md, scope, ownership, setup, docs/finale/INTEGRATION.md and actual shared types/fixtures first. Record your base SHA; preserve existing work and state intended files before editing.

Own only src/components/companion/** and docs/qa/finale/yeewei/**. Build CompanionPanel, meaningful tests and CompanionPreview described in your sheet. Use supplied facts, personality, reply and callbacks to explain progress, eligibility and contribution. Include evidence and distinct unknown/no-pet/pending/failure states, hide stale-context replies, and keep standard explanations visibly labelled. No wallet/RPC/API calls, persistence, unsafe HTML or invented facts. Codex owns optional model/OKX.AI service access and route wiring.

Use frozen types/fixtures and request missing shared inputs instead of inventing another schema. Open a draft PR early, commit/push scoped work, and return its URL with screenshots/viewing steps, actual checks and limits. Codex handles adapters, wiring, conflicts, review, merge and release. Do not merge/deploy yourself. Continue independent UI work when an integration request is pending.
```
