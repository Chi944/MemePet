# File ownership and integration contract

**Current handoff — 3 October:** B0–B4 feature integration is merged through
#92. Reviewed #93/#95 complete the assigned B3/B2 release QA; Kym's B1
implementation is complete. Use [current beta roles](beta/START_HERE.md)
and [weighted progress](STATUS.md#progress-measurement). The [repaired-release
retest](qa/evidence/READ_REPAIR_2026-10-03.md) records scoped wallet acceptance
PASS for `fa07032`, preserving the earlier failure and observation limits.
B5 runtime is reviewed and merged in #102 at `36b9ba8`, after passing PR CI and
Vercel preview checks. Production identity and main CI are verified; genuine
changed-release B5 recovery remains NOT RUN. Deston retains private
approvals, product review and rehearsal. Backup delivery/playback and rehearsal
do not gate B5 engineering.

## Current beta delegation — 2 October 2026

The latest user instruction delegates the [testnet beta](beta/START_HERE.md)
and merges to **the lead Codex session**. Codex builds shared engineering,
reviews exact PR heads, repairs conflicts and merges passing, in-scope work.
Deston handles final product checks and private wallet approvals, with no routine
coding assigned. This supersedes the earlier same-day Deston-only merge rule;
teammate agents still cannot merge.

| Owner | New task-level editable paths |
|---|---|
| Kym / B1 | `src/components/onboarding/**`, `src/components/progression/**`, `docs/qa/beta/kym/**` |
| YeeWei / B2 | `src/components/recovery/**`, `src/components/help/**`, `e2e/**`, `docs/qa/beta/yeewei/**` |
| Larm / B3 | `src/content/help.ts`, `docs/qa/beta/larm/**` |
| Codex / B0, B4, B5 | Shared types/fixtures/helpers/hooks, routes, shell/navigation, config/dependencies/CI, integrations and shared docs |

B4's focused `e2e/simulated-wallet/provider-selection.spec.ts` is a lead-owned
exception to YeeWei's E2E lane until handoff. She may cite its evidence and add
broader scenarios in other files; coordinate before changing this active spec.
Kym's `WalletChooser` replaced the temporary picker in #91. The lead owns
its route integration; Kym retains the presentation component lane.

Beta task allowlists are exclusive: these assignments do not grant permission
to redesign the earlier pet/community/recap components. Existing scoped finale
QA can finish independently on its own branch. Use [exact beta interfaces](beta/INTEGRATION.md),
separate clones/worktrees, and branch from reviewed main. B0 is merged in
PR #80 at `99086a3`; the original three beta lanes have completed their assigned
implementation. The scoped wallet prerequisite for pending-transaction runtime
integration is now satisfied by the evidence linked above. B5's own acceptance
remains required. All paid services stay inactive.

## Finale ownership and historical handoff

The user approved the [finale extension](finale/START_HERE.md) on 29 September
2026. Named ownership below replaces the old Teammate A/B labels. Task-level
delegation may narrow these paths; shared interface changes require lead review.

| Owner | Editable area |
|---|---|
| Codex integration lead | `contracts/**`, `src/app/**`, `src/hooks/**`, `src/lib/**`, `src/types/**`, `src/fixtures/**`, `src/components/ui/**`, `src/components/share/**`, global styles, configuration, packages/lockfile, CI/deployment, shared specification docs |
| Kym / pet QA handoff complete in #78; focused regressions only | `src/components/pet/**`, `public/pets/**`, `docs/pet-assets.md` |
| Larm / F7 follow-up `test/finale-combined-qa` | `src/components/landing/**`, `src/components/community/**`, `docs/qa/finale/larm/**`, `docs/finale/COMMUNITY_CANDIDATE.md` |
| YeeWei / combined QA `test/companion-combined-qa` | `src/components/companion/**`, `docs/qa/finale/yeewei/**` |

Task-level allowlists can be narrower than this table. Ownership is a coordination agreement, not a technical permission system. Everyone reviews their diff and the lead reviews every merge.

The 2 October role sheets follow the merged F5/#73, F6/#72/#75 and Kym's pet
QA/preview fix #78. Approved features are complete; current tasks are combined
QA and reproduced-defect fixes. Kym's assigned handoff is complete; do not reuse
her merged `test/pet-release-qa` branch or repeat that full brief. Any requested
pet regression remains limited to `src/components/pet/**`; broader asset
ownership above does not authorize new artwork or expand scope. Use a fresh
branch for a new follow-up; preserve and safely reconcile Larm's existing
combined-QA work.
Preserve active unmerged QA work in any lane; fresh branches are for tasks that
have not started. All four role sheets define deliverables and paste-ready
continuation prompts. Larm owns the combined result index and cites Kym's
[completed report](../src/components/pet/qa/PET_RELEASE_QA_2026-10-02.md) with
its limits; YeeWei returns her remaining recap report from her own folder.
If there is no defect, an evidence-only PR completes the handoff without adding
unnecessary code. The shared [handoff](finale/START_HERE.md#release-identity-and-common-handoff)
defines completion and how to distinguish checkout from deployed revisions.

The verified product checkpoint is `62d487d5d4e1f7c7b26332753f042fcb91a748d8`,
production deployment `6794766512`. The [current release evidence](qa/evidence/PET_QA_RELEASE_2026-10-02.md)
records the alias-to-SHA verification and a separate lead read-only follow-up.
Fetch reviewed current main and record the actual runtime; historical evidence
does not establish a new wallet pass or permanent deployment identity.

Component folders include co-located tests and CSS modules. Deston is the final
reviewer and wallet operator; Codex handles his engineering lane. Larm's former
broad `docs/qa/**` permission is narrowed to his own finale folder to avoid
overwriting another lane's evidence. No one edits old wallet failures into passes.
Combined QA is planned for 3–4 October, backup capture for 5 October and rehearsal
for 6 October. Genuine final wallet acceptance remains a single planned lead
session; mock tests and fixture clicks are not wallet proof. No extra coding is
assigned to Deston. Optional OKX.AI registration/invocation remains unverified
and non-blocking; paid integrations stay inactive without explicit authorization.

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

Codex reviews passing work, resolves integration conflicts, prepares release
checks and merges the reviewed PRs one at a time. Teammate agents cannot
merge themselves or change deployment settings. Review exact PR heads. Do not
work directly on main, force-push or bypass failing checks.

Check for a clean working tree before updating from main. Do not let an agent discard local work or force-resolve conflicts. The lead handles confusing conflicts and reviews the result.

Return PR URL, base/head commits, actual commands/results, screenshots or viewing
steps and limitations. Executable assignments: [Kym](finale/KYM.md),
[Larm](finale/LARM.md), [YeeWei](finale/YEEWEI.md), [Codex](finale/CODEX.md).
