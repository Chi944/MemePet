# F6 — concise recap with verified-evidence disclosure

**Task F6 · branch `feat/companion-evidence-layout` · owner YeeWei · PR #72 (draft)**
**Base SHA:** `d279344200cf9320db55cf5edbccafdef1f1059a` (reviewed `origin/main`, fetched 1 October 2026)

## Scope

Presentation-only rework of `CompanionPanel`'s ready view. Changed paths are
limited to `src/components/companion/**` and this folder.

Unchanged: `CompanionPanelProps`, the question IDs `progress | next-care |
contribution` and their button labels, the reply `contextKey` rule, every
facts/reply state message, Retry callbacks, the single persistent polite
response region, and plain-text rendering (no HTML injection). The panel adds no
fetching, storage, model calls, routes, shared types/fixtures or packages.

## What changed

Ready view order: **recap → questions → answer → evidence.**

1. **"Where is my pet now?" recap card (always visible)**
   - Context line: `Fixture` badge or `Live read` label from the supplied
     `dataMode`; shortened wallet (full value in `title` and in the evidence);
     `Chain 1952`; `MemePet activity only`; `Confirmed at block N`.
   - Four facts: **Stage**, **Growth** (points plus "Next stage at N points" or
     "Final stage reached"), **Your confirmed cares** and **Next eligible care**.
   - Next eligible care is the supplied `nextCareAtIso`, reformatted as
     `YYYY-MM-DD HH:MM UTC` by string matching only. It is never compared with the
     browser clock. A non-UTC string is shown exactly as supplied.
   - Community total is **not** in the recap.
2. **Question controls** — the same three buttons and style note, directly
   below the recap.
3. **Answer** — the same live region, with the "Standard explanation" or "AI
   response" label, directly below the controls.
4. **Native `<details>` "View verified evidence"** (closed by default) — all
   12 snapshot fields, unchanged: Network, full Wallet, full Registry, Read
   block, Block time, Observed at, Your care actions, Growth points, Stage, Next
   stage at, Next care time, and, under a separate "Shared community" heading,
   Community total (all pets). A null total shows `Unknown`; a supplied 0 shows `0`.

Phones (≤ 30rem): the recap uses a 2×2 grid and evidence labels stack above
their values, so long addresses wrap inside the card.

## Automated checks — run 1 October 2026 on this branch

| Command | Result |
|---|---|
| `npx vitest run src/components/companion` | **25 passed** (14 existing + 11 new) |
| `npm test` | **37 files, 358 tests passed** |
| `npm run typecheck` | **Passed** (exit 0) |
| `npm run lint` | **0 errors**, 1 existing warning in `src/components/share/ShareImage.tsx` (unrelated) |
| `npm run build` | **NOT RUN locally** — an existing `next dev` server was using this checkout's `.next`. Left to PR CI. |
| `node --test docs/qa/*.regression.mjs` | **NOT RUN** — this change does not touch those helpers. |

New component tests cover: recap facts outside the disclosure and community
total absent from the recap; long-address shortening with full values in the
evidence; all 12 evidence values exactly; a native `summary` that stays focusable,
follows the question buttons and toggles; the answer and its provenance placed
before a closed disclosure; final stage; a non-UTC next-care value shown verbatim;
unknown vs zero community total, separate from personal cares; each non-ready
state without recap/evidence/questions/answer; and an obsolete answer dropped
after a context change.

## Browser observations — 1 October 2026

**Method:** headless Google Chrome (installed app) driven via the DevTools
protocol from a scratch script (not committed, no packages added), against
`next dev` at `http://localhost:3000/dev/companion`. Viewports were 320×700 and
390×844 (mobile emulation) and 1440×900. "Long fictional hex addresses" was
on, with the reply set to `standardAnswer` unless noted. Keys were real
`Input.dispatchKeyEvent` Tab/Enter/Space events; the pickers were set by click.
**All data is fictional fixture data.**

| Check | 320 | 390 | 1440 |
|---|---|---|---|
| No horizontal page overflow (evidence closed / open) | ✓ 320/320 | ✓ 390/390 | ✓ 1425/1425 |
| No recap or evidence cell overflows its box (evidence open) | ✓ | ✓ | ✓ |
| Disclosure closed on load | ✓ | ✓ | ✓ |
| Tab order: Explain progress → Next care time → Contribution → **View verified evidence** | ✓ | ✓ | ✓ |
| Summary shows `:focus-visible` outline (solid `rgb(198,255,0)`) | ✓ | ✓ | ✓ |
| Enter on summary opens; Space closes; Space reopens | ✓ | ✓ | ✓ |
| All 12 evidence values present and full addresses complete | ✓ | ✓ | ✓ |
| Enter on "Explain progress" logs `onAsk: progress` once | ✓ | ✓ | ✓ |
| "Standard explanation" label and answer visible above the closed disclosure | ✓ | ✓ | ✓ |
| `aiAnswer`: "AI response" only | — | ✓ | — |
| Obsolete-context answer: no text, no provenance label, buttons enabled | — | ✓ | — |
| Loading reply: "Mochi is thinking…", buttons disabled | — | ✓ | — |
| Reply failure keeps the recap and evidence | — | ✓ | — |
| `unknownCommunity`: evidence `Unknown`, personal cares `1`, recap has no community text | — | ✓ | — |
| `zeroActivity`: community total `0` | — | ✓ | — |
| needs-wallet / wrong-network / loading / no-pet / unavailable each show their own message, with no recap, evidence, questions or old answer | — | ✓ | — |
| Enter on "Retry read" logs `onRetry: 1 time` | — | ✓ | — |

The heading-to-first-question distance was 450 px at 320, 376 px at 390 and
231 px at 1440. Questions → answer was 47–99 px.

Screenshots: [`f6-screenshots/`](f6-screenshots/). They include the
workbench picker, so the selected state is visible. The red "Developer preview"
bar part-way down is the preview route's fixed banner captured during full-page
capture; the "N" circle is the Next.js dev indicator. Neither belongs to the panel.

### NOT RUN — needs a human or Codex

- **Screen reader** (VoiceOver/NVDA): announcement of the summary's
  expanded/collapsed state and of the answer live region.
- **Real Safari/Firefox** keyboard toggling. Only headless Chrome was driven.
- **Live wallet route** (`/pet` with a real wallet on X Layer testnet, chain
  1952): real addresses, a `Live read` label and a real recap. Codex owns route
  wiring; no change to it is needed.
- **Reduced motion / zoom 200%** — not checked. The panel adds no animation.
- **`npm run build`** and the production 404 gate for `/dev/companion` — CI.

## Integration requests

None. F6 needs no shared type, fixture, hook, route or API change. The existing
`useCompanion` → `<CompanionPanel {...companion} />` wiring in
`src/app/pet/pet-live-client.tsx` continues to work unchanged.

## Viewing steps

1. `npm run dev`, then open `http://localhost:3000/dev/companion`.
2. Facts `ready`, reply `standardAnswer`: the recap, three questions, labelled
   answer and a closed "View verified evidence" disclosure.
3. Tick **Long fictional hex addresses**; narrow the window to 320 px.
4. Tab from "Explain progress" to the summary; press Enter/Space to toggle.
5. Tick **Obsolete-context answer**: the answer and its label disappear.
6. Try `unknownCommunity`, `zeroActivity` and every non-ready facts state.
