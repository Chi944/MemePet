# Companion UI — viewing steps and QA notes

**Task F3 UI · branch `feat/finale-companion-ui`**
**Base SHA:** `8a811516333a99cd7175e4c5d4b3de6e07639454`

## Automated checks (run before viewing)

```bash
npm run typecheck   # must pass with zero errors
npm run lint        # zero errors (pre-existing img warning in ShareImage.tsx is unrelated)
npm test            # all tests pass
```

These have been run and passed. Results are in the PR description.

## Visual inspection — `/dev/companion`

The development server must be running (`npm run dev`) and the app must be in development mode. This route returns 404 in production.

1. Open [http://localhost:3000/dev/companion](http://localhost:3000/dev/companion).
2. Confirm the banner reads **"UI preview — fictional data"** in amber.
3. Confirm the heading reads **"Companion UI workbench"**.
4. Confirm the disclaimer: "No wallet, RPC or model calls."

### State inspector: facts states

Work through each radio in the **Facts state** fieldset and confirm:

| Selection | Expected |
|---|---|
| `needsWallet` | "Connect a wallet to read MemePet activity." No ask buttons. |
| `wrongNetwork` | "Switch to chain 1952 to read MemePet activity." No ask buttons. |
| `loading` | "Loading MemePet activity…" No ask buttons. |
| `noPet` | "No pet found in this wallet at the checked registry." No ask buttons. |
| `unavailable` | Error message. **Retry read** button visible. No ask controls. |
| `ready` | Full facts card with 12 rows (Network … Community total). Three ask buttons visible. |
| `zeroActivity` | Ready card with care count 0, growth points 0, community total 0 (not "Unknown"). |
| `unknownCommunity` | Ready card with Community total: **Unknown (not zero)**. |

### State inspector: reply states (set facts to `ready` first)

| Selection | Expected |
|---|---|
| `idle` | No reply area rendered. |
| `loading` | "Mochi is thinking…" shown. Ask buttons are **disabled**. |
| `standardAnswer` | **Standard explanation** badge (green). Answer text visible. |
| `aiAnswer` | **AI response** badge (blue). Answer text visible. No "Standard explanation" label. |
| `unavailable` | Reply error message visible. Facts card still shows confirmed data. **Retry** button in reply area. |

### Stale reply check

1. Set facts to `ready`, reply to `standardAnswer`.
2. The standard answer appears with "Standard explanation" label.
3. Set facts to `noPet` (which has no contextKey). The answer disappears — it was from a different context.

### Provenance check

- With `standardAnswer`: the label reads exactly **"Standard explanation"** (green badge). No "AI response" label.
- With `aiAnswer`: the label reads exactly **"AI response"** (blue badge). No "Standard explanation" label.
- Fixture badge (**Fixture**, amber) appears in both states.

### Personality indicator

With facts set to `ready`:
- Personality `playful` → shows "Mochi's style: Playful"
- Personality `curious` → shows "Mochi's style: Curious"
- Personality `focused` → shows "Mochi's style: Focused"

### Callback log

1. With facts `ready`, click **Explain progress** → `onAsk calls: progress`.
2. Click **Next care time** → `onAsk calls: progress, next-care`.
3. Click **Contribution** → `onAsk calls: progress, next-care, contribution`.
4. Click **Clear log** → log resets.
5. Set reply to `loading` → three ask buttons disabled. Click does not append to log.
6. Set facts to `unavailable`, click **Retry read** → `onRetry: 1 time`.

### Responsive layout

Check at three viewport widths. The browser DevTools device toolbar works:

| Width | Check |
|---|---|
| 320 px | Facts list is readable; no horizontal overflow; addresses wrap cleanly. |
| 390 px | Controls wrap to two rows if needed; all text is readable. |
| 1440 px | Panel has reasonable max-width; no stretched layout. |

Long fictional addresses in fixture data are truncated (`0x…` format) with the full value in the `title` attribute.

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
