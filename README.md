<div align="center">

# 🐣 MemePet

**Adopt the meme. Grow the community.**

A meme-community companion on **X Layer testnet**. Adopt a wallet-linked mascot,
care for it once a day, and contribute to a shared community ritual.
Growth comes from confirmed care. No MemePet token to buy; network gas applies.

[![Checks](https://github.com/Chi944/memepet/actions/workflows/checks.yml/badge.svg)](https://github.com/Chi944/memepet/actions/workflows/checks.yml)
[![OKX Dev Day 2026](https://img.shields.io/badge/OKX_Dev_Day_2026-Finalist-black)](https://www.okx.com/en-sg/learn/okx-dev-day-builder-kit)
[![X Layer testnet](https://img.shields.io/badge/chain-X_Layer_testnet-c6ff00)](https://web3.okx.com/onchainos/dev-docs/xlayer/developer/build-on-xlayer/network-information)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.5-black)](https://nextjs.org)
[![Solidity 0.8.24](https://img.shields.io/badge/Solidity-0.8.24-363636)](https://soliditylang.org)

[Live app](https://memepet.vercel.app)

<img src="docs/images/home-desktop.jpg" alt="MemePet's current black and lime homepage with the Mochi stage-art showcase" width="820">

<sub>Public homepage captured 23 September 2026 (Singapore). The mascot showcase is stage artwork, not an earned wallet state.</sub>

</div>

---

## 📋 Submission at a glance

| | |
|---|---|
| **Event** | OKX Dev Day 2026 |
| **Finale** | Selected for the 7 October 2026 live pitch; team-provided invitation |
| **Intended track** | Build a Market — meme application; deployed on X Layer testnet |
| **Team** | **The four musketeers** — Deston, Kym, Larm and YeeWei |
| **Live demo** | [memepet.vercel.app](https://memepet.vercel.app) |
| **Demo video** | [Watch the 3:05 demo](https://youtu.be/ofPOony4nys) · Larm's 1 October signed-out check found it public and playable; [access evidence](docs/qa/finale/larm/LINKS_AND_RECAP_QA_2026-10-01.md) |
| **Contract** | [`0xe844152262D243a7B90F6e07FF7A67F1d7FeD216`](https://www.okx.com/web3/explorer/xlayer-test/address/0xe844152262D243a7B90F6e07FF7A67F1d7FeD216) |
| **Network** | X Layer testnet · chain **1952** · gas currency **OKB** |
| **Repository** | [github.com/Chi944/memepet](https://github.com/Chi944/memepet) |

### Review in 60 seconds — no wallet needed

1. Open the [live overview](https://memepet.vercel.app) to see Mochi's three stage designs and the shared care counter.
2. Visit the [public demo pet](https://memepet.vercel.app/pet/0x86F7De84EBB97c875e1494675Bfcd664f0773CE9). This page reads the registry without a wallet connection. Select an earlier earned form: the artwork changes while the current stage and points remain visible. Future forms stay locked.
3. Inspect a [recorded care transaction](https://www.okx.com/web3/explorer/xlayer-test/tx/0xa340d65b2e59276568c8ff364ea01ec4cf1cc995b6e0ce720ddd1477906e1a55) and its [browser/receipt evidence](docs/qa/evidence/LATEST_RELEASE_QA_2026-09-24.md): one real care added ten points and exactly one community care.

To try adoption and care yourself, use the [wallet walkthrough](docs/qa/BROWSER_WALKTHROUGH.md) with an injected wallet and X Layer testnet gas. Browsing and public sharing require neither.

---

## 📖 Table of contents

- [The problem](#the-problem)
- [What MemePet does](#what-memepet-does)
- [Honest status](#honest-status)
- [How it works](#how-it-works)
- [Architecture](#architecture)
- [Deployed contracts](#deployed-contracts)
- [Getting started](#getting-started)
- [Running the checks](#running-the-checks)
- [Project structure](#project-structure)
- [Product scope](#product-scope)
- [Known limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Team and credits](#team-and-credits)

---

<a id="the-problem"></a>
## 🧐 The problem

For a meme community, a price chart tells only part of the story. MemePet explores
another reason to return: a small companion that grows through a daily act of care.
The goal is to make participation visible and give the community a shared ritual.

This is a product hypothesis. We have not yet established organic adoption,
retention or demand through community testing.

<a id="what-memepet-does"></a>
## 💡 What MemePet does

- **Adopt** a pet linked to your wallet. One pet per wallet; network gas applies.
- **Care** once per UTC calendar day through an explicit wallet transaction.
- **Grow** by ten points per confirmed care: Hatchling → Buddy → Guardian.
- **Revisit earned forms** without changing current growth, stage or care eligibility.
- **Contribute** one care action to the community total with every confirmed care.
- **Grow a shared garden** that blooms at 20 lifetime confirmed care actions; a cosmetic app goal.
- **Ask Mochi** for a read-only standard explanation of your progress, next care time or contribution, with the source block displayed and full evidence one click away.
- **Choose an explanation style** through browser-local Explore/Practise interactions; these never award growth or train a model.
- **Share** a read-only public pet page with a generated stage-aware share image.

Missing a day never removes earned growth. The prototype has no MemePet token,
marketplace, staking or financial rewards. Adoption and care do not request token
allowances or token transfers; wallet approval and network gas are still required.

| Hatchling · 0 points | Buddy · 20 points | Guardian · 50 points |
|:---:|:---:|:---:|
| <img src="public/pets/hatchling.png" alt="Hatchling stage artwork" width="170"> | <img src="public/pets/buddy.png" alt="Buddy stage artwork" width="170"> | <img src="public/pets/guardian.png" alt="Guardian stage artwork" width="170"> |

*Stage illustrations show the product's designs. They do not establish a recorded live evolution.*

---

<a id="honest-status"></a>
## 🚦 Honest status

Browser evidence below was verified **25 September 2026 (Singapore)** on product
runtime `af886a75`. Finale work is tracked separately in the
[four-person build plan](docs/finale/START_HERE.md); planned features are not live claims.

**30 September finale integration:** the shared garden and block-sourced recap
are implemented on the overview/pet routes. A sourced, text-only XDOG reference
labels its mainnet separately from MemePet's testnet; it adds no token ownership
check or affiliation. [Integration evidence](docs/qa/evidence/FINALE_INTEGRATION_2026-09-30.md)
records release checks and limits. **1 October:** Kym's Explore/Practise controls
are integrated with wallet-scoped browser preferences, reset and immediate
answer rewording. [Personality verification](docs/qa/evidence/PERSONALITY_INTEGRATION_2026-10-01.md)
records automated checks and the separate hosted-browser checkpoint. Fresh final
wallet acceptance remains pending. Recap wording is a **Standard explanation**,
not a model-generated response.

**2 October combined release:** the earned-form gallery and concise recap with
keyboard-accessible evidence are integrated. Live public/connected-page reads
and gallery interactions were checked on `d0fc020`; no new transaction was
performed. [Combined release evidence](docs/qa/evidence/COMBINED_RELEASE_2026-10-02.md)
separates those observations from the final wallet session still to run.

| Area | Verified result |
|---|---|
| Wallet flow | Genuine rejection → adoption → care; automatic 10-point pet read-back, UTC cooldown and reload persistence |
| Read recovery | Automatic community refresh showed Unknown; **Retry community total** recovered the receipt-block total without a reload or second transaction |
| Sharing and disconnect | Public pet displayed correct live state without connecting; Disconnect revoked site access and persisted after reload |
| Interface | Four viewport layouts, keyboard navigation, reduced-motion preview and missing/unknown-state previews checked |
| Automated checks | **123 app tests / 21 files · 15 contract tests · 8 counter checks**; typecheck, lint, build and production preview gates passed |

[Release CI](https://github.com/Chi944/memepet/actions/runs/36040157500) and
[latest browser QA](docs/qa/evidence/LATEST_RELEASE_QA_2026-09-24.md) retain the
actual results, read failures and unrun checks. Lint has one existing image-element
warning and no errors. The 3:05 film passed technical QC; original care/refresh
result stills are labelled, and no live evolution or uninterrupted successful
care/refresh recording is claimed. [Capture evidence](docs/qa/evidence/FINAL_CAPTURE_2026-09-24.md)
records the exact footage boundaries.

**Confirmed data drives the interface.** Growth requires a successful receipt
and fresh registry read. Unknown totals stay unknown; fictional previews never
replace failed live reads. The shared total counts **care actions**, not users
or adopted pets.

---

<a id="how-it-works"></a>
## ⚙️ How it works

```mermaid
flowchart LR
    A[Visitor] -->|Connect wallet| B[Adopt]
    B -->|One pet per wallet| C[Pet home]
    C -->|Care once per UTC day| D{Transaction}
    D -->|Rejected or reverted| E[No growth awarded]
    D -->|Receipt confirmed| F[Fresh registry read]
    F -->|Read succeeds| G[10 growth points per care]
    F -->|Read succeeds| H[Community care total]
    F -->|Read fails| I[Explicit unavailable state]
    I -->|Read-only recovery| F
    E --> C
    G --> C
```

### Contract rules and UI mapping

| Rule | Where it is enforced |
|---|---|
| One pet per wallet | `adopt()` reverts with `AlreadyAdopted` |
| Approved community only | `adopt()` reverts with `InvalidCommunity` |
| A pet is required for care | `care()` reverts with `NoPet` |
| One care per UTC calendar day | `care()` reverts with `AlreadyCaredToday` |
| Ten growth points per care | Derived from confirmed `careCount` in the app |
| Buddy at 20; Guardian at 50 | Derived in the app |
| No missed-day penalty | The contract does not remove care history |

The daily boundary uses `block.timestamp / 1 days`: **UTC midnight**, or
**08:00 Singapore time**. Growth and stage are derived from the same confirmed
care count; they are not a separate saved balance.

---

<a id="architecture"></a>
## 🏗️ Architecture

| Layer | Responsibility |
|---|---|
| Presentation · `src/components/` | Pet, care and community views consume display values and callbacks |
| Integration · `src/hooks/`, `src/lib/` | Wallet sessions, explicit transactions, receipts, same-block reads and UI mapping |
| Registry · `contracts/src/PetRegistry.sol` | One pet per wallet, permitted community, UTC-day care limit and shared care count |

[`deployment.ts`](src/lib/deployment.ts) declares the public testnet configuration.
Signing credentials never belong in client configuration. Development fixtures
are isolated from live reads; preview routes return **404 in production**.

### Built with

| Layer | Choice | Purpose |
|---|---|---|
| Framework | Next.js 16.3.5, React 19, TypeScript | Routes, rendering and server-generated share images |
| Styling | CSS Modules, custom properties, Geist / Geist Mono | Consistent black/lime interface and motion |
| Chain access | viem + an injected EIP-1193 wallet | Explicit reads and adoption/care requests |
| Contract | Solidity 0.8.24 / Foundry | Registry and UTC-day rules |
| Testing | Vitest, Testing Library, Foundry | Application and contract regression checks |
| CI | GitHub Actions | Typecheck, lint, tests, build and production preview gates |

Four runtime dependencies: `next`, `react`, `react-dom`, `viem`.

---

<a id="deployed-contracts"></a>
## 🔗 Deployed contracts

| Network | Chain ID | Registry |
|---|---|---|
| X Layer testnet | 1952 | [`0xe844152262D243a7B90F6e07FF7A67F1d7FeD216`](https://www.okx.com/web3/explorer/xlayer-test/address/0xe844152262D243a7B90F6e07FF7A67F1d7FeD216) |

[Deployment transaction](https://www.okx.com/web3/explorer/xlayer-test/tx/0x2ff191a789d48bc58f19e018dfee82aad4cba2ad50212d942e8e1e002fd593f9)
· block **41,543,244**. No mainnet deployment is claimed.

The executable runtime was compared with the deployed contract; compiler metadata
differs after an SPDX comment change. [Deployment evidence](docs/deploy/XLAYER_TESTNET.md)
details the comparison; explorer source verification is not claimed.

---

<a id="getting-started"></a>
## 🚀 Getting started

### Prerequisites

- **Node 24.19.x** (`.nvmrc`) and **npm 11.19.x**.
- **Foundry** for contract tests or a local chain.
- A browser wallet and testnet gas for the live transaction flow.

### Install and run

```bash
git clone https://github.com/Chi944/memepet.git
cd memepet
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Browsing needs no wallet. The committed
configuration reads the public X Layer testnet registry, so live data needs
network access. Production builds also download Google Fonts.

### Pages

| Route | Purpose |
|---|---|
| `/` | Overview, stage artwork and community progress |
| `/pet` | Connect, adopt, care, inspect the shared garden and ask for a verified activity recap |
| `/pet/<wallet-address>` | Read-only public pet page and generated share image |
| `/api/companion` | Read-only, block-sourced MemePet facts and standard explanations; GET describes the API, POST reads a public address |
| `/dev/pet` | Fictional pet stages and care-state previews |
| `/dev/landing` | Fictional landing preview |
| `/dev/community` | Loading, zero, growing, unavailable and other community previews |
| `/dev/finale` | Fictional shared inputs for the finale companion, personality and mission work |
| `/dev/companion` | Fictional recap facts, explanations and failure states |

The `/dev/*` routes return **404 in production**. CI checks that gate.
For local Anvil setup, use [development setup](docs/DEV_SETUP.md) and
[`.env.example`](.env.example); keep private overrides in gitignored `.env.local`.

### Public hosting

The app runs on [Vercel](https://memepet.vercel.app). Configuration and deployment
procedures are documented in [Vercel setup](docs/deploy/VERCEL.md) and
[X Layer deployment](docs/deploy/XLAYER_TESTNET.md).

---

<a id="running-the-checks"></a>
## ✅ Running the checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
node --test docs/qa/counter-check.regression.mjs
node --test docs/qa/rpc-recovery.regression.mjs
```

Install Foundry and its test library before running contract checks:

```bash
cd contracts
forge install foundry-rs/forge-std --no-git
cd ..
npm run test:contracts
```

CI runs these checks and starts the production build to assert `/` returns 200
and the `/dev/*` preview pages return 404. Automated passes are separate from the
[real browser-wallet walkthrough](docs/qa/BROWSER_WALKTHROUGH.md).

---

<a id="project-structure"></a>
## 📁 Project structure

```text
contracts/          Solidity registry, deployment script and contract tests
src/app/            Routes, public pet/share images and gated previews
src/components/     Pet, care, landing, community and shared presentation
src/hooks/          Wallet, pet registry and community integration
src/lib/            Deployment, reads, progression and view-model mapping
src/fixtures/       Fictional preview/test data only
public/pets/        Three stage illustrations and share backgrounds
docs/               Setup, scope, deployment, acceptance and dated evidence
```

Raw media, editable video sources and exports are preserved in the private
submission archive. Product code, tests, operational guides and evidence remain
in this repository.

---

<a id="product-scope"></a>
## 🎯 Product scope

The prototype supports **one community, one mascot and three stages**, with a
wallet-linked registry, daily care, public viewing and a shared care count.

A token economy, NFT trading, marketplace, staking, breeding and social feed are
outside the [agreed scope](docs/PROJECT_BRIEF.md). Multiple communities, accessories
and a read-only holder indicator remain optional future work.

<a id="known-limitations"></a>
## ⚠️ Known limitations

- **Testnet prototype:** one community, one mascot; no mainnet deployment or organic usage metrics are claimed. Finale selection does not establish approval of every planned integration.
- **Community reads:** automatic refresh can return Unknown. A real read-only Retry recovered the confirmed total; automatic refresh itself did not pass that run.
- **Finale retry repair:** a reproduced viem error-classification gap is covered by 14 new regressions; [fresh live verification remains pending](docs/qa/evidence/FINALE_RECEIPT_RETRY_2026-09-29.md).
- **Unrun browser checks:** network away/back and normal-motion foreground playback remain **NOT RUN**. The user kept reduced motion enabled. Real later-day evolution is also unverified; stage artwork is illustrative.
- **Wallet warnings:** a fresh approval was reported without a warning; automation did not inspect the extension prompt. Leave any warning unapproved and follow [wallet setup](docs/qa/WALLET_SETUP.md).
- **Security:** no independent security audit. A dated dependency scan cannot establish zero risk.
- **Rights:** no repository-wide licence has been selected; artwork-input permissions still need confirmation. See [asset provenance](docs/pet-assets.md).

<a id="roadmap"></a>
## 🔭 Roadmap

The team has been selected for the **7 October finale**. The approved extension
keeps Build a Market as the primary direction: reliable confirmed reads, one
verified community reference, a cosmetic shared garden at 20 confirmed cares,
browser-local personality, and a grounded MemePet activity recap. These are
tracked as separate deliverables so implemented features and real wallet evidence
are not confused.

The shared services now implement a block-verified recap API, isolated local
personality storage and a confirmed-total garden adapter. Larm's garden and
YeeWei's recap panels now have live route integration. Kym's personality controls
use the same existing adapter; preferences change explanation style, not earned
growth. [Dated verification](docs/qa/evidence/PERSONALITY_INTEGRATION_2026-10-01.md)
separates automated and read-only browser checks from genuine wallet actions.

The approved feature scope is implemented. The remaining finale work is combined
acceptance, one genuine wallet session, a labelled backup and a timed rehearsal.
The free [OKX.AI service packet](docs/finale/OKX_AI_SERVICE.md) is prepared;
registration and a genuine call through OKX.AI remain pending. No included model
credits or deployed AI chat are claimed. The [parallel build plan](docs/finale/START_HERE.md) assigns
isolated work to all four members. Remaining browser checks and the automatic
refresh limitation stay explicit in [current status](docs/STATUS.md).

---

<a id="team-and-credits"></a>
## 👥 Team and credits

| Contributor | Project contribution |
|---|---|
| **Deston — lead** | Contract, wallet/data integration, routes, shared UI, CI, deployment and release checks |
| **Kym — pet experience** | Pet presentation, stage artwork and evolution presentation |
| **Larm — community experience** | Landing/community UI, QA and demo materials |
| **YeeWei — activity experience** | Finale activity recap interface, bounded questions, evidence and response states |

Responsibilities are documented in [file ownership](docs/OWNERSHIP.md).
Built with [Next.js](https://nextjs.org), [React](https://react.dev),
[viem](https://viem.sh), [Foundry](https://getfoundry.sh),
[Vitest](https://vitest.dev) and [Testing Library](https://testing-library.com).
Fonts: **Geist and Geist Mono**, loaded through `next/font`. Copyright 2024
The Geist Project Authors; [SIL Open Font License 1.1](public/licenses/geist-OFL.txt).

AI coding tools were used during development. Dated evidence distinguishes
implementation, automated checks, browser observations and planned work.
