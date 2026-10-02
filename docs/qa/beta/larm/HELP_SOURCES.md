# B3 help content: sources and link checks

Content: [`src/content/help.ts`](../../../../src/content/help.ts). First checked against
`main` at `b4e9b85` (#85) on 2 October 2026. **Rechecked on 3 October against
`3148238` (#92)**, after the lead updated four sentences for B1 (#91). Each answer
states only behaviour found in that code. Anything not wired into a live route
is called **planned**. Rendered-page checks are in the
[acceptance index](ACCEPTANCE_INDEX.md#release-check-of-help--3-october-2026-row-13).

## Claims and where they come from

| Entry | Claim | Source on `3148238` |
|---|---|---|
| `testnet-wallet-gas` | Injected browser wallet; explicit choice when several are installed; no QR/WalletConnect | `src/lib/wallet-providers.ts`, `src/components/onboarding/WalletChooser.tsx` (replaced the picker in #91), `useWallet.ts` (`selectionRequired` disables Connect), `docs/qa/WALLET_SETUP.md` |
| | The public app runs on X Layer testnet 1952, gas paid in testnet OKB ("public" added by the lead in #91) | X Layer network information page (below); `NEXT_PUBLIC_MEMEPET_CHAIN_ID` usage in `src/lib/deployment.ts` |
| `one-care-per-day` | One care per wallet per UTC day, enforced on-chain | `contracts/src/PetRegistry.sol` `care()` (`AlreadyCaredToday`) |
| | Panel shows the next time in UTC | `src/lib/care-cooldown.ts`, `CarePanel.tsx` (`timeZone: "UTC"`) |
| | Onboarding also shows the same reset in local time; UTC rule unchanged (added in #91) | `OnboardingPanel.tsx` ("Next reset in your local time", "Local time is a guide; confirmed network state determines when you can care") |
| `missed-days` | No decay; +10 growth per care; Buddy 20, Guardian 50 | `PetRegistry.sol` (count only increments), `src/lib/pet-progress.ts` |
| `confirmed-vs-local` | On-chain: adoption, care count, last care day, community total | `PetRegistry.sol` `petOf` / `communityStats` |
| | Local only: personality style/counts per browser and wallet; Animate Mochi | `usePersonality.ts`, `PersonalityPanel.tsx` ("local to this browser and wallet context"), `useMochiMotion.ts` |
| `read-failures` | Unknown instead of 0; Retry buttons only read, including the garden's Retry reading (added in #91) | `src/app/pet/pet-live-client.tsx` ("Retry pet read", "Retry community total", "Retry only reads the chain"), `FinaleCommunityPanel.tsx` ("Retry reading") |
| `pending-transaction` | Pending awards no progress; success message | `CarePanel.tsx` pending/success states |
| | Resume after reload and Check status are **planned** | `docs/beta/START_HERE.md` (B5 gated); at `3148238` no live route, hook or component imports `pending-transaction-*` or `TransactionRecoveryPanel`; 8 recovery cases still skipped |
| `disconnect-approvals` | Revoke attempt, manual fallback message, no token approvals, no value sent | `useWallet.ts` `disconnect` (`wallet_revokePermissions`), `pet-live-client.tsx` disconnect messages, `WALLET_SETUP.md` |
| `public-pet` | Public page by address; visitors cannot care | `src/app/pet/[address]/page.tsx` ("Visitors cannot care for someone else's pet"), `SharePetLink` |
| `milestones-money` | No token/NFT/marketplace/payouts | `docs/PROJECT_BRIEF.md`, `PetRegistry.sol` (not payable, no transfers) |
| | Milestones 5/10/20 and chapters 20/50/100 are **live** on Your pet, cosmetic, lifetime counts, never reset (planned in #87; updated by the lead in #91) | `src/lib/beta-progress.ts`; `ProgressionPanel.tsx` mounted in `pet-live-client.tsx` ("Reaching a milestone never resets it", "Cosmetic recognition only: no money, tokens or extra growth points") |
| `report-bug` | No monitored contact yet | `SUPPORT_URL = null`; see [bug-report checklist](BUG_REPORT_CHECKLIST.md) |

## Link checks (2 October 2026; rechecked 3 October, same results, see the index)

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
