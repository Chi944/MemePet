# B3 help content: sources and link checks

Content: [`src/content/help.ts`](../../../../src/content/help.ts). Checked against
`main` at `b4e9b85` (#85) on 2 October 2026; `ce77d1a` (#86) changes docs only. Each answer states only behaviour
found in that code. Anything not wired into a live route is called **planned**.

## Claims and where they come from

| Entry | Claim | Source on `b4e9b85` |
|---|---|---|
| `testnet-wallet-gas` | Injected browser wallet; explicit choice when several are installed; no QR/WalletConnect | `src/lib/wallet-providers.ts`, `WalletProviderPicker.tsx`, `useWallet.ts` (`selectionRequired`), `docs/qa/WALLET_SETUP.md` |
| | X Layer testnet 1952, gas paid in testnet OKB | X Layer network information page (below); `NEXT_PUBLIC_MEMEPET_CHAIN_ID` usage in `src/lib/deployment.ts` |
| `one-care-per-day` | One care per wallet per UTC day, enforced on-chain | `contracts/src/PetRegistry.sol` `care()` (`AlreadyCaredToday`) |
| | Panel shows the next time in UTC | `src/lib/care-cooldown.ts`, `CarePanel.tsx` (`timeZone: "UTC"`) |
| `missed-days` | No decay; +10 growth per care; Buddy 20, Guardian 50 | `PetRegistry.sol` (count only increments), `src/lib/pet-progress.ts` |
| `confirmed-vs-local` | On-chain: adoption, care count, last care day, community total | `PetRegistry.sol` `petOf` / `communityStats` |
| | Local only: personality style/counts per browser and wallet; Animate Mochi | `usePersonality.ts`, `PersonalityPanel.tsx` ("local to this browser and wallet context"), `useMochiMotion.ts` |
| `read-failures` | Unknown instead of 0; Retry buttons only read | `src/app/pet/pet-live-client.tsx` ("Retry pet read", "Retry community total", "Retry only reads the chain") |
| `pending-transaction` | Pending awards no progress; success message | `CarePanel.tsx` pending/success states |
| | Resume after reload and Check status are **planned** | `docs/beta/START_HERE.md` (B5 gated); `src/lib/pending-transaction-*.ts` have no live importer; recovery cases skipped in #85 |
| `disconnect-approvals` | Revoke attempt, manual fallback message, no token approvals, no value sent | `useWallet.ts` `disconnect` (`wallet_revokePermissions`), `pet-live-client.tsx` disconnect messages, `WALLET_SETUP.md` |
| `public-pet` | Public page by address; visitors cannot care | `src/app/pet/[address]/page.tsx` ("Visitors cannot care for someone else's pet"), `SharePetLink` |
| `milestones-money` | No token/NFT/marketplace/payouts | `docs/PROJECT_BRIEF.md`, `PetRegistry.sol` (not payable, no transfers) |
| | Milestones 5/10/20 and chapters 20/50/100 are **planned** | `src/lib/beta-progress.ts` has no live route/component importer; Kym's B1 PR not open yet |
| `report-bug` | No monitored contact yet | `SUPPORT_URL = null`; see [bug-report checklist](BUG_REPORT_CHECKLIST.md) |

## Link checks (2 October 2026)

Each link was opened and its page title or content read. No account, faucet
claim or wallet action was made.

| Link | Result |
|---|---|
| `https://web3.okx.com/download` | 200; title "Download OKX Wallet …". Same link the app already shows. |
| `https://support.metamask.io/start/getting-started-with-metamask/` | 200; title "How to install MetaMask \| MetaMask Help Center" |
| `https://web3.okx.com/xlayer/faucet` | 200; page "X Layer Testnet Faucet", states testnet tokens have no actual value |
| `https://web3.okx.com/onchainos/dev-docs/xlayer/developer/build-on-xlayer/network-information` | 200; lists testnet chain ID 1952, token OKB, explorer below |
| `https://www.okx.com/web3/explorer/xlayer-test` | 200 after redirect to `web3.okx.com/explorer/x-layer-testnet`; this is the explorer URL the official network page lists |
| `https://support.metamask.io/more-web3/dapps/disconnect-wallet-from-a-dapp/` | 200; title "How to disconnect a wallet from a dapp \| MetaMask Help Center" |

No OKX Wallet disconnect page was linked: none was verified, so the answer
points to the wallet's connected-sites settings instead (the app's own wording).

## Not claimed

No support email, response time, privacy certification, partnership, mobile
wallet-browser support or WalletConnect. The Singapore time (08:00 UTC+8) is
arithmetic from 00:00 UTC, not a product feature.
