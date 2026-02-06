# PrivateAlpha - Decentralized Private Trading Platform

[![Arbitrum](https://img.shields.io/badge/Arbitrum-Sepolia-blue)](https://sepolia.arbiscan.io/)
[![iExec](https://img.shields.io/badge/iExec-TEE-green)](https://iex.ec/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> A full-stack decentralized platform enabling private credit scoring, AI-powered trading signals, and MEV-protected trade execution using iExec's Trusted Execution Environment (TEE).

## 🏗️ Project Structure

**This is a monorepo** managed with npm workspaces. All components are organized under a single repository.

```
iExecX/                     # ← You are here (project root)
├── packages/               # All application packages
│   ├── contracts/          # Solidity smart contracts (Hardhat)
│   ├── tee-worker/         # Rust TEE workers (Cargo)
│   ├── backend/            # Node.js API server (Express)
│   └── mobile/             # React Native app (Expo)
├── docs/                   # Centralized documentation
├── scripts/                # Setup & deployment scripts
├── package.json            # Monorepo configuration
└── .env.example            # Environment variables template
```

📖 **New to monorepos?** Read the [Workspace Guide](WORKSPACE_GUIDE.md) for detailed structure explanation and best practices.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Rust 1.75+
- Docker Desktop
- Git

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd iExecX

# Install dependencies for all packages
npm install

# Build all packages
npm run build

# Run tests
npm run test
```

## 📦 Packages

### 1. Smart Contracts (`packages/contracts`)
Solidity contracts deployed on Arbitrum Sepolia:
- **CreditScoreRegistry**: On-chain credit score storage with TEE attestations
- **StrategyExecutor**: Private trade execution with proof verification
- **FlashbotsRelayer**: MEV-protected transaction submission

[View Documentation →](packages/contracts/README.md)

### 2. TEE Worker (`packages/tee-worker`)
Rust-based confidential computation workers:
- **Credit Scorer**: Private credit score calculation
- **Momentum Strategy**: AI-powered trading signal generation

[View Documentation →](packages/tee-worker/README.md)

### 3. Backend API (`packages/backend`)
Node.js REST API orchestrating blockchain and TEE interactions:
- Credit score computation endpoints
- Trading opportunity discovery
- Transaction submission

[View Documentation →](packages/backend/README.md)

### 4. Mobile App (`packages/mobile`)
React Native cross-platform mobile application:
- Wallet connection
- Credit score visualization
- Trading dashboard
- Strategy execution

[View Documentation →](packages/mobile/README.md)

## 🛠️ Development

### Running Locally

```bash
# Terminal 1: Start local Hardhat node
cd packages/contracts
npm run node

# Terminal 2: Deploy contracts
npm run deploy:local

# Terminal 3: Start backend API
cd packages/backend
npm run dev

# Terminal 4: Run mobile app
cd packages/mobile
npm run web
```

## 🌐 Deployment

### Testnet Deployment (Arbitrum Sepolia)

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with your keys

# 2. Deploy contracts
cd packages/contracts
npm run deploy:testnet

# 3. Deploy TEE worker to iExec
cd packages/tee-worker
npm run deploy:iexec

# 4. Deploy backend
cd packages/backend
npm run deploy
```

## 📚 Documentation

### Core Documentation
- [Architecture Overview](docs/ARCHITECTURE.md) - System design and components
- [Quick Start Guide](docs/QUICKSTART.md) - Get up and running in 5 minutes
- [Testing Guide](docs/TESTING.md) - How to test the application
- [Deployment Guide](docs/DEPLOYMENT.md) - Deploy to testnets and production

### Structure & Workflow
- [📂 Workspace Guide](WORKSPACE_GUIDE.md) - **Complete monorepo structure guide**
- [📐 Structure Diagram](STRUCTURE_DIAGRAM.md) - Visual diagrams and command flows
- [🔄 Migration Guide](MIGRATION_GUIDE.md) - How to use the corrected structure
- [✅ Structure Fix Summary](STRUCTURE_FIX_SUMMARY.md) - What was fixed and why

### Quick Reference
- [⚡ Quick Commands (PowerShell)](QUICK_COMMANDS.ps1) - Common commands for Windows
- [⚡ Quick Commands (Bash)](QUICK_COMMANDS.sh) - Common commands for Unix/Linux
- [📊 Project Status](PROJECT_STATUS.md) - Current development status

## 🔐 Security

- TEE-based confidential computation
- End-to-end encryption
- MEV protection
- Smart contract best practices
- Access control and authorization

**⚠️ Warning**: This is a testnet project for educational purposes. Not audited for production use.

## 🧪 Testing

```bash
# Run all tests
npm test

# Test individual packages
npm test --workspace=packages/contracts
npm test --workspace=packages/tee-worker
npm test --workspace=packages/backend
npm test --workspace=packages/mobile
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [iExec](https://iex.ec/) - Confidential computing infrastructure
- [Arbitrum](https://arbitrum.io/) - Layer 2 scaling solution
- [OpenZeppelin](https://openzeppelin.com/) - Secure smart contract libraries
- [Hardhat](https://hardhat.org/) - Ethereum development environment

---

**Built with ❤️ for decentralized finance**
