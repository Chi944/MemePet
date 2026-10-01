# File ownership and integration contract

The user approved the [finale extension](finale/START_HERE.md) on 29 September
2026. Named ownership below replaces the old Teammate A/B labels. Task-level
delegation may narrow these paths; shared interface changes require lead review.

| Owner | Editable area |
|---|---|
| Codex integration lead | `contracts/**`, `src/app/**`, `src/hooks/**`, `src/lib/**`, `src/types/**`, `src/fixtures/**`, `src/components/ui/**`, `src/components/share/**`, global styles, configuration, packages/lockfile, CI/deployment, shared specification docs |
| Kym / F5 `feat/earned-stage-viewer` | `src/components/pet/**`, `public/pets/**`, `docs/pet-assets.md` |
| Larm / F7 follow-up `test/finale-combined-qa` | `src/components/landing/**`, `src/components/community/**`, `docs/qa/finale/larm/**`, `docs/finale/COMMUNITY_CANDIDATE.md` |
| YeeWei / F6 follow-up `test/companion-release-qa` | `src/components/companion/**`, `docs/qa/finale/yeewei/**` |

Task-level allowlists can be narrower than this table. Ownership is a coordination agreement, not a technical permission system. Everyone reviews their diff and the lead reviews every merge.

The 1 October role sheets assign F5/F6/F7 after the first component wave merged
(including #67 and #66). F5 is currently limited to `src/components/pet/**` and
reuses existing art; the broader asset ownership above does not expand that task.

Component folders include co-located tests and CSS modules. Deston is the final
reviewer and wallet operator; Codex handles his engineering lane. Larm's former
broad `docs/qa/**` permission is narrowed to his own finale folder to avoid
overwriting another lane's evidence. No one edits old wallet failures into passes.

## Stable component exports

- Kym: `PetScene`, `CarePanel`, `PetPreview` and `PersonalityPanel` in `src/components/pet/`; preserve their existing shared props.
- Larm: `LandingHero`, `LandingPreview`, `HowItWorks` in `src/components/landing/`; `CommunityPanel`, `CommunityPreview` and `FinaleCommunityPanel` in `src/components/community/`.
- YeeWei: `CompanionPanel` and `CompanionPreview` in `src/components/companion/`, using the finale shared props.
- Lead: integration routes and shared UI (`Button`, `Card`, `Badge`,
  `DataModeBadge`, `AppShell`) in `src/components/ui/`. Component owners preserve
  the agreed exported prop types.

`HowItWorks` takes `connected: boolean` and is rendered by the lead-owned home
route. Larm owns its presentation. Preserve all existing exports and inputs.

Public viewing is implemented in the lead-owned `src/app/pet/[address]/` route,
using the existing pet presentation. Share-image rendering lives in
`src/components/share/` with lead-owned data/asset helpers. A separate profile
component or interface is not required.

Use `src/types/view-models.ts` for existing component inputs and the exact finale
types in [INTEGRATION](finale/INTEGRATION.md). The lead supplies named fixtures in
`src/fixtures/ui-fixtures.ts` and `src/fixtures/finale-fixtures.ts`. Teammates read
but do not change them without delegation. Components may compose approved
components; they cannot edit another owner's files. The lead owns data/model
clients, browser-local personality storage and stale account/network isolation.

## Developer previews

The lead provides `/dev/pet`, `/dev/landing`, `/dev/community`, `/dev/companion`
and the F0 fixture workbench `/dev/finale`, labelled **UI preview — fictional
data**. The teammate state inspectors are implemented. Owners extend their preview components;
the lead controls routes and production gates. Fixture imports belong only in
preview components/tests, never as a failed live read's fallback.

Developer preview routes must return a not-found response in a production build. The lead tests that gate in the release build. They must not be reachable as an undocumented production demo mode.

## Shared changes

When a task needs a new prop, package, route or shared style, put the exact need
and current blocker in the draft PR. Codex makes the shared change once and
tells affected lanes to sync. Do not invent competing schemas. Continue
independent UI work while a shared request is pending.

## Branch policy

Start each new assigned finale branch from the **current reviewed `origin/main`**
after fetching. F0 and the first component wave are already merged; retain later
fixes instead of branching from the original F0 revision or reusing an old merged
branch. Record the actual base SHA in your PR; do not start from an unreviewed
sibling branch or the old downloaded proposal. Use separate clones or worktrees
for simultaneous sessions. Open a small draft PR early.

The user authorizes the lead Codex session to review and merge passing work,
resolve integration conflicts and handle release checks. This does not
authorize teammate agents to merge themselves or change deployment settings.
Codex reviews exact PR heads and integrates one PR at a time. Do not work
directly on main, force-push or bypass failing checks.

Check for a clean working tree before updating from main. Do not let an agent discard local work or force-resolve conflicts. The lead handles confusing conflicts and reviews the result.

Return PR URL, base/head commits, actual commands/results, screenshots or viewing
steps and limitations. Executable assignments: [Kym](finale/KYM.md),
[Larm](finale/LARM.md), [YeeWei](finale/YEEWEI.md), [Codex](finale/CODEX.md).
