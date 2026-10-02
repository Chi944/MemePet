# Beta preview and read-only pet retry — 2 October 2026

Lead integration from main `1a2b120` (includes reviewed #82/#83 and evidence
PR #84). The associated PR records the final tested source and release SHAs.
These are automated and fictional-browser results, **not genuine wallet
acceptance**. No signature, public-chain write or paid service was used.

## Changes

- `/pet` exposes **Retry pet read** after failed reads. While reading, the
  control stays focusable but inert and is labelled **Reading pet…**. The
  failure is not presented as a missing pet or zero growth.
- The hook guards scope, failure state and concurrent work. Repeated clicks
  start one manual read. Existing read budgets and the background interval
  remain; obsolete responses cannot complete a newer read.
- A current successful receipt establishes a memory-only minimum block.
  A lagging latest block falls back to that known receipt block; unavailable
  or mismatched fallback remains an error. Invalid latest block numbers are
  rejected; immediate receipt read-back also requires the requested height.
  A newer head advances normally. Dismissing the
  notice does not drop this protection; changing wallet/provider/network does.
  No persistent hash journal or B5 recovery runtime was introduced.
- `/dev/beta` renders all nine recovery states, care/adoption labels,
  fictional sample/empty FAQs, callback counter and reset. It has no data or
  wallet hooks, storage or external links. The shared development layout blocks
  it in production; CI now explicitly checks its 404 response.
- `careAvailable` is a shared fictional companion example. It does not depend
  on the computer clock. The preview navigation links the component workbenches.

## Actual local verification

Windows, Node 24.19 / committed dependencies. No private configuration was
read or modified. The production build used process-local public testnet values.

| Check | Result |
|---|---|
| `npm test` | 639 passed / 50 files |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed; existing ShareImage warning |
| `npm run build` | Passed after fixing three unsupported test-selector options |
| `npm run test:e2e:simulated` | 15 passed, 8 skipped B5 cases |
| `npm run test:e2e:previews` | 3 passed at 320/390/1440px |
| Local production HTTP gate | `/` and `/pet` 200; all six `/dev/*` routes, including `/dev/beta`, 404 |

Twelve new hook cases cover duplicate retry clicks, deadline recovery, interval
replacement, provider changes, a stale head after confirmed receipt/dismissal,
an unavailable receipt-block fallback, invalid latest heights and mismatched
receipt headers. All use mocked RPC/wallet clients. The stricter header check
exposed an old cooldown fixture whose receipt remained at block 10 after its
head moved to 11; the fixture now gives the new care a matching block-11 receipt.
The existing failure-recovery Chromium scenario now clicks Retry pet read,
holds its response, checks focus/loading and repeated Enter, and verifies
read recovery without any write/sign/network-change call.

The new preview suite checks every recovery state, no horizontal overflow,
one h1, callback-only behavior, inert/focusable checking, native FAQ Enter/Space,
reset and empty-help behavior. Browser requests to APIs or non-local resources
are blocked and asserted absent. Visual inspection found the outward FAQ focus
outline crowded the answer; added spacing and a browser clearance assertion
pass at all three widths. Screenshots below come from the corrected run.
The preview suite keeps its report/output in dedicated subfolders; running it
after the simulated suite preserves both sets of browser evidence.

- [Keyboard-open help at 320px](beta-preview-2026-10-02/help-keyboard-320.png)
- [Replaced transaction preview at 1440px](beta-preview-2026-10-02/recovery-replaced-1440.png)

## Not established

No new genuine wallet/transaction acceptance. No recovery after refresh.
The eight B5 placeholders stay NOT RUN. No live `/help`, real support contact
or Kym onboarding/progression integration is claimed. Preview keyboard checks
are not a screen-reader or physical-device audit. The dated companion report
in #84 remains evidence of its own tested revision.

YeeWei's updated beta brief continues from the functioning preview. Kym and
Larm retain their existing assignments; the lead owns live route integration.
