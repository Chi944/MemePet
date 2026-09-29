# Finale foundation verification — 29 September 2026

Scope: F0 on `feat/finale-foundation`, based on known main
`fa78ed0459f9e1cddd9a84e5100c91da682339d1`. This is new finale preparation,
not a claim about the exact originally submitted revision.

## Delivered

- Shared component interfaces and strictly fictional fixture collections for
  Kym, Larm and YeeWei; original component props remain compatible.
- `/dev/finale` fixture inspector and `/dev/companion` starter preview. Existing
  pet/community previews give the other two lanes independent entry points.
- Pure helpers for validated personality preferences, grounded standard replies,
  and the deliberate 20-confirmed-care cosmetic garden rule.
- Named file ownership, role sheets with starter prompts, integration rules and
  a finale schedule. The helpers/new presentation features are not wired live.

## Automated checks actually run

Windows, Node `v24.19.0`, npm `11.19.0`:

| Command/check | Result |
|---|---|
| `npm run typecheck` | PASS; repeated `npx tsc --noEmit` after adding companion preview also passed |
| `npm run lint` | PASS, 0 errors; existing `ShareImage.tsx` image-element warning remains |
| `npm test` | PASS: 132 tests / 24 files |
| `node --test docs/qa/counter-check.regression.mjs` | PASS: 8 |
| `forge test --root contracts` | PASS: 15; executable invoked by its local absolute path |
| `npm run build` | PASS, repeated after both new routes existed |
| Production HTTP checks on `127.0.0.1:3450` | `/` = 200; `/dev/pet`, `/dev/landing`, `/dev/community`, `/dev/finale`, `/dev/companion` = 404 |
| `git diff --check` | PASS |

The new stub also passed targeted ESLint. Independent code and handoff review
reported no actionable findings. The temporary production server was stopped.
CI repeats checks on the published PR; its result is recorded on GitHub.

## Limits

No real wallet actions or browser visual checks were performed for F0. It changes
no contract, wallet integration or deployed game rule. Standard text is generated
without a model. The garden threshold is an app presentation rule awaiting live
integration, not a token reward or a newly claimed chain event.

The previously observed automatic community refresh failure remains open.
OKX.AI registration, a real client invocation, optional model access and a sourced
community identity remain unverified. No paid services or new dependencies were
introduced. Teammates must still implement their assigned components, then the
combined product requires new automated and genuine browser-wallet acceptance.
