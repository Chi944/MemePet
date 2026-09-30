# Community reference candidate — XDOG

Prepared by Larm for task F4, 30 September 2026. **For Codex to verify before
anything is shown live.** This is research, not a configured identity: the
panel stays `unconfigured` until Codex decides.

A reference is not a partnership. Nothing here was obtained by a transaction,
and no permission to use the XDOG name or artwork has been requested or given.

## Recommendation

XDOG is a realistic reference for a meme-community demo on X Layer. It is a
meme token native to X Layer, and OKX Wallet itself announced it on its Boost
Ranking. Its contract address is confirmed by three independent sources.

Use it only as a **factual text reference**: name, network, address, a source
link and a check time. No logo, no price, no holder count, no trading link.
Branding permission is unknown, so if the team wants anything beyond text,
ask the project first. If Codex is not comfortable with that, `unconfigured`
is an honest finale state and the panel already handles it.

## The one thing that must not go wrong

**At least two tokens on X Layer are named XDOG.** Both report `name` and
`symbol` as `XDOG` on-chain:

| Address | Supply | Status |
|---|---|---|
| `0x0cc24c51BF89c00c5afFBfCf5E856C25ecBdb48e` | 1 000 000 000 | **Canonical** — see evidence below |
| `0x0eae5D6bb2C534d20a0452e51479957de49583ca` | ≈ 378.6 trillion | **Not canonical.** Same name and symbol; not the token OKX announced |

Verify by address against an official source, never by name or symbol.

## Proposed identity values

For `CommunityIdentityState`, once Codex has verified them:

| Field | Proposed value |
|---|---|
| `kind` | `verified-reference` |
| `name` | `XDOG` |
| `chainId` | `196` |
| `networkLabel` | `X Layer mainnet` |
| `tokenAddress` | `0x0cc24c51BF89c00c5afFBfCf5E856C25ecBdb48e` |
| `sourceUrl` | https://web3.okx.com/help/announcement-on-xdog-and-penguin-listing-on-okx-boost-ranking |
| `checkedAtIso` | the time Codex re-verifies it, not this document's time |
| `dataMode` | `live` |

The source is OKX's own announcement rather than a token page: OKX's token page
is a trading and price-chart page, and linking a trading view from MemePet
could read as promoting the token.

**The networks differ.** XDOG is on X Layer **mainnet (196)**; MemePet runs on
X Layer **testnet (1952)**. The panel labels the reference network explicitly,
but cannot show both side by side until it receives MemePet's own network as a
prop — the request is open on PR #59.

## Evidence

| Fact | Status | Source and method |
|---|---|---|
| A contract at `0x0cc24c51…b48e` on chain 196 | **Verified** | Read-only RPC to `https://rpc.xlayer.tech` (the mainnet RPC in `src/lib/chains.ts`), chain id `196`, block 71 967 640, 2026-09-30T02:51Z: 12 619 bytes of code |
| `name` / `symbol` / `decimals` / supply | **Verified** | Same read: `XDOG`, `XDOG`, 18, 1 000 000 000 × 10¹⁸ |
| OKX named this exact address | **Verified** | [OKX Wallet announcement](https://web3.okx.com/help/announcement-on-xdog-and-penguin-listing-on-okx-boost-ranking), dated 28 January 2026, lists XDOG on X Layer at this address. HTTP 200 when checked |
| Listed on OKX Boost Ranking | **Verified** | Same announcement. It describes Boost Ranking eligibility and carries OKX's own risk and not-investment-advice disclaimers |
| An independent aggregator agrees | **Verified** | CoinGecko's XDOG page lists this address on X Layer, website `xdog.meme` and `@xdog_meme` |
| Address viewable on an explorer | **Verified** | [OKX explorer address page](https://www.okx.com/web3/explorer/xlayer/address/0x0cc24c51bf89c00c5affbfcf5e856c25ecbdb48e), HTTP 200 |
| The copycat token exists | **Verified** | RPC read of `0x0eae5D6b…83ca`: `XDOG` / `XDOG`, supply ≈ 378.6 trillion |
| The project's own site lists this address | **Not verified** | `xdog.meme` serves a Cloudflare bot-verification page. It was not bypassed. A person should check it in a normal browser |
| The project's X account | **Not verified** | `@xdog_meme` is listed by CoinGecko; the account itself was not read |
| Branding / logo permission | **Unknown** | No media kit or usage terms were found; the site could not be read. **Not requested** |

## Proposed interaction

A read-only reference that gives the garden context: *this demo's shared
garden is themed around an X Layer meme community, and here is which one.*

- Show the name, the network (clearly X Layer mainnet), the address and the
  OKX announcement as source, with the time it was last checked.
- A viewer can confirm the address themselves through the source or the
  explorer.
- That is all. **No** balance read, holder check, token gating, swap or trade
  link, price, market cap, holder count or badge. Caring for Mochi has no
  connection to XDOG, and the panel says so.

Market figures and holder counts were deliberately left out of this document.
They change constantly, the project brief excludes market data, and a holder
count is exactly the kind of number the panel must not display.

## Not found, and not to be claimed

- Any relationship between MemePet and XDOG. There is none.
- Any permission to use the XDOG name beyond factual reference, or its artwork.
- Any claim that MemePet users are XDOG holders, or that caring earns XDOG.
- Other partnership claims by or about XDOG turned up in search summaries but
  were not verified from primary sources and are not relevant to MemePet.

## For the lead to decide

1. Re-verify the address, name and source at display time, and set
   `checkedAtIso` to that time.
2. Decide whether a factual text reference to a real, traded meme token is
   appropriate on stage without the project's permission. Both options — XDOG
   as text, or `unconfigured` — are honest.
3. If artwork is wanted, request permission through XDOG's official channel
   first.
