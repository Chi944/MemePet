# Judge Q&A — honest answers

Likely questions after the three-minute demo, each with a short answer the
team can say as written. Every answer points to its source. Where something is
not done or not known, the answer says so.

Written against `7d4144b` on 1 October 2026; updated with 2 October hosted
observations ([F7 combined QA](COMBINED_QA_2026-10-02.md)) and rechecked on
3 October against release `3148238` ([rerun](COMBINED_QA_2026-10-03.md)).
Neither run independently resolved the public alias to a commit; the reports
preserve that limit.
Dated figures keep their dates. Numbers change: **read live
numbers off the screen**, not from this sheet. Words to avoid are in
[`FINALE_RUNBOOK.md`](FINALE_RUNBOOK.md#words-to-use-words-to-avoid).

## Traction and numbers

**"How many users do you have?"**
> We count care actions, not people. One wallet can care once a day, so the
> number is not a user count. We have used team wallets for testing, but we
> do not claim these totals represent outside users.

Source: `docs/STATUS.md`, `INTEGRATED_QA_2026-09-30.md`. The three demo
accounts have cared twice each, so they account for at least six of the
seven on 1 October. The other one is not attributed in our records. If asked,
say exactly that.

Later reading: on 2 October at 08:07 UTC the counter read **12** (block
42 469 608). Of the five care actions since the reading of 7, one is the
stage pet's care on 1 October at 16:34 UTC (block 42 413 656); the others are
not attributed in our records. Do not call them team or community cares.
On stage, read the live number off the screen.

Still **12** at 16:42 UTC on 2 October (block 42 500 495) and at 05:59 UTC on
3 October (block 42 548 305).

**"Isn't the garden easy to fake with lots of wallets?"**
> Yes. Anyone can make many wallets, and that's why we call it care actions
> and never users. The garden is a cosmetic goal inside the app, with no
> reward, so there is nothing to farm.

Source: README "What MemePet does"; `PetRegistry.sol`, which allows one pet per
wallet and one care per UTC day.

## Token, money, rewards

**"Is there a token? Can I earn anything?"**
> No. There's no MemePet token, marketplace, staking or reward. Adopting and
> caring ask for no token approvals or transfers; you only pay testnet gas.
> The milestones on your pet page are cosmetic labels from confirmed cares:
> no money, no tokens, no extra growth.

Source: README "What MemePet does" and "Product scope"; the milestones panel
copy "Cosmetic recognition only: no money, tokens or extra growth points"
(`ProgressionPanel.tsx`, B1 #90/#91).

**"What's the market, then?"**
> We built for Build a Market's meme track: a daily ritual around a meme
> community's mascot. The prototype doesn't claim a business model. More
> communities and accessories are listed as optional future work.

Source: README "Product scope", "Roadmap". Do not improvise revenue numbers.

## AI and personality

**"Where's the AI? Does Mochi learn?"**
> Mochi's answers are standard explanations built from your confirmed
> on-chain activity, and each shows the block it was read from (open
> "View verified evidence"). Explore and
> Practise only change the explanation style. Nothing is trained, and no model
> writes the answer.

Source: README line "Recap wording is a Standard explanation, not a
model-generated response"; PersonalityPanel copy "These preferences do not
earn growth points, change care cooldown, or train a model."

**"Where is the personality stored?"**
> Only in this browser, separately for each wallet. It doesn't sync across
> devices, and resetting it never touches earned growth.

Source: PersonalityPanel copy; `PERSONALITY_INTEGRATION_2026-10-01.md`.

**"Is this on OKX.AI?"**
> A free, read-only service description is prepared, but it is **not
> registered** and hasn't been called through OKX.AI yet.

Source: README "Roadmap"; `docs/finale/OKX_AI_SERVICE.md`.

## Chain and contract

**"Why testnet?"**
> It's a prototype. The registry runs on X Layer testnet, chain 1952, and we
> don't claim a mainnet deployment.

Source: README "Known limitations", "Deployment".

**"Is the contract audited? Who controls it?"**
> No independent audit. The contract is about 110 lines and has no owner, no
> admin functions, no upgrade path and accepts no payments. You adopt one pet,
> and you care for it once per UTC day.

Source: README "Known limitations"; `contracts/src/PetRegistry.sol`. It has no
imports, constructor, `payable`, owner role or upgrade code ("owner" appears only as the pet holder's address in events). Its 15 contract tests
pass (`PERSONALITY_INTEGRATION_2026-10-01.md`).

**"Can someone else care for my pet?"**
> No. Care is tied to the wallet that sends it. The public pet page is
> read-only.

Source: `PetRegistry.care()` uses `msg.sender`; public page text "a visitor
cannot care for someone else's pet."

**"What if I miss a day?"**
> Nothing is lost. Growth never goes down. The day resets at 00:00 UTC, which
> is 08:00 in Singapore. After you care, the app also shows the next reset in
> your local time.

Source: README; `FINALE_RUNBOOK.md` trap 1; onboarding card "Next reset in
your local time" (`OnboardingPanel.tsx`, #91).

**"Does it work on mobile?"**
> On desktop it works with a browser wallet extension. The app suggests
> opening it inside a mobile wallet's browser, but we haven't tested that on
> real phones yet. There's no WalletConnect or QR pairing.

Source: onboarding copy; mobile wallet browsers are NOT RUN in Kym's B1
handoff and the lead's B1 evidence; Help FAQ "What do I need…".

**"How do people get help?"**
> There's a public Help page with plain answers and official wallet and faucet
> links. We haven't set up a monitored support contact yet, so the app says so
> instead of listing one.

Source: https://memepet.vercel.app/help (#88); `SUPPORT_URL = null` in
`src/content/help.ts`.

## Community reference

**"Are you partnered with XDOG?"**
> No. It's a reference, not a partnership or endorsement. XDOG is an X Layer
> mainnet token we checked against an OKX announcement. MemePet runs on
> testnet and doesn't check anyone's holdings.

Source: `docs/finale/COMMUNITY_CANDIDATE.md`; the in-app disclaimer and network
note.

## What doesn't work yet

**"What would you fix next?" / "What's not working?"**
> Four things:
>
> - Automatic refresh of the shared total has returned Unknown before. The
>   app shows Unknown instead of a number. Retry recovered it in our recorded
>   tests; persistent failures remain unknown.
> - We haven't yet seen, on this release, the page update by itself after a
>   new care.
> - If you reload while a care is pending, the app doesn't pick that
>   transaction back up yet. That recovery is planned, after our final wallet
>   checks.
> - There is no security audit.

Source: README "Known limitations"; `COMMUNITY_INITIAL_READ_2026-09-30.md`;
the reported 2 October local recovery check in `COMBINED_QA_2026-10-02.md`
(its installed runtime version remains unresolved). Say it plainly; it
shows the honesty design.

## Check it yourself (30 seconds)

For "how do we know these numbers are real?":

1. **Public pet page, no wallet:**
   https://memepet.vercel.app/pet/0xb7E6D789c39D468CfE3c5dA37C29Bd9852247B3a
2. **The recap API**, the same facts the app uses, with the block number:

   ```bash
   curl -s -X POST https://memepet.vercel.app/api/companion -H "content-type: application/json" -d "{\"address\":\"0xb7E6D789c39D468CfE3c5dA37C29Bd9852247B3a\",\"question\":\"contribution\"}"
   ```

   Checked on 1 October: returned `careCount 2` and `communityTotalCares 7` at
   block 42 359 328. Checked on 2 October at 08:07 UTC: `careCount 3`,
   `growthPoints 30`, `stage buddy` and `communityTotalCares 12` at block
   42 469 610, with `source: standard`. Same values at 16:42 UTC on 2 October
   (block 42 500 519, release `3148238`).
3. **The registry on the explorer:** `0xe844152262D243a7B90F6e07FF7A67F1d7FeD216`
   on X Layer testnet. If the explorer shows a login page, reload; don't log in
   on stage.
4. **From the repo**, read-only: `node docs/qa/counter-check.mjs` prints the
   chain's own `communityStats(1)` and the block it was read at.
