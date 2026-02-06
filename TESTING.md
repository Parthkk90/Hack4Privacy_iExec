# PrivateAlpha Testing Guide

## 🧪 Testing Strategy

PrivateAlpha includes comprehensive tests for all components:

1. **Smart Contract Tests** (Hardhat/Ethers)
2. **TEE Worker Tests** (Rust/Cargo)
3. **Backend API Tests** (Jest)
4. **Integration Tests** (End-to-end)

## 📋 Running Tests

### Smart Contract Tests

```powershell
# Run all contract tests
npx hardhat test

# Run specific test file
npx hardhat test test/CreditScoreRegistry.test.js

# Run with coverage
npx hardhat coverage

# Run with gas reporting
REPORT_GAS=true npx hardhat test
```

### TEE Worker Tests

```powershell
cd privatealpha-tee

# Run all Rust tests
cargo test

# Run with output
cargo test -- --nocapture

# Run specific test
cargo test test_calculate_payment_history

# Run with coverage
cargo tarpaulin --out Html
```

### Backend API Tests

```powershell
cd backend

# Run all API tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test -- server.test.js
```

## 🎯 Test Coverage

### CreditScoreRegistry.sol

✅ **Deployment**
- Owner is set correctly
- No authorized TEE workers initially

✅ **TEE Authorization**
- Owner can authorize TEE workers
- Emits TEEAuthorized event
- Non-owner cannot authorize
- Owner can revoke authorization

✅ **Score Updates**
- Authorized TEE can update scores
- Emits ScoreUpdated event
- Unauthorized addresses cannot update
- Rejects invalid tier values (0, 5+)
- Rejects invalid score values (<300, >850)
- Increments update count

✅ **Max Leverage Calculation**
- Bronze tier: 0.75x (75)
- Silver tier: 1.5x (150)
- Gold tier: 2.25x (225)
- Platinum tier: 3.0x (300)
- Default: 1.0x (100) for no score

✅ **Score Expiration**
- Recent scores not expired
- Owner can deactivate scores
- Expired scores return true after 30 days

✅ **View Functions**
- getTier() returns correct tier
- getScore() returns full details
- getUpdateCount() returns correct count

### Credit Scorer (Rust)

✅ **Payment History**
- Returns neutral (50) for no loans
- Calculates based on repayment rate
- Penalizes liquidations
- Score range 0-100

✅ **Trading Skill**
- Returns neutral (50) for no trades
- Calculates Sharpe ratio
- Calculates win rate
- Weighted combination
- Score range 0-100

✅ **Tier Assignment**
- 750-850 → Platinum (4)
- 650-749 → Gold (3)
- 550-649 → Silver (2)
- 300-549 → Bronze (1)

### Momentum Strategy (Rust)

✅ **Return Calculation**
- Calculates price change over period
- Handles insufficient data

✅ **Volatility Calculation**
- Calculates standard deviation
- Uses rolling window

✅ **RSI Calculation**
- Returns 0-100 range
- Identifies overbought (>70)
- Identifies oversold (<30)

✅ **Signal Generation**
- BUY signal for high momentum
- SELL signal for low momentum
- HOLD for neutral
- Confidence scoring

## 🔍 Manual Testing Checklist

### Smart Contracts

- [ ] Deploy to testnet
- [ ] Verify on Arbiscan
- [ ] Authorize TEE worker
- [ ] Update credit score
- [ ] Execute trade
- [ ] Submit private transaction

### TEE Worker

- [ ] Build Docker image
- [ ] Run locally with mock data
- [ ] Test credit score computation
- [ ] Test strategy execution
- [ ] Verify attestation generation

### Backend API

- [ ] Health check endpoint
- [ ] Compute credit score
- [ ] Find opportunities
- [ ] Get credit score
- [ ] Execute trade
- [ ] Error handling

### Mobile App

- [ ] Wallet connection
- [ ] Credit score screen
- [ ] Dashboard loading
- [ ] Opportunity cards
- [ ] Trade execution
- [ ] Navigation flow

## 🐛 Test Scenarios

### Happy Path

1. **New User Journey**
   ```
   Connect wallet → Compute credit score → View dashboard →
   → Select opportunity → Execute trade → View confirmation
   ```

2. **Returning User Journey**
   ```
   Connect wallet → Load cached score → Refresh opportunities →
   → Execute trade
   ```

### Edge Cases

1. **No Trading History**
   - Should return neutral score (500-600)
   - Should show Bronze tier
   - Should allow basic trading

2. **Excellent Credit**
   - Score 800+
   - Platinum tier
   - 3x leverage
   - Premium features

3. **Poor Credit**
   - Score <400
   - Bronze tier
   - Limited leverage
   - Basic features only

### Error Scenarios

1. **Insufficient Balance**
   - Error message displayed
   - Suggest getting testnet funds

2. **Network Error**
   - Retry mechanism
   - Fallback to cached data

3. **TEE Timeout**
   - Progress indicator
   - Timeout after 2 minutes
   - Option to retry

4. **Invalid Attestation**
   - Reject transaction
   - Display error message
   - Request new computation

## 📊 Performance Testing

### Metrics to Track

1. **Smart Contract Gas Usage**
   - updateScore: ~100,000 gas
   - executePrivateTrade: ~150,000 gas
   - submitPrivateTransaction: ~80,000 gas

2. **TEE Computation Time**
   - Credit Score: 30-60 seconds
   - Strategy Analysis: 10-20 seconds

3. **API Response Time**
   - Health check: <50ms
   - Database queries: <200ms
   - TEE requests: 30-60s (async)

4. **Mobile App**
   - Initial load: <2s
   - Screen navigation: <100ms
   - API calls: <500ms (excluding TEE)

## 🔐 Security Testing

### Smart Contract Security

- [ ] Reentrancy attacks
- [ ] Access control
- [ ] Integer overflow/underflow
- [ ] Front-running protection
- [ ] Replay attacks

### TEE Security

- [ ] Data encryption
- [ ] Attestation verification
- [ ] Side-channel attacks
- [ ] Memory safety

### API Security

- [ ] SQL injection
- [ ] XSS attacks
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Authentication

## 📝 Test Data

### Mock Wallet Data

```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "trades": [
    {
      "timestamp": 1234567890,
      "token": "ETH",
      "amount": 1.0,
      "price": 2000,
      "is_buy": true,
      "pnl_percent": 5.0
    }
  ],
  "loans": [
    {
      "timestamp": 1234567890,
      "protocol": "Aave",
      "amount": 1000,
      "repaid": true,
      "liquidated": false
    }
  ],
  "liquidations": 0,
  "total_volume": 6000
}
```

### Expected Outputs

**Credit Score**:
- Score: 650-750
- Tier: 3 (Gold)
- Max Leverage: 2.25x

**Trading Signal**:
- Asset: ETH
- Signal: BUY
- Confidence: 0.75-0.85
- Entry: $2000

## 🚀 Continuous Integration

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  smart-contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npx hardhat compile
      - run: npx hardhat test

  tee-worker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions-rs/toolchain@v1
      - run: cd privatealpha-tee && cargo test

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: cd backend && npm install
      - run: cd backend && npm test
```

## ✅ Definition of Done

A feature is complete when:

- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] Code coverage >80%
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Security review done
- [ ] Performance acceptable

## 📞 Reporting Issues

When reporting test failures:

1. **Describe the test**
   - What were you testing?
   - Expected vs actual behavior

2. **Environment**
   - OS, Node version, Rust version
   - Network (local/testnet)

3. **Steps to reproduce**
   - Exact commands run
   - Configuration used

4. **Logs**
   - Error messages
   - Stack traces
   - Gas reports

---

**Run tests before every commit!** 🧪
