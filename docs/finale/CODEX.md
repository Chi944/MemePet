# Codex — engineering, integration and release

**Latest:** B1 integration/#91 and CI stabilization/#92 are merged; assigned
B2/B3 release QA is reviewed in #93/#95. Prepare final genuine acceptance.
Use [current beta tasks](../beta/START_HERE.md) for release QA and acceptance;
do not restart delivered feature work.

## Current assignment — 2 October 2026

Finale features and B0–B4 are merged; assigned B2/B3 release checks are complete. Prepare one genuine final wallet session using the read-only preflight. B5 runtime waits for that acceptance; helpers alone do not enable it.

Use [the current beta brief](../beta/INTEGRATION.md)
for new work and [current progress](../STATUS.md#progress-measurement).
The older task instructions below are retained as finale requirements/history;
do not recreate merged branches. Genuine wallet acceptance, backup capture
and rehearsal remain separate from implementation and simulated checks.

**Current engineering lane:** [B0/B4/B5](../beta/INTEGRATION.md).
The 2 October beta instruction adds shared engineering and team integration.
The latest same-day user request authorizes lead review and merge of passing
PRs, superseding the earlier Deston-only merge rule. B0 is merged in #80
(`99086a3`); B4 is the current lead implementation lane. Keep Deston's routine
coding workload near zero. Complete
the existing final wallet acceptance before runtime pending-transaction recovery.

Deston delegates routine engineering to this lane. Do not hand him a list of
coding commands. Teammates own their three presentation branches; Codex owns
their shared contract, verified adapters, wiring, PR review and release.

## Current checkpoint — 2 October

F0/shared adapters and the first teammate component wave are merged, including
Kym's personality panel (#67) and Larm's release QA/focus repair (#66). Garden
and recap already have live integration. Personality wiring and same-snapshot
Standard explanation updates shipped in #68 (`3cd4b0a`); release and browser
preference checks are recorded in [status](../STATUS.md).
F5 earned forms (#73), normalized live/public scene scope keys, and F6's recap
and focus fixes (#72/#75) are now merged. The approved feature scope is complete.
Kym's pet QA/preview fix #78 is also reviewed and merged. Verified product
source: `62d487d5d4e1f7c7b26332753f042fcb91a748d8`, Production deployment
6794766512; current Vercel alias-to-SHA proof and the genuine same-page read-only
follow-up are in [release evidence](../qa/evidence/PET_QA_RELEASE_2026-10-02.md).
Exact-head and main CI passed. Record checkout and deployed revisions
separately using the [common handoff](START_HERE.md#release-identity-and-common-handoff).
Combined checks pass: 379 app tests, 15 contract tests, 22 read-helper tests,
typecheck, lint and build. Local browser checks covered the F5 gallery at
320/390/1440px, keyboard/missing-art behavior and F6 evidence focus at 390px.
These are automated and local presentation checks; production verification is
recorded separately in status. Final genuine wallet acceptance is **NOT RUN**.
Preserve the dated historical wallet failure and later read-only recovery.
Implemented retry protection does not prove a new genuine care read-back passed.

## Next work in order

1. **Preserve personality integration:** #68 uses one `useCompanion` instance,
   gates controls on a confirmed pet/correct network/no pending write, and keeps
   style changes separate from chain facts. Regression tests cover storage and
   isolation; genuine browser preference/reload/reset checks passed. Keep these
   guarantees through combined QA; do not substitute them for final wallet QA.
2. **Verify the combined release:** check the exact deployed SHA, production
   preview gates, real public read-only pages and rollback reference. F5 and F6
   need no new feature work. Preserve route scope keys, stage-change resets,
   source-time wording, narrow-card dates and evidence focus. Review incoming
   fixes against their exact heads, keeping the combined suite green.
3. **Coordinate 3–4 October QA:** Kym's #78 report is handed off; request only
   focused follow-ups for reproduced pet regressions. YeeWei checks
   recap/disclosure behavior, and Larm checks the integrated presentation and
   read recovery. The [local recovery setup](../qa/READ_RECOVERY.md) is already
   implemented with helper regressions and CI coverage. Preserve its prior real
   local execution as separate evidence, and record each new named-runtime run
   honestly. Keep faults out of production and wallet-write paths. A fixture
   callback or mocked transaction is not genuine read recovery or wallet proof.
4. **Run the [prepared final wallet session](../qa/FINAL_WALLET_SESSION.md):**
   refresh prerequisites and the exact deployment first, then request only the
   necessary private approvals from Deston. Capture rejection/adoption/care where applicable, automatic reads,
   reload and account/network isolation on the final runtime. Preserve NOT RUN
   entries rather than fragmenting work into repeated teammate wallet requests.
   Account 4 already had Hatchling/10 at the 2 October preflight; all accounts
   were due at 08:00 Singapore. Recheck before its possible single-care evolution
   run; do not call it a fresh account or assume eligibility persists.
5. **Freeze and rehearse:** fix release blockers, preserve the previous good
   deployment, capture a dated backup on 5 October and run the three-minute
   rehearsal with a network fallback on 6 October. No scope expansion or extra
   human coding work is assigned.

Shared code/routes are in the lead [allowlist](../OWNERSHIP.md). Do not enter
teammates' files while they are editing; coordinate a specific handover for
integration fixes instead of silently overwriting work.

## Concrete release deliverable

- Collect Kym's pet report, YeeWei's companion report and Larm's combined report
  as PR links. Preserve each agent's dated observations; Larm may cite them but
  does not need to rerun every specialist check. Review all source fixes and
  rerun the affected checks on the final combined source.
- Maintain one release record under `docs/qa/evidence/` with source/deployment
  SHA, check results, actual browser evidence, remaining blockers and rollback.
  Keep the existing 2 October observations historical; a new build needs its own
  record where relevant. Docs-only commits do not imply a fresh production run.
- Before asking Deston for wallet actions, prepare the runtime, account/network
  prerequisites, due-care state, recording plan and ordered checklist from
  [BROWSER_WALKTHROUGH.md](../qa/BROWSER_WALKTHROUGH.md). Combine the team's wallet
  requests into one session. Do not consume the reserved pitch-day care while
  preparing read-only checks. No signature or testnet funding is automated here.
- Publish the final acceptance record with actual transaction hashes/receipts
  only when performed; route blockers to the correct owner. Confirm the dated
  backup file exists and plays before calling backup capture complete.

## OKX.AI service and optional model

The free A2MCP feasibility packet remains optional. A deterministic read-only
recap can use the documented HTTPS 200 response path without x402 payment;
paid model wording is not a prerequisite.
Codex handles endpoint code, validation, registration preparation and invocation
tests. Deston performs only private account verification/login where required.

The [registration packet](OKX_AI_SERVICE.md) is prepared and describes the
deployed direct HTTP endpoint. Private authentication, ASP registration,
marketplace acceptance/listing and an actual OKX.AI invocation remain pending.
Inspect the official setup and installed tool requirements before registering;
do not treat the packet or a direct HTTPS response as a listed integration.

Do not claim listing or integration until the actual registered service has been
invoked through the intended OKX.AI client. A normal chatbot API call is not proof.
The optional service must not block the working X Layer product if registration,
review or network support is unavailable. Do not change the primary track.
Its registration/invocation remain unverified and are not release blockers.
Keep paid integrations inactive for this work, use free
local tools, and do not make billable calls or start trials without new explicit
authorization. Available credentials do not authorize spending.

Model access is a separate optional enhancement. Before enabling it publicly,
establish actual provider access, approved budget/quota, server-only credentials,
bounded input/output, timeouts and persistent/shared abuse controls. An in-memory
counter in a serverless function is insufficient. No model credits, purchases or
provider key are assumed to be supplied by OKX. Prepare the build first, then ask
only for the concrete private setup or cost decision that cannot be automated.

If unavailable, ship verified facts plus **Standard explanation** and explicit
model-disabled/unavailable state. Never imply a model generated a template.
No signing key, wallet-provider access, arbitrary tool execution or spending
permission is given to either service or model.

Official integration references: [free A2MCP](https://web3.okx.com/onchainos/dev-docs/okxai/howtomcp),
[registration](https://web3.okx.com/onchainos/dev-docs/okxai/registerasp).
Verify current requirements at implementation time; an API description is not
evidence of a completed integration or supported 1952 wallet-history coverage.

## Review, checks and release

The user authorizes Codex to commit/push, review teammate PRs, resolve conflicts
and merge reviewed passing changes. This does not authorize teammates to merge
themselves. Avoid force-pushes/admin bypasses and preserve unrelated work.
Review exact heads and integrate one PR at a time; later changes need rechecking.

Run [development checks](../DEV_SETUP.md) and meaningful new regressions. Before
production, verify old/new preview routes return 404, public pages stay read-only,
fixtures never enter live adapters, account/network changes clear stale replies
and the no-model path works. Release only a green integrated revision through
the existing deployment process. Retain the previous good deployment and record
the exact runtime used for QA/rollback.

Actual wallet acceptance still needs a genuine due care, automatic pet/community
reads, reload, account/network isolation and disconnect on the new runtime;
record read recovery separately if required. Retain September's genuine
adoption/rejection evidence. Do not repeat those transactions solely to change
their evidence date; repeat only when a changed path or an agreed acceptance
case requires it, using a genuinely suitable account. Unperformed final-runtime
rows remain NOT RUN. Human approvals
stay private; never request secrets or bypass extension restrictions. Tests and
fixtures cannot replace real wallet evidence.

Preserve reduced motion outside the explicit 30 September Mochi exception:
Deston requested default-on artwork interaction for everyone with a saved
Animate Mochi off control. Do not change Windows settings or extend this
exception to garden, page or transaction-status animation.
Reserve pitch-day care on one demo wallet and rehearse
with another. Record a genuine backup and label it if live connectivity or a
pending transaction requires its use.

## Deston's remaining work

- Private login/credential setup only when an approved integration needs it.
- Genuine wallet approvals and organizer/attendance declarations.
- One integrated final review and timed rehearsal. Report observations in plain
  language; no routine coding, debugging or merge work is assigned to Deston.

Return a short release report: shipped behavior, PRs/commit, real vs automated
checks, limits and the exact next human step. Teammates return PR links here;
automatic access to their separate coding agents is not assumed.

## Resume prompt for the lead session

```text
Continue MemePet's release lane in docs/finale/CODEX.md. Fetch and inspect current reviewed main, open PRs and local work without discarding anything. All approved features are implemented; use the latest team briefs for QA, not new feature work. Review incoming Kym/YeeWei/Larm reports and exact PR heads, fix shared blockers, run relevant integrated checks and release through the existing process. Record checkout and deployed SHAs separately. Preserve real/fixture/cited/NOT RUN evidence and historical failures. Prepare one complete final wallet-and-capture session before requesting only necessary private approvals from Deston. Verify actual backup footage and coordinate the three-minute rehearsal. No paid integration, scope expansion, force-push or autonomous wallet signing. Return a concise release report and the exact remaining human step.
```
