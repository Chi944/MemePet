# Backup recording — shot list

A plan for the labelled backup that the finale runbook falls back on. **This is
a plan, not footage.** Nothing here has been recorded. Until Deston captures it
on the final release, there is no backup.

The shots follow the three-minute flow in [`FINALE_RUNBOOK.md`](FINALE_RUNBOOK.md),
so the backup can stand in for any single beat or for the whole demo.

## Rules that apply to every shot

- **Permanent label.** "Recorded [date, time SGT] — not live" stays on screen
  for the entire recording, in a corner that hides no app content. Burn it into
  the exported video; a title card at the start is not enough.
- **Genuine only.** It must be a real wallet, a real care, a real receipt, and
  the real garden total before and after. No fixtures, no `/dev/*` previews, no
  edited numbers, no cut that hides a failure inside a shot.
- **Final release.** Record on the SHA Codex names for the finale. Put the SHA
  and the date in the file name, e.g. `memepet-backup-<sha7>-2026-10-0X.mp4`.
- **Wallet and timing.** Deston signs. Use the **rehearsal wallet**, or the
  pitch wallet **before 08:00 SGT on 7 October**; a later pitch-wallet care
  blocks the stage care (runbook trap 1). The recorded care adds one real team
  care to the garden, so record its transaction hash for attribution.
- **Nothing private on screen.** Only the public wallet address may show; no
  balances in other tabs, no recovery words, no notifications, no unrelated
  tabs or bookmarks. Pause and restart a shot rather than blur afterwards.
- **Legible.** 1920×1080 (or 1440×900) at 100–125% browser zoom, so a projector
  at the back of a room can read the numbers. "Animate Mochi" On.

## Shots

Times are targets for the edited cut. The total stays under three minutes so it
can replace the whole demo.

| # | Target | Screen | Must be visible | Notes |
|---|---|---|---|---|
| 0 | 3 s | Title card | "MemePet — recorded [date, time SGT] — not live", release SHA | The permanent corner label starts here and never leaves |
| 1 | 10 s | Overview `/`, scrolled to the garden | **Live** badge, the garden total **before** the care, "N more confirmed care actions until it blooms" | This is the "before" number. Hold still long enough to read it |
| 2 | 10 s | Pet home `/pet`, connected | Wallet address (public), X Layer testnet, pet stage, growth points, **Daily care** badge "Ready" | Shows the starting state of the pet |
| 3 | 30–60 s, uncut | **Daily care** → wallet → back | Care pressed; wallet prompt; approval; badge "In your wallet" → "Pending" → "Confirmed"; "Care is confirmed. Your pet's progress is up to date." | **One continuous take, no cuts**, so the wait is real. Speed it up in the edit only if the speed-up is shown on screen (e.g. "×4") |
| 4 | 10 s | Pet home after confirmation | Growth **+10** compared with shot 2. Stage change if a threshold was crossed | Note whether this appeared with **no reload** (QA row X3). If a reload or **Retry reading** was needed, keep it in the shot |
| 5 | 10 s | Garden after confirmation | Total **one higher** than shot 1 | Same as shot 4: keep any reload or Retry visible |
| 6 | 10 s | The transaction | Transaction hash from the app or wallet, plus a receipt with status success: the OKX explorer page, or `node docs/qa/counter-check.mjs <before> <after>` showing one `Cared` event from this wallet with that hash | If the explorer asks for a login, do not log in; use the counter-check output |
| 7 | 5 s | **Daily care** again | "Done today" and "Care is available again at …" | Shows the once-per-UTC-day rule without a second transaction |
| 8 | 20 s | **Read-only recap** | Ask "Explain progress"; the **"Standard explanation"** label; "Read block" and "Block time" | Recheck these labels against F6 before recording. If "Read block" sits inside "View verified evidence", open it on camera |
| 9 | 20 s | **Mochi, your way** | With shot 8's answer still visible, press "Explore" (and/or "Practise"); the style line and the counts change; the same answer is reworded with **the same facts and the same Read block** | One take, so the unchanged Read block is visible before and after |
| 10 | 5 s | Overview card | "Say hello to Mochi" greeting (optional) | Skip if time is short |

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
