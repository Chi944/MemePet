# Finale runbook — community segment and network failure

For the 7 October 2026 finale. Covers the community/garden part of the
three-minute demo and what to do when the network or the chain misbehaves.
The overall pitch script and timing are the lead's; this is a proposal for
Larm's part plus a failure playbook the whole team can use.

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

### 2. The garden will almost certainly not bloom live

| When | `communityStats(1)` | Source |
|---|---|---|
| 2026-09-30 02:59:56 UTC, block 42 278 359 | **4** | `node docs/qa/counter-check.mjs` |

Blooming needs 20. Sixteen more genuine confirmed cares, at most one per
wallet per UTC day, is unlikely to happen organically before the pitch.

- **Show the garden as it really is** — the true total, sprouting, with how
  many cares remain. That is the honest story and it demonstrates the product.
- If the team's own wallets push the total to 20, it is real and may be shown,
  but say it plainly: **team cares, not community adoption.**
- The fictional preview at `/dev/community` shows a bloom, but it is a labelled
  fixture and `/dev/*` is 404 in production. Never present it as live.

## Proposed community segment (≈ 30 s)

For the lead to fit into the three minutes.

1. Point at the community total: *"Every confirmed care adds one here — it
   counts care actions, not people."*
2. Point at the garden: *"When the community reaches 20 confirmed cares, the
   garden blooms. It's a goal inside the app — no token, no reward. We're at
   [real total] now."*
3. If a reference is configured, one line: *"Themed around an X Layer meme
   community — a reference, not a partnership."* If identity is
   `unconfigured`, skip this line.

Read the real total off the screen at the time. Do not quote a number from
this document.

## Pre-flight

### The day before

- [ ] Codex has named the release SHA to demo; confirm the hosted site serves
      a deployment built from it.
- [ ] `/dev/pet`, `/dev/landing`, `/dev/community` all return 404 on the hosted
      site.
- [ ] Phone hotspot tested with the demo laptop: the site loads and the
      registry reads succeed over it.
- [ ] A **genuine** backup recording exists (see below), made on the release
      being demoed, and plays offline from the laptop.
- [ ] Reduced motion checked on the release with the OS setting on — QA matrix
      row A3. Deston's machine is the natural test.
- [ ] Browser zoom and font size are legible from the back of a room.

### Morning of 7 October

- [ ] **The pitch wallet has not cared since 08:00 SGT today.**
- [ ] Take a counter baseline: `node docs/qa/counter-check.mjs`. Note the block.
- [ ] Open the hosted site once in a clean profile. No console errors.
- [ ] Close unrelated tabs and notifications. Nothing private on screen.
- [ ] Backup recording opened and paused on its first frame, one click away.

## When things go wrong

Decide fast. Do not debug on stage.

| What happens | What to do |
|---|---|
| Venue Wi-Fi is down | Switch to the pre-tested hotspot. If it is still down after ~10 s, go to the backup recording |
| Community total shows **Unknown** or "could not be loaded" | Say so — it is the honest-state design working: *"it never invents a number when the chain can't be read."* Press **Retry reading** once. If it stays unavailable, carry on, or go to the backup |
| Wallet prompt does not appear | Do not wait more than ~15 s. Move on; show the confirmed part from the backup |
| Transaction stays pending | Say *"progress appears only after the receipt confirms"* — true, and a feature. Continue the talk and come back; if it has not confirmed by the end, the backup shows a confirmed care |
| Wrong network | Use **Switch network** in the app |
| Wallet or browser shows a **security warning** | **Do not approve it.** Go to the backup. Never bypass a warning on stage |
| Care is refused as already cared today | The cooldown trap above has been hit. Show the cooldown message — it demonstrates the once-a-day rule — and use the backup for the care itself |
| Garden total is lower than expected | Show it as it is. Never switch to the preview to make it look further along |

## The backup recording

- Made on the demoed release, of a **genuine** care: real wallet, real
  receipt, real total before and after.
- The screen says, for the whole recording, that it is a recording — for
  example *"Recorded [date, time] — not live"* — not just the narrator.
- Say out loud when switching to it: *"This is a recording from [date]."*
- Never present a recording, a fixture or the preview as live. A backup that
  is labelled is fine; one that is passed off as live is not.

## After the pitch

- [ ] If a care happened live, attribute it:
      `node docs/qa/counter-check.mjs <baseline block> <after block>`.
      Exactly one `Cared` event from the pitch wallet with the receipt's
      transaction hash means the +1 was ours.
- [ ] Record what actually happened, including anything that failed, in the
      QA folder. Keep failures as failures.
