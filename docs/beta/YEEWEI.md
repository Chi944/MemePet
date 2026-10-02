# YeeWei — B2 recovery, help and browser regression

Your larger beta lane combines visible support/recovery work with repeatable
browser coverage. B0 is merged in #80 (`99086a3`); start now from current
reviewed `origin/main`. Preserve your prior combined recap QA; do not restart
completed F6 work. If the B2 branch already has unpublished work, continue it
and safely reconcile main instead of resetting or recreating it.

**Branch:** `feat/beta-recovery-help-regression`.
**Editable:** `src/components/recovery/**`, `src/components/help/**`,
`e2e/**`, `docs/qa/beta/yeewei/**`. Codex owns package/config/CI changes and live
adapters. Larm owns `src/content/help.ts`; do not edit his content file.
The active B4 `e2e/simulated-wallet/provider-selection.spec.ts` is temporarily
lead-owned. Cite its results when available and put your broader scenarios in
separate specs; coordinate before modifying that file.

## Deliver

1. `TransactionRecoveryPanel` using [the exact props](INTEGRATION.md), with idle,
   checking, pending, confirmation unknown, confirmed but awaiting facts,
   confirmed, reverted, cancelled and replaced cases. A replacement hash is not
   confirmation; render the validated replacement separately. Its only operation is **Check status**, which
   reads the existing hash. No “send again,” automatic signing, dismissal that
   implies failure, storage or invented receipt. Distinguish a successful chain
   receipt from temporarily unavailable pet/community facts.
2. `HelpPanel`: accessible FAQ sections with plain text, links and a clear
   support-unavailable state when no contact is verified. Test with local
   sample entries while Larm writes the shared copy; import his reviewed
   entries only through the lead route. Codex adds `/help` and navigation.
3. Extend the B0 Playwright harness under `e2e/simulated-wallet/` to cover account
   A→B and A→B→A changes, delayed old answers after a context switch, failed
   pet/community reads (unknown != zero/no pet), and combined pet/recap/garden
   agreement. Use real Chromium with fake provider/RPC/API inputs. Verify
   visible states. Block unexpected network traffic, not just writes. Add
   wallet-choice and recovery-refresh cases once their adapters are supplied;
   mark these dependent cases NOT RUN/TODO until then, not passing placeholders.
   B4 supplies explicit provider selection independently of your panel work.
   Check its reviewed API in [Integration](INTEGRATION.md) and add selection,
   same-account provider-swap follow-ups once it lands. Cite the lead's focused
   provider-selection spec instead of duplicating its coverage. Do not modify
   the lead's hook to make a simulated scenario pass.
4. Co-located panel tests and narrow-screen/keyboard/focus evidence. Keep the
   existing recap evidence-focus behavior intact. Clearly label every mocked
   test/report **SIMULATED WALLET BROWSER REGRESSION**. No actual wallet prompts.

Prepare the recovery presentation now; its **live persistence integration
waits for final genuine wallet acceptance**. This does not block Help or the
account/failure/combined tests. Request exact missing adapter interfaces from
Codex rather than editing his hook. Keep UI/scenario commits separate for review.

Return PR URL, actual test commands/results, base/head, screenshots or report
paths, NOT RUN cases and integration needs. Codex reviews, integrates and merges
passing work; Deston handles final product checks and private wallet approvals.

## Paste this into YeeWei's agent

```text
Continue MemePet B2 using docs/beta/YEEWEI.md. Read AGENTS.md, PROJECT_BRIEF, OWNERSHIP, DEV_SETUP and beta START_HERE/INTEGRATION. B0 is merged in #80 (99086a3); begin now. Preserve local work, fetch origin and continue an active B2 branch; otherwise create feat/beta-recovery-help-regression from reviewed origin/main. Edit only src/components/recovery/**, src/components/help/**, e2e/** and docs/qa/beta/yeewei/**. Build TransactionRecoveryPanel and HelpPanel against shared props/fixtures; Larm owns FAQ content. Extend Playwright for account races, stale answers, failed reads and combined-panel consistency. Add provider selection/same-account provider switching after reviewed B4 lands. Label mocks SIMULATED WALLET BROWSER REGRESSION and block unexpected network traffic. Runtime transaction recovery remains gated on genuine final acceptance. No actual wallet actions, live RPC dependencies, storage, hooks/routes/shared types/packages/config changes. Open a draft PR early; return actual checks, base/head, evidence, NOT RUN cases and integration needs. Codex reviews/integrates/merges; do not merge, reset others' work or spend money.
```
