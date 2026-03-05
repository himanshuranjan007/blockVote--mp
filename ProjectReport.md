# 📋 BlockVote — Comprehensive Project Report

**Project Name:** BlockVote — Decentralized Voting with Token Governance
**Repository:** [himanshuranjan007/blockVote--mp](https://github.com/himanshuranjan007/blockVote--mp)
**Author:** Himanshu Ranjan ([himanshuranjan007](https://github.com/himanshuranjan007))
**Live Demo:** [https://block-vote-mp.vercel.app](https://block-vote-mp.vercel.app)
**Date of Report:** 2026-03-05
**License:** MIT

---

## 1. Abstract

**BlockVote** is a full-stack decentralized application (DApp) that enables tamper-proof, transparent, on-chain voting using blockchain technology. It leverages **ERC-20 governance tokens** for token-weighted voting, **Solidity smart contracts** deployed on Ethereum-compatible networks, and a modern **Next.js** frontend with MetaMask wallet integration. The system allows an administrator (election commission) to create elections, register voters, distribute governance tokens, and manage the complete election lifecycle — while voters interact with the blockchain to cast verifiable, immutable votes.

---

## 2. Introduction & Problem Statement

### 2.1 Problem
Traditional voting systems suffer from several critical issues:
- **Lack of transparency** — voters cannot independently verify that their vote was counted correctly.
- **Centralized trust** — a central authority manages the entire process, introducing a single point of failure.
- **Tamper vulnerability** — paper ballots and electronic voting machines can be manipulated.
- **Inefficient auditing** — post-election audits are costly, time-consuming, and often incomplete.

### 2.2 Proposed Solution
BlockVote addresses these challenges by:
- Storing all election data and votes **on-chain** (immutable ledger).
- Using **ERC-20 tokens** as voting weight, making vote power quantifiable and auditable.
- Requiring **token locking** during voting to prevent double-spending of votes.
- Providing **transparent, real-time results** accessible to anyone on the blockchain.
- Offering a **user-friendly web frontend** that abstracts blockchain complexity for end users.

---

## 3. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Smart Contracts** | Solidity | ^0.8.20 |
| **Contract Framework** | Hardhat | ^2.28.6 |
| **Standard Libraries** | OpenZeppelin Contracts | ^5.4.0 |
| **Testing** | Hardhat Toolbox (Chai + Mocha + Ethers) | ^5.0.0 |
| **Frontend Framework** | Next.js | 16.1.6 |
| **UI Library** | React | 19.2.3 |
| **Blockchain Interaction** | Ethers.js | ^6.16.0 |
| **Wallet** | MetaMask | Browser Extension |
| **Deployment (Frontend)** | Vercel | Cloud |
| **Local Blockchain** | Hardhat Node | Chain ID 31337 |

### 3.1 Language Composition

| Language | Bytes | Percentage |
|----------|-------|-----------|
| JavaScript | 53,218 | 61.0% |
| CSS | 20,537 | 23.5% |
| Solidity | 13,486 | 15.5% |
| **Total** | **87,241** | **100%** |

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐          │
│  │Dashboard │ │Elections │ │ Tokens │ │  Admin  │          │
│  └─────┬────┘ └────┬─────┘ └───┬────┘ └────┬────┘          │
│        └───────────┼───────────┼───────────┘                │
│                    ▼                                         │
│          ┌─────────────────┐    ┌──────────────┐            │
│          │ Web3Context.js  │    │  contracts.js │            │
│          │ (React Context) │    │  (ABI+Addr)   │            │
│          └────────┬────────┘    └──────┬───────┘            │
└───────────────────┼───────────────────┼──────────────────────┘
                    ▼                   ▼
           ┌────────────────────────────────┐
           │       MetaMask / Ethers.js     │
           └──────────────┬─────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                   ETHEREUM BLOCKCHAIN                         │
│  ┌─────────────────┐       ┌─────────────────────┐          │
│  │  VoteToken.sol  │◄──────│  VotingSystem.sol    │          │
│  │  (ERC-20)       │       │  (Elections + Voting)│          │
│  └─────────────────┘       └─────────────────────┘          │
│        ▲                          ▲                          │
│        │    OpenZeppelin Contracts (ERC20, Ownable)          │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Token-Based Voting Flow

```
  Voter                    VoteToken (ERC-20)              VotingSystem
    │                           │                               │
    │── registerVoter() ───────▶│                               │
    │◀── mint VOTE tokens ──────│                               │
    │                           │                               │
    │── approve(VotingSystem) ─▶│                               │
    │                           │                               │
    │── castVote(election, candidate, tokens) ─────────────────▶│
    │                           │◀── transferFrom() ────────────│
    │                           │                               │── record vote
    │                           │                               │── update weights
    │◀── VoteCast event ────────────────────────────────────────│
```

---

## 5. Project Structure

```
blockVote--mp/
├── contracts/
│   ├── VoteToken.sol            # ERC-20 governance token contract
│   └── VotingSystem.sol         # Core voting system contract
├── scripts/
│   └── deploy.js                # Deployment + demo data setup script
├── test/
│   └── VotingSystem.test.js     # 16 comprehensive unit tests
├── frontend/
│   ├── app/
│   │   ├── layout.js            # Root layout (Web3Provider + ToastProvider)
│   │   ├── page.js              # Dashboard page
│   │   ├── page.module.css      # Dashboard styles
│   │   ├── globals.css           # Global styles
│   │   ├── elections/
│   │   │   ├── page.js          # Elections browser + vote modal
│   │   │   └── page.module.css
│   │   ├── tokens/
│   │   │   ├── page.js          # Token management page
│   │   │   └── page.module.css
│   │   └── admin/
│   │       ├── page.js          # Admin panel
│   │       └── page.module.css
│   ├── components/
│   │   ├── Navbar.js            # Navigation bar component
│   │   ├── Navbar.module.css
│   │   ├── Toast.js             # Toast notification system
│   │   └── Toast.module.css
│   ├── lib/
│   │   ├── Web3Context.js       # Web3 provider context (wallet + contracts)
│   │   └── contracts.js         # Contract ABIs & addresses config
│   ├── package.json
│   └── README.md
├── artifacts/                    # Compiled contract artifacts (auto-generated)
├── cache/                        # Hardhat cache (auto-generated)
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Root package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 6. Smart Contract Design

### 6.1 VoteToken.sol — ERC-20 Governance Token

```solidity name=contracts/VoteToken.sol url=https://github.com/himanshuranjan007/blockVote--mp/blob/7b9ab175cdab3cb83a6d0d37ec4b898ed1b261b1/contracts/VoteToken.sol
```

**Key Features:**

| Feature | Description |
|---------|-------------|
| **Token Standard** | ERC-20 (OpenZeppelin implementation) |
| **Name / Symbol** | `VoteToken` / `VOTE` |
| **Max Supply** | 1,000,000 VOTE tokens (hard cap) |
| **Initial Supply** | 100,000 VOTE tokens minted to deployer (admin) |
| **Voter Registration** | `registerVoter()` — registers a voter and mints tokens to them |
| **Batch Registration** | `batchRegisterVoters()` — bulk register multiple voters in one transaction |
| **Token Burning** | `burn()` — any holder can burn their own tokens |
| **Minting** | `mint()` — owner-only function to mint additional tokens |
| **Access Control** | OpenZeppelin `Ownable` — only owner can register voters and mint |

**State Variables:**
- `MAX_SUPPLY` — constant hard cap of 1M tokens
- `registeredVoters` — mapping of address → registration status
- `voterList` — array tracking all registered voter addresses

**Events Emitted:**
- `VoterRegistered(address voter, uint256 tokensGranted)`
- `TokensBurned(address voter, uint256 amount)`

---

### 6.2 VotingSystem.sol — Core Voting Logic

```solidity name=contracts/VotingSystem.sol url=https://github.com/himanshuranjan007/blockVote--mp/blob/7b9ab175cdab3cb83a6d0d37ec4b898ed1b261b1/contracts/VotingSystem.sol
```

**Key Features:**

| Feature | Description |
|---------|-------------|
| **Election Lifecycle** | Pending → Active → Ended (3-state enum) |
| **Multi-Election Support** | Create and manage multiple elections simultaneously |
| **Candidate Management** | Add candidates with names and descriptions to each election |
| **Token-Weighted Voting** | 1 VOTE token = 1 vote weight (configurable) |
| **Token Locking** | Tokens are transferred to the contract upon voting (locked) |
| **Double-Vote Prevention** | `hasVoted` mapping prevents voting twice per election |
| **Winner Determination** | `getWinner()` iterates candidates to find highest vote count |
| **Access Control** | Owner-only for election/candidate management; public for voting |

**Data Structures:**

```solidity
struct Candidate {
    uint256 id;
    string name;
    string description;
    uint256 voteCount;
}

struct Election {
    uint256 id;
    string title;
    string description;
    uint256 startTime;
    uint256 endTime;
    ElectionStatus status;       // Pending, Active, Ended
    uint256 candidateCount;
    uint256 totalVotesCast;
    uint256 totalTokensUsed;
    address creator;
}
```

**Core Functions:**

| Function | Access | Description |
|----------|--------|-------------|
| `createElection()` | Owner | Create a new election with title, description, time range |
| `addCandidate()` | Owner | Add a candidate to a pending election |
| `startElection()` | Owner | Activate an election (requires ≥ 2 candidates) |
| `endElection()` | Owner | End an active election |
| `castVote()` | Public | Cast a token-weighted vote (registered voters only) |
| `getElection()` | View | Get election details |
| `getCandidate()` | View | Get candidate details |
| `getWinner()` | View | Get winning candidate of an ended election |
| `getAllCandidates()` | View | Get all candidates for an election |
| `hasVoterVoted()` | View | Check if a voter has voted in a specific election |
| `setTokensPerVote()` | Owner | Update tokens required per vote |

**Events Emitted:**
- `ElectionCreated(uint256 electionId, string title, uint256 startTime, uint256 endTime)`
- `CandidateAdded(uint256 electionId, uint256 candidateId, string name)`
- `VoteCast(uint256 electionId, address voter, uint256 candidateId, uint256 tokensUsed)`
- `ElectionStatusChanged(uint256 electionId, ElectionStatus newStatus)`
- `TokensPerVoteUpdated(uint256 newAmount)`

**Security Mechanisms:**
1. **Registered voter check** — only registered voters can cast votes
2. **Double-vote prevention** — `hasVoted` mapping prevents re-voting
3. **Token balance check** — voter must have sufficient token balance
4. **Token locking** — tokens are transferred (locked) to the contract via `transferFrom()`
5. **Election state validation** — only active elections accept votes
6. **Candidate validation** — candidate ID must be valid
7. **Minimum token requirement** — vote must meet `tokensPerVote` threshold
8. **Owner-only admin functions** — OpenZeppelin `Ownable` pattern

---

## 7. Frontend Application

### 7.1 Application Layout

The frontend uses the **Next.js App Router** pattern with a root layout that wraps the entire application in `Web3Provider` and `ToastProvider` contexts:

```javascript name=frontend/app/layout.js url=https://github.com/himanshuranjan007/blockVote--mp/blob/7b9ab175cdab3cb83a6d0d37ec4b898ed1b261b1/frontend/app/layout.js
```

### 7.2 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| **Dashboard** | `/` | Hero section, statistics grid (elections, voters, supply, balance), "How It Works" explainer |
| **Elections** | `/elections` | Browse all elections, view candidates and vote counts, cast votes via modal with token staking |
| **Tokens** | `/tokens` | View VOTE token balance, supply info, registration status, governance details |
| **Admin** | `/admin` | Register voters, create elections, add candidates, start/end elections |

### 7.3 Core Components

| Component | File | Purpose |
|-----------|------|---------|
| **Navbar** | `components/Navbar.js` | Navigation bar with links to all pages, wallet connect/disconnect, address display |
| **Toast** | `components/Toast.js` | Toast notification system for success/error/info messages |
| **Web3Context** | `lib/Web3Context.js` | React Context for managing wallet connection, contract instances, account state |
| **contracts** | `lib/contracts.js` | Contract ABIs and deployed addresses configuration |

### 7.4 Web3Context — Wallet & Contract Management

The `Web3Context.js` provides a React Context that manages:

| State | Type | Description |
|-------|------|-------------|
| `account` | string | Connected wallet address |
| `provider` | BrowserProvider | Ethers.js provider instance |
| `signer` | Signer | Ethers.js signer for transactions |
| `voteToken` | Contract | VoteToken contract instance |
| `votingSystem` | Contract | VotingSystem contract instance |
| `chainId` | number | Current network chain ID |
| `isConnecting` | boolean | Connection loading state |
| `error` | string | Error message |
| `isConnected` | boolean | Derived: `!!account` |
| `isCorrectNetwork` | boolean | Derived: `chainId === CHAIN_ID` |

**Key Behaviors:**
- **Read-only initialization** on mount (no wallet required to browse)
- **MetaMask integration** via `window.ethereum`
- **Account change detection** — listens for `accountsChanged` events
- **Chain change detection** — reloads page on `chainChanged` event
- **Graceful disconnect** — clears all state

### 7.5 UI Design
- 🌑 **Premium dark theme** with glassmorphism effects
- ✨ **Animated gradients** for visual appeal
- 📱 **Fully responsive** design with CSS Modules
- 🔔 **Toast notifications** for transaction feedback

---

## 8. Deployment & Build System

### 8.1 Hardhat Configuration

```javascript name=hardhat.config.js url=https://github.com/himanshuranjan007/blockVote--mp/blob/7b9ab175cdab3cb83a6d0d37ec4b898ed1b261b1/hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337,
        },
    },
};
```

- **Solidity optimizer** enabled (200 runs) for gas efficiency
- **Hardhat local network** configured on chain ID 31337
- **Localhost network** pointing to `http://127.0.0.1:8545`

### 8.2 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run compile` | `npx hardhat compile` | Compile Solidity contracts |
| `npm test` | `npx hardhat test` | Run all 16 tests |
| `npm run node` | `npx hardhat node` | Start local Hardhat blockchain |
| `npm run deploy` | `npx hardhat run scripts/deploy.js --network localhost` | Deploy contracts + setup demo |
| `npm run frontend` | `cd frontend && npm run dev` | Start Next.js development server |

### 8.3 Deploy Script

The deployment script (`scripts/deploy.js`) performs the following automated steps:

1. **Deploy VoteToken** contract
2. **Deploy VotingSystem** contract (linked to VoteToken address)
3. **Register 5 test voters** (accounts 1–5), each receiving 10 VOTE tokens
4. **Create a demo election**: "Best Blockchain Platform 2026"
5. **Add 4 candidates**: Ethereum, Solana, Polygon, Avalanche
6. **Start the election** immediately
7. **Approve token spending** for all 5 voters
8. **Save deployment info** to `frontend/deployment.json` for frontend consumption

---

## 9. Testing

### 9.1 Test Framework
- **Mocha** — Test runner
- **Chai** — Assertion library
- **Hardhat Ethers** — Blockchain interaction in tests

### 9.2 Test Suite Overview

The test file `test/VotingSystem.test.js` contains **16 comprehensive tests** organized in 3 describe blocks:

#### Block 1: VoteToken (6 tests)
| # | Test | Description |
|---|------|-------------|
| 1 | Deploy with correct name and symbol | Verifies token name = "VoteToken", symbol = "VOTE" |
| 2 | Mint initial supply to owner | Verifies owner receives 100,000 VOTE tokens |
| 3 | Register voters with correct token amounts | Verifies registration status, balance (10 VOTE), voter count (3) |
| 4 | Prevent double registration | Verifies revert with "Voter already registered" |
| 5 | Allow token burning | Verifies balance decreases after burn |
| 6 | Batch register voters | Verifies batch registration sets status and correct balance |

#### Block 2: VotingSystem — Election Management (4 tests)
| # | Test | Description |
|---|------|-------------|
| 7 | Create an election | Verifies election title and candidate count |
| 8 | Add candidates | Verifies candidate name matches |
| 9 | Start an election | Verifies election status changes to Active (1) |
| 10 | Require at least 2 candidates to start | Verifies revert with "Need at least 2 candidates" |

#### Block 3: VotingSystem — Token-Based Voting (6 tests)
| # | Test | Description |
|---|------|-------------|
| 11 | Allow registered voters to cast votes | Verifies `hasVoterVoted` returns true after voting |
| 12 | Correctly weight votes by token amount | Verifies 5 tokens → 5 votes, 3 tokens → 3 votes |
| 13 | Prevent double voting | Verifies revert with "Already voted in this election" |
| 14 | Prevent non-registered voters from voting | Verifies revert for non-registered voter |
| 15 | Determine the winner correctly | Verifies correct winner name and vote count after election ends |
| 16 | Lock tokens when voting | Verifies voter balance decreases by exact token amount after voting |

---

## 10. Dependencies

### 10.1 Root Project (Smart Contracts)

```json name=package.json url=https://github.com/himanshuranjan007/blockVote--mp/blob/7b9ab175cdab3cb83a6d0d37ec4b898ed1b261b1/package.json
```

| Package | Version | Type | Purpose |
|---------|---------|------|---------|
| `@openzeppelin/contracts` | ^5.4.0 | Production | Battle-tested ERC-20, Ownable implementations |
| `hardhat` | ^2.28.6 | Dev | Ethereum development environment |
| `@nomicfoundation/hardhat-toolbox` | ^5.0.0 | Dev | Bundled testing & deployment tools |

### 10.2 Frontend

```json name=frontend/package.json url=https://github.com/himanshuranjan007/blockVote--mp/blob/7b9ab175cdab3cb83a6d0d37ec4b898ed1b261b1/frontend/package.json
```

| Package | Version | Type | Purpose |
|---------|---------|------|---------|
| `next` | 16.1.6 | Production | React meta-framework (App Router) |
| `react` | 19.2.3 | Production | UI library |
| `react-dom` | 19.2.3 | Production | React DOM renderer |
| `ethers` | ^6.16.0 | Production | Ethereum library for blockchain interaction |
| `eslint` | ^9 | Dev | Code linting |
| `eslint-config-next` | 16.1.6 | Dev | Next.js-specific ESLint rules |

---

## 11. Version Control & Commit History

| # | Date | Commit Message | SHA |
|---|------|---------------|-----|
| 1 | 2026-02-27 05:12 | `configs` | `50be3fe` |
| 2 | 2026-02-27 05:13 | `configs changes` | `860a395` |
| 3 | 2026-02-27 05:49 | `blockvote` | `79f215a` |
| 4 | 2026-02-27 05:55 | `fixed modules` | `6d4c7db` |
| 5 | 2026-02-27 05:55 | `fixed gitignore` (HEAD) | `7b9ab17` |

- **Total commits:** 5
- **Contributors:** 1 (Himanshu Ranjan)
- **Development duration:** Single day (Feb 27, 2026)
- **Default branch:** `main`

---

## 12. Setup & Installation Guide

### Prerequisites
- Node.js v18+
- MetaMask browser extension

### Step-by-step:

```bash
# 1. Clone the repository
git clone https://github.com/himanshuranjan007/blockVote--mp.git
cd blockVote--mp

# 2. Install root dependencies (smart contracts)
npm install

# 3. Install frontend dependencies
cd frontend && npm install && cd ..

# 4. Start local blockchain (Terminal 1)
npm run node

# 5. Deploy contracts & setup demo (Terminal 2)
npm run deploy

# 6. Start frontend (Terminal 3)
npm run frontend
```

### MetaMask Configuration:
| Setting | Value |
|---------|-------|
| Network Name | Hardhat Local |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency Symbol | `ETH` |

---

## 13. Security Considerations

| Aspect | Implementation |
|--------|---------------|
| **Access Control** | OpenZeppelin `Ownable` restricts admin functions to contract owner |
| **Double Voting** | `hasVoted` mapping prevents any address from voting twice per election |
| **Voter Registration** | Only registered voters (verified via `registeredVoters` mapping) can vote |
| **Token Supply Cap** | Hard-coded `MAX_SUPPLY` of 1M tokens prevents inflation |
| **Token Locking** | Voted tokens are transferred to the contract, preventing reuse |
| **Input Validation** | Comprehensive `require()` checks on all state-changing functions |
| **Election State Machine** | Status enum (Pending → Active → Ended) enforces correct lifecycle |
| **Candidate Minimum** | Elections require at least 2 candidates to start |

---

## 14. Limitations & Future Scope

### Current Limitations
1. **No testnet/mainnet deployment** — currently configured for local Hardhat network only
2. **No token unlock mechanism** — locked tokens cannot be reclaimed after voting
3. **Single-owner admin model** — no multi-sig or DAO-based governance for admin functions
4. **No voter anonymity** — all votes are publicly visible on-chain
5. **No time-based automatic election management** — elections are started/ended manually by admin
6. **No support for delegation** — voters cannot delegate their token weight to others

### Future Enhancements
1. Deploy to Ethereum testnet (Sepolia) and mainnet
2. Implement zero-knowledge proofs for voter privacy
3. Add multi-signature admin wallet support
4. Implement token unlock/refund after election ends
5. Add vote delegation (like Compound-style governance)
6. Implement automatic election start/end based on block timestamps
7. Add IPFS integration for storing election metadata
8. Build mobile-responsive Progressive Web App (PWA)
9. Add comprehensive event logging and analytics dashboard

---

## 15. Conclusion

BlockVote successfully demonstrates a production-quality implementation of decentralized voting using blockchain technology. The project implements a two-contract architecture (VoteToken + VotingSystem) with a clean separation of concerns, follows established smart contract patterns (OpenZeppelin), includes comprehensive testing (16 tests covering all critical paths), and provides a polished user interface with modern design patterns. The token-weighted governance model provides a flexible foundation that can be extended for more complex governance scenarios.

---

*Report generated on 2026-03-05 from repository analysis of [himanshuranjan007/blockVote--mp](https://github.com/himanshuranjan007/blockVote--mp) at commit `7b9ab175`.*