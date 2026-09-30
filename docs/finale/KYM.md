# Kym — pet personality and presentation

**Task F2 · branch `feat/finale-pet` · base: reviewed F0 merged into main.**
Own the Mochi experience. Build real components, styling and meaningful tests;
this task is not only a design document.

**30 September start handoff:** Deston confirmed this new panel has not started.
Create your branch from the latest `origin/main` (PRs #59, #61 and #62 are merged).
The garden and read-only recap are already integrated. Your shared props are
unchanged, and local personality storage/reset is implemented by Codex. Build the
panel and preview only; Codex will connect it to the existing `useCompanion`
instance and check that Explore/Practise change wording without changing growth.

**Allowed:** `src/components/pet/**`, `public/pets/**`, `docs/pet-assets.md`.
No routes, hooks, API calls, shared types/fixtures, localStorage, global CSS,
packages, contracts, deployment or other owners' files. Reuse approved Mochi art.

## Deliver

- Export `PersonalityPanel` using `PersonalityPanelProps` from
  `src/types/companion.ts`. Preserve `PetScene`, `CarePanel`, `PetPreview` and
  existing inputs. The lead wires the new panel into the live route.
- Explore and Practise controls, visible counts and playful/curious/focused style.
  Explain why Mochi's delivery changed; avoid an unexplained decorative badge.
  Use `onInteract("explore" | "practise")` and `onReset()` only.
- A browser-local saving notice and storage-unavailable state driven by
  `storageStatus`. Do not claim saving succeeded when it is unavailable. Codex
  handles storage and account isolation; the parent controls panel availability.
- Readable earned growth and restrained expressions using the three current
  artworks. No second pet, financial badge or unrelated decorative resource bars.
- Extend `PetPreview` with `personalityFixtures` from the shared finale fixtures.
  If a needed state is missing, request it rather than creating another schema.

## Accept when

- Each interaction invokes its supplied callback once; reset invokes reset once.
  These controls never call care, award points or alter cooldown.
- Default, exploration-led, practice-led and storage-unavailable states are
  understandable. Wording describes explanation style, not trained intelligence.
- Stage/growth still comes only from the supplied pet. Off-chain interactions
  do not trigger confirmed-care celebrations.
- Keyboard focus, accessible names, 320/390px and a 1440px presentation view work.
  Reduced motion keeps meaning/art visible without animation.
- Component tests plus typecheck/lint pass; observed visual checks are reported
  separately. Normal animation is unrun unless actually watched in a suitable
  browser. Do not ask Deston to change his OS preference.

## Handoff

Open a draft PR early. Include state screenshots, actual commands/results,
asset provenance if changed, limitations and exact route/fixture requests.
Codex reviews and merges; do not merge or deploy yourself.

## Paste into Kym's coding session

```text
Implement MemePet task F2 from docs/finale/KYM.md on feat/finale-pet, starting from the reviewed merged F0 foundation on origin/main. Read AGENTS.md, docs/PROJECT_BRIEF.md, docs/OWNERSHIP.md, docs/DEV_SETUP.md and docs/finale/INTEGRATION.md first, then inspect actual shared types/fixtures. Record the base SHA; preserve uncommitted work and state intended files before editing.

Build PersonalityPanel, meaningful tests and preview states described in your sheet. Own only src/components/pet/**, public/pets/** and docs/pet-assets.md. Reuse approved Mochi assets and preserve existing exports. Explore/Practise shape explanation style through supplied callbacks only: no growth/cooldown changes, RPC/model calls or persistence in components. Respect reduced motion, keyboard access and narrow layouts.

Request missing shared inputs from Codex in a draft PR instead of inventing parallel types or editing other owners' paths. Commit/push your task changes and open the draft PR early. Report exact checks and actual visual observations, keep failures/unrun states, and return the PR URL. Codex handles review, conflicts, merge and release. Do not merge or deploy yourself.
```
