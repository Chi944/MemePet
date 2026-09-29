# Shared finale contract

Read the actual TypeScript definitions before implementation. These are the
single source for prop names; do not invent parallel schemas in UI folders.

| New component export | Shared props | Owner |
|---|---|---|
| `PersonalityPanel` | `PersonalityPanelProps` in `src/types/companion.ts` | Kym |
| `CompanionPanel` | `CompanionPanelProps` in `src/types/companion.ts` | YeeWei |
| `FinaleCommunityPanel` | `FinaleCommunityPanelProps` in `src/types/finale-community.ts` | Larm |

The lead owns these types and `src/fixtures/finale-fixtures.ts`. Existing
`src/types/view-models.ts` exports remain compatible. Preserve old component
exports. If an input is absent, request it in the draft PR; do not implement a
private data adapter to work around it.

Available fixture collections are `companionFactsFixtures`,
`companionReplyFixtures`, `personalityFixtures`, `communityMissionFixtures` and
`communityIdentityFixtures`. Identity examples deliberately use invalid addresses
and a `.invalid` source URL. The AI-style example is handwritten fiction.

F0 also implements pure lead-owned helpers in `src/lib/companion/personality.ts`,
`src/lib/companion/standard-reply.ts` and `src/lib/map-community-mission.ts`.
The lead's live adapters are described below. Teammates still consume
props/callbacks rather than adding persistence, fetching or progression logic.

## Lead adapters — 30 September

`useCompanion({ deployment, address, wrongChain, confirmedBlockNumber,
isWriting })` returns `companion: CompanionPanelProps` and
`personality: PersonalityPanelProps`. Mount it once in the wallet route, pass
the actual registry hook's `confirmedBlockNumber` and `isSubmitting` as
`isWriting`, and spread those returned props into the reviewed panels. Codex
owns this final route wiring when the component PRs are ready.

The hook reads `/api/companion` initially, after a receipt/write transition,
and on Retry. It does not poll. It rejects stale account/network responses,
regressing block heights and mismatched API scope; writes hide the previous
recap. Asking a bounded question uses the validated snapshot locally and
labels the response `standard`. A retry clears the previous explanation.

`usePersonality` supplies resettable, versioned browser-local preferences,
isolated by chain, registry and wallet. Storage failures report `unavailable`;
failed saves do not award interactions. This hook is already composed by
`useCompanion`; do not mount a second independent store for the same panel.

`useCommunityStats` preserves its existing exports and additionally returns
`finale: FinaleCommunityPanelProps`. Its mission maps the confirmed community
view; identity stays `unconfigured` until Larm's candidate is verified. The
same read-only Retry callback is shared by both community presentations.

The public API fixes its RPC/registry from deployment configuration. It verifies
chain ID, reads pet and community at one block and rechecks that block's hash.
`GET /api/companion` describes the API; `POST` accepts only a public `address`,
optional bounded `question`, and optional decimal `blockNumber`. Responses have
`schemaVersion: 1`, `scope` and `facts`, with `reply` only when requested. No
wallet connection or signature is required. See [service preparation](OKX_AI_SERVICE.md).

These adapters do not make the teammate panels visible in production by
themselves. Their final integration and genuine wallet acceptance are separate
release gates. Public HTTP verification is not an OKX.AI marketplace invocation.

## Exact inputs and meaning

**PersonalityPanel:** `profile`, `storageStatus`, `dataMode`, `onInteract`,
`onReset`. Profile contains version 1, Explore/Practise counts and a
`playful | curious | focused` style. `onInteract` accepts `explore | practise`.
The parent owns persistence and decides when the panel can be offered. A storage
failure must not imply successful saving. It does not alter chain growth/cooldown.

**CompanionPanel:** `facts`, `personality`, `reply`, `onAsk`, `onRetry`.
`onAsk` accepts `progress | next-care | contribution`. Facts distinguish
`needs-wallet`, `wrong-network`, `loading`, `no-pet`, `unavailable` and `ready`.
Ready includes a confirmed snapshot with source chain/registry/account, decimal
block number, block timestamp, observation time, care count, growth/stage,
next-stage threshold, next-care time and nullable community total. The personal
care count and shared total are separate measures, not full transaction history.

Reply kinds are `idle`, `loading`, `unavailable` and `answer`; an answer is marked
`standard | ai`. Show the provenance label. Loading/answer `contextKey` must
match ready facts before display; Codex also discards obsolete responses in the
adapter. Render text safely, never as HTML. F0 supplies no receipt links; show
source fields as evidence and request any additional links through the lead.
Do not manufacture a transaction hash, inferred streak or transfer history.

**FinaleCommunityPanel:** `community`, `mission`, `identity`, `onRetry`.
Mission has title `Mochi garden`, target `20`, fixture/live provenance and
loading/unavailable/ready states. Ready supplies total and `isComplete`.
Use those values rather than an independent completion rule. The garden is a
new cosmetic app rule at 20 lifetime confirmed care actions for registry
community 1; previous cares count and no chain reward is granted. Preserve the
actual total even if the bar caps at 100%. Unknown/error never means zero/bloom.

Identity is `unconfigured` or `verified-reference`, with sourced name, chain,
network label, token address, source URL, check time and data provenance. Display
reference wording, not endorsement/partnership or token-holder claims. A token's
reference network may differ from MemePet's testnet; label both accurately.
There is no personal-contribution prop in this panel; YeeWei's recap supplies it.

## Data and ownership boundaries

Presentation components have no RPC/model clients, localStorage access,
transaction effects or independent progression formulas. Callbacks express
intent; they do not prove success. Separate chain facts, pending writes and
off-chain preferences. Loading, absent pet, wrong network and failed reads are
different. Chain time and the browser's observation time are also different;
never infer successful care from a countdown or optimistic UI update.

Growth remains 10 points per confirmed care and stages remain 0/20/50. A
standard recap is useful without AI. Optional model text cannot add facts or
obscure the confirmed evidence. A free OKX.AI service may expose this deterministic
capability without paying for model wording; its actual invocation is a separate
integration check, not a visual badge.

## Previews and integration

F0 adds `/dev/finale` as a labelled fixture workbench, not finished teammate UI.
Kym extends `PetPreview`; Larm extends `CommunityPreview`. F0 wires
`/dev/companion` to a minimal `CompanionPreview` stub so YeeWei can replace it
with her state inspector immediately. Codex owns all routes and their production
404 gates. No production `CompanionPanel` is implemented by the stub.

Fixtures are fictional. Import collections only in tests or labelled preview
files, not production panel implementations or live adapters. Codex integrates
each reviewed component with real adapters after inspecting the full state shape.
Tests should assert behavior, not merely repeat implementation snapshots:
unknown stays unknown, callbacks fire once, obsolete replies stay hidden and
standard/model/fixture provenance remains distinguishable.

Each PR includes base/head commits, changed paths, actual commands/results,
screenshots/viewing steps, unrun checks and exact integration requests. Shared
contract changes land once through Codex and are communicated to affected lanes.
