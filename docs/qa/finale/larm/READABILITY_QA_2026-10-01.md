# F7 — stage readability check (Larm)

Can the demo be read from the back of a room? This check covers:

- contrast on `/`, `/pet` and the public pet page;
- the smallest text and the key numbers;
- layout at projector zoom levels.

Every row is **PASS / FAIL / NOT RUN**. No wallet was connected.

## Run context

| Field | Value |
|---|---|
| Release | hosted `7d4144b` (Vercel production `6767674346`) |
| Run (UTC) | 2026-10-01, 02:36 → 02:40 |
| Method | In-page script: every visible text element's colour, blended with opacity and the backgrounds behind it, against WCAG 2.2 (4.5:1 normal text, 3:1 large text and UI component boundaries) |
| Browser | Chromium 152 embedded in the Claude desktop app; viewport emulation |

**Measurement caveat.** The embedded pane was hidden, so the entry animations
were frozen at their first frame (opacity 0). The first pass therefore reported
the hero at 1:1. That was confirmed as the frozen-animation artifact: the
animations were `running` at `currentTime 0` with `visibilityState hidden`.
They were jumped to their end state with `finish()` **for measurement only**,
and every number below is after that.

This is an automated check, not a projector test. It cannot judge glare, venue
lighting or a particular projector's contrast.

## Text contrast

| Page | Text elements | Result | Lowest |
|---|---|---|---|
| `/` | 77 | **PASS** | 6.09:1 (11 px "Stage artwork"). Only failures: the two decorative "+" marks at 3.58:1, which are `aria-hidden` decoration and exempt |
| `/pet` (no wallet) | 63 | **PASS** | 5.71:1 (13 px wallet-setup hint) |
| Public pet page | 31 | **PASS** | 5.71:1 (10.4 px locked "Guardian") |

## Non-text contrast (UI boundaries and graphics)

| Element | Result | Observed |
|---|---|---|
| "Animate Mochi" switch outline | **PASS** | 6.09:1 |
| Stage buttons (Hatchling / Buddy / Guardian) | **PASS** | Pressed state is a lime fill at 16.8:1. Unpressed buttons have no visible boundary, but the text alone identifies the control, which WCAG allows |
| Badges ("Live", "X Layer testnet") | **PASS** | Text 12.8:1. The badge outline is weak (1.7–1.9:1), but a badge is a label, not a control |
| **Garden progress bar — track** | **FAIL → fixed** | The track outline `--line` (#292929) on the card (#111) was **1.3:1** (needs 3:1). The empty part of the bar was effectively invisible, so the audience could not see how far 7 is from 20 |
| Garden progress bar — fill vs track | **PASS** | Lime on #181818: 14.97:1 |
| **Pet growth bar (PetScene)** | **FAIL — reported, not changed** | Track #181818 on the dark card, no outline, about 5.6 px tall: the same invisible-track problem. `src/components/pet/**` is Kym's (F5 is in progress there) |

### Fix — `src/components/community/finale-community.module.css`

`.progressTrack` outline changed from `var(--line)` to the existing token
`var(--ink-faint)` (#929292): **6.07:1** against the card. The lime fill is
unchanged and still 14.97:1 against the track interior.

Checked on a local build of `7d4144b` plus the fix, at 1280×720: the computed
`box-shadow` is `rgb(146, 146, 146) 0 0 0 1px inset`. The bar shows its full
length with the fill at 386 of 1 103 px for 7 of 20. Community and landing
tests: 28 passed (4 files); eslint clean. Not yet observed on the hosted site;
it ships when Deston merges.

**For Kym (F5) / Codex:** the same one-line approach fixes the pet growth bar:
give its track a 1 px inset `var(--ink-faint)` outline.

## Text size and key numbers

| Item | Size at 100% | At 125% | At 150% |
|---|---|---|---|
| Garden total "7" | 40 px bold | 50 px | 60 px |
| Garden status "13 more confirmed care actions…" | 16 px | 20 px | 24 px |
| Pet growth "20" (public page) | 26.4 px | 33 px | 39.6 px |
| Smallest text: stage-trail labels and points | 10.4 px | 13 px | 15.6 px |
| "Stage artwork", "Explore the stages…" (landing) | 11 px | 13.75 px | 16.5 px |
| Badges and eyebrows ("Live", "Shared mission") | 11.2 px | 14 px | 16.8 px |

The numbers the audience needs are large. The small text is secondary labels.
Browser zoom brings them to a readable size without any code change.

## Projector zoom: layout

Browser zoom shrinks the layout width (CSS width = screen width ÷ zoom). Each
width was checked for horizontal overflow and for clipped text (screen-reader
only text excluded).

| Screen and zoom | CSS width | `/` | `/pet` | Public page |
|---|---|---|---|---|
| 1920 × 1080 at 125% | 1536 × 864 | **PASS** | **PASS** | **PASS** |
| 1920 × 1080 at 150% | 1280 × 720 | **PASS** | **PASS** | **PASS** |
| 1440 × 900 at 125% | 1152 × 720 | **PASS** | **PASS** | **PASS** |
| 1440 × 900 at 150% | 960 × 600 | **PASS** | **PASS** | **PASS** |

No overflow, no clipped text, at every width on every page.

## Recommendation for the stage laptop

- **1920 × 1080 output: 150% browser zoom.** The smallest text becomes 15.6 px,
  and the garden total 60 px.
- **1440 × 900 output: 125–150%.** Both pass; pick by room size.
- Set zoom in the browser (Ctrl + / Ctrl −), not in the OS display settings,
  and do it in the rehearsal. Added to the runbook pre-flight.

## Not run

- An actual projector in a room.
- Wallet-connected states: care panel, ready recap, personality panel.
- Windows high-contrast or forced-colours mode.
