# 🗳️ BlockVote — Decentralized Voting with Token Governance

A full-stack blockchain voting DApp powered by **Solidity smart contracts**, **ERC-20 governance tokens**, and a **Next.js** frontend. Cast tamper-proof votes on-chain with token-weighted governance.

![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Hardhat](https://img.shields.io/badge/Hardhat-2.x-FFF100?logo=ethereum)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

### Smart Contracts
- **VoteToken (VOTE)** — ERC-20 governance token (1 token = 1 vote weight)
- **VotingSystem** — Create elections, add candidates, cast token-weighted votes
- Voter registration with automatic token distribution
- Batch voter registration
- Token locking during voting (tokens transferred to contract)
- On-chain winner determination
- Max supply cap of 1,000,000 VOTE tokens

### Frontend (Next.js)
- 🌑 Premium dark theme with glassmorphism & animated gradients
- 💼 MetaMask wallet integration
- 📊 Real-time election data from blockchain
- 🗳️ Interactive voting modal with token staking
- 👑 Admin panel for election management
- 💰 Token balance & governance dashboard
- 📱 Fully responsive design

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MetaMask](https://metamask.io/) browser extension

### 1. Install Dependencies

```bash
# Root (smart contracts)
npm install

# Frontend (Next.js)
cd frontend && npm install && cd ..
```

### 2. Start Local Blockchain

```bash
# Terminal 1 — Start Hardhat local node
npm run node
```

### 3. Deploy Contracts

```bash
# Terminal 2 — Deploy & setup demo election
npm run deploy
```

### 4. Start Frontend

```bash
# Terminal 3 — Start Next.js dev server
npm run frontend
```

### 5. Connect MetaMask
1. Open MetaMask → Add Network → Add network manually
2. Network Name: `Hardhat Local`
3. RPC URL: `http://127.0.0.1:8545`
4. Chain ID: `31337`
5. Currency Symbol: `ETH`
6. Import a test account using one of the private keys printed by `npm run node`

---

## 📁 Project Structure

```
├── contracts/
│   ├── VoteToken.sol          # ERC-20 governance token
│   └── VotingSystem.sol       # Voting system with elections & candidates
├── scripts/
│   └── deploy.js              # Deployment + demo setup script
├── test/
│   └── VotingSystem.test.js   # 16 comprehensive tests
├── frontend/
│   ├── app/
│   │   ├── page.js            # Dashboard
│   │   ├── elections/page.js  # Elections browser + vote modal
│   │   ├── tokens/page.js     # Token management
│   │   └── admin/page.js      # Admin panel
│   ├── components/
│   │   ├── Navbar.js          # Navigation bar
│   │   └── Toast.js           # Notification system
│   └── lib/
│       ├── Web3Context.js     # Web3 provider context
│       └── contracts.js       # ABI & address config
├── hardhat.config.js
└── package.json
```

---

## 🧪 Testing

```bash
npm test
```

All **16 tests** pass:
- ✅ Token deployment, naming, and symbol
- ✅ Voter registration & batch registration
- ✅ Token minting to voters
- ✅ Election creation & candidate management
- ✅ Token-weighted voting
- ✅ Double-vote prevention
- ✅ Non-registered voter protection
- ✅ Winner determination
- ✅ Token locking on vote

---

## 🏗️ Token-Based Voting Architecture

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

## 📜 License

MIT
