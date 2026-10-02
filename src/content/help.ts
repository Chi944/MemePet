import type { HelpEntry } from "@/types/beta";

/**
 * Beta FAQ copy for the generic HelpPanel. Plain text only: blank lines become
 * paragraphs. Every statement was checked against main at b4e9b85; sources are
 * listed in docs/qa/beta/larm/HELP_SOURCES.md. Recovery after a refresh and
 * milestones are described as planned until the lead enables them.
 */

/** null until an actual monitored support contact has been verified. */
export const SUPPORT_URL: string | null = null;

const paragraphs = (...parts: readonly string[]) => parts.join("\n\n");

const OKX_WALLET = { label: "Get OKX Wallet (official download)", href: "https://web3.okx.com/download" } as const;
const METAMASK = { label: "Install MetaMask (MetaMask Help Center)", href: "https://support.metamask.io/start/getting-started-with-metamask/" } as const;
const FAUCET = { label: "X Layer testnet faucet (OKX)", href: "https://web3.okx.com/xlayer/faucet" } as const;
const NETWORK = { label: "X Layer network information", href: "https://web3.okx.com/onchainos/dev-docs/xlayer/developer/build-on-xlayer/network-information" } as const;
const EXPLORER = { label: "X Layer testnet explorer", href: "https://www.okx.com/web3/explorer/xlayer-test" } as const;
const METAMASK_DISCONNECT = { label: "Disconnect a site in MetaMask", href: "https://support.metamask.io/more-web3/dapps/disconnect-wallet-from-a-dapp/" } as const;

export const HELP_ENTRIES: readonly HelpEntry[] = [
  {
    id: "testnet-wallet-gas",
    question: "What do I need to adopt and care for a pet?",
    answer: paragraphs(
      "A browser wallet extension, such as OKX Wallet or MetaMask, installed and unlocked in the same browser profile as MemePet. If more than one wallet is installed, choose the one you want before connecting. MemePet does not offer QR code or WalletConnect pairing.",
      "The public MemePet app runs on X Layer testnet (chain ID 1952). Adopting and caring are transactions, so your wallet needs a small amount of testnet OKB for gas. Testnet OKB has no real value. You can request it from the official X Layer testnet faucet.",
      "MemePet will never ask for your seed phrase, private key or wallet password.",
    ),
    links: [OKX_WALLET, METAMASK, FAUCET, NETWORK],
  },
  {
    id: "one-care-per-day",
    question: "How often can I care for my pet?",
    answer: paragraphs(
      "Once per wallet per UTC calendar day. The registry contract enforces this and rejects a second care on the same UTC day.",
      "The day resets at 00:00 UTC, which is 08:00 in Singapore (UTC+8). After you care, the care panel shows the next available time in UTC. The onboarding panel also shows that same reset in your local time; the UTC rule does not change.",
    ),
  },
  {
    id: "missed-days",
    question: "What happens if I miss a day?",
    answer: paragraphs(
      "Nothing is lost. There is no streak to break and no decay. Confirmed cares never go down.",
      "Each confirmed care adds 10 growth. Your pet becomes a Buddy at 20 growth (2 cares) and a Guardian at 50 growth (5 cares), however many days that takes.",
    ),
  },
  {
    id: "confirmed-vs-local",
    question: "What is stored on-chain, and what stays in my browser?",
    answer: paragraphs(
      "On-chain and public: your adoption, your confirmed care count, the UTC day of your last care and the community care total. Growth and stage are calculated from these confirmed facts.",
      "Only in this browser: Mochi's personality style and interaction counts (kept for this browser and wallet) and the Animate Mochi setting. They do not sync across devices and never change growth, stage or care.",
      "Clearing browser data resets those local preferences. It does not affect your pet.",
    ),
  },
  {
    id: "read-failures",
    question: "Why does MemePet say Unknown, and what does Retry do?",
    answer: paragraphs(
      "When the app cannot read X Layer testnet, it shows Unknown instead of guessing or showing 0.",
      "Retry pet read, Retry community total and the garden's Retry reading button only read the chain again. They never send a transaction or ask your wallet to sign.",
      "If reads keep failing, the testnet connection may be busy. Wait a moment and try again; your pet's confirmed progress is unaffected.",
    ),
  },
  {
    id: "pending-transaction",
    question: "My care shows a transaction hash and says pending. What now?",
    answer: paragraphs(
      "Pending means the care was submitted but is not confirmed yet. No progress is awarded until it confirms. Keep the page open; when it confirms, the care panel says so.",
      "The hash is public. You can look it up on the X Layer testnet explorer. Looking up a hash is read-only and never resubmits or repeats the care.",
      "Do not press care again while the first care is pending. If you reload the page, MemePet does not yet resume watching that hash; check it on the explorer instead. A care that confirms appears the next time MemePet reads your pet.",
      "Planned: a Check status option to resume a pending care after a reload. It will only read the existing hash. It is not enabled yet.",
    ),
    links: [EXPLORER],
  },
  {
    id: "disconnect-approvals",
    question: "What does Disconnect do? Does it remove token approvals?",
    answer: paragraphs(
      "Disconnect asks your wallet to remove this site's account access. If the wallet cannot confirm that, MemePet says so and tells you to remove the site in your wallet's connected-sites settings.",
      "MemePet never asks for token approvals (allowances). Adopting and caring send no tokens or OKB beyond the gas fee.",
      "Disconnecting does not reverse confirmed transactions and does not revoke token approvals you gave to other sites. Manage those in your wallet.",
    ),
    links: [METAMASK_DISCONNECT],
  },
  {
    id: "public-pet",
    question: "Who can see my pet?",
    answer: paragraphs(
      "Anyone. Registry data on X Layer testnet is public, so anyone with your wallet address can open your pet's public page and see its stage, growth and confirmed cares. The share link points to that page.",
      "Visitors cannot care for your pet. Only the wallet that adopted it can care.",
    ),
  },
  {
    id: "milestones-money",
    question: "Are there rewards, tokens or anything to buy?",
    answer: paragraphs(
      "No. MemePet has no token, NFT, marketplace, staking or payouts, and asks for no payment. The only cost is testnet gas, which has no real value.",
      "Stages and the community garden are cosmetic. The garden counts confirmed care actions, not people.",
      "On Your pet, cosmetic milestones mark 5, 10 and 20 personal cares, and garden chapters mark 20, 50 and 100 community cares. They use confirmed lifetime counts without resetting them. They are labels only and carry no money value.",
    ),
  },
  {
    id: "report-bug",
    question: "How do I report a problem?",
    answer: paragraphs(
      "A monitored support contact has not been confirmed yet, so none is listed below. When you report a problem to the MemePet team, include: the page URL; your browser and wallet app; the network your wallet shows; the steps you took and what you saw; and, optionally, a public transaction hash.",
      "Never include your seed phrase, private key, wallet or account passwords, or screenshots that show them. A public wallet address or transaction hash is enough.",
    ),
  },
];
