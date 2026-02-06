# 📂 Workspace Structure Guide

## Overview

This project uses a **monorepo** structure with npm workspaces, organizing all components under a single repository for easier development, testing, and deployment.

## ✅ Correct Structure

```
iExecX/                                    # Root monorepo directory
│
├── 📄 Root Configuration
│   ├── package.json                       # Monorepo config with workspaces
│   ├── .gitignore                         # Git ignore rules
│   ├── .env.example                       # Environment template
│   ├── LICENSE                            # MIT License
│   └── README.md                          # Main documentation
│
├── 📚 docs/                               # Centralized documentation
│   ├── ARCHITECTURE.md                    # System architecture
│   ├── QUICKSTART.md                      # Getting started guide
│   ├── DEPLOYMENT.md                      # Deployment instructions
│   └── TESTING.md                         # Testing guide
│
├── 🔧 scripts/                            # Shared utility scripts
│   ├── setup.ps1                          # Windows setup
│   └── setup.sh                           # Linux/Mac setup
│
└── 📦 packages/                           # All project packages
    │
    ├── contracts/                         # Smart contracts package
    │   ├── contracts/                     # Solidity source files
    │   ├── scripts/                       # Deploy & verify scripts
    │   ├── test/                          # Contract tests
    │   ├── hardhat.config.js              # Hardhat configuration
    │   ├── package.json                   # Package dependencies
    │   └── README.md                      # Package documentation
    │
    ├── tee-worker/                        # Rust TEE workers package
    │   ├── src/                           # Rust source code
    │   │   ├── bin/                       # Binary executables
    │   │   ├── credit_scoring.rs          # Credit scoring logic
    │   │   ├── momentum_strategy.rs       # Trading strategy
    │   │   └── lib.rs                     # Library root
    │   ├── Cargo.toml                     # Rust dependencies
    │   ├── Dockerfile                     # Docker build config
    │   ├── iexec.json                     # iExec deployment config
    │   ├── package.json                   # NPM scripts
    │   └── README.md                      # Package documentation
    │
    ├── backend/                           # Node.js API server package
    │   ├── src/                           # JavaScript source
    │   │   ├── routes/                    # API route handlers
    │   │   │   ├── blockchain.js          # Blockchain endpoints
    │   │   │   ├── tee.js                 # TEE computation endpoints
    │   │   │   └── trading.js             # Trading endpoints
    │   │   └── server.js                  # Express server
    │   ├── package.json                   # Package dependencies
    │   └── README.md                      # Package documentation
    │
    └── mobile/                            # React Native app package
        ├── src/                           # App source code
        │   ├── screens/                   # Screen components
        │   └── services/                  # Service layer
        ├── App.js                         # App entry point
        ├── package.json                   # Package dependencies
        └── README.md                      # Package documentation
```

## 🚀 Working with the Monorepo

### Initial Setup

```bash
# Clone and navigate to project root
cd iExecX

# Install all dependencies (root + all workspaces)
npm install

# Build all packages
npm run build
```

### Working with Individual Packages

```bash
# Run command in specific workspace
npm run dev --workspace=packages/backend
npm test --workspace=packages/contracts

# Or navigate to package directory
cd packages/backend
npm run dev
```

### Available Root Scripts

```bash
npm run build              # Build all packages
npm test                   # Test all packages
npm run lint               # Lint all packages
npm run format             # Format all code

# Development
npm run dev:contracts      # Start local Hardhat node
npm run dev:backend        # Start backend server
npm run dev:mobile         # Start mobile app (web)

# Deployment
npm run deploy:testnet     # Deploy contracts to testnet
npm run deploy:all         # Deploy everything
```

## 🔄 Dependency Management

### Adding Dependencies

```bash
# Root-level dev dependency
npm install -D eslint

# Package-specific dependency
npm install express --workspace=packages/backend
npm install ethers --workspace=packages/contracts
```

### Shared Dependencies

Common dependencies (like `ethers`, `dotenv`) can be:
- Installed at root level if used by multiple packages
- Installed in each package if versions differ

## 📁 File Organization Best Practices

### ✅ DO:
- Keep package-specific code within `packages/`
- Place shared utilities in appropriate package
- Use centralized `docs/` for documentation
- Keep environment config in root `.env`
- Commit package-lock.json to root only

### ❌ DON'T:
- Mix source code between packages
- Duplicate configuration files
- Create nested monorepos
- Commit `node_modules/` or build artifacts
- Store secrets in repository

## 🔐 Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit with your values
PRIVATE_KEY=your_key_here
ARBITRUM_SEPOLIA_RPC=https://...
```

Environment variables are loaded from root `.env` and accessible to all packages.

## 🧪 Testing Strategy

```bash
# Test everything
npm test

# Test specific package
npm test --workspace=packages/contracts

# Watch mode for development
cd packages/backend
npm run test:watch
```

## 🚢 Deployment Workflow

1. **Deploy Contracts**
   ```bash
   cd packages/contracts
   npm run deploy:testnet
   ```

2. **Deploy TEE Worker**
   ```bash
   cd packages/tee-worker
   npm run deploy:iexec
   ```

3. **Deploy Backend**
   ```bash
   cd packages/backend
   npm run deploy
   ```

4. **Build Mobile App**
   ```bash
   cd packages/mobile
   npm run build:android
   npm run build:ios
   ```

## 🔍 Troubleshooting

### Issue: `npm install` fails
**Solution**: 
```bash
rm -rf node_modules package-lock.json
rm -rf packages/*/node_modules
npm install
```

### Issue: Workspace not found
**Solution**: Ensure you're running commands from project root or correct package directory.

### Issue: Import errors between packages
**Solution**: Reference packages by their relative paths or configure path aliases.

## 📚 Additional Resources

- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Monorepo Best Practices](https://monorepo.tools/)
- [Project Architecture](docs/ARCHITECTURE.md)

---

**Remember**: Always work from the `iExecX/` root directory for monorepo commands!
