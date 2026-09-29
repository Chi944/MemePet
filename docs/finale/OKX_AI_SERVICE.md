# Free OKX.AI service: registration handoff

Prepared **30 September 2026** from current official documentation. This is the
registration packet for the deployed bounded endpoint. [Direct HTTPS checks
passed](../qa/evidence/FINALE_SERVICES_2026-09-30.md); **registration, listing
and invocation through OKX.AI remain pending**.

## Listing fields

| Field | Value |
|---|---|
| Service name | `MemePetVerifiedRecap` |
| Type | A2MCP, free read-only API |
| Price per call | `0` |
| Verified endpoint | `https://memepet.vercel.app/api/companion` |
| Method / content type | `POST` / `application/json` |
| Discovery metadata | `GET` at the same URL; OpenAPI 3.1 metadata verified after PR #57 |

**Description to paste:**

> Read a public wallet's confirmed MemePet progress on X Layer testnet (1952).
> Return pet growth, next-care timing and community contribution with source
> block/time evidence and a labelled standard explanation. Limited to MemePet's
> configured registry; no signing, payments or full wallet-history analysis.

The configured testnet registry is
`0xe844152262D243a7B90F6e07FF7A67F1d7FeD216`. This service reads that registry
directly; it does not imply that OKX's wallet-history APIs support chain 1952.

## Endpoint contract to verify before registering

Request fields: required public `address`; optional `question` equal to
`progress`, `next-care` or `contribution`; optional `blockNumber` as a decimal
string. The server fixes the network/registry. No arbitrary RPC URL, prompt,
token, wallet signature or secret belongs in the request.

```json
{
  "address": "0xb7E6D789c39D468CfE3c5dA37C29Bd9852247B3a",
  "question": "progress"
}
```

Codex verifies the actual public response before listing: `200` returns the
read result with facts and a standard reply where applicable; `400`, `413` and
`415` reject invalid input, excessive bodies and unsupported content types;
`503` represents an unavailable read. Missing pets and failed reads must remain
distinct. Inspect deployed metadata for the final response schema; this packet
must not substitute for an endpoint check. Requesting an older block must label
that snapshot's age, not promise current care eligibility.

## Why this can be free

The official [A2MCP guide](https://web3.okx.com/onchainos/dev-docs/okxai/howtomcp)
allows a free HTTPS endpoint to return its result directly with HTTP 200, without
x402. This deterministic recap needs no language-model API. This provision does
not establish free model inference or cover hosting/RPC quotas. Keep public reads
bounded; optional model replies require their separate approved controls.

## Registration sequence and the only private handoff

1. **Codex:** deploy and verify the endpoint, its validation and real RPC results.
   Save the release commit, check time and redacted request/result evidence.
2. **Private setup, if needed:** the documented route uses Onchain OS and an
   Agentic Wallet identity authenticated by email. Deston completes the private
   login/verification in the official flow. Do not put passwords, one-time codes,
   keys or wallet recovery material in chat. This identity is separate from the
   existing browser demo wallet; do not import or fund a wallet for this read API.
3. **Codex after setup:** use the listing fields above to register an A2MCP ASP
   with price zero, then request marketplace listing. Inspect the concrete flow
   before submitting; a fee, funding, signature or paid-plan requirement is a new
   decision, not implied authorization from this handoff.
4. **Codex:** record the returned service ID, listing URL and actual status. The
   [registration guide](https://web3.okx.com/onchainos/dev-docs/okxai/registerasp)
   describes a separate review and an email result, with a stated 24-hour review
   period. That is documentation, not a promised completion time for this team.
5. **Codex:** invoke the listed service through the intended OKX.AI client using a
   public demo address. Compare its facts with the endpoint's matching block and
   save the actual invocation evidence. A direct HTTP call alone is insufficient.

No available OKX registration tool was found in this session's tool metadata.
No Onchain OS package was installed, no identity created and no registration
submitted during this preparation. Setup access is a distinct later step; the
working MemePet app and standard recap do not depend on marketplace approval.

## Release evidence: fill only after each action occurs

| Gate | Current evidence / status |
|---|---|
| Implementation and automated checks | PASS at the 30 September code checkpoint — 271 app tests, 15 contract tests, 8 counter regressions, typecheck/lint/build; [dated evidence](../qa/evidence/FINALE_SERVICES_2026-09-30.md) |
| Local HTTP backed by real testnet reads | PASS — Account 3 at block 42247147 matched an independent RPC read; historical block, no-pet and invalid-input cases also checked |
| Public HTTPS endpoint verified | PASS — PR #57, commit `3c9cdd0`; 29 September 18:26:46Z, Account 3 at block 42247566 matched independent RPC; [evidence](../qa/evidence/FINALE_SERVICES_2026-09-30.md) |
| ASP registered | PENDING — actual service ID |
| Marketplace listed | PENDING — actual listing URL and status |
| Invoked through OKX.AI | PENDING — client, UTC time, request and returned block/facts |

Until those gates are evidenced, use **“free OKX.AI integration prepared”**, not
“integrated with OKX.AI,” “listed,” or “AI-generated answers.” The recap's
deterministic wording stays labelled **Standard explanation**.
