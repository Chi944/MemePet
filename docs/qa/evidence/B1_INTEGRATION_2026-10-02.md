# B1 live integration — 2 October 2026

Kym's reviewed head `b810594cc94821387f5f0d51e695058c97dc9d77` passed
App/Contracts/Vercel checks and merged in #90 (`99050c6`). Her handoff retains
its standalone harness limits. The lead branch is `feat/beta-live-onboarding`;
its PR records exact final source, CI, merge and deployment verification.

## Delivered

- Explicit chooser replaces the temporary picker. Existing security/session
  guards remain; onboarding cannot connect until a provider is selected.
- Onboarding uses the current confirmed hook state. Local reset is the same
  UTC instant formatted in the browser; no computer-clock eligibility.
- Personal 5/10/20 and community 20/50/100 cosmetic milestones use confirmed
  lifetime counts. Unknown is never zero. Account changes clear earned badges;
  disconnect/wrong network hides the progression panel.
- Read-only failed-read callbacks are guarded during loading/writes. Retry
  retains keyboard focus while its label changes to Reading pet.
- Help/README describe shipped milestones; B5 recovery remains planned.
- /dev/beta now includes fictional B1 states and callback counts; still 404
  in production. No new runtime, storage, paid service or wallet action.

## Actual checks

Typecheck, lint (existing ShareImage warning), **737 tests / 54 files** and
production build passed. The 22 Node evidence/harness regressions also passed. Production Playwright: **21 passed**, comprising 18
simulated-wallet cases and three read-only Help cases; eight B5 cases remain
skipped. Separate fictional development suite: **six passed**.

New simulated cases at 320/390/1440px use the real route/components with fake
providers and intercepted reads. They verify 5 personal/50 community cares,
account change to a failed read (no old earned badge/adoption), explicit
progression retry to 20 cares, disconnect hiding, and no signing/write calls.
Existing tests preserve A-B-A stale-result, read failure, correct-provider and
retry-focus coverage. Three fictional B1 cases check keyboard wallet choice,
connection disabled before selection, callback counts, local ISO formatting,
all milestones then unknown states, no overflow and no unexpected requests.

The first browser run accidentally used the machine's Anvil build settings;
the network guard blocked localhost RPC and the run was stopped. The production
build was repeated with explicit public testnet overrides, without reading or
editing private environment files, and all 21 cases passed. A former preview
assertion assumed no links anywhere; it now distinguishes official onboarding
guidance from a fictional transaction explorer link. Removed picker regression
cases were migrated to WalletChooser, not discarded.

## Screenshots and limits

These are **SIMULATED / FICTIONAL**, not proof of real wallet milestones:
[320px milestones](screenshots/b1-2026-10-02/beta-live-320.png),
[1440px milestones](screenshots/b1-2026-10-02/beta-live-1440.png),
[390px chooser](screenshots/b1-2026-10-02/wallet-choice-390.png),
[320px local reset](screenshots/b1-2026-10-02/b1-local-reset-320.png).
The lead inspected milestone/chooser images for wrapping and spacing; browser
assertions check local reset text against the browser's Intl timezone.

Genuine wallet acceptance, real mobile wallet browsers, screen readers and a
new transaction were NOT RUN. B5 persistence/recovery remains disabled. This
integration does not erase earlier receipt/read-back failures or QA limits.
