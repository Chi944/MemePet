# Finale runbook — three-minute demo and recovery

For the 7 October 2026 finale. It covers:

- a proposed three-minute flow for the finished loop;
- the words to use and to avoid;
- pre-flight checks;
- what to do when the network, the wallet or the chain misbehaves.

The backup recording plan is in [`BACKUP_SHOT_LIST.md`](BACKUP_SHOT_LIST.md);
honest answers for the questions afterwards are in [`JUDGE_QA_PREP.md`](JUDGE_QA_PREP.md).
The final script and timing are Deston's call; this is a proposal the whole
team can rehearse against.

**Deston privately approves wallet connections and transactions.** Codex prepares
the page, recording and public verification; nobody signs on Deston's behalf.

## Current handoff — 3 October, finale checklist complete

Reviewed [PR #104](https://github.com/Chi944/MemePet/pull/104), `4a40275`, is
production verified; CI passed 822 app tests, 30 simulated browser cases and
six fictional previews. The hosted picker showed one OKX Wallet and one MetaMask.
[Account 2's genuine care](../../evidence/B5_RECOVERY_2026-10-03.md) automatically
updated Buddy/30 to 40 points, three to four cares and community 15 to 16.
Ordinary reload retained those facts; no saved hash was restored in that public
attempt. Account 2 was then in cooldown until 4 October
00:00 UTC (08:00 Singapore); the earlier care-due preflight below is historical.

The later [controlled Local Anvil acceptance](../../evidence/B5_LOCAL_WALLET_2026-10-03.md)
passed with real MetaMask and unchanged runtime `4a40275`. Both user-approved
adoption and care remained pending across reload, restored the same hashes and
confirmed without resubmission after mining resumed. Care added ten growth points
and one community care with the correct cooldown. This closes the agreed B5
finale gate using Deston's chosen local method. **Public X Layer pending-refresh
remains NOT OBSERVED**; do not describe local mining control as public-network
timing evidence.

The lead's [silent 2:14 (134.333-second) backup](../../evidence/FINALE_BACKUP_2026-10-03.md)
is delivered locally and passed full start-to-end playback at 10:35 UTC. It combines
salvaged approval/pending footage with later confirmed-state footage and explicitly
discloses the missing confirmation/reload segment. This edit is separate from
Larm's four read-only clips, which remain undelivered. Timed team rehearsal is
**USER-REPORTED PASS (2026-10-03)**, not independently observed by the lead;
venue-equipment playback remains NOT RUN. The agreed finale checklist is complete;
no further build or repeat rehearsal is required. Deston retains
the private cue card and final pitch timing.

## Earlier checkpoint — 3 October, B5 genuine acceptance pending

The backup-not-ready statement and Account 2 care-due table in this checkpoint
describe the earlier preflight. Use the current handoff above for later results.
The original proposal and checklists below are retained as planning material,
not the current result index.

- [Scoped genuine wallet acceptance](../../evidence/READ_REPAIR_2026-10-03.md)
  passed on `fa07032`. Account 3's care settled at Buddy/40/four cares and
  community 14 without Retry or refresh, corroborated by Deston. The pending
  transition was not continuously observed; this is not a latency measurement.
  **That successful care was not recorded.**
- [PR #102](https://github.com/Chi944/memepet/pull/102), runtime source
  `4477df2377c49038db7be8dda146c0b617ce3ca4`, is merged at
  `36b9ba8d9b93c84e2036c121a377fb0837a24b10`; PR checks passed, including
  [CI 37112343616](https://github.com/Chi944/memepet/actions/runs/37112343616).
  The production alias was verified READY at
  `dpl_ABJum39qAz9ebj8GL9u12Q31YdBG`, built from `36b9ba8`; its runtime tree
  matches `4477df2`. **Genuine changed-release B5 recovery is NOT RUN.**
  Recheck the hosted identity before capture; these are dated release facts.
- The earlier Account 4 recording on `988ed94` preserves a successful care
  followed by failed automatic pet/community reads and manual recovery. It is
  **diagnostic evidence, not a passing finale backup**. Larm's dated
  [read-only clips](BACKUP_READONLY_2026-10-03.md) still need delivery and local
  playback; they do not cover the successful care or B5.
- The current backup is **not ready**. Follow the separate
  [continuous care/refresh capture plan](BACKUP_SHOT_LIST.md), then verify the
  delivered file plays offline. Keep the live pitch simple: no deliberate
  refresh or forced network failure is required on stage.

Lead read-only preflight at **09:10:54 UTC / 17:10:54 SGT on 3 October**, block
**42559817**, returned community **15** and these account states:

| Account | Dated state | Recording use |
|---|---|---|
| Account 1 (`0x3876…5774`) | Buddy/40, in cooldown | Read-only feature footage |
| Account 2 (`0x86F7…3CE9`) | Buddy/30, care due | Candidate for the single B5 care/refresh take; recheck immediately before use |
| Account 3 (`0xb7E6…7B3a`) | Buddy/40, in cooldown | Read-only feature footage |
| Account 4 (`0x0A93…203e6`) | Buddy/20, in cooldown | Read-only feature footage |

These are dated observations, not current availability or funding guarantees.
Recheck account, chain 1952, registry, gas and due state before requesting one
care. A due Account 2 care would ordinarily change 30 to 40 points, **not** evolve
Buddy to Guardian. Attribute any garden increase using the actual event interval.

## Two traps to know before the day

### 1. The care cooldown resets at 08:00 Singapore, not midnight

Care is once per **UTC** day. The UTC day starts at **08:00 Singapore time**.
The invitation says arrive by 11:00, so the pitch falls inside the UTC day
that began at 08:00 on 7 October.

**If the pitch wallet cares after 08:00 SGT on 7 October — in a rehearsal, a
test, anywhere — it cannot care again on stage.** Rehearse with a different
wallet, as `docs/finale/CODEX.md` already requires. Cares before 08:00 SGT on
the 7th fall on the previous UTC day and do not block the pitch.

### 2. Show the actual garden total

| When | `communityStats(1)` | Source |
|---|---|---|
| 2026-09-30 02:59:56 UTC, block 42 278 359 | **4** | `node docs/qa/counter-check.mjs` |
| 2026-09-30 17:45:35 UTC, block 42 331 498 | **7** | `node docs/qa/counter-check.mjs` |
| 2026-10-02 08:07:25 UTC, block 42 469 608 | **12** | `node docs/qa/counter-check.mjs` ([F7 combined QA](COMBINED_QA_2026-10-02.md)) |
| 2026-10-02 16:42:12 UTC, block 42 500 495 | **12** | `node docs/qa/counter-check.mjs` ([3 October rerun](COMBINED_QA_2026-10-03.md)) |
| 2026-10-03 05:59:02 UTC, block 42 548 305 | **12** | `node docs/qa/counter-check.mjs` |
| 2026-10-03 09:10:54 UTC preflight, block 42 559 817 | **15** | Lead read-only wallet preflight; recheck before capture |

Blooming needs 20. At the latest dated preflight total of 15,
5 more genuine confirmed cares remain. Each wallet can care at most once per UTC day. Use the actual
total on stage; this table is a dated observation, not a forecast.

- **Show the garden as it really is** — the true total, sprouting, with how
  many cares remain. That is the honest story and it demonstrates the product.
- If the team's own wallets push the total to 20, it is real and may be shown,
  but say it plainly: **team cares, not community adoption.**
- The rise from 4 to 7 came from three team demo wallets within 44 blocks.
  Chain evidence is in `INTEGRATED_QA_2026-09-30.md`; Deston's prior account
  attribution is recorded in [the lead's read-recovery evidence](../../evidence/COMMUNITY_INITIAL_READ_2026-09-30.md).
  These are team cares, not evidence of outside-user adoption.
- The later rise from 7 to 12 is **not attributed** in our records, apart
  from one care by the stage pet `0xb7E6…7B3a` on 1 October at 16:34 UTC
  (block 42 413 656). Do not call the rest team or community cares without
  event evidence; say "care actions".
- The later 12→13 Account 4 care and 13→14 Account 3 / 14→15 Account 1 cares
  have separate public receipt/event evidence in the
  [first October session](../../evidence/FINAL_WALLET_2026-10-03.md) and
  [repair retest](../../evidence/READ_REPAIR_2026-10-03.md). They are attributed
  demo-account actions; they do not establish organic adoption.
- The fictional preview at `/dev/community` shows a bloom, but it is a labelled
  fixture and `/dev/*` is 404 in production. Never present it as live.

## Three-minute flow (proposal)

Historical presentation check: on 3 October against release `3148238` (GitHub Production
deployment 6812922873) in [the 3 October rerun](COMBINED_QA_2026-10-03.md);
the [2 October run](COMBINED_QA_2026-10-02.md) is kept as history. The alias
was not independently resolved to a commit (the lead's release notes record
it). The subsequent `a83f342` deployment (6824015621, 3 October
06:00 UTC) changed QA documents only relative to that check. Later runtime
repairs and the B5 candidate are separate, as recorded above. "Read block" sits
inside the closed **View verified evidence** disclosure, so **open it before
pointing at the block** (checklist row S1). The closed recap already shows
"Confirmed at block N". Recheck these labels on the release Codex names for
the finale. B5 moves submitted-transaction status into its own panel;
do not promise the old Daily care badge sequence on the changed release.

The care confirmation is the only step whose length we do not control. Its
slot below is a **buffer**, not a measurement. Time it in the rehearsal, from
approving in the wallet to "Confirmed", and adjust. On 30 September, X Layer
testnet produced roughly one block per second; that is not a receipt time.

| Time | Screen | What to show and say |
|---|---|---|
| 0:00–0:20 | Overview `/` | The idea in one line: *"Adopt a meme-community mascot. A little daily care grows your pet and the community's garden."* No token to buy |
| 0:20–0:40 | Pet home `/pet`, connected | The real pet: stage, growth points, "Ready" in **Daily care**. *"Care history comes from the X Layer testnet registry; growth is derived from confirmed cares."* Below Daily care, the **Getting started** card should read "Ready for a little care"; no need to mention it |
| 0:40–1:30 | **Daily care** | Press care once; Deston approves only the expected zero-value testnet care. **This is a buffer, not a promised confirmation time.** On B5, the transaction panel may show "Waiting for confirmation", "Checking transaction status…" or "Confirmed"; report what is visible. Say *"We show updated progress after confirmation and a verified pet read."* Expected growth is **+10**; only call it updated when the page actually shows it. Do not refresh to demonstrate recovery during the live pitch. |
| 1:30–1:55 | Garden (same page) | Read the actual total. The expected contribution is one care; the event check distinguishes ours from concurrent activity. Settled automatic updates passed on `fa07032`, but B5 requires its own check. If unavailable, use **Retry reading** once without submitting again. *"Every confirmed care adds one here. It counts care actions, not people. At 20 the garden blooms. It's a goal inside the app: no token, no reward. We're at [read it off the screen]."* One line for the reference: *"Themed around XDOG, an X Layer meme community. A reference, not a partnership."* |
| 1:55–2:20 | **Read-only recap** | Ask "Explain progress". Point at the label **"Standard explanation"**. Open **View verified evidence** (click, or Enter on the summary), then point at "Read block" / "Block time". *"Every answer is a standard explanation of confirmed activity, and it shows the block it was read from."* Leave the evidence open for the next beat |
| 2:20–2:50 | **Mochi, your way** | With that answer still on screen, press "Explore" or "Practise". The style line changes (curious when Explore leads, focused when Practise leads, playful when balanced) and the same answer is reworded, with the same facts and the same Read block (still visible in the open evidence). *"This changes how Mochi explains, not the facts. It is stored only in this browser, earns no growth and trains no model."* |
| 2:50–3:00 | — | Close. If the result remains unknown, say so. Switch only to the labelled backup once its delivery/playback check is complete; otherwise describe the confirmed read-only state without pretending a successful care was filmed. |

Optional, only if ahead of time (about 10 s): scroll to **Keep growing
together** (shown only while connected). *"Milestones are cosmetic labels from
confirmed cares: no money, no tokens, no extra growth."* The first personal
milestone needs five confirmed cares. Read the current panel rather than
reusing a historical account count; check this optional beat in the rehearsal.

Optional, only if ahead of time (about 10 s): on the pet, select the earned
Hatchling form. The notice reads "Viewing Hatchling · Your current stage is
Buddy" (for a Buddy) while growth stays unchanged; "Return to current form"
restores it. It shows earned forms without inventing history.

If the care is unresolved at 1:30, show the independently read garden or explain
the product while waiting. Recap/personality intentionally pause while that
transaction needs verification; do not promise those controls are available.
Return to the transaction panel and use **Check status** once if offered: it
only reads the existing hash. Do not click Care again. A deliberate refresh
belongs in the prepared backup/acceptance take, not this three-minute pitch.

### Words to use, words to avoid

| Say | Do not say |
|---|---|
| "care actions" / "confirmed cares" | "users", "holders", "members", "people", "community growth" |
| "team demo cares" (only for actions we have attributed to team wallets) | "organic", "traction", "adoption" |
| "explanation style" / "Mochi explains differently" | "Mochi learns", "AI personality", "trained", "smart" |
| "Standard explanation" | "AI answer", "the model says" |
| "a reference to XDOG" | "partnered with", "endorsed by", "official XDOG app" |
| "a free read-only service is prepared" | "listed on OKX.AI" (it is **not registered**) |
| "no token, no rewards" | "earn", "rewards", "airdrop" |

## Pre-flight

### The day before

- [ ] Codex has named the release SHA to demo; confirm the hosted site serves
      a deployment built from it.
- [ ] `/dev/pet`, `/dev/landing`, `/dev/community`, `/dev/finale`,
      `/dev/companion` and `/dev/beta` all return 404 on the hosted site.
- [ ] Choose the intended provider explicitly when multiple wallets are
      offered, then connect the expected public account on chain 1952. After
      a reload, selection/connection may be needed again; rehearse that real
      flow. **Do not disable another extension as a requirement.** Account
      state must clear when changing provider; never sign through an unexpected
      prompt just to continue the pitch.
- [ ] Phone hotspot tested with the demo laptop: the site loads and the
      registry reads succeed over it.
- [ ] A **genuine** backup recording exists (see below), made on the release
      being demoed, and plays offline from the laptop.
- [ ] Check the app's animation preference with the user's existing OS setting;
      no OS setting change is required. The later explicit Mochi override is
      separate from the historical reduced-motion check; record actual behavior.
- [ ] Browser zoom and font size are legible from the back of a room. Start
      from **150% browser zoom on a 1920×1080 output** (125–150% on 1440×900);
      layout was checked at these zooms in `READABILITY_QA_2026-10-01.md`.
      On 2 October an emulated 150% layout check on 1920×1080 found no
      overflow and smallest text about 15 px of output (about 10 px at
      100%); the projector check remains a rehearsal task.
      Set it with Ctrl +/−, not the OS display settings.
- [ ] Pitch wording says "care actions". Say "team demo cares" only for
      actions attributed by the dated event evidence above; the rest is not
      attributed. The counter
      counts actions, not people.
- [ ] Timed rehearsal done on the demo release, with the **rehearsal**
      wallet. Write down how long the care took from approval to "Confirmed",
      and set the 0:40–1:30 buffer from it. Also note whether growth and the
      garden total updated **without a reload** (QA row X3); if not, plan the
      Retry press into the script.
- [ ] B5's separate genuine care/refresh check is recorded against the changed
      release. A fast care that completes before refresh is **not** evidence of
      recovering a pending journal; keep that row NOT RUN and do not create
      delays, force a failure or submit an extra care for the camera.
- [ ] Recap labels rechecked on the named release. Verified on 2 and 3 October
      (fixture, `3148238` on 3 October): "Explain progress", "Next care time",
      "Contribution", "Standard explanation", "View verified evidence" →
      "Read block".

### Morning of 7 October

- [ ] **The pitch wallet has not cared since 08:00 SGT today.**
- [ ] Take a counter baseline: `node docs/qa/counter-check.mjs`. Note the block.
- [ ] Open the hosted site once in a clean profile. No console errors.
- [ ] **"Animate Mochi" reads On** in the browser used on stage. An Off chosen
      in a rehearsal is saved in that browser and stays off after a reload.
      Mochi animates even with the OS reduced-motion setting on (Deston's
      choice); the garden and other effects still follow the OS setting.
- [ ] **Explanation style is where you want it.** Explore/Practise counts are
      saved per browser and wallet, so rehearsal presses carry over. If the
      style is not the one you plan to show, press **Reset personality**
      (preferences only; earned growth stays) and rehearse the presses once.
- [ ] Close unrelated tabs and notifications. Nothing private on screen.
- [ ] Backup recording opened and paused on its first frame, one click away.

## When things go wrong

Decide fast. Do not debug on stage.

| What happens | What to do |
|---|---|
| Venue Wi-Fi is down | Switch to the pre-tested hotspot. If it is still down after ~10 s, go to the backup recording |
| Community total shows **Unknown** or "could not be loaded" | Classified temporary read failures receive up to two automatic retries (#64). Unknown alone does not establish the cause or prove retries ran. Say *"the total is unverified, so the app does not invent a number."* Press **Retry reading** once. (Larm's 2 October local report records recovery without a reload; its installed runtime version remains unresolved.) If it stays unavailable, carry on, or go to the backup |
| Mochi is not moving | Check "Animate Mochi" — it was probably switched off earlier. One press turns it on. It changes only the artwork, never the pet's data |
| Wallet prompt does not appear | Do not wait more than ~15 s. Move on; show the confirmed part from the backup |
| Transaction stays pending or status is unknown | Say *"We show updated progress after confirmation and a verified pet read."* Use **Check status** once if offered; it reads the existing hash. Do not send another care. Continue the talk and use only a delivered, checked backup; do not claim the existing diagnostic clip is a passing take |
| "Confirmed — pet details not read yet" | The transaction is confirmed but updated pet facts are unavailable. Use **Check status** once; community progress is read separately. Do not repeat the care or claim the displayed old pet is the new result |
| Wrong network | Use **Switch network** in the app (the Getting started card also offers "Switch to X Layer testnet") |
| Wallet choice appears after a reload | Choose the intended provider, use **Connect wallet**, then select the same account on chain 1952. Approve only the expected connection. B5's saved public hash is checked separately; reconnecting is not another care |
| Wallet or browser shows a **security warning** | **Do not approve it.** Go to the backup. Never bypass a warning on stage |
| Care is refused as already cared today | The cooldown trap above has been hit. Show the cooldown message — it demonstrates the once-a-day rule — and use the backup for the care itself |
| Garden total is lower than expected | Show it as it is. Never switch to the preview to make it look further along |
| **Mochi, your way** is missing | It is shown only for a connected, adopted pet on the right network, and it hides during a write or unresolved recovery. Wait for verified pet facts, or skip this beat |
| "Browser saving is unavailable" appears | Say: *"Preferences aren't saved in this browser right now; the facts are unaffected."* Carry on |
| Transaction recovery reports that browser storage is unavailable | Keep the returned public hash. Recovery after closing/reloading is not guaranteed in that browser. Do not confuse this with personality saving, clear storage, or resubmit the care |
| The recap says activity is unavailable | Same as Unknown: the app will not make an answer up. Retry once, then move on |
| An explorer link opens an OKX login page | Do not log in on stage. Reload once; if it persists, skip it. The app's own "Read block" and the receipt are the evidence (see `LINKS_AND_RECAP_QA_2026-10-01.md`) |

## The backup recording

The full plan is in [`BACKUP_SHOT_LIST.md`](BACKUP_SHOT_LIST.md). The rules:

- It must be made on the demoed release, of a **genuine** care: real wallet,
  real receipt, real total before and after.
- The screen says it is a recording **for the whole recording**, for example
  *"Recorded [date, time] — not live"*. The narrator saying so is not enough.
- Say out loud when switching to it: *"This is a recording from [date]."*
- Never present a recording, a fixture or the preview as live. A labelled
  backup is fine; one passed off as live is not.
- A B5 refresh take must retain the same original public hash and expose any
  provider selection/reconnection and read-only **Check status**. If confirmation
  beats the refresh, label it a completed-care reload, not pending recovery.
- The plan is not footage. No ready finale backup is established at this
  handoff. The `988ed94` diagnostic and old September submission remain separate;
  they do not become current passing evidence through editing.

## After the pitch

- [ ] If a care happened live, attribute it:
      `node docs/qa/counter-check.mjs <baseline block> <after block>`.
      Exactly one `Cared` event from the pitch wallet with the receipt's
      transaction hash means the +1 was ours.
- [ ] Record what actually happened, including anything that failed, in the
      QA folder. Keep failures as failures.
