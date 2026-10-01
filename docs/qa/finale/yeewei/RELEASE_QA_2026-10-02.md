# F6 follow-up — companion release QA

**Task F6 follow-up · branch `test/companion-release-qa` · owner YeeWei**
**Base SHA:** `a608a3842305844d6da9ed2e6fd9b0a245323de7` (reviewed `origin/main`,
fetched 2 October 2026, Singapore). It contains F6 (#72, `e1f5011`) and the
lead's care-at-read wording and date-width fixes (`03ac2ea`); both are preserved.

## Scope

One reproduced presentation defect fixed in
`src/components/companion/CompanionPanel.module.css`. No change to
`CompanionPanel.tsx`, `CompanionPanelProps`, question IDs, reply-context rules,
routes, hooks, shared types/fixtures, global styles, APIs or packages.

## Defect and fix

**Reproduced:** when "View verified evidence" had keyboard focus, its focus
outline crossed the top of the first evidence line ("One confirmed registry
read…") and extended past the disclosure border. The global `:focus-visible`
style draws a 2px outline 5px outside the element, and the evidence body starts
directly below the summary with no top padding.

**Fix:** scoped to the summary only; the global focus style is unchanged.

```css
/* Inset so the global 5px offset cannot draw over the evidence text below. */
.evidenceSummary:focus-visible {
  outline-offset: -4px;
}
```

The outline remains 2px solid `rgb(198, 255, 0)` and is now drawn inside the
summary's own padding.

| Width | Before (offset 5px) | After (offset −4px) |
|---|---|---|
| 320 | Outline bottom 5px **below** first-line top; outside border — FAIL | 4px gap; inside border — PASS |
| 390 | 5px overlap; outside border — FAIL | 4px gap; inside border — PASS |
| 1440 | 5px overlap; outside border — FAIL | 4px gap; inside border — PASS |

Measured as the summary's rendered bottom plus outline offset and width,
compared with the first line box of the note text, and the outline's outer box
against the `details` element. The "before" values come from the same script
run with the CSS change temporarily stashed.

Screenshots: [before (320)](release-qa-screenshots/320-focus-outline-before.png),
[after (320)](release-qa-screenshots/320-focus-outline-after.png),
[after (1440)](release-qa-screenshots/1440-focus-outline-after.png).
The dark circle at 320 is the Next.js development indicator, not the panel.

## Automated checks — run 2 October 2026 with the fix applied

Node 24.21.0 / npm 11.19.0 (the repository pins Node 24.19.x).

| Command | Result |
|---|---|
| `npx vitest run src/components/companion` | **27 passed** (1 file) |
| `npm test` | **368 passed** (38 files), exit 0 |
| `npm run typecheck` | **Passed**, exit 0 |
| `npm run lint` | **0 errors**, 1 existing warning (`<img>` in `src/components/share/ShareImage.tsx`), exit 0 |
| `npm run build` | **NOT RUN** locally; left to PR CI |
| `node --test docs/qa/*.regression.mjs` | **NOT RUN** — this change does not touch those helpers |

The same companion/full/typecheck/lint results were also obtained before the fix.
No unit test was added: jsdom does not apply the CSS module, so outline
geometry is verified in the browser instead.

## Scripted browser checks — `/dev/companion` fixture workbench

**These are scripted agent observations against fictional fixture data, not
human QA or production evidence.** Headless Google Chrome (installed app),
driven by an uncommitted scratch script over the DevTools protocol (no packages
added), against an existing `next dev` server from this checkout at
`http://localhost:3000/dev/companion`. Viewports: 320×700 and 390×844 (mobile
emulation), 1440×900. "Long fictional hex addresses" on; reply `standardAnswer`
unless noted. Keys were real `Input.dispatchKeyEvent` Tab/Enter/Space events.

Result with the fix: **68 passed, 0 failed** (19 at 320, 30 at 390, 19 at 1440).

### Layout and readability — 320 / 390 / 1440

| Check | 320 | 390 | 1440 |
|---|---|---|---|
| No horizontal page overflow, evidence closed and open | ✓ 320/320 | ✓ 390/390 | ✓ 1440/1440 |
| No recap/evidence `dt`/`dd`/answer overflow, evidence open | ✓ | ✓ | ✓ |
| Recap shows Stage, Growth + next stage, Your confirmed cares, Next eligible care (`2030-01-02 00:00 UTC`) | ✓ | ✓ | ✓ |
| Context line: `Fixture`, `0xF1C7…F1C7`, Chain 1952, MemePet activity only, Confirmed at block 100 | ✓ | ✓ | ✓ |
| Recap contains no community total | ✓ | ✓ | ✓ |
| "Standard explanation" label and answer above the closed disclosure | ✓ | ✓ | ✓ |
| All 12 evidence values exact, full 42-character wallet/registry | ✓ | ✓ | ✓ |
| Heading → first question (px) | 404 | 359 | 231 |
| First question → bottom of answer (px) | 308 | 282 | 205 |

### Keyboard disclosure — 320 / 390 / 1440

| Check | 320 | 390 | 1440 |
|---|---|---|---|
| Disclosure closed on load | ✓ | ✓ | ✓ |
| Tab: Explain progress → Next care time → Contribution → View verified evidence | ✓ | ✓ | ✓ |
| Summary matches `:focus-visible`, outline solid 2px | ✓ | ✓ | ✓ |
| Enter opens; Space closes; Space reopens | ✓ | ✓ | ✓ |
| Focus remains on the summary after toggling | ✓ | ✓ | ✓ |
| Focus outline clear of first evidence line (4px gap) | ✓ | ✓ | ✓ |
| Focus outline inside the disclosure border | ✓ | ✓ | ✓ |
| Enter on "Explain progress" logs `onAsk: progress` once | ✓ | ✓ | ✓ |

### Unknown / stale / failure fixtures

| Check | Width | Result |
|---|---|---|
| `unknownCommunity`: evidence `Unknown`, personal cares `1`, recap has no community text, no overflow | 320 / 390 / 1440 | ✓ |
| `zeroActivity`: community total `0` (not Unknown), cares `0` | 390 | ✓ |
| `aiAnswer`: "AI response" label only | 390 | ✓ |
| Obsolete-context answer: no text, no provenance label, buttons enabled | 390 | ✓ |
| Loading reply: "Mochi is thinking…", all three questions disabled | 390 | ✓ |
| Reply failure: alert text + Retry, recap and evidence kept | 390 | ✓ |
| `needsWallet`, `wrongNetwork`, `loading`, `noPet`, `unavailable`: own message, no recap/evidence/questions/old answer | 390 | ✓ |
| Enter on "Retry read" logs `onRetry: 1 time` | 390 | ✓ |

Screenshots with the fix: [320](release-qa-screenshots/320-evidence-open-keyboard.png),
[390](release-qa-screenshots/390-evidence-open-keyboard.png),
[1440](release-qa-screenshots/1440-evidence-open-keyboard.png) (evidence opened by
keyboard, summary focused). Full-page captures include the workbench pickers; the
red "Developer preview" bar part-way down is the route's fixed banner captured
during full-page capture, not part of the panel.

**Not reachable on the workbench:** "Care at this read: Available" — no fixture
has a next-care time at or before its block time. It is covered only by the
existing companion unit tests in this run.

## Human confirmation — YeeWei

**Performed by:** YeeWei, on the `/dev/companion` fixture workbench with the fix
applied, reported 2 October 2026. Browser and viewport widths were not
specified, so none are claimed.

| Check | Result |
|---|---|
| Focus outline no longer overlaps the first evidence line | ✓ Confirmed |
| Disclosure still opens and closes correctly with the keyboard | ✓ Confirmed |

## NOT RUN

- **Live `/pet` route with a connected wallet** — no production or wallet
  observation was made in this follow-up. The released URL/SHA were not
  re-verified in a browser here.
- **VoiceOver / screen reader** — disclosure expanded/collapsed announcement and
  answer live region.
- **Safari / Firefox keyboard QA** — scripted checks used Chrome only; YeeWei's
  confirmation did not record a browser.
- **200% zoom.**
- **Any wallet transaction** — none performed or authorized for this task.
- Local `npm run build` and helper regressions (see above).
- Combined presentation pass with Kym's F5 — PR #73 was still a draft at the
  base SHA; this waits for F5 to merge and Larm's combined checklist.

## Integration requests

None. The fix needs no shared type, fixture, hook, route, global style or API
change.
