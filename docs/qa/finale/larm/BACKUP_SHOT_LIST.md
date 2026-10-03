# Backup recording — shot list

A plan for the labelled backup that the finale runbook falls back on. **This is
a plan, not footage.** The genuine care recording (shots 0–9) has not been made.
Until Deston captures it on the final release, there is no backup for the care.

**Prepared 3 October (read-only, no wallet):** four labelled clips of release
`3148238`: overview → garden, shot 10 (greeting), shot 11 (earned forms) and
`/help`. See [BACKUP_READONLY_2026-10-03.md](BACKUP_READONLY_2026-10-03.md).
They do not replace any wallet shot.

The shots follow the three-minute flow in [`FINALE_RUNBOOK.md`](FINALE_RUNBOOK.md),
so the backup can stand in for any single beat or for the whole demo.

## Rules that apply to every shot

- **Permanent label.** "Recorded [date, time SGT] — not live" stays on screen
  for the entire recording, in a corner that hides no app content. Burn it into
  the exported video; a title card at the start is not enough.
- **Genuine only.** It must be a real wallet, a real care, a real receipt, and
  the real garden total before and after. No fixtures, no `/dev/*` previews, no
  edited numbers, no cut that hides a failure inside a shot.
- **Final release.** Record on the SHA Codex names for the finale. On
  3 October that is expected to be `3148238` or later
  ([rerun](COMBINED_QA_2026-10-03.md)). Production moved to `a83f342` on
  3 October; it changes QA documents only. Confirm with Codex before recording. Put the SHA
  and the date in the file name, e.g. `memepet-backup-<sha7>-2026-10-0X.mp4`.
- **Wallet and timing.** Deston signs. Use the **rehearsal wallet**, or the
  pitch wallet **before 08:00 SGT on 7 October**; a later pitch-wallet care
  blocks the stage care (runbook trap 1). The recorded care adds one real team
  care to the garden, so record its transaction hash for attribution.
- **Nothing private on screen.** Only the public wallet address may show; no
  balances in other tabs, no recovery words, no notifications, no unrelated
  tabs or bookmarks. Pause and restart a shot rather than blur afterwards.
- **Legible.** Match the runbook: 1920×1080 at **150%** browser zoom (125–150%
  on 1440×900), so a projector at the back of a room can read the numbers.
  An emulated layout check on 2 October found no overflow at 150%; the
  smallest text is about 10 px of output at 100%, too small to film. The
  projector check is still a rehearsal task. "Animate Mochi" On.
- **One wallet extension.** Record in a browser profile with only the
  recording wallet enabled, so a reload does not stop on "Choose your wallet"
  (see the runbook pre-flight).

## Shots

Times are targets for the edited cut. The total stays under three minutes so it
can replace the whole demo.

| # | Target | Screen | Must be visible | Notes |
|---|---|---|---|---|
| 0 | 3 s | Title card | "MemePet — recorded [date, time SGT] — not live", release SHA | The permanent corner label starts here and never leaves |
| 1 | 10 s | Overview `/`, scrolled to the garden | **Live** badge, the garden total **before** the care, "N more confirmed care actions until it blooms" | This is the "before" number. Hold still long enough to read it |
| 2 | 10 s | Pet home `/pet`, connected | Wallet address (public), X Layer testnet, pet stage, growth points, **Daily care** badge "Ready"; the Getting started card "Ready for a little care" may be in frame | Shows the starting state of the pet |
| 3 | 30–60 s, uncut | **Daily care** → wallet → back | Care pressed; wallet prompt; approval; badge "In your wallet" → "Pending" → "Confirmed"; "Care is confirmed. Your pet's progress is up to date." | **One continuous take, no cuts**, so the wait is real. Speed it up in the edit only if the speed-up is shown on screen (e.g. "×4") |
| 4 | 10 s | Pet home after confirmation | Growth **+10** compared with shot 2. Stage change if a threshold was crossed | Note whether this appeared with **no reload** (QA row X3). If a reload or **Retry reading** was needed, keep it in the shot |
| 5 | 10 s | Garden after confirmation | Total **one higher** than shot 1 | Same as shot 4: keep any reload or Retry visible |
| 6 | 10 s | The transaction | Transaction hash from the app or wallet, plus a receipt with status success: the OKX explorer page, or `node docs/qa/counter-check.mjs <before> <after>` showing one `Cared` event from this wallet with that hash | If the explorer asks for a login, do not log in; use the counter-check output |
| 7 | 5 s | **Daily care** again | "Done today" and "Care is available again at …" (UTC); below it, the Getting started card "Your next little care" with "Next reset in your local time: …" | Shows the once-per-UTC-day rule without a second transaction. If the card has not switched, film it as it is and note it |
| 8 | 20 s | **Read-only recap** | Ask "Explain progress"; the **"Standard explanation"** label; then **open "View verified evidence"** on camera and show "Read block" and "Block time" | F6 is merged: "Read block" sits inside the disclosure (confirmed 2 October). Open it first, then point. Leave it open for shot 9 |
| 9 | 20 s | **Mochi, your way** | With shot 8's answer still visible, press "Explore" (and/or "Practise"); the style line and the counts change; the same answer is reworded with **the same facts and the same Read block** | One take, so the unchanged Read block is visible before and after |
| 10 | 5 s | Overview card | "Say hello to Mochi" greeting (optional) | Skip if time is short |
| 11 | 10 s | Pet, earned forms (optional) | Select the earned Hatchling: "Viewing Hatchling · Your current stage is Buddy" (for a Buddy), growth unchanged; then "Return to current form" | Optional. Shows earned forms without inventing history. Skip if time is short |
| 12 | 10 s | Milestones (optional) | **Keep growing together**: personal milestones (5/10/20) and garden chapters (20/50/100) with Earned / Not yet earned, and "Cosmetic recognition only: no money, tokens or extra growth points." | Optional. First seen with a real wallet here, so record what it actually shows |

## After recording

Record these in this QA folder (a short dated note), not in the video:

- release SHA, date and time (SGT and UTC), wallet (public address only);
- the care's transaction hash, block and receipt status;
- the garden total before and after, and the counter-check command and output;
- whether shots 4 and 5 needed a reload or Retry (this is real X3 evidence);
- anything that failed or was retaken. Keep failures as failures.

Before relying on it:

- [ ] The label is visible on every frame (scrub through once).
- [ ] It plays offline from the demo laptop, from a local file.
- [ ] It is open and paused on its first frame before the pitch (runbook,
      morning checklist).

## What this plan does not claim

No backup exists yet, and no wallet step listed here has been performed for
it. The shots describe what a genuine recording must show; they are not
evidence that the app behaves that way on the final release.
