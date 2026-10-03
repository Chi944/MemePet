# Kym — B1 onboarding and continued progression

## Current handoff — 3 October

B1 is complete and integrated in #91. Keep your focused released chooser,
local-reset and milestone visual check if it is still pending; no new feature
work is needed. Preserve your original evidence and report only new defects.

The first genuine care run found a lead-owned read-back failure; PR #100 and
its changed-release recheck are Codex's work. Do not rebuild your panels or
mark that wallet gate passed from component checks.

```text
Fetch reviewed main, preserving local work. Read docs/beta/KYM.md. B1 is complete; do not rebuild it or redo the whole QA suite. Finish only the focused released onboarding/progression visual check if unrun, covering narrow/wide layout and keyboard behavior. Record actual runtime and distinguish fictional, simulated and genuine checks. Change only your assigned components/evidence for reproduced defects. No wallet actions, shared code, paid calls or merges. Return evidence or a small fix PR; if already done, return its existing reference.
```

## Earlier requirements and handoffs

**Current handoff — 2 October:** your finale personality, earned forms and pet
QA are merged (#67/#73/#78). No pushed B1 branch or PR was visible at this
checkpoint. Deston subsequently confirmed that you are working locally.
Preserve and continue that work; its implementation is not yet reviewed.
The lead has shipped provider selection, panel-state mapping and read-only pet retry (#81/#82/#85), so B1 can use the agreed inputs.
See [the weighted progress snapshot](../STATUS.md#progress-measurement).

**Next deliverable:** open a small B1 draft with WalletChooser/OnboardingPanel
first, then ProgressionPanel. Keep the components callback-only; do not rebuild
wallet discovery or change hooks. Ask the lead to extend `/dev/beta` after the
component handoff. Local reset time is explanatory; eligibility still comes
from confirmed chain time. Your existing detailed deliverables below remain.

Your larger beta lane has two independent components of the user journey.
Start now: B0 is reviewed and merged in #80 (`99086a3`). Use current `origin/main`.
Keep any previous QA work; do not reuse the merged F5 or pet-QA branch.
If this beta branch already contains work, preserve and continue it instead of
recreating it. Fetch and inspect before reconciling main; never reset local work.

**Branch:** `feat/beta-onboarding-progression`.
**Editable:** `src/components/onboarding/**`, `src/components/progression/**`,
`docs/qa/beta/kym/**`. No shared hooks, types, routes, fixtures, package or global
style edits. Request exact shared changes from Codex.

## Deliver

1. `WalletChooser` and `OnboardingPanel` using [the exact props](INTEGRATION.md).
   Let the visitor explicitly choose an available wallet. Explain install,
   connection, wrong network, loading, unknown read, adoption and ready states.
   Use a mobile wallet's browser as the supported first mobile path; do not
   claim WalletConnect or deep-link support that does not exist. Explain that
   X Layer testnet uses test OKB for gas, never request a seed/key, and link only
   verified official wallet/faucet guidance. Do not promise a faucet allocation.
   Codex supplies provider discovery and a minimal lead-owned route selector
   in B4. Your full `WalletChooser` replaces that presentation after review;
   do not duplicate discovery, alter the hook or edit the route to remove it.
2. In cooldown, show the given reset time in the visitor's local time zone and
   retain “one care per UTC calendar day.” Do not use the local clock to enable
   care or award anything. Handle unavailable/invalid dates honestly.
3. `ProgressionPanel` renders personal 5/10/20 confirmed-care milestones and
   garden 20/50/100 chapters. Show existing earned milestones and the next
   absolute target; preserve lifetime totals. Use native CSS/SVG badge artwork
   with no purchase. Guardian remains the final pet form. No missed-day loss,
   monetary reward, fictional history or third-party branding.
4. Tests and 320/390/1440px, keyboard and visible-focus evidence. Cover zero,
   loading, unknown, boundary targets, all milestones reached and both wallet
   options. Reuse supplied fixtures; label every preview fictional. Component
   callback tests are simulated, never real wallet passes.

Return a draft PR early, then mark it ready with actual commands/results,
screenshots/viewing steps, base/head and limitations. Codex reviews, integrates
and merges passing work. No need to initiate real wallet prompts or redo the
old full QA brief. Deston handles final product checks and private approvals.

## Paste this into Kym's agent

```text
Continue MemePet B1 from docs/beta/KYM.md and INTEGRATION.md. Preserve existing local work; fetch reviewed main with #81/#82/#85 and the Help integration before reconciling. Your finale work is complete. Build only src/components/onboarding/** and src/components/progression/** with the shared beta props and fictional fixtures; put evidence in docs/qa/beta/kym/**. Start with WalletChooser and OnboardingPanel, then ProgressionPanel. Provider discovery, state mapping and retry callbacks already exist; the lead owns route wiring and /dev/beta expansion. Open a small draft early and report actual checks, screenshots, base/head and limitations. Do not alter hooks, shared types, routes, packages, contract rules or other lanes. No paid services, wallet actions, force-pushes or merges.
```
