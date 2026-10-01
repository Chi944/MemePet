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

**Deston is the only signer.** Nobody else connects, approves, adopts or cares.

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

Blooming needs 20. At the recorded total of 7, 13 more genuine confirmed
cares remain. Each wallet can care at most once per UTC day. Use the actual
total on stage; this table is a dated observation, not a forecast.

- **Show the garden as it really is** — the true total, sprouting, with how
  many cares remain. That is the honest story and it demonstrates the product.
- If the team's own wallets push the total to 20, it is real and may be shown,
  but say it plainly: **team cares, not community adoption.**
- The rise from 4 to 7 came from three team demo wallets within 44 blocks.
  Chain evidence is in `INTEGRATED_QA_2026-09-30.md`; Deston's prior account
  attribution is recorded in [the lead's read-recovery evidence](../../evidence/COMMUNITY_INITIAL_READ_2026-09-30.md).
  These are team cares, not evidence of outside-user adoption.
- The fictional preview at `/dev/community` shows a bloom, but it is a labelled
  fixture and `/dev/*` is 404 in production. Never present it as live.

## Three-minute flow (proposal)

Written for the release at `7d4144b`. Labels in quotes are the app's own text.
**Recheck the recap labels after YeeWei's F6 merges**, because F6 reworks that
panel. F6 is planned to move "Read block" into a closed "View verified evidence"
disclosure; if it does, open that disclosure before pointing at the block
(`COMBINED_REGRESSION_CHECKLIST.md`, row S1).

The care confirmation is the only step whose length we do not control. Its
slot below is a **buffer**, not a measurement. Time it in the rehearsal, from
approving in the wallet to "Confirmed", and adjust. On 30 September, X Layer
testnet produced roughly one block per second; that is not a receipt time.

| Time | Screen | What to show and say |
|---|---|---|
| 0:00–0:20 | Overview `/` | The idea in one line: *"Adopt a meme-community mascot. A little daily care grows your pet and the community's garden."* No token to buy |
| 0:20–0:40 | Pet home `/pet`, connected | The real pet: stage, growth points, "Ready" in **Daily care**. *"Everything here is read from the registry on X Layer testnet."* |
| 0:40–1:30 | **Daily care** | Press care. In the wallet: approve (Deston only). The badge moves "In your wallet" → "Pending" → "Confirmed". **This is the buffer.** While it is pending, say: *"No progress is awarded until the receipt confirms."* When it confirms: "Care is confirmed. Your pet's progress is up to date." Expected: growth **+10** (automatic read-back on this release is still NOT RUN; check in rehearsal) |
| 1:30–1:55 | Garden (same page) | Expected: the garden total is one higher. **The automatic garden update after a new care has not been observed live yet** (QA row X3), so check it in the rehearsal. If it has not moved, press **Retry reading** once. *"Every confirmed care adds one here. It counts care actions, not people. At 20 the garden blooms. It's a goal inside the app: no token, no reward. We're at [read it off the screen]."* One line for the reference: *"Themed around XDOG, an X Layer meme community. A reference, not a partnership."* |
| 1:55–2:20 | **Read-only recap** | Ask "Explain progress". Point at the label **"Standard explanation"** and at "Read block" / "Block time". *"Every answer is a standard explanation of confirmed activity, and it shows the block it was read from."* |
| 2:20–2:50 | **Mochi, your way** | With that answer still on screen, press "Explore interactions" or "Practise interactions". The style line changes (curious when Explore leads, focused when Practise leads, playful when balanced) and the same answer is reworded, with the same facts and the same Read block. *"This changes how Mochi explains, not the facts. It is stored only in this browser, earns no growth and trains no model."* |
| 2:50–3:00 | — | Close. If the care did not confirm, say so and use the backup (below) |

If the care is still pending at 1:30, go on to the garden and the explanation
style, then come back to **Daily care** at the end. Whether the page shows the
confirmation without a reload is a rehearsal check, not a promise. Do not
reload while the care is pending.

### Words to use, words to avoid

| Say | Do not say |
|---|---|
| "care actions" / "confirmed cares" | "users", "holders", "members", "people", "community growth" |
| "team demo cares" (for today's total) | "organic", "traction", "adoption" |
| "explanation style" / "Mochi explains differently" | "Mochi learns", "AI personality", "trained", "smart" |
| "Standard explanation" | "AI answer", "the model says" |
| "a reference to XDOG" | "partnered with", "endorsed by", "official XDOG app" |
| "a free read-only service is prepared" | "listed on OKX.AI" (it is **not registered**) |
| "no token, no rewards" | "earn", "rewards", "airdrop" |

## Pre-flight

### The day before

- [ ] Codex has named the release SHA to demo; confirm the hosted site serves
      a deployment built from it.
- [ ] `/dev/pet`, `/dev/landing`, `/dev/community`, `/dev/finale` and
      `/dev/companion` all return 404 on the hosted site.
- [ ] Phone hotspot tested with the demo laptop: the site loads and the
      registry reads succeed over it.
- [ ] A **genuine** backup recording exists (see below), made on the release
      being demoed, and plays offline from the laptop.
- [ ] Reduced motion checked on the release with the OS setting on — QA matrix
      row A3. Deston's machine is the natural test.
- [ ] Browser zoom and font size are legible from the back of a room. Start
      from **150% browser zoom on a 1920×1080 output** (125–150% on 1440×900);
      layout was checked at these zooms in `READABILITY_QA_2026-10-01.md`.
      Set it with Ctrl +/−, not the OS display settings.
- [ ] Pitch wording reflects the documented team demo cares. Attribute any
      later increase separately; the counter counts actions, not people.
- [ ] Timed rehearsal done on the demo release, with the **rehearsal**
      wallet. Write down how long the care took from approval to "Confirmed",
      and set the 0:40–1:30 buffer from it. Also note whether growth and the
      garden total updated **without a reload** (QA row X3); if not, plan the
      Retry press into the script.
- [ ] Recap labels rechecked after F6 merges ("Explain progress",
      "Standard explanation", "Read block"); this runbook updated if they
      changed.

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
| Community total shows **Unknown** or "could not be loaded" | Classified temporary read failures receive up to two automatic retries (#64). Unknown alone does not establish the cause or prove retries ran. Say *"the total is unverified, so the app does not invent a number."* Press **Retry reading** once. If it stays unavailable, carry on, or go to the backup |
| Mochi is not moving | Check "Animate Mochi" — it was probably switched off earlier. One press turns it on. It changes only the artwork, never the pet's data |
| Wallet prompt does not appear | Do not wait more than ~15 s. Move on; show the confirmed part from the backup |
| Transaction stays pending | Say *"progress appears only after the receipt confirms"* — true, and a feature. Continue the talk and come back; if it has not confirmed by the end, the backup shows a confirmed care |
| Wrong network | Use **Switch network** in the app |
| Wallet or browser shows a **security warning** | **Do not approve it.** Go to the backup. Never bypass a warning on stage |
| Care is refused as already cared today | The cooldown trap above has been hit. Show the cooldown message — it demonstrates the once-a-day rule — and use the backup for the care itself |
| Garden total is lower than expected | Show it as it is. Never switch to the preview to make it look further along |
| **Mochi, your way** is missing | It is shown only for a connected, adopted pet on the right network, and it hides while a care is being written. Wait for "Confirmed", or skip this beat |
| "Browser saving is unavailable" appears | Say: *"Preferences aren't saved in this browser right now; the facts are unaffected."* Carry on |
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
- The plan is not footage. Until it is captured, the backup does not exist.

## After the pitch

- [ ] If a care happened live, attribute it:
      `node docs/qa/counter-check.mjs <baseline block> <after block>`.
      Exactly one `Cared` event from the pitch wallet with the receipt's
      transaction hash means the +1 was ours.
- [ ] Record what actually happened, including anything that failed, in the
      QA folder. Keep failures as failures.
