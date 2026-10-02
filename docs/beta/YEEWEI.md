# YeeWei — B2 recovery, help and browser regression

Your larger beta lane combines visible support/recovery work with repeatable
browser coverage. Use current `origin/main` after Deston merges B0. Preserve
your prior combined recap QA; do not restart completed F6 work.

**Branch:** `feat/beta-recovery-help-regression`.
**Editable:** `src/components/recovery/**`, `src/components/help/**`,
`e2e/**`, `docs/qa/beta/yeewei/**`. Codex owns package/config/CI changes and live
adapters. Larm owns `src/content/help.ts`; do not edit his content file.

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
4. Co-located panel tests and narrow-screen/keyboard/focus evidence. Keep the
   existing recap evidence-focus behavior intact. Clearly label every mocked
   test/report **SIMULATED WALLET BROWSER REGRESSION**. No actual wallet prompts.

Prepare the recovery presentation now; its **live persistence integration
waits for final genuine wallet acceptance**. This does not block Help or the
account/failure/combined tests. Request exact missing adapter interfaces from
Codex rather than editing his hook. Keep UI/scenario commits separate for review.

Return PR URL, actual test commands/results, base/head, screenshots or report
paths, NOT RUN cases and integration needs. Deston merges after Codex review.

## Paste this into YeeWei's agent

```text
Implement MemePet B2 from docs/beta/YEEWEI.md. Read AGENTS.md, scope, ownership, setup and all shared beta instructions. Preserve existing work, fetch origin and branch feat/beta-recovery-help-regression from reviewed main containing B0. Own only components/recovery, components/help, e2e and docs/qa/beta/yeewei. Build the exact Recovery and Help components with beta types/fixtures; keep Larm's content separate. Extend the supplied Playwright harness for account changes/races, stale replies, failed reads and combined-panel consistency. Label all mocks SIMULATED WALLET BROWSER REGRESSION. No real wallet action, live RPC dependency, storage or runtime recovery wiring; Codex supplies that after final acceptance. No packages/config/CI/routes/shared hook changes without an exact lead handoff. Open a draft PR, run actual checks and return the ready PR with honest limitations. Deston merges; no paid calls.
```
