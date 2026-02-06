# PrivateAlpha - Visual Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER DEVICE                                  │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │              Mobile App (React Native/Expo)                 │    │
│  │                                                              │    │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐ │    │
│  │  │ Welcome  │──>│  Credit  │──>│Dashboard │──>│Execute  │ │    │
│  │  │  Screen  │   │  Score   │   │  Screen  │   │ Screen  │ │    │
│  │  └──────────┘   └──────────┘   └──────────┘   └─────────┘ │    │
│  │                                                              │    │
│  │  ┌──────────────────────────────────────────────────────┐  │    │
│  │  │           Services (API, Blockchain, Wallet)         │  │    │
│  │  └──────────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                │ HTTPS / REST API
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                        BACKEND SERVER                                 │
│                     (Node.js / Express)                              │
│                                                                      │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────┐  │
│  │  Credit Score  │  │  Opportunities │  │   Trade Execution    │  │
│  │   Endpoint     │  │    Endpoint    │  │      Endpoint        │  │
│  └────────┬───────┘  └────────┬───────┘  └──────────┬───────────┘  │
│           │                   │                      │               │
│           │                   │                      │               │
│  ┌────────▼───────────────────▼──────────────────────▼───────────┐  │
│  │              iExec SDK & Ethers.js Integration                 │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────┬──────────────────────┘
                       │                       │
         ┌─────────────▼────────┐   ┌─────────▼──────────┐
         │                      │   │                     │
         │   iExec Network      │   │  Arbitrum Sepolia   │
         │   (TEE Workers)      │   │    (Blockchain)     │
         │                      │   │                     │
         └──────────────────────┘   └─────────────────────┘

```

## Credit Score Computation Flow

```
┌─────────────┐
│   User      │
│ Wallet Data │
└──────┬──────┘
       │
       │ 1. Request credit score
       ▼
┌─────────────────────┐
│   Mobile App        │
│ Collects & Encrypts │
└──────┬──────────────┘
       │
       │ 2. POST /api/compute-credit-score
       ▼
┌──────────────────────┐
│   Backend API        │
│ Validates & Forwards │
└──────┬───────────────┘
       │
       │ 3. Submit to iExec
       ▼
┌──────────────────────────────────────────┐
│     iExec TEE Worker (SCONE Enclave)     │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Step 1: Decrypt Data              │ │
│  └────────┬───────────────────────────┘ │
│           │                              │
│  ┌────────▼───────────────────────────┐ │
│  │  Step 2: Calculate Factors         │ │
│  │  • Payment History      (40%)      │ │
│  │  • Utilization         (30%)      │ │
│  │  • Trading Skill       (20%)      │ │
│  │  • Diversification     (10%)      │ │
│  └────────┬───────────────────────────┘ │
│           │                              │
│  ┌────────▼───────────────────────────┐ │
│  │  Step 3: Weighted Sum              │ │
│  │  raw_score = Σ (factor * weight)   │ │
│  └────────┬───────────────────────────┘ │
│           │                              │
│  ┌────────▼───────────────────────────┐ │
│  │  Step 4: Normalize (300-850)       │ │
│  │  final = raw * 5.5 + 300           │ │
│  └────────┬───────────────────────────┘ │
│           │                              │
│  ┌────────▼───────────────────────────┐ │
│  │  Step 5: Assign Tier (1-4)         │ │
│  │  750-850 → Platinum                │ │
│  │  650-749 → Gold                    │ │
│  │  550-649 → Silver                  │ │
│  │  300-549 → Bronze                  │ │
│  └────────┬───────────────────────────┘ │
│           │                              │
│  ┌────────▼───────────────────────────┐ │
│  │  Step 6: Generate Attestation      │ │
│  │  (SGX/SCONE signature)             │ │
│  └────────┬───────────────────────────┘ │
└───────────┼──────────────────────────────┘
            │
            │ 4. Return result
            ▼
   ┌────────────────────┐
   │   Backend API      │
   │ Verifies Attestation│
   └────────┬───────────┘
            │
            │ 5. Update on-chain
            ▼
   ┌──────────────────────┐
   │ CreditScoreRegistry  │
   │     (Smart Contract)  │
   └────────┬─────────────┘
            │
            │ 6. Return to user
            ▼
   ┌─────────────────┐
   │   Mobile App    │
   │ Display Score   │
   └─────────────────┘
```

## Trade Execution Flow

```
  ┌─────────────┐
  │    User     │
  │ Selects     │
  │ Opportunity │
  └──────┬──────┘
         │
         │ 1. Initiate trade
         ▼
┌─────────────────────┐
│   Mobile App        │
│ ExecutionScreen     │
└──────┬──────────────┘
       │
       │ 2. POST /api/execute-trade
       ▼
┌──────────────────────┐
│   Backend API        │
└──────┬───────────────┘
       │
       │ 3. Request TEE computation
       ▼
┌──────────────────────────────────────────┐
│     iExec TEE Worker                     │
│  ┌────────────────────────────────────┐ │
│  │  • Encrypt strategy                │ │
│  │  • Compute optimal execution       │ │
│  │  • Generate proof                  │ │
│  │  • Create attestation              │ │
│  └────────┬───────────────────────────┘ │
└───────────┼──────────────────────────────┘
            │
            │ 4. Return proof
            ▼
   ┌────────────────────┐
   │   Backend API      │
   └────────┬───────────┘
            │
            │ 5. Call smart contract
            ▼
   ┌──────────────────────────────────────┐
   │   StrategyExecutor Contract          │
   │  ┌────────────────────────────────┐  │
   │  │  • Verify proof                │  │
   │  │  • Check attestation           │  │
   │  │  • Execute trade               │  │
   │  │  • Emit event                  │  │
   │  └────────┬───────────────────────┘  │
   └───────────┼──────────────────────────┘
               │
               │ 6. Submit to relayer
               ▼
   ┌──────────────────────────────────────┐
   │   FlashbotsRelayer Contract          │
   │  ┌────────────────────────────────┐  │
   │  │  • Encrypt transaction         │  │
   │  │  • Submit privately            │  │
   │  │  • Prevent MEV                 │  │
   │  └────────┬───────────────────────┘  │
   └───────────┼──────────────────────────┘
               │
               │ 7. Execute on-chain
               ▼
   ┌──────────────────────────────────────┐
   │      Arbitrum Sepolia L2             │
   │      Transaction Confirmed           │
   └────────┬─────────────────────────────┘
            │
            │ 8. Return tx hash
            ▼
   ┌─────────────────┐
   │   Mobile App    │
   │ Success Screen  │
   └─────────────────┘
```

## Component Interaction Matrix

```
┌────────────────┬─────────┬─────────┬──────────┬──────────┬──────────┐
│ Component      │ Wallet  │ Backend │ iExec    │ Contract │ Mobile   │
├────────────────┼─────────┼─────────┼──────────┼──────────┼──────────┤
│ Mobile App     │   R/W   │   R/W   │    -     │    R     │    -     │
├────────────────┼─────────┼─────────┼──────────┼──────────┼──────────┤
│ Backend API    │    -    │    -    │   R/W    │   R/W    │   R/W    │
├────────────────┼─────────┼─────────┼──────────┼──────────┼──────────┤
│ TEE Worker     │    -    │    R    │    -     │    W     │    -     │
├────────────────┼─────────┼─────────┼──────────┼──────────┼──────────┤
│ Smart Contract │    R    │    R    │    R     │    -     │    -     │
└────────────────┴─────────┴─────────┴──────────┴──────────┴──────────┘

R = Read, W = Write
```

## Data Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Layer 5: User Device                      │
│  • Wallet private keys                                      │
│  • Local storage encryption                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────▼───────────────────────────────────┐
│                    Layer 4: Backend API                      │
│  • API key authentication (future)                          │
│  • Rate limiting                                            │
│  • Input validation                                         │
└─────────────────────────┬───────────────────────────────────┘
                          │ Encrypted
┌─────────────────────────▼───────────────────────────────────┐
│                    Layer 3: TEE Worker                       │
│  • SCONE/SGX enclave                                        │
│  • Memory encryption                                        │
│  • Attestation generation                                   │
└─────────────────────────┬───────────────────────────────────┘
                          │ Signed
┌─────────────────────────▼───────────────────────────────────┐
│                   Layer 2: Smart Contract                    │
│  • Access control                                           │
│  • Proof verification                                       │
│  • Replay protection                                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   Layer 1: Blockchain                        │
│  • Immutable ledger                                         │
│  • Consensus mechanism                                      │
│  • Network validation                                       │
└─────────────────────────────────────────────────────────────┘
```

## Tier System Visualization

```
Credit Score: 300 ──────────────────────────────────────> 850
                │          │          │          │
                │          │          │          │
Tier:       Bronze     Silver      Gold     Platinum
            (1)        (2)         (3)         (4)
                │          │          │          │
Score Range: 300-549   550-649   650-749   750-850
                │          │          │          │
Leverage:      0.75x      1.5x       2.25x      3.0x
                │          │          │          │
Features:     Basic    Enhanced   Premium    Elite
```

## Gas Optimization Flow

```
                    ┌─────────────────┐
                    │  User Action    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Estimate Gas    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
              ┌─────┤ Gas > Threshold?├─────┐
              │     └─────────────────┘     │
              │ No                      Yes │
              │                             │
    ┌─────────▼────────┐        ┌──────────▼─────────┐
    │  Execute Direct  │        │   Batch with       │
    │                  │        │   Other Txs        │
    └─────────┬────────┘        └──────────┬─────────┘
              │                             │
              └─────────┬───────────────────┘
                        │
              ┌─────────▼────────┐
              │  Submit to       │
              │  Flashbots       │
              └─────────┬────────┘
                        │
              ┌─────────▼────────┐
              │  MEV Protection  │
              │  Applied         │
              └──────────────────┘
```

## Mobile App Navigation Tree

```
App
 │
 ├── WelcomeScreen
 │   ├── [Connect Wallet] ──> CreditScoreScreen
 │   └── Features Display
 │
 ├── CreditScoreScreen
 │   ├── Loading Animation
 │   ├── Progress Tracker
 │   └── [Auto Navigate] ──> DashboardScreen
 │
 ├── DashboardScreen
 │   ├── Portfolio Card
 │   ├── Credit Score Card ──> CreditScoreScreen (revisit)
 │   ├── Strategy Selector
 │   │   ├── Momentum
 │   │   ├── Arbitrage
 │   │   └── Mean Reversion
 │   ├── Opportunities List
 │   │   ├── [Details] ──> StrategyScreen
 │   │   └── [Execute] ──> ExecutionScreen
 │   └── Stats Footer
 │
 ├── StrategyScreen
 │   ├── Signal Details
 │   ├── Technical Analysis
 │   └── [Back] ──> DashboardScreen
 │
 └── ExecutionScreen
     ├── Progress (4 steps)
     ├── TEE Computation
     └── Success/Error
         └── [Done] ──> DashboardScreen
```

---

*These diagrams provide a visual overview of the PrivateAlpha architecture and workflows.*
