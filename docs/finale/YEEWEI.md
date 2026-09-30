# YeeWei — a recap judges can read quickly

**Current task F6 · branch `feat/companion-evidence-layout` · assigned 1 October 2026.**
F3/PR #61 is merged and connected to verified facts. Start a fresh branch from
current reviewed `origin/main`; preserve its fixes and stable props.

**Allowed:** `src/components/companion/**`, `docs/qa/finale/yeewei/**`.
No routes, hooks, shared schemas/fixtures, API/RPC, persistence, dependencies or
other owners' files. Reuse installed components and supplied callbacks.

## Build

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

Target PR by **2 October, Singapore**. Open a draft early. Return base/head SHAs,
screenshots, actual checks, limitations and precise shared integration requests.
Codex handles review, conflicts, merge and release.

## Paste into YeeWei's agent

```text
Continue MemePet with task F6 in docs/finale/YEEWEI.md. F3/PR #61 is already integrated. Read AGENTS.md, scope, ownership, setup and docs/finale/INTEGRATION.md. Preserve local work, fetch origin and start feat/companion-evidence-layout from current reviewed origin/main; record its SHA. Build a concise ready recap with accessible verified-evidence disclosure, question controls and clear answer provenance only in src/components/companion/** and docs/qa/finale/yeewei/**. Preserve all supplied facts/states, source labels, safe rendering and stale-context protection. Do not add fetching, storage, models, routes, shared props or packages. Run meaningful tests/typecheck/lint and real responsive/keyboard observations. Commit/push, open a draft PR early and return its URL with actual results. Codex reviews/merges/releases. Target 2 October Singapore.
```
