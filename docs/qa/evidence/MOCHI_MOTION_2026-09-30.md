# Mochi motion control — 30 September 2026

## Approved behavior

Deston explicitly requested animation on by default for everyone, including
visitors with reduced motion enabled. The narrow exception applies to Mochi
artwork on the overview and pet scene. It does not change Windows settings or
disable the rest of the application's reduced-motion handling.

- **Animate Mochi** is an accessible on/off switch with a browser-wide saved
  preference. Storage denial still permits an in-page choice.
- Server markup stays still until the browser preference is read, so a saved
  off choice does not briefly animate before hydration.
- Enabled artwork has a finite entrance, gentle hover/keyboard-focus lift and
  a short greeting when activated. There is no continuous bobbing.
- Off stops artwork transforms/animations and disables greeting activation.
  Missing artwork remains a static placeholder.
- Greeting does not change care, stage, points, cooldown or personality.

## Verification

- `npm test`: **331 tests / 35 files PASS**.
- Shared preference tests cover multiple mounted scenes, saved off/remount,
  cross-tab changes, server rendering and denied storage.
- Component tests cover greeting cancellation, unchanged growth/callbacks,
  default-on behavior and missing artwork.
- Independent diff review found no blockers. The review's storage-event
  hardening was applied so sessionStorage events cannot clear an in-memory choice.
- `npm run typecheck`, `npm run lint`, `npm run build`: PASS. Lint retains the
  existing ShareImage image-element warning, with no errors.
- Local production: `/` and `/pet` 200, all five development previews 404.

## Actual browser checks

Chrome, local development `127.0.0.1:3451`, effective reduced motion **true**.
Public testnet configuration was supplied explicitly; no private environment
file was read or edited. Pet-preview inputs below are labelled fictional data.

- Overview: after hydration the switch is On despite reduced motion. Artwork
  transition computes to **320ms**. Clicking/hovering the greeting produced a
  non-identity transform while it moved; the settled hover is a 4px lift/2-degree tilt.
- Keyboard: Space toggled motion, Tab reached the greeting, Enter activated it.
  Focus had the visible lime outline. This was browser keyboard verification,
  not a screen-reader speech test or physical touch-device test.
- Off: artwork animation, transition and transform computed as **none**;
  greeting was disabled. Reload preserved Off; switching it on worked again.
- Pet preview: Buddy's aligned artwork moves without changing its **20 fixture
  points** or any onCare/onConnect/onSwitchNetwork counter (all stayed zero).
- The fixture celebration announcement remained visible with animation **none**
  under reduced motion; only artwork receives the explicit motion exception.
- Missing-art fixture has no greeting button and no entrance animation.
- At a 320px viewport override, overview and pet preview each measured
  **305px client width / 305px scroll width**, with the switch still available.
  Mobile screenshot capture timed out; full mobile visual inspection is not
  claimed. Desktop layout was visually inspected; the viewport was reset.

The local garden also showed an unavailable RPC read during these motion checks.
This is retained as a read failure, not relabelled a pass. The initial-read
repair bounds transient retries; it does not guarantee availability of the
public RPC. No wallet interaction was needed for the motion work.

## Release and remaining work

Hosted verification pending. Automatic community/recap read-back after genuine
care still requires the final wallet acceptance run. Kym's personality panel
and the optional OKX.AI service remain separate work.
