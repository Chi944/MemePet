# Larm — B3 support copy and focused verification

## Current handoff after B1 integration

B1/#90 is merged; the lead integration updates Help from planned milestones
to actual cosmetic milestones and explains the local reset label. After that
release merges, continue `docs/beta-help-release-check` and verify these exact
rendered claims, official links and the acceptance index. Recovery still says
planned; support stays unavailable. Preserve all genuine-wallet NOT RUN rows.

## Earlier requirements and handoffs

**Current handoff — 2 October:** finale QA/demo-doc PR #86 and B3 content PR
#87 are merged. Do not recreate their merged branches or rebuild the FAQ.
The lead preserved the #86 runtime-version discrepancy and the two screenshot
limitations; those historical observations must not become new verified passes.
See [progress](../STATUS.md#progress-measurement).

**Next deliverable:** after the lead Help integration merges, inspect `/help`
on the named release and update only your acceptance index with actual wording
and link observations. Keep `SUPPORT_URL = null` until a monitored contact is
explicitly confirmed. Keep UTC as the care rule; describe Kym's local-time label
only after it ships. Keep planned recovery/milestone paragraphs until the
corresponding runtime is released, then update them against real behavior.
Use a fresh `docs/beta-help-release-check` branch after preserving local work.

**Original delivered branch:** `docs/beta-help-and-acceptance` (#87). Do not reuse it.
Preserve unpublished work before starting the follow-up branch. **Editable:** `src/content/help.ts`, `docs/qa/beta/larm/**`.
No landing redesign, new feature panel, browser harness or shared hook changes.

## Original deliverables (completed in #87)

1. Export typed `HELP_ENTRIES` and `SUPPORT_URL` for YeeWei's generic HelpPanel.
   Cover: testnet wallet/gas; one care per UTC day; no missed-day penalty;
   confirmed progress versus local personality; read failures/Retry;
   pending hashes (status checking never resubmits); disconnect versus token
   approvals; public pet visibility; cosmetic milestones versus money.
   Cross-check actual implementation before calling a feature available. Phrase
   unintegrated recovery as planned until the lead enables it.
2. Verify any official wallet/faucet/source links. Do not invent a support
   email, privacy certification, response-time promise or partnership. Start
   `SUPPORT_URL` as null unless an existing monitored contact is confirmed.
   A bug-report checklist asks for URL, browser, network, steps and optional
   public transaction hash; explicitly excludes secrets and account passwords.
3. A short beta acceptance index with owner, release/PR, actual evidence and
   PASS/FAIL/NOT RUN. Cite Kym/YeeWei/lead evidence with attribution; do not copy
   their reports into your own as personally executed tests. Check your FAQ
   links and wording on the combined release when it becomes available.

Return a small PR with verified content sources, actual checks and open contact
questions. Do not take on another person's component or genuine wallet test.
Codex reviews, integrates and merges passing work. Deston handles final product
checks and private wallet approvals. No money or messages to outside parties.

## Paste this into Larm's agent

```text
Continue MemePet B3 from docs/beta/LARM.md. #86 and #87 are merged; do not repeat them or reuse those branches. Preserve local work, fetch reviewed main after the lead Help integration merges, and start docs/beta-help-release-check. Inspect /help on its named release; verify rendered wording/official links and update docs/qa/beta/larm/ACCEPTANCE_INDEX.md with actual evidence. Keep SUPPORT_URL null until a monitored contact is confirmed. UTC remains the care rule; local-time labels and planned milestone/recovery copy change only when those features ship. Preserve #86 local-runtime/screenshot limitations and all NOT RUN wallet rows. Edit only src/content/help.ts and docs/qa/beta/larm/**; no UI/hooks/routes/config, wallet actions, paid calls, outside messages, force-pushes or merges. Return a small PR with checked SHA, viewing evidence and remaining gaps.
```
