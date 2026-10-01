# Free OKX.AI service: registration handoff

Prepared **30 September 2026**; official documentation and the endpoint's source
contract reviewed again **1 October 2026 (Singapore)**. This is the registration
packet for the deployed bounded endpoint. [Direct HTTPS checks
passed](../qa/evidence/FINALE_SERVICES_2026-09-30.md); **the ASP is not registered,
not accepted/listed, and has not been invoked through OKX.AI**. The 1 October
review is documentation/source review, not a new invocation or approval.

## Listing fields

| Field | Value |
|---|---|
| Service name | `MemePetVerifiedRecap` |
| Type | A2MCP, free read-only API |
| Price per call | `0` |
| Verified endpoint | `https://memepet.vercel.app/api/companion` |
| Method / content type | `POST` / `application/json` |
| API metadata | `GET` at the same URL; OpenAPI 3.1 metadata verified after PR #57 |

### Four-part service description packet

The official [listing field reference](https://github.com/okx/onchainos-skills/blob/main/skills/okx-ai/references/identity/service-contract.md#servicedescription)
describes four numbered sections for an A2MCP service description: capability,
parameter specification, request method, and a complete `curl` example. This
draft describes the existing endpoint; review the actual installed tool's
requirements and the final listing before submission. It is not evidence of
registration. Larm found the earlier `identity-invariants.md` link returned 404;
the lead verified this current replacement on 1 October. Validate the packet
against the installed tool before submission, including its description-length
limit and requirement that the service name differ from the agent name.

```text
1. [Service Description] Read a public wallet's confirmed MemePet progress on X Layer testnet (1952): pet growth, next-care timing and community contribution, with source block/time evidence and an optional standard explanation. Reads only MemePet's configured registry.
2. [Parameter Spec] address(string, required): public EVM wallet address, 0x plus 40 hexadecimal characters, with a valid checksum if mixed case; question(string, optional): progress, next-care or contribution, omitted by default so no reply is requested; blockNumber(string, optional): canonical unsigned decimal block number from 0 through 18446744073709551615, omitted by default to resolve the latest block.
3. [Request Method] POST
4. [Request Example] curl -i -X POST 'https://memepet.vercel.app/api/companion' -H 'Content-Type: application/json' --data-raw '{"address":"0xb7E6D789c39D468CfE3c5dA37C29Bd9852247B3a","question":"progress"}'
```

The example uses the team's previously verified public Account 3 address; it
does not need a wallet connection, signature or secret. The shell example uses
POSIX quoting; preserve the JSON body when adapting it to another shell. Before
listing, actually repeat the call against the deployed endpoint and retain the
response evidence. An unavailable RPC read can still return `503`.

GET describes the API; POST returns the requested facts. The official guide does
not establish automatic OpenAPI discovery. This endpoint does not implement MCP
JSON-RPC initialization or `tools/call`; its prepared integration uses the
documented direct HTTP API route. A real OKX.AI client invocation must establish
compatibility before any integration claim.

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

Codex verifies the actual public response before listing: `200` returns
`schemaVersion: 1`, `scope`, and `facts` (`ready` or `no-pet`), plus `reply` when
a question was supplied. A ready snapshot includes its block number/time and a
nullable community total. `400`, `413` and `415` reject invalid input, bodies
over 1024 bytes and unsupported content types; `408` is a request-body timeout,
`429` is per-instance load shedding, and `503` represents an unavailable read.
Missing pets and failed reads must remain distinct. The metadata describes
response variants in prose, not a complete JSON response schema; verify the
actual result. This packet must not substitute for an endpoint check. Requesting
an older block must label that snapshot's age, not promise current care eligibility.

## Why this can be free

The official [A2MCP guide](https://web3.okx.com/onchainos/dev-docs/okxai/howtomcp)
allows a free HTTPS endpoint to return its result directly with HTTP 200, without
x402. This deterministic recap needs no language-model API. This provision does
not establish free model inference or cover hosting/RPC quotas. Keep public reads
bounded; optional model replies require their separate approved controls.

## Registration sequence and the only private handoff

1. **Codex:** deploy and verify the endpoint, its validation and real RPC results.
   Save the release commit, check time and redacted request/result evidence.
2. **Private authentication owner: Deston.** The documented route uses Onchain
   OS and an Agentic Wallet identity authenticated by email. Codex prepares the
   official setup; Deston completes private login/verification if needed. Do not
   put passwords, one-time codes, keys or wallet recovery material in chat. This
   identity is separate from the existing browser demo wallet; do not import or
   fund a wallet for this read API. See the official
   [installation guide](https://web3.okx.com/onchainos/dev-docs/okxai/agent-installation-guide)
   and [email login sequence](https://web3.okx.com/onchainos/dev-docs/okxai/user-register).
3. **Codex after setup:** inspect the active identity to avoid duplicate
   registration, validate the four-part packet against the installed tool, and
   use the listing fields above to register an A2MCP ASP with price zero. Then
   request marketplace listing. Inspect the concrete flow before submitting; a
   fee, funding, signature or paid-plan requirement is a new decision, not
   implied authorization from this handoff.
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
| Marketplace accepted/listed | PENDING — actual approval, listing URL and status |
| Invoked through OKX.AI | PENDING — client, UTC time, request and returned block/facts |

Until those gates are evidenced, use **“free OKX.AI integration prepared”**, not
“integrated with OKX.AI,” “listed,” or “AI-generated answers.” The recap's
deterministic wording stays labelled **Standard explanation**.
