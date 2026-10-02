# Kym — B1 onboarding and continued progression

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
Continue MemePet B1 using docs/beta/KYM.md. Read AGENTS.md, PROJECT_BRIEF, OWNERSHIP, DEV_SETUP and beta START_HERE/INTEGRATION first. B0 is merged in #80 (99086a3); begin now. Preserve local/unpublished work and fetch origin. Continue an existing active B1 branch; otherwise create feat/beta-onboarding-progression from reviewed origin/main. Edit only src/components/onboarding/**, src/components/progression/** and docs/qa/beta/kym/**. Build WalletChooser, OnboardingPanel and ProgressionPanel with the exact shared types/fixtures, local care-time wording, 5/10/20 personal milestones and 20/50/100 garden chapters. Keep unknown data honest and progression cosmetic. Codex owns provider discovery and will replace his initial route controls with your components. Do not edit hooks/routes/storage/shared types/packages/global CSS. Add component tests and narrow-screen/keyboard evidence. Open a draft PR early; finish with actual checks, base/head, viewing steps and limitations. Codex reviews/integrates/merges passing work. No real wallet actions, destructive resets, merges or paid services.
```
