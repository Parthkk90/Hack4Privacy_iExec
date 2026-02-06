# 📐 Project Structure Diagram

## ✅ Correct Structure (Current)

```
f:\W3\iExec\iExecX\                      🏠 PROJECT ROOT (work from here)
│
├── 📦 packages/                          Package directory (monorepo)
│   │
│   ├── 🔗 contracts/                     Smart Contracts Package
│   │   ├── contracts/                    Solidity source files
│   │   │   ├── CreditScoreRegistry.sol
│   │   │   ├── StrategyExecutor.sol
│   │   │   └── FlashbotsRelayer.sol
│   │   ├── scripts/
│   │   │   ├── deploy.js
│   │   │   └── verify.js
│   │   ├── test/
│   │   │   └── CreditScoreRegistry.test.js
│   │   ├── hardhat.config.js
│   │   ├── package.json                 ← Package config
│   │   └── README.md
│   │
│   ├── 🦀 tee-worker/                    Rust TEE Workers Package
│   │   ├── src/
│   │   │   ├── bin/
│   │   │   │   ├── credit_scorer.rs
│   │   │   │   └── strategy_executor.rs
│   │   │   ├── credit_scoring.rs
│   │   │   ├── momentum_strategy.rs
│   │   │   ├── types.rs
│   │   │   ├── encryption.rs
│   │   │   ├── attestation.rs
│   │   │   └── lib.rs
│   │   ├── Cargo.toml
│   │   ├── Dockerfile
│   │   ├── iexec.json
│   │   ├── package.json                 ← NPM scripts wrapper
│   │   └── README.md
│   │
│   ├── 🖥️ backend/                       Node.js API Package
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── blockchain.js
│   │   │   │   ├── tee.js
│   │   │   │   └── trading.js
│   │   │   └── server.js
│   │   ├── package.json                 ← Package config
│   │   └── README.md
│   │
│   └── 📱 mobile/                        React Native App Package
│       ├── src/
│       │   ├── screens/
│       │   │   ├── WelcomeScreen.js
│       │   │   ├── CreditScoreScreen.js
│       │   │   ├── DashboardScreen.js
│       │   │   ├── StrategyScreen.js
│       │   │   └── ExecutionScreen.js
│       │   └── services/
│       │       └── api.js
│       ├── App.js
│       ├── package.json                 ← Package config
│       └── README.md
│
├── 📚 docs/                              Documentation
│   ├── ARCHITECTURE.md
│   ├── QUICKSTART.md
│   ├── DEPLOYMENT.md
│   └── TESTING.md
│
├── 🔧 scripts/                           Utility Scripts
│   ├── setup.ps1                         Windows setup
│   └── setup.sh                          Unix/Linux setup
│
├── 📄 Configuration Files                Root-level config
│   ├── package.json                      ← Monorepo config (workspaces)
│   ├── .env.example                      Environment template
│   ├── .gitignore                        Git ignore rules
│   └── LICENSE                           MIT License
│
└── 📖 Documentation Files                Guides & docs
    ├── README.md                         Main project README
    ├── WORKSPACE_GUIDE.md                Structure guide
    ├── MIGRATION_GUIDE.md                Migration instructions
    ├── CONTRIBUTING.md                   Contribution guide
    ├── PROJECT_STATUS.md                 Project status
    └── COMPLETE_STRUCTURE.md             Complete structure doc
```

---

## 🔄 Command Flow

### Installation Flow
```
npm install (at root)
    │
    ├─→ Install root dependencies
    │
    └─→ Install workspace dependencies
            │
            ├─→ packages/contracts/
            ├─→ packages/tee-worker/
            ├─→ packages/backend/
            └─→ packages/mobile/
```

### Build Flow
```
npm run build (at root)
    │
    └─→ Run build in all workspaces
            │
            ├─→ packages/contracts/ → Compile Solidity
            ├─→ packages/tee-worker/ → Build Rust (if configured)
            ├─→ packages/backend/ → Build TypeScript (if configured)
            └─→ packages/mobile/ → Build React Native
```

### Test Flow
```
npm test (at root)
    │
    └─→ Run tests in all workspaces
            │
            ├─→ packages/contracts/ → Hardhat tests
            ├─→ packages/tee-worker/ → Cargo tests
            ├─→ packages/backend/ → Jest/Mocha tests
            └─→ packages/mobile/ → Jest tests
```

---

## 📊 Dependency Graph

```
┌─────────────────────────────────────────────┐
│              Root package.json               │
│         (Monorepo Configuration)             │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┬──────────┐
        │           │           │          │
        ▼           ▼           ▼          ▼
   contracts/   tee-worker/  backend/   mobile/
   package.json package.json package.json package.json
        │           │           │          │
        │           │           │          │
   [Hardhat]   [Cargo.toml]  [Express]  [React Native]
   [OpenZeppelin] [iExec SDK] [Ethers]  [Expo]
```

---

## 🎯 Work Directory Reference

| Task | Working Directory | Command |
|------|------------------|---------|
| Install all packages | `iExecX/` | `npm install` |
| Build all | `iExecX/` | `npm run build` |
| Run all tests | `iExecX/` | `npm test` |
| Deploy contracts | `iExecX/` | `npm run deploy:testnet` |
| Start backend | `iExecX/packages/backend/` | `npm run dev` |
| Or from root | `iExecX/` | `npm run dev:backend` |
| Work on contracts | `iExecX/packages/contracts/` | Any command |
| Build TEE worker | `iExecX/packages/tee-worker/` | `cargo build` |
| Run mobile app | `iExecX/packages/mobile/` | `npm run web` |

---

## ✅ Validation Commands

Run these to verify your structure is correct:

```bash
# 1. Check you're in the right directory
pwd
# Should show: f:\W3\iExec\iExecX

# 2. Verify root package.json has workspaces
cat package.json | grep workspaces
# Should show: "workspaces": ["packages/*"]

# 3. List all packages
npm ls --workspaces --depth=0
# Should show: contracts, tee-worker, backend, mobile

# 4. Verify all packages can be accessed
npm run build
# Should attempt to build all packages
```

---

## 🚫 Common Mistakes to Avoid

### ❌ Wrong
```
f:\W3\iExec\                    ← Old structure (to be removed)
f:\W3\iExec\iExecX\             ← Nested inside old structure
```

### ✅ Correct
```
f:\W3\iExec\iExecX\             ← Single clean monorepo
```

---

## 📝 Notes

1. **Single Source of Truth**: All code lives in `iExecX/packages/`
2. **No Duplicates**: Each component exists in exactly one place
3. **Workspace Commands**: Use npm workspace features for cross-package operations
4. **Documentation**: Centralized in `docs/` and root-level guide files
5. **Environment**: Single `.env` file at root for all packages

---

**Structure Diagram Last Updated:** February 6, 2026
