# YeeWei — a recap judges can read quickly

**F6 delivered in PR #72 · follow-up branch `test/companion-release-qa` · updated 1 October 2026.**
Your F3 and F6 implementation is complete. The lead's F6 review also corrects
already-available care wording and narrow-card date overflow. Preserve those
changes. Start any follow-up from current reviewed `origin/main`; do not reuse
the merged feature branch or build another recap.

**Allowed:** `src/components/companion/**`, `docs/qa/finale/yeewei/**`.
No routes, hooks, shared schemas/fixtures, API/RPC, persistence, dependencies or
other owners' files. Reuse installed components and supplied callbacks.

## Next: release and combined QA

- Verify the released recap at narrow/desktop widths and with keyboard access.
  Record the actual release SHA and URL. Use the existing labelled workbench
  for states you cannot genuinely obtain on the wallet route.
- Confirm questions and answers remain easy to reach, evidence opens/closes,
  full addresses remain readable, and care availability is attributed to its
  recorded block. Do not infer current eligibility from browser time.
- Help Larm's combined pass after Kym F5 merges. Fix only reproduced companion
  presentation defects within your area; request shared changes from Codex.
- No fresh feature, model integration or wallet transaction is assigned here.
  Preserve unrun screen-reader/cross-browser/zoom checks until actually executed.

## Implemented F6 scope (reference)

- Rework the ready card so its first view answers "Where is my pet now?":
  current stage, growth, personal confirmed cares and next eligible care time.
  Keep question controls and the answer easy to reach. Do not bury them below
  a twelve-row technical table.
- Put detailed registry/block/observation evidence in a keyboard-accessible
  native `details` disclosure, "View verified evidence". Retain every existing
  source field. Keep the account, network, scope (MemePet activity only), and
  standard/AI/fixture provenance understandable even when details are closed.
- Use only supplied facts; do not calculate care-ready from browser time or add
  streaks, retention, transaction hashes, holder status or full-wallet history.
  Unknown community total remains unknown, distinct from personal care count.
- Preserve all current empty/loading/wrong-network/failure states and safe text
  rendering. A failed explanation cannot erase valid facts. Obsolete-context
  replies stay hidden. Source `standard` remains "Standard explanation".
- Kym owns the separate personality controls. Consume the supplied style as
  today; do not duplicate Explore/Practise, persistence or model calls.

## Acceptance and handoff

Test disclosure keyboard access, preserved evidence, answer visibility,
unknown/no-pet/failure distinctions and obsolete reply isolation. Inspect
320/390/1440px with long addresses and actual question/answer states. Keep
callback IDs and `CompanionPanelProps` unchanged. Run component tests,
typecheck/lint and separate automated results from browser observations.

Follow-up QA target **3–4 October, Singapore**. Return base/head SHAs,
screenshots, actual checks, limitations and precise shared integration requests.
Codex handles review, conflicts, merge and release.

## Paste into YeeWei's agent

```text
Continue the F6 QA follow-up in docs/finale/YEEWEI.md. F3 and F6/PR #72 are complete; do not rebuild them. Read AGENTS.md, scope, ownership, setup, docs/finale/INTEGRATION.md and the lead's F6 evidence. Preserve local work, fetch origin and start test/companion-release-qa from current reviewed origin/main; record its SHA. Verify released recap/disclosure/answer readability, keyboard access, source labels and unknown/stale states. After Kym F5 merges, help Larm's combined presentation pass. Fix only reproduced companion defects in src/components/companion/**; record actual observations in docs/qa/finale/yeewei/**. Preserve lead care-at-read wording and date-width fixes. No new fetching/storage/models/routes/shared props/packages or wallet actions. Run relevant checks for fixes, retain NOT RUN cases, and return the PR URL if changes are needed. Codex reviews/merges/releases. Target 3–4 October Singapore.
```
