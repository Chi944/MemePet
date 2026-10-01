# YeeWei — a recap judges can read quickly

**F6 and its release QA fix merged in #72/#75 · next branch `test/companion-combined-qa` · updated 2 October 2026.**
Your F3 and F6 implementation is complete. The lead's F6 review also corrects
already-available care wording and narrow-card date overflow. Preserve those
changes and #75's evidence-focus correction. Start any follow-up from current
reviewed `origin/main`; both the feature and previous release-QA branches are
merged. Do not reuse them or build another recap.

**Allowed:** `src/components/companion/**`, `docs/qa/finale/yeewei/**`.
No routes, hooks, shared schemas/fixtures, API/RPC, persistence, dependencies or
other owners' files. Reuse installed components and supplied callbacks.

## Next: combined QA, 3–4 October

The approved feature scope is complete. Combined candidate
`d0fc02057eb9d06350c598220a62c68960cd8ab2` contains F5 and F6; check
[status](../STATUS.md) for production verification and the exact release to test.
Final genuine wallet acceptance is **NOT RUN** and belongs to one lead session.

- Verify the released recap at narrow/desktop widths and with keyboard access.
  Record the actual release SHA and URL. Use the existing labelled workbench
  for states you cannot genuinely obtain on the wallet route.
- Confirm questions and answers remain easy to reach, evidence opens/closes,
  full addresses remain readable, and care availability is attributed to its
  recorded block. Do not infer current eligibility from browser time.
- Help Larm's combined pass with the now-merged F5 gallery. Fix only reproduced companion
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
Support backup capture on **5 October** and the timed rehearsal on **6 October**.
No additional coding is assigned to Deston; mock tests are not wallet evidence.

## Paste into YeeWei's agent

```text
Continue combined companion QA in docs/finale/YEEWEI.md. F3/F6 and PRs #72/#75 are merged; do not rebuild them or reuse the previous release-QA branch. Read AGENTS.md, scope, ownership, setup, docs/finale/INTEGRATION.md and dated evidence. Preserve local work, fetch origin and start test/companion-combined-qa from current reviewed origin/main; record its SHA. Verify recap/disclosure/answer readability, keyboard focus, source labels and unknown/stale states on the named combined release, alongside F5. Fix only reproduced companion defects in src/components/companion/**; record actual observations in docs/qa/finale/yeewei/**. Preserve care-at-read wording, date-width and #75 focus fixes. Distinguish fixture/mock evidence from real wallet checks, retain NOT RUN cases and run relevant checks. No new features, fetching/storage/models/routes/shared props/packages or wallet requests. Return a small draft PR if changes are needed. Codex reviews/merges/releases and coordinates one final wallet session. QA 3–4 October Singapore; backup 5 October, rehearsal 6 October.
```
