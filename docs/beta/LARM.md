# Larm — B3 support copy and focused verification

This is deliberately smaller than Kym's and YeeWei's feature lanes. Preserve
and finish any existing finale combined-QA/runbook work; cite prior evidence
instead of rerunning every teammate's suite.

**Branch:** `docs/beta-help-and-acceptance`, from reviewed current main.
B0 is merged in #80 (`99086a3`), so start now. If this branch already contains
unpublished work, preserve and continue it; fetch and inspect before reconciling
main. **Editable:** `src/content/help.ts`, `docs/qa/beta/larm/**`.
No landing redesign, new feature panel, browser harness or shared hook changes.

## Deliver

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
Continue MemePet B3 using docs/beta/LARM.md. Read AGENTS.md, PROJECT_BRIEF, OWNERSHIP, DEV_SETUP and beta START_HERE/INTEGRATION. B0 is merged in #80 (99086a3); start now. Preserve any unfinished finale QA separately. Fetch origin; continue an active B3 branch or create docs/beta-help-and-acceptance from reviewed origin/main without discarding local work. Edit only src/content/help.ts and docs/qa/beta/larm/**. Export typed HELP_ENTRIES and SUPPORT_URL, keeping the latter null until a monitored contact is confirmed. Verify official guidance links and distinguish on-chain, local, cosmetic and planned behavior; transaction recovery is still gated. Create a concise acceptance index attributing other teammates' evidence accurately and preserving FAIL/NOT RUN. This is a smaller content/verification lane: no feature UI, browser harness, hooks/routes/packages or real wallet actions. Open a small draft PR, run actual checks, and return sources, base/head, evidence and remaining questions. Codex reviews/integrates/merges; do not merge, force-push, spend money or contact outsiders.
```
