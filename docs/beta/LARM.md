# Larm — B3 support copy and focused verification

This is deliberately smaller than Kym's and YeeWei's feature lanes. Preserve
and finish any existing finale combined-QA/runbook work; cite prior evidence
instead of rerunning every teammate's suite.

**New branch:** `docs/beta-help-and-acceptance`, from reviewed current main
after B0 merges. **Editable:** `src/content/help.ts`, `docs/qa/beta/larm/**`.
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
Codex reviews/integrates, Deston merges. No money or messages to outside parties.

## Paste this into Larm's agent

```text
Implement MemePet B3 from docs/beta/LARM.md. Read AGENTS.md, scope, ownership, setup and beta START_HERE/INTEGRATION. Preserve any unfinished finale QA on its own branch. Once B0 is merged, start docs/beta-help-and-acceptance from reviewed main. Own only src/content/help.ts and docs/qa/beta/larm. Supply factual typed FAQ entries and a null support URL until a monitored channel is verified, then a concise evidence index. Research official links, distinguish on-chain/local/cosmetic/planned behavior, and cite other people's tests rather than claiming you ran them. No feature UI, hooks, routes, packages, wallet actions or paid services. Open a small draft PR, finish actual checks, and return it for Codex review and Deston's merge.
```
