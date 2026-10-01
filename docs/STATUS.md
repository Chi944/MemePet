# Current delivery status

Updated 1 October 2026 (Singapore). Team **The four musketeers**: Deston,
Kym, Larm and YeeWei. The recorded release and the 25 September follow-up run remain
separate evidence; see [latest-release QA](qa/evidence/LATEST_RELEASE_QA_2026-09-24.md).

## F7 presentation and read recovery — 1 October, later checkpoint

Larm's PR #70 is reviewed and merged as `9fa6438`. It adds the Ask Mochi landing
step, visible garden-track boundary, initial presentation checks, timed runbook,
judge Q&A and backup shot list. The combined checklist remains NOT RUN until
F5/F6 are integrated; a shot list is not recorded footage.

Codex supplied a bounded local-only read-recovery proxy, a reproducible handoff
and CI regressions. Actual browser testing observed Unknown during deliberate
read failure, then **7 confirmed cares / 13 remaining** after Retry reading
without reloading or connecting a wallet. Repeated failure/recovery passed.
The read-only recap also recovered from HTTP 503 to a real block-pinned 200.
Standard next-care wording now distinguishes care available at the verified
block from a future cooldown time. [Dated evidence](qa/evidence/READ_RECOVERY_2026-10-01.md)
preserves the test-tool defect found and repaired during verification.

| Lane | Completed | Remaining |
|---|---|---|
| Kym | F2 personality panel, integrated by Codex | F5 earned-form viewer **not started**, confirmed by Deston; growth-track visibility check. |
| YeeWei | F3 recap, integrated by Codex | F6 concise recap/evidence layout **not started**, confirmed by Deston. |
| Larm | Garden, landing and initial F7 presentation/runbook PR #70 | Recovery follow-up and final combined QA after F5/F6; actual backup capture is separate. |
| Codex / Deston | Shared facts/adapters, integration, retry protection, motion, preference verification and recovery setup | Review/integrate F5/F6, final release checks and one genuine wallet/rehearsal session with Deston. |

**Planning estimate: about 80% finale-ready**, not a measured acceptance score.
The first teammate wave is complete; two small follow-up features and final
combined acceptance still remain. Role sheets are current. Teammates should
fetch reviewed main and use their assigned fresh branches; Larm's old F7 branch
is merged, so his next branch is `test/finale-combined-qa`. No messages to their
separate Claude sessions are assumed delivered.

The README/submission notes now distinguish Larm's 1 October signed-out public
video-access check from the historical private upload. Full human playback,
attendance receipt, optional OKX.AI registration and invocation are not claimed.

## Personality integration — 1 October

Kym completed F2 in reviewed PR #67, now merged (`a82eafd`). Larm's focus-ring
repair/QA #66 also merged (`d79df25`) after the lead corrected runbook claims
about retries, remaining cares and already-known demo-wallet ownership.

The lead integration mounts Explore/Practise, style counts, reset and honest
storage states on the wallet pet page using the existing local preference
adapter. Already-open Standard explanations immediately follow the current
style using the same verified snapshot. Interactions neither fetch again nor
award growth. Pending writes, wrong networks, disconnected/unconfirmed/no-pet
states do not offer the controls.

Local checks pass: **343 app tests / 37 files, 15 contract tests, 8 counter
regressions**, typecheck, lint (one existing image warning), production build,
public-page 200s and all five production preview 404 gates. Integration tests
exercise persistence, reset and A–B–A wallet isolation. PR #68 merged as
`3cd4b0a`; production deployment `6767546180` succeeded. Hosted Chrome verified
Explore/Practise, immediate answer rewording, saved counts after reload and reset
back to the initial zero-count profile. Account 2 remained Buddy/20 points and
the community stayed at 7. [Release evidence](qa/evidence/PERSONALITY_INTEGRATION_2026-10-01.md)
records the exact runtime and limits; no new wallet action was performed.

Next assignments are executable in [the four-person handoff](finale/START_HERE.md):
Kym F5 earned-form viewer, YeeWei F6 concise recap/evidence disclosure, Larm F7
presentation/recovery QA. Codex owns shared integration and releases. Target
feature-complete 2 October, QA 3–4 October, freeze 5 October. These new tasks are
assigned, not claimed started or finished. Deston keeps only private approvals
and the final review/rehearsal. The free OKX.AI packet is updated against official
documentation; registration, review and an actual OKX.AI invocation remain pending.

## Finale integration — 30 September

The [initial-read follow-up](qa/evidence/COMMUNITY_INITIAL_READ_2026-09-30.md)
records genuine read-only recovery from Unknown to **7 cares** in Chrome and
adds bounded automatic retries to initial/latest community reads. **321 app
tests / 34 files** pass. Buddy with 20 points was observed, but no new care or
evolution transition was performed. Automatic read-back after a genuine care
on the resulting release remains pending. Reduced motion initially explained
the stationary hover. Deston then explicitly requested default-on Mochi motion
for everyone, with a saved off control. The [motion follow-up](qa/evidence/MOCHI_MOTION_2026-09-30.md)
records the narrow artwork exception, keyboard/hover verification and **331 app
tests / 35 files**. Other UI still respects reduced motion; Windows was unchanged.

Reviewed and merged Larm's garden PR #59 and YeeWei's recap PR #61. The lead
fixed answer announcements and error contrast in #61, then connected both panels
to verified data on the real overview/pet routes. The garden reads 4 confirmed
cares in the local browser against the public testnet. Exactly-20 bloom and
unavailable states were checked separately as labelled fixtures. XDOG's token
address was independently checked against an official OKX source and mainnet
RPC; its reference network (196) is explicitly separate from care network 1952.

Combined checks: **312 app tests / 33 files, 15 contract tests, 8 counter
regressions**, typecheck and lint pass (one existing image warning). Browser
checks preserve reduced motion and distinguish real reads from fixtures.
[Integration evidence](qa/evidence/FINALE_INTEGRATION_2026-09-30.md) records the
build, release and browser boundaries. No fresh wallet action was performed.

At the 30 September checkpoint Kym had not started the new personality panel.
That checkpoint is superseded by completed F2/#67 above; her earlier pet/art
contribution remains separate.
Larm's landing-copy PR #60 follows the integrated garden release in #62. The optional
OKX.AI service is still prepared, not registered or invoked.

## Foundation history — 29 September

The team shared its selection invitation for the **7 October 2026** live finale
and authorized continued building. This establishes finalist selection, not
approval of every proposed technical integration or an attendance receipt.

[Start the four-person build](finale/START_HERE.md). Kym owns pet personality
presentation, Larm community presentation and reference research, YeeWei the
activity recap presentation. Codex handles shared data/services, integration,
review and release work under Deston's authorization. Deston retains product
decisions, private setup, wallet approvals and final rehearsal.

F0 supplies shared interfaces, fictional fixtures, a development-only workbench,
and pure standard-reply/personality/mission helpers. At this milestone these helpers
were not yet wired into the public product. The automatic community-refresh defect remains
open; no additional real wallet QA was performed for the foundation change.
[Foundation checks](qa/evidence/FINALE_FOUNDATION_2026-09-29.md) passed: 132 app
tests, 15 contract tests, 8 counter regressions, typecheck, lint, build and five
production preview gates. The existing lint warning remains.

The [F1 retry follow-up](qa/evidence/FINALE_RECEIPT_RETRY_2026-09-29.md) repairs a
reproduced viem classification gap for a temporary `header not found` RPC error.
Fourteen added regressions bring the suite to 146 app tests. The original live
failure's precise cause remains unproven, and automatic community read-back on
the new release still needs genuine browser-wallet verification.

## Shared services — 30 September

Codex implemented the public read-only recap API and browser adapters for the
three teammate panels. Facts are pinned to one block with a final hash check;
responses are validated against wallet/chain/registry and obsolete sessions are
discarded. Standard explanations require no model account. Resettable personality
preferences stay local to this browser and wallet context. The garden uses the
confirmed total; its community identity was unconfigured at this milestone.

Review also repaired an endless-loading case when the community hook starts on
an unsupported network or without complete deployment settings. All 271 app
tests, 15 contract tests, 8 counter regressions, typecheck, lint and build passed.
Lint retains one existing image warning. A real local HTTP recap matched an
independent X Layer RPC read: Account 3 had one care, 10 points and community
total 4 at block 42247147. [Service evidence](qa/evidence/FINALE_SERVICES_2026-09-30.md)
records the exact source and limits.

[PR #57](https://github.com/Chi944/MemePet/pull/57) merged after green checks;
production deployment 6742315810 records commit `3c9cdd0`. The public HTTPS
recap was verified at 29 September 18:26:46Z against independent RPC block
42247566. Its real pet/total matched, no-pet and invalid-input cases behaved
correctly, public routes returned 200 and all five preview gates returned 404.

Teammate panels were not yet wired into the live wallet page at this milestone. No fresh wallet
action was performed for this work, so the automatic community refresh,
network-away/back and other pending browser acceptance rows remain open.
The [free OKX.AI registration packet](finale/OKX_AI_SERVICE.md) is prepared, but
the service is not registered or invoked through OKX.AI. Website model replies
remain optional; no model account, included credits or budget is assumed.

The 25 September submission/access checklist below is historical and must not
be mistaken for a new check of video access or submitted declarations.

## Delivered — original submission evidence

- Wallet-linked adoption, one care per UTC day, confirmed growth and a shared care counter on X Layer testnet.
- Responsive black/lime overview, pet home, stage artwork, read-only public pet and share images; development previews return 404 in production.
- Genuine Account 2 rejection/adoption/care, receipts, later pet read-back, cooldown, manual refresh and disconnected public viewing. [Capture evidence](qa/evidence/FINAL_CAPTURE_2026-09-24.md) retains read failures and capture limitations.
- Completed **185-second 1080p30 video**, four portraits, three 130-word voices and 66-caption SRT. Technical decode/audio/caption and bounded visual checks passed; human full playback is not claimed.
- [Video upload](https://youtu.be/ofPOony4nys) observed in YouTube Studio on 25 September: saved as **Private**, processing/checks complete with no issues reported. This is not a rights clearance or a signed-out playback pass. Thumbnail and square team portrait are prepared in the private submission pack.
- Reduced-motion preview passed with the effective preference enabled: Buddy, success and celebration states kept visible artwork with computed animation disabled. Missing-art and unknown-total previews passed. Normal-motion foreground playback remains NOT RUN by user preference.
- Account switching cleared the previous account's pet without a reload. Earlier Account 1 care confirmed with 10 points/cooldown but left the community header **Unknown**; this failure remains in the evidence.
- A separate unconnected browser displayed Account 3's public page with the correct address, Read only, Live Hatchling, 10 points and no care action: PASS.
- On release **af886a75**, Account 3 genuinely rejected adoption, then adopted and cared. The pet automatically reached **10 points / cooldown**. The community header became **Unknown**, then **Retry community total** recovered **4** without reloading or another transaction. Manual read-only recovery passed; automatic community refresh failed. A normal reload retained Account 3, 10 points, cooldown and total 4.

- Hosted **Disconnect** at approximately 24 September 18:41 UTC completed with account-access revocation, Not connected, no live pet or write actions, and total 4. A normal reload preserved the disconnected state and revocation notice: PASS. The site was left disconnected; no new connection request was issued.

The tested product revision is **af886a75** (PR #51), separate from later
documentation-only revisions. Disconnect ran on this loaded runtime; the following
normal reload used documentation-only **edae08a**, deployment **6645345099**
(18:37:56 UTC), with no runtime source difference. Production deployment **6644949897** succeeded at
**24 September, 18:17:39 UTC**; the public app served the new recovery control.
[Post-merge CI](https://github.com/Chi944/memepet/actions/runs/36040157500)
passed **123 app tests / 21 files, 15 contract tests, 8 counter checks,
typecheck, lint and production build**. Lint has one existing image-element
warning and no errors. Production-route checks passed: `/` returned 200 and
all three development routes returned 404. Automated checks do not erase the
observed automatic counter-refresh failure.

## Original submission follow-ups — last checked 25 September

| Work | Owner / evidence needed |
|---|---|
| Latest-release browser follow-up | Network away/back is NOT RUN: the wallet showed network-management settings and the page remained on 1952 before disconnect. Extension controls were unavailable to automation. Genuine adoption/care, manual recovery, public viewing and disconnect/reload passed; the site remains disconnected |
| Remaining visual QA | Reduced-motion and missing-art/unknown-total fixtures passed in the follow-up run; normal-motion foreground playback is NOT RUN because the user prefers to keep reduced motion enabled. Four viewport layouts and keyboard checks passed in Larm's audit |
| Team video review and access | All four watch/listen and confirm names/portraits/claims. MP4 is uploaded privately; add corrected SRT/thumbnail, make it judge-accessible and check signed-out playback |
| Submission | Deston completes exact roster/route/origin/declarations and retains receipt; Kym resolves asset-input provenance; Larm verifies public links |

[Submission details and checklist](SUBMISSION.md) contain only current form,
rights and delivery fields. The complete scripts/editing pack is preserved in
private production records and [pinned Git history](https://github.com/Chi944/memepet/blob/19c3fac1f097955f2b6e409ab2f4ab988abc0cee/docs/demo/DEMO_SCRIPT.md).
No new feature prompt, full voice retake or optional evolution capture is
required for the original edit. No organic usage metrics are claimed; the later
finalist invitation is recorded above, separately from this evidence.

Use the [wallet walkthrough](qa/BROWSER_WALKTHROUGH.md), [acceptance checklist](QA_CHECKLIST.md),
[component worksheet](qa/COMPONENT_QA_WORKSHEET.md) and [evidence index](qa/evidence/README.md)
for repeatable verification. Tests, mocks, previews and chain reads are not
substitutes for actual browser-wallet actions.
