# Kym — B1 onboarding and continued progression

Your larger beta lane has two independent components of the user journey.
Start after B0 is reviewed and merged by Deston, using current `origin/main`.
Keep any previous QA work; do not reuse the merged F5 or pet-QA branch.

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
screenshots/viewing steps, base/head and limitations. Codex integrates; Deston
merges. No need to initiate real wallet prompts or redo the old full QA brief.

## Paste this into Kym's agent

```text
Implement MemePet B1 from docs/beta/KYM.md. Read AGENTS.md, docs/PROJECT_BRIEF.md, docs/OWNERSHIP.md, docs/DEV_SETUP.md, docs/beta/START_HERE.md and INTEGRATION.md first. Preserve local work and fetch origin; start feat/beta-onboarding-progression from reviewed main containing B0. If B0 is not merged, inspect its brief but do not invent substitute interfaces. Own only components/onboarding, components/progression and docs/qa/beta/kym. Build the agreed wallet chooser/onboarding and cosmetic lifetime-progression panels with co-located tests, supplied beta types/fixtures and existing MemePet styling. No RPC, wallet client, storage, dependencies, global CSS, routes or contract changes. Keep unknown data honest and new milestones cosmetic. Open a draft PR, verify the agreed visual/keyboard/error cases, then return the ready PR with exact checks and remaining lead integration. Codex supplies adapters; Deston merges. Do not merge or spend money.
```
