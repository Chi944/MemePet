# Companion UI — viewing steps and QA notes

> **F6 (1 October 2026):** the ready view now leads with a concise recap and a
> "View verified evidence" disclosure. Current F6 checks, screenshots and NOT RUN
> items are in [F6_EVIDENCE_LAYOUT.md](F6_EVIDENCE_LAYOUT.md). The F3 records below
> are historical and unchanged.

**Task F3 UI · branch `feat/finale-companion-ui`**
**Base SHA:** `8a811516333a99cd7175e4c5d4b3de6e07639454`

## Automated checks (run before viewing)

```bash
npm run typecheck   # must pass with zero errors
npm run lint        # zero errors (pre-existing img warning in ShareImage.tsx is unrelated)
npm test            # all tests pass
```

These have been run and passed. Results are in the PR description.

### Codex review follow-up — 30 September 2026

- Kept an empty polite response region mounted before replies arrive, with stale
  replies removed from that same region when the snapshot changes.
- Used the shared high-contrast error token and allowed unbroken reply/error
  strings to wrap inside the panel.
- Targeted component tests: **14 passed**, including immediate-answer,
  loading-to-answer and stale-context announcement-region regressions.
- Typecheck and lint passed; lint retains the existing ShareImage warning.
- These are code and automated checks. Screen-reader behavior and responsive
  rendering after these changes still require actual browser verification.

## Manual visual checks — `/dev/companion`

**Checked by:** Yee-Wei  
**Date:** 2026-09-30  
**Method:** development server (`npm run dev`), browser at `http://localhost:3000/dev/companion`

The following checks **passed**. Only these checks are recorded as confirmed; nothing beyond this list is claimed as visually verified.

| Check | Result |
|---|---|
| `ready` facts render correctly (evidence card visible with all fields) | ✓ Pass |
| Three question controls present and functional | ✓ Pass |
| `Standard explanation` label present on standard answers | ✓ Pass |
| `unavailable` reply keeps confirmed facts card visible | ✓ Pass |
| `no-pet` state renders correct message | ✓ Pass |
| `unavailable` facts state renders correctly | ✓ Pass |
| Fixture provenance badge visible | ✓ Pass |
| Page usable at 390 px mobile width | ✓ Pass |
| Desktop layout usable | ✓ Pass |

### Checks not yet run by Yee-Wei (not claimed above)

- `needsWallet`, `wrongNetwork`, `loading`, `zeroActivity`, `unknownCommunity` facts states not individually confirmed.
- `aiAnswer`, `loading` reply, `idle` reply not individually confirmed.
- Stale reply (contextKey mismatch) hide behaviour not confirmed visually.
- Personality indicator switching not confirmed.
- Callback log counter behaviour not confirmed.
- 320 px and 1440 px viewport widths not confirmed.
- Browser test with a real wallet on X Layer testnet (chain 1952) — requires integration.
- Live read via `POST /api/companion` — requires integration.
- Reduced-motion preference — not checked.
- Screen reader live region announcement — not checked.

## Viewing steps for future review

The development server must be running (`npm run dev`). This route returns 404 in production.

1. Open [http://localhost:3000/dev/companion](http://localhost:3000/dev/companion).
2. The banner reads **"UI preview — fictional data"**.
3. Facts, reply and personality radio pickers are in the top card.
4. The `CompanionPanel` renders below the picker card.

## Integration requests for Codex

1. **Route wiring:** Wire `useCompanion` (adapter in `src/hooks/useCompanion` or similar lead-owned location) into the production wallet route and spread `companion: CompanionPanelProps` into `<CompanionPanel>`. The panel accepts only the agreed props interface; no additional changes to this component are needed.
2. **Receipt links:** F0 provides no receipt links. If Codex adds a `receiptUrl` or similar field to `CompanionSnapshot`, this component can be extended to link to it. Currently none are shown, as specified.

## Checks not yet run (require Codex integration)

- Browser test with a real wallet connected on X Layer testnet (chain 1952).
- Live read with a genuine pet snapshot via `POST /api/companion`.
- Reduced-motion preference respected (no animated transitions added; verify in system settings).
- Screen reader announcement of live region when reply transitions from loading → answer.

## Known limitations

- All displayed data in the preview is fictional fixture data. The production panel requires Codex's `useCompanion` adapter wiring.
- Community total appears as 7 in the `ready` fixture. Whether this matches the live testnet total is a live-integration concern.
- No receipt links are displayed. F0 specifies this is correct; any extension requires a Codex-owned type change.
