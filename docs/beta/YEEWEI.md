# YeeWei — B2 recovery, help and browser regression

## Current handoff — 3 October

Your B2 implementation and assigned combined release QA are complete in #95.
Keep that report; no duplicate browser suite or repeat disconnected-page sweep
is needed. B5 production is verified; its new genuine acceptance remains lead-coordinated.

The [repaired-release retest](../qa/evidence/READ_REPAIR_2026-10-03.md) records
scoped wallet acceptance and clears the prerequisite for Codex's B5 integration.
Keep the original read-back failure and both genuine reports separate from your
simulated suite. The lead implemented B5 in #102 with eight passing recovery cases.
Latest reviewed [PR #104](https://github.com/Chi944/MemePet/pull/104), `4a40275`,
fixes duplicate wallet wrappers and is production verified. Its CI passed 822 app
tests, 30 simulated browser cases and six fictional previews; main CI also passed.
Cite [the lead's B5 evidence](../qa/evidence/B5_RECOVERY_2026-10-03.md) rather than
rerunning or claiming those checks as your own. Account 2's genuine care and
ordinary reload did not restore a saved hash; genuine B5 recovery remains NOT RUN.
The lead's [labelled backup](../qa/evidence/FINALE_BACKUP_2026-10-03.md) passed full
local playback with its recording gap disclosed; it does not close B5 acceptance
or establish venue-equipment playback. Timed team rehearsal is separately
**USER-REPORTED PASS (2026-10-03)**, not independently observed by the lead.
Only genuine B5 recovery remains open in the scored scope. No additional browser
suite or repeat rehearsal is assigned to you.

```text
Fetch reviewed main, preserving local work. Read docs/beta/YEEWEI.md. B2 and #95 are complete. Keep existing evidence. The lead's B5 runtime shipped in #102; latest wallet-discovery release #104 at 4a40275 is production verified, with 822 app tests, 30 simulated browser cases and six fictional previews passed in CI. Cite the B5 evidence; do not rebuild the adapter or duplicate completed tests. Account 2's genuine care and ordinary reload are not saved-hash recovery. Report only new reproducible defects within your assigned paths; no new feature, wallet action, paid call or merge. Genuine changed-release B5 recovery remains NOT RUN and lead-coordinated.
```

## Earlier requirements and handoffs

**Current handoff — 2 October:** #83 (B2), #84 (finale recap QA) and the lead's
#85 preview/read-retry integration are merged. Do not restart those branches or
repeat delivered components. The current Help integration adds `/help` with
Larm's reviewed #87 content. Start the next check only after its lead PR merges;
record the actual checkout and deployment rather than assuming this document
names the running version. See [progress](../STATUS.md#progress-measurement).

**Next deliverable:** focused production Help/keyboard/narrow-width review and
only uncovered browser scenarios. The lead's `help.spec.ts` already covers
320/390/1440px, all real FAQ entries, inert wallet access and no RPC/API requests;
cite that coverage instead of duplicating it. `/dev/beta` remains fictional.
Kym's combined onboarding/progression checks await her integration. Eight B5
refresh cases stay NOT RUN until final genuine acceptance and the runtime exist.

Your original B2 feature work is delivered. Preserve any unpublished work,
then create `test/beta-help-integration` from reviewed main for the follow-up.
Do not repeat the merged recovery/help implementation. The original deliverables
below are reference requirements, not a fresh assignment.

**Editable:** `src/components/recovery/**`, `src/components/help/**`,
`e2e/**`, `docs/qa/beta/yeewei/**`. Codex owns package/config/CI changes and live
adapters. Larm owns `src/content/help.ts`; do not edit his content file.
The active B4 `e2e/simulated-wallet/provider-selection.spec.ts` is temporarily
lead-owned. Cite its results when available and put your broader scenarios in
separate specs; coordinate before modifying that file.

## Original deliverables (handed off in #83; integration remains separate)

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

## Continuation prompt after syncing the reviewed preview PR

```text
Continue MemePet B2 integration QA from docs/beta/YEEWEI.md and INTEGRATION.md. Preserve local work, then use a fresh test/beta-help-integration branch from reviewed main after the lead Help integration merges. #83/#84/#85 are delivered: do not rebuild them. Inspect actual /help content at 320/390/1440px and keyboard access; cite the existing help.spec.ts and preview suite, adding only uncovered scenarios or reproduced fixes in your allowed components/e2e/evidence paths. Record checkout and runtime identity separately. Kym combined checks await B1 integration. Keep simulated and fictional tests distinct from genuine wallet acceptance; eight B5 cases remain NOT RUN. No hooks/routes/config/dependencies, real wallet actions, paid calls, force-pushes or merges.
```
