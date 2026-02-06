# Architecture Overview

## System Architecture

PrivateAlpha is built as a decentralized platform with four main components:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Mobile    │◄────►│   Backend   │◄────►│  Blockchain │
│     App     │      │     API     │      │  (Arbitrum) │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  iExec TEE  │
                     │   Workers   │
                     └─────────────┘
```

## Components

### 1. Smart Contracts (Solidity)

**CreditScoreRegistry**
- Stores encrypted credit scores on-chain
- Validates TEE attestations
- Provides tier-based leverage limits
- 30-day score expiration

**StrategyExecutor**
- Executes trading strategies
- Verifies computation proofs
- Prevents replay attacks
- Integrates with credit registry

**FlashbotsRelayer**
- MEV-protected transaction submission
- Encrypted transaction storage
- Block deadline enforcement
- Relayer authorization

### 2. TEE Workers (Rust)

**Credit Scorer**
```rust
compute_credit_score(input) -> CreditScoreOutput
- Payment History (40%)
- Credit Utilization (30%)
- Trading Skill (20%)
- Portfolio Diversification (10%)
```

**Momentum Strategy**
```rust
generate_trading_signal(input) -> TradingSignalOutput
- RSI Analysis (14-period)
- 3M & 6M Momentum
- Volatility Calculation
- Volume Trends
```

**Security Features**
- SGX/SCONE enclave execution
- Remote attestation
- Encrypted I/O
- Side-channel protection

### 3. Backend API (Node.js)

**Endpoints**

GET `/health` - Health check
GET `/api/blockchain/credit-score/:address` - Get credit score
POST `/api/tee/compute-credit-score` - Submit TEE task
GET `/api/tee/task/:taskId` - Get task result
POST `/api/trading/opportunities` - Find opportunities
POST `/api/trading/execute` - Execute trade

**Services**
- iExec SDK integration
- Ethers.js blockchain interaction
- Task orchestration
- Mock mode for development

### 4. Mobile App (React Native)

**Screens**
1. Welcome - Wallet connection
2. CreditScore - Animated computation
3. Dashboard - Opportunities list
4. Strategy - Detailed analysis
5. Execution - MEV-protected trade

**State Management**
- React Query for API calls
- React Navigation for routing
- Context for wallet state

## Data Flow

### Credit Score Computation

```
1. User → Mobile App
   "Compute my credit score"

2. Mobile App → Backend API
   POST /api/tee/compute-credit-score
   { userAddress, history, portfolio }

3. Backend → iExec
   Submit task to TEE worker

4. TEE Worker
   - Fetch on-chain data
   - Compute score in enclave
   - Generate attestation
   - Encrypt result

5. iExec → Backend
   Return task ID

6. Backend → Mobile App
   { taskId, status: "SUBMITTED" }

7. Mobile App polls Backend
   GET /api/tee/task/:taskId

8. TEE Worker → Smart Contract
   updateScore(address, score, attestation)

9. Backend → Mobile App
   { score, tier, factors }

10. Mobile App
    Display credit score with tier
```

### Trade Execution

```
1. User selects opportunity
2. Mobile App → Backend API
   POST /api/trading/execute
3. Backend → FlashbotsRelayer
   submitPrivateTransaction(encrypted_data)
4. Relayer queues transaction
5. Relayer submits at optimal block
6. Transaction executes on DEX
7. Backend → Mobile App
   { status: "COMPLETED", executionPrice }
```

## Security Architecture

### Layer 1: Computation Security (TEE)
- SGX enclave isolation
- Memory encryption
- Attestation verification

### Layer 2: Data Security
- End-to-end encryption (AES-GCM-256)
- Private keys never leave wallet
- Encrypted storage

### Layer 3: Smart Contract Security
- OpenZeppelin libraries
- ReentrancyGuard
- Access control
- Input validation

### Layer 4: Network Security
- HTTPS/TLS for API
- MEV protection
- Rate limiting
- DDoS protection

### Layer 5: Operational Security
- Secure key management
- Audit logging
- Monitoring & alerts

## Scalability

### Current Limitations
- Sequential TEE task processing
- On-chain storage costs
- Mobile app synchronous operations

### Future Optimizations
1. **Parallel TEE Execution**
   - Multiple worker instances
   - Load balancing

2. **Off-chain Storage**
   - IPFS for large data
   - On-chain only critical data

3. **Batch Processing**
   - Batch score updates
   - Merkle proofs

4. **Layer 2 Optimization**
   - Arbitrum's low gas costs
   - Optimistic execution

## Technology Choices

### Why Arbitrum?
- Low transaction costs
- Fast finality
- EVM compatibility
- Growing DeFi ecosystem

### Why iExec?
- Production-ready TEE infrastructure
- Decentralized compute marketplace
- SGX/SCONE support
- Blockchain integration

### Why Rust for TEE?
- Memory safety
- Performance
- Small binary size
- SGX support

### Why React Native?
- Cross-platform (iOS/Android/Web)
- Large ecosystem
- Hot reload
- Native performance

## Deployment Architecture

### Development
```
Localhost:
- Hardhat node (contracts)
- Backend API (port 3000)
- Mobile web (Expo)
- Mock TEE responses
```

### Staging
```
Testnet:
- Arbitrum Sepolia contracts
- Railway backend API
- TestFlight/Google Play Beta
- iExec Sepolia TEE workers
```

### Production
```
Mainnet:
- Arbitrum One contracts
- AWS/Railway backend
- App Store/Play Store
- iExec mainnet TEE workers
```

## Monitoring & Observability

### Metrics
- API response times
- TEE task completion rates
- Smart contract gas usage
- Mobile app crashes

### Logging
- Structured JSON logs
- Error tracking (Sentry)
- Analytics (Google Analytics)

### Alerts
- Failed transactions
- TEE worker downtime
- API errors > threshold
- Unusual trading patterns

## Future Enhancements

1. **More Strategies**
   - Arbitrage
   - Mean reversion
   - Market making

2. **Advanced Credit Scoring**
   - Machine learning models
   - Social reputation
   - Cross-chain analysis

3. **Portfolio Management**
   - Automated rebalancing
   - Risk management
   - Performance tracking

4. **Social Features**
   - Strategy sharing
   - Leaderboards
   - Reputation system

---

**For implementation details, see individual package READMEs**
