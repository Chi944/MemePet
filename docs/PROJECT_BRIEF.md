# MemePet product scope

**Current handoff — 3 October:** B0–B4 feature integration is merged through
#92. Reviewed #93/#95 complete the assigned B3/B2 release QA; Kym's B1
implementation is complete. Use [current beta roles](beta/START_HERE.md)
and [weighted progress](STATUS.md#progress-measurement). The [repaired-release
retest](qa/evidence/READ_REPAIR_2026-10-03.md) records scoped wallet acceptance
PASS for `fa07032`, preserving the earlier failure and observation limits.
Codex may begin B5 integration; its runtime and changed-release acceptance
remain outstanding. Deston retains private approvals, product review and
rehearsal. Backup delivery/playback and rehearsal do not gate B5 engineering.

## Product

A meme-community companion app on X Layer. A user adopts a wallet-linked pet, completes a daily care action, sees its progress and helps a shared habitat grow.

**Core user story:** connect → adopt → care → see confirmed progress → refresh and recover the same pet.

## Rules

One pet per wallet. One care per UTC calendar day. Each confirmed care gives 10 personal growth points and increments the community care total by one. Hatchling begins at 0 points, Buddy at 20, Guardian at 50. No missed-day penalty. The lead owns the contract and UI mapping of these rules.

Show progression earned from participation, not token spending. No token approvals, token transfers, deposits, rewards with financial value or new MemePet token.

## Commit scope

One community, one mascot with three stage assets, a landing/adoption entry, pet home, daily care, persistent state, a community-progress panel, and read-only public pet/share-image pages. The actual community token/network identity is lead-verified, not inferred from a ticker or generated artwork. A read-only holder indicator may be added by the lead after the core loop works.

## Stretch scope

Accessory saving, multiple communities and market data are deferred. No marketplace, launchpad, breeding, trading, staking, unrestricted chatbot, autonomous wallet agent, second pet, real-time 3D engine or in-app social feed. The bounded read-only companion below is the precise exception to the original chatbot exclusion. It has no signing or transaction authority.

## Approved finale extension — 29 September 2026

The team reports selection for the 7 October finale and organizer permission to
continue building. Implement the [finale assignments](finale/START_HERE.md) as new
work; do not backdate it or claim an unconfirmed submitted revision.

Keep MemePet a meme-community participation app, not a token launchpad. First
resolve the documented automatic community read-back failure. Then add one
verified community identity/reference integration, a shared cosmetic garden
mission, a read-only MemePet activity explainer and browser-local personality.

- **Garden rule:** the garden blooms when the configured registry's lifetime
  community care total reaches **20 confirmed care actions**. Existing confirmed
  cares count. This newly defined app presentation rule is not a contract reward,
  unique-user target, token payout or retention metric. Unknown totals cannot
  unlock it. Do not reset or fabricate live progress for a demonstration.
- **Personality:** Explore and Practise influence explanation style. The lead
  saves a resettable profile locally for this browser/chain/registry/wallet.
  These interactions do not earn growth, change cooldown or train a model.
- **Companion:** answer bounded questions about the project's confirmed facts:
  progress, care eligibility and personal/shared contribution. Evidence remains
  visible without a model. This is not full wallet history or financial advice.
- **Community identity:** a sourced reference is allowed without claiming a
  partnership. The lead verifies identity and network coverage before live use.

The companion uses the existing Next.js app. Start with explicitly labelled
standard explanations. A real free OKX.AI/A2MCP service may expose the same
deterministic recap; it requires registration and evidence of actual invocation,
not necessarily a paid language model. Optional model wording needs separately
established credentials, budget and public abuse controls. No model credits or
paid service are assumed to be provided by OKX.

**2 October delivery checkpoint:** the approved garden, reference, read-only
recap, local personality, earned-form viewer and recap presentation are
implemented. Follow the [current briefs](finale/START_HERE.md) for combined QA,
reproduced-defect fixes, final wallet acceptance, backup capture and rehearsal.
Implementation complete does not mean final acceptance passed. Optional OKX.AI
registration/invocation remains unverified and does not block this working scope.

## Approved testnet beta extension — 2 October 2026

The user approved [B0–B5](beta/START_HERE.md): easier onboarding and explicit
wallet choice, continued cosmetic progression, help/support, bounded reads,
pinned contract tools, automated simulated browser regression, and public-hash
transaction recovery **after final genuine wallet acceptance**. This approval
supersedes earlier feature-freeze wording for work on these separate branches;
it does not change the final-acceptance gate or authorize a mainnet launch.

Personal cosmetic milestones use 5/10/20 lifetime confirmed cares; shared
garden chapters use 20/50/100. The original 20-care bloom and three pet stages
stay intact. No reset, missed-day penalty, token reward, new pet or contract
change is introduced. Shared types/helpers may land before presentation; do
not describe planned panels as live. Kym and YeeWei own larger UI/test lanes,
Larm a smaller content/QA lane, and Codex handles shared engineering, review,
integration and passing PR merges under the latest 2 October authorization.
Deston keeps final product checks and private wallet approvals. B0 is merged in
#80 (`99086a3`), so the three beta lanes can begin from reviewed current main.

## Architecture boundary

The lead owns contract reads/writes and supplies display-ready values and callbacks. Teammates build components with those inputs. UI preview data must never become a fallback for a failed live read.

## Visual direction

Soft collectible-pet appearance, readable text, spacious cards, consistent lighting/camera, a dominant pet scene and one obvious care action. Use approved art, not rendered financial logos or unverified token branding. The previous concept image is inspiration, not an implementation specification.

## Completion

Core transactions work in the declared environment; state survives refresh; rejected or failed transactions do not award progress; unknown community data is not shown as zero; the app works on a narrow mobile screen; the demo distinguishes live state from previews.

These are project design choices. The lead separately verifies hackathon requirements and the supported deployment environment.
