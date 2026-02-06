# PrivateAlpha - Architecture & Technical Design

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Mobile App (React Native)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Welcome  │->│  Credit  │->│Dashboard │->│Execution │   │
│  │  Screen  │  │  Score   │  │  Screen  │  │  Screen  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
                     v
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (Node.js/Express)              │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────┐ │
│  │ Credit Score   │  │ Opportunities  │  │ Trade Execute │ │
│  │ Endpoint       │  │ Endpoint       │  │ Endpoint      │ │
│  └────────┬───────┘  └────────┬───────┘  └───────┬───────┘ │
└───────────┼──────────────────┼───────────────────┼─────────┘
            │                  │                   │
            v                  v                   v
┌─────────────────────────────────────────────────────────────┐
│                    iExec Network (TEE)                       │
│  ┌────────────────────┐         ┌─────────────────────────┐ │
│  │  Credit Scorer     │         │  Strategy Executor      │ │
│  │  (Rust/SCONE)      │         │  (Rust/SCONE)          │ │
│  │  - Decrypt data    │         │  - Find signals        │ │
│  │  - Compute score   │         │  - Calculate targets   │ │
│  │  - Generate proof  │         │  - Generate proofs     │ │
│  └────────────────────┘         └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
            │                                      │
            v                                      v
┌─────────────────────────────────────────────────────────────┐
│              Arbitrum Sepolia Blockchain                     │
│  ┌──────────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ CreditScore      │  │  Strategy    │  │  Flashbots    │ │
│  │ Registry         │  │  Executor    │  │  Relayer      │ │
│  └──────────────────┘  └──────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Data Flow - Credit Score Computation

```
User Wallet -> Mobile App
    |
    | 1. Connect wallet
    v
Mobile App collects trading history
    |
    | 2. Encrypt data
    v
Backend API receives request
    |
    | 3. Submit to iExec
    v
iExec TEE Worker (SCONE)
    |
    | 4. Decrypt in secure enclave
    | 5. Calculate:
    |    - Payment history (40%)
    |    - Utilization (30%)
    |    - Trading skill (20%)
    |    - Diversification (10%)
    | 6. Normalize to 300-850 scale
    | 7. Assign tier (1-4)
    | 8. Generate attestation
    v
Result with TEE Attestation
    |
    | 9. Return to backend
    v
Backend verifies attestation
    |
    | 10. Update on-chain
    v
CreditScoreRegistry Contract
    |
    | 11. Store score hash + attestation
    v
Mobile App displays score
```

## 💡 Smart Contract Design

### CreditScoreRegistry.sol

**Purpose**: Store encrypted credit scores with TEE attestations

**Key Functions**:
- `updateScore()`: Only callable by authorized TEE workers
- `getScore()`: Retrieve user's credit score
- `getTier()`: Get user's tier (1-4)
- `getMaxLeverage()`: Calculate max leverage based on tier
- `verifyAttestation()`: Validate TEE proof

**Security Features**:
- Only authorized TEE addresses can update scores
- Attestations verified before storage
- ReentrancyGuard on state changes
- Owner-controlled TEE authorization

### StrategyExecutor.sol

**Purpose**: Execute trades with TEE-computed strategies

**Key Functions**:
- `executePrivateTrade()`: Execute with proof verification
- `verifyComputationProof()`: Validate strategy computation
- `getUserTrades()`: Get trade history

**Security Features**:
- Proof replay protection (nonce tracking)
- Deadline enforcement
- Slippage protection
- TEE attestation requirement

### FlashbotsRelayer.sol

**Purpose**: MEV-protected transaction submission

**Key Functions**:
- `submitPrivateTransaction()`: Submit encrypted tx
- `executePrivateTransaction()`: Execute by authorized relayer
- `cancelTransaction()`: User can cancel pending tx

**Security Features**:
- Encrypted transaction data
- Block deadline enforcement
- Relayer authorization
- Partial refunds for cancellations

## 🔒 TEE Worker Architecture

### Credit Scorer (Rust)

**Input**: Encrypted wallet data (JSON)
```json
{
  "address": "0x...",
  "trades": [...],
  "loans": [...],
  "liquidations": 0,
  "total_volume": 10000
}
```

**Processing**:
1. Decrypt data inside SCONE enclave
2. Calculate payment history score (0-100)
3. Calculate utilization score (0-100)
4. Calculate trading skill (Sharpe ratio, win rate)
5. Calculate diversification (unique tokens, concentration)
6. Weighted average: `score = p*0.4 + u*0.3 + s*0.2 + d*0.1`
7. Normalize to 300-850 range
8. Assign tier based on score
9. Generate SGX attestation

**Output**: Credit score with attestation
```json
{
  "score": 720,
  "tier": 3,
  "max_leverage": 2.25,
  "attestation": "0x...",
  "factors": {
    "payment_history": 85.0,
    "utilization": 70.0,
    "trading_skill": 65.0,
    "diversification": 55.0
  }
}
```

### Momentum Strategy (Rust)

**Input**: Asset list + price data
```rust
vec!["ETH", "BTC", "SOL"]
```

**Processing**:
1. Load historical price data (180 days)
2. Calculate 3-month returns
3. Calculate 6-month returns
4. Calculate volatility (30-day)
5. Calculate volume trend (20-day)
6. Calculate RSI (14-period)
7. Momentum score = weighted sum
8. Determine signal (BUY/SELL/HOLD)
9. Calculate position size based on volatility
10. Set targets and stops

**Output**: Trading signals
```json
{
  "asset": "ETH",
  "signal": "BUY",
  "confidence": 0.82,
  "entry_price": 2000,
  "target_price": 2150,
  "stop_loss": 1950,
  "recommended_size": 0.15
}
```

## 📱 Mobile App Architecture

### Navigation Flow

```
WelcomeScreen (wallet connection)
    |
    v
CreditScoreScreen (TEE computation + analysis)
    |
    v
DashboardScreen (opportunities list)
    |
    +-> StrategyScreen (signal details)
    |
    +-> ExecutionScreen (trade execution)
```

### State Management

- **React Query** for API calls and caching
- **Navigation State** for screen parameters
- **Local State** (useState) for UI state

### Key Components

1. **WalletConnector**: MetaMask/WalletConnect integration
2. **CreditScoreMeter**: Visual credit score display (SVG gauge)
3. **OpportunityCard**: Trading signal card with metrics
4. **LoadingAnimation**: TEE computation progress

## 🌐 Backend API Design

### Architecture

```
Express Server
    |
    +-- Middleware (CORS, JSON parsing)
    |
    +-- Routes
    |   |-- /health
    |   |-- /api/compute-credit-score
    |   |-- /api/find-opportunities
    |   |-- /api/credit-score/:address
    |   +-- /api/execute-trade
    |
    +-- Services
    |   |-- iExec SDK (TEE interaction)
    |   +-- ethers.js (blockchain interaction)
    |
    +-- Contract Instances
        |-- CreditScoreRegistry
        |-- StrategyExecutor
        +-- FlashbotsRelayer
```

### API Endpoints

#### POST /api/compute-credit-score
- Receives wallet data
- Submits to iExec TEE
- Waits for computation
- Updates on-chain registry
- Returns score + attestation

#### POST /api/find-opportunities
- Receives strategy + assets
- Submits to TEE for analysis
- Returns trading signals sorted by confidence

#### GET /api/credit-score/:address
- Queries on-chain registry
- Returns current credit score
- Includes timestamp and tier

#### POST /api/execute-trade
- Validates trade parameters
- Verifies TEE attestation
- Calls StrategyExecutor contract
- Returns transaction hash

## 🔄 Deployment Pipeline

### Local Development
```
1. Compile contracts -> Deploy to Hardhat network
2. Run TEE worker locally (Docker)
3. Start backend API (mock mode)
4. Run mobile app (Expo web)
```

### Testnet Deployment
```
1. Deploy contracts to Arbitrum Sepolia
2. Verify on Arbiscan
3. Build TEE worker Docker image
4. Deploy to iExec network
5. Configure backend with addresses
6. Deploy backend to cloud (Railway/Render)
7. Test mobile app with testnet
```

### Production (Future)
```
1. Audit smart contracts
2. Deploy to Arbitrum mainnet
3. Use production TEE infrastructure
4. CDN for backend API
5. Publish mobile app to stores
```

## 🔐 Security Considerations

### TEE Security
- All sensitive data processed in SCONE/SGX
- Attestations prove computation integrity
- Encrypted data at rest and in transit
- No logs of sensitive information

### Smart Contract Security
- OpenZeppelin libraries for standard patterns
- ReentrancyGuard on critical functions
- Access control (Ownable)
- Proof replay protection
- Input validation

### API Security
- HTTPS only in production
- JWT authentication (future)
- Rate limiting
- Input sanitization
- Error handling without leaking info

## 📊 Performance Metrics

### Expected Performance

- **Credit Score Computation**: 30-60 seconds (TEE)
- **Strategy Analysis**: 10-20 seconds (TEE)
- **On-chain Transaction**: 2-5 seconds (Arbitrum)
- **API Response Time**: <500ms (excluding TEE)

### Scalability

- **Concurrent Users**: 100+ (backend)
- **iExec Tasks**: Limited by RLC balance
- **Blockchain**: Arbitrum L2 scaling
- **Mobile**: Client-side rendering

## 🚀 Future Enhancements

1. **Advanced Strategies**: Arbitrage, mean reversion, pairs trading
2. **Social Features**: Copy trading, leaderboards
3. **Risk Management**: Portfolio analytics, position sizing
4. **Cross-chain**: Support multiple L2s
5. **Governance**: DAO for parameter adjustment
6. **Insurance**: Protection against liquidations
7. **Notifications**: Push alerts for opportunities
8. **Advanced TEE**: Zero-knowledge proofs, multi-party computation

---

**Last Updated**: February 5, 2026
