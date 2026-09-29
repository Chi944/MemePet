# Current delivery status

Updated 29 September 2026 (Singapore). Team **The four musketeers**: Deston,
Kym, Larm and YeeWei. The recorded release and the 25 September follow-up run remain
separate evidence; see [latest-release QA](qa/evidence/LATEST_RELEASE_QA_2026-09-24.md).

## Finale work — 29 September

The team shared its selection invitation for the **7 October 2026** live finale
and authorized continued building. This establishes finalist selection, not
approval of every proposed technical integration or an attendance receipt.

[Start the four-person build](finale/START_HERE.md). Kym owns pet personality
presentation, Larm community presentation and reference research, YeeWei the
activity recap presentation. Codex handles shared data/services, integration,
review and release work under Deston's authorization. Deston retains product
decisions, private setup, wallet approvals and final rehearsal.

F0 supplies shared interfaces, fictional fixtures, a development-only workbench,
and pure standard-reply/personality/mission helpers. These helpers are not yet
wired into the public product. The automatic community-refresh defect remains
open; no additional real wallet QA was performed for the foundation change.
[Foundation checks](qa/evidence/FINALE_FOUNDATION_2026-09-29.md) passed: 132 app
tests, 15 contract tests, 8 counter regressions, typecheck, lint, build and five
production preview gates. The existing lint warning remains.

The [F1 retry follow-up](qa/evidence/FINALE_RECEIPT_RETRY_2026-09-29.md) repairs a
reproduced viem classification gap for a temporary `header not found` RPC error.
Fourteen added regressions bring the suite to 146 app tests. The original live
failure's precise cause remains unproven, and automatic community read-back on
the new release still needs genuine browser-wallet verification.

The proposed free OKX.AI service is not registered or live. Website model replies
remain optional; no model account, included credits or spending budget has been
verified. The 25 September submission/access checklist below is historical and
must not be mistaken for a new check of video access or submitted declarations.

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
