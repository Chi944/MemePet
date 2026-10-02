# Beta acceptance index — 2 October 2026

One row per beta checkpoint. Evidence belongs to the named owner and is
**cited, not rerun**, unless the row says Larm ran it. PASS covers only what
the evidence column states. SIMULATED rows use fictional providers and RPC
answers, and none of them stands in for genuine wallet acceptance.

Compiled from `main` at `ce77d1a` (#86 on top of `b4e9b85`; docs only) and the
PR list as read on 2 October 2026.
Update a row only with new evidence; keep FAIL / NOT RUN rows.

| # | Checkpoint | Owner | Release / PR | Evidence (attributed) | Status |
|---|---|---|---|---|---|
| 1 | B0 foundation: shared types, read budgets, pinned tools, harness | Codex (lead) | [#80](https://github.com/Chi944/memepet/pull/80), merged `99086a3` | Lead: CI run 36972049272 at head `17c357c` (413 app tests, 15 contract tests, 22 helper checks, 1 simulated smoke). [BETA_FOUNDATION](../../evidence/BETA_FOUNDATION_2026-10-02.md) | PASS (automated + SIMULATED) |
| 2 | B4 explicit wallet selection | Codex (lead) | [#81](https://github.com/Chi944/memepet/pull/81), merged `6f6a6c4` | Lead: PR CI 36974992013 and main CI 36975242405; 453 app tests; 3 SIMULATED Chromium cases. [WALLET_SELECTION](../../evidence/WALLET_SELECTION_2026-10-02.md) | PASS (SIMULATED) |
| 3 | Genuine MetaMask / OKX selection on a release | Codex prepares, Deston approves | none yet | None | NOT RUN |
| 4 | Panel adapters and transaction identity helpers | Codex (lead) | [#82](https://github.com/Chi944/memepet/pull/82), merged `16da0ba` | Lead: main CI 36978050643; 594 app tests. Helpers have no live importer | PASS (helpers only) |
| 5 | B2 Recovery and Help panels, simulated regressions | YeeWei | [#83](https://github.com/Chi944/memepet/pull/83), merged `5a84e23` | YeeWei, with lead verification: 623 tests, typecheck, lint, build; 15 SIMULATED browser cases passed, 8 skipped. [B2_REGRESSION](../yeewei/B2_REGRESSION_2026-10-02.md) | PASS (components + SIMULATED) |
| 6 | Read-only pet retry and `/dev/beta` previews | Codex (lead) | [#85](https://github.com/Chi944/memepet/pull/85), merged `b4e9b85` | Lead: main CI 36984936127; 639 app tests; 15 SIMULATED + 3 fictional preview cases; production `/`, `/pet` 200 and `/dev/*` 404. [BETA_PREVIEW_RETRY](../../evidence/BETA_PREVIEW_RETRY_2026-10-02.md) | PASS (automated + SIMULATED) |
| 7 | B1 wallet chooser, onboarding, milestones, garden chapters | Kym | No PR found on 2 October | None. `src/lib/beta-progress.ts` (B0) exists but has no live importer | NOT RUN |
| 8 | B3 FAQ content (`HELP_ENTRIES`, `SUPPORT_URL = null`) | Larm | This PR | Larm: typecheck, lint, 639 tests and a local render check, listed below. [Sources](HELP_SOURCES.md) | PASS (content + automated) |
| 9 | Official guidance links in the FAQ | Larm | This PR | Larm: 6 links opened and read on 2 October. [Link checks](HELP_SOURCES.md#link-checks-2-october-2026) | PASS (on 2 October) |
| 10 | Live `/help` route and navigation with B3 content | Codex (lead) | not on main | None | NOT RUN |
| 11 | FAQ links and wording rechecked on the combined release | Larm | combined release not available | None | NOT RUN |
| 12 | Final genuine wallet acceptance | Deston (private approval), Codex | [FINAL_WALLET_SESSION](../../FINAL_WALLET_SESSION.md) | None | NOT RUN |
| 13 | B5 transaction recovery runtime (8 recovery cases) | Codex, **after row 12** | gated | 8 cases skipped as `fixme` in #83 / #85 | NOT RUN |
| 14 | Finale combined QA (separate from beta) | Larm | [#86](https://github.com/Chi944/memepet/pull/86), merged `ce77d1a` | Larm: hosted G/O/E and fixture rows PASS; read recovery executed; W1–W6 and E12 NOT RUN. [COMBINED_QA](../../finale/larm/COMBINED_QA_2026-10-02.md) | PARTIAL |

## Larm's checks for this PR (actual)

Windows, dependencies from the committed lockfile, run on `b4e9b85` plus this change.
`ce77d1a` differs from it only under `docs/qa/finale/larm/`.

| Command | Result |
|---|---|
| `npx tsc --noEmit` | Pass (exit 0) |
| `npm run lint` | Pass: 0 errors, 1 existing warning (`ShareImage.tsx` `<img>`) |
| `npm test` | Pass: 639 / 639 |
| Local render check (not committed; tests may not live in B3's paths): `HELP_ENTRIES` through `HelpPanel` in jsdom | Pass, 2 / 2: unique ids, https links only, no markup characters, all 10 questions and 9 links render, "Support contact unavailable" shown |
| Browser view of the real content | NOT RUN: `/help` is not wired and `/dev/beta` shows fictional samples only |

## Open questions for the lead

1. **Support contact.** Is there a monitored contact? The public repository has
   GitHub Issues enabled, but nobody has confirmed it is watched. `SUPPORT_URL`
   stays `null` until someone does.
2. **Reset-time wording.** The FAQ gives 00:00 UTC (08:00 UTC+8). Should it move
   to local time once Kym's reset-time explanation lands?
3. **Planned wording.** Remove the "Planned" paragraphs (Check status, milestones)
   when B5 and B1 ship, or hide those entries until then?
