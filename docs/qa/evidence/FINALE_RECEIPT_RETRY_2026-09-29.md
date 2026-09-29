# Receipt retry classification — 29 September 2026

F1 follow-up to the merged F0 foundation `c296e9e`. Scope: a narrowly reproduced
error-classification gap; no claim that the September 24 live failure's precise
cause has been established. That run did not capture the raw failed RPC error.

## Reproduction and fix

The installed viem wraps RPC code `-32603` with message `header not found` as
`ContractFunctionRevertedError`. The old classifier stopped at that wrapper, so
the outer receipt-read retry did not run after transport retries were exhausted.
A later same-block manual read could succeed once state became available.

The fix looks through only an exact, case-insensitive, trimmed `header not found`
reason with no decoded data, raw payload or signature, and requires a nested
`-32603`. A nested execution-reverted code `3` vetoes retry. Encoded custom errors,
Solidity reasons/panics, unknown errors, explicit revert messages and even an
empty `0x` payload retain their terminal classification.

Read attempts remain bounded to three, pinned to the same receipt block. The
existing transport may retry within each read. Wallet/session cancellation still
discards late responses; no transaction is resent by this helper.

## Actual verification

- Fourteen new regressions use the real viem client/error wrapping with an
  in-memory custom transport, not a mocked `readContract` error shape.
- Recovery is checked both after one transport failure and after the existing
  three transport retries are exhausted; every call retains block `0xb`.
- Tests cover genuine revert variants, retry exhaustion, cancellation during the
  delay and a successful response arriving after the session changed.
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` and
  `node --test docs/qa/counter-check.regression.mjs` passed: **146 app tests / 25
  files**, **8 counter regressions**, no lint errors and one existing ShareImage
  warning. Independent code review found no actionable findings.
- CI repeats the production build, preview gates and contract tests for the PR.

## Required live follow-up

No real wallet request was made in this task. The previous browser result stays
**automatic community read-back: failed; read-only retry: passed**. A fresh
genuine eligible care on the new deployed runtime must still verify automatic
pet and community results without refresh or manual retry. Capture the receipt,
runtime revision, resulting read status and any sanitized RPC error. Do not
label the complete F1 live acceptance passed from these regressions alone.
