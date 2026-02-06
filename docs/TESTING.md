# Testing Guide

Comprehensive testing guide for PrivateAlpha.

## Test Structure

```
packages/
├── contracts/test/          # Smart contract tests
├── tee-worker/src/          # Rust unit tests (inline)
├── backend/src/__tests__/   # Backend API tests
└── mobile/src/__tests__/    # Mobile app tests
```

## Smart Contract Tests

### Running Tests

```bash
cd packages/contracts

# Run all tests
npm test

# Run specific test file
npx hardhat test test/CreditScoreRegistry.test.js

# Run with gas reporting
REPORT_GAS=true npm test

# Run with coverage
npm run test:coverage
```

### Test Coverage

Current coverage:
- CreditScoreRegistry: 95%
- StrategyExecutor: (pending)
- FlashbotsRelayer: (pending)

### Writing Tests

Example test structure:
```javascript
describe("ContractName", function () {
  beforeEach(async function () {
    // Setup
  });

  describe("Function Group", function () {
    it("Should do expected behavior", async function () {
      // Test
    });
  });
});
```

## TEE Worker Tests

### Running Tests

```bash
cd packages/tee-worker

# Run all tests
cargo test

# Run specific test
cargo test test_credit_score_calculation

# Run with output
cargo test -- --nocapture

# Run in release mode
cargo test --release
```

### Test Coverage

```bash
# Install tarpaulin
cargo install cargo-tarpaulin

# Generate coverage
cargo tarpaulin --out Html
```

Current test coverage:
- Credit Scoring: 85%
- Momentum Strategy: 80%

## Backend API Tests

### Running Tests

```bash
cd packages/backend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Manual API Testing

```bash
# Start server
npm run dev

# Test health endpoint
curl http://localhost:3000/health

# Test credit score endpoint
curl http://localhost:3000/api/blockchain/credit-score/0x...

# Test TEE computation
curl -X POST http://localhost:3000/api/tee/compute-credit-score \
  -H "Content-Type: application/json" \
  -d '{"userAddress":"0x..."}'

# Test trading opportunities
curl -X POST http://localhost:3000/api/trading/opportunities \
  -H "Content-Type: application/json" \
  -d '{"strategy":"momentum","userAddress":"0x..."}'
```

## Mobile App Tests

### Running Tests

```bash
cd packages/mobile

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test WelcomeScreen
```

### Manual Testing Checklist

**Welcome Screen**
- [ ] Displays app title and features
- [ ] "Connect Wallet" button works
- [ ] Network indicator shows correct network

**Credit Score Screen**
- [ ] Shows loading animation
- [ ] Progress updates (0% → 100%)
- [ ] Status messages update correctly
- [ ] Navigates to Dashboard on completion

**Dashboard Screen**
- [ ] Displays credit score card correctly
- [ ] Shows tier (Bronze/Silver/Gold/Platinum)
- [ ] Lists trading opportunities
- [ ] Pull-to-refresh works
- [ ] Opportunity cards clickable

**Strategy Screen**
- [ ] Displays all opportunity details
- [ ] Shows analysis metrics
- [ ] Lists reasoning points
- [ ] "Execute Trade" button works

**Execution Screen**
- [ ] Shows trade summary
- [ ] MEV protection badge visible
- [ ] "Confirm & Execute" submits trade
- [ ] Shows success/error states
- [ ] Navigates back to Dashboard

## Integration Tests

### End-to-End Flow

```bash
# Terminal 1: Start backend
cd packages/backend && npm run dev

# Terminal 2: Start mobile app
cd packages/mobile && npm run web

# Manual test flow:
# 1. Click "Connect Wallet"
# 2. Wait for credit score computation
# 3. View opportunities on Dashboard
# 4. Select an opportunity
# 5. Execute trade
# 6. Verify success message
```

### Contract Integration Test

```bash
cd packages/contracts

# Start local node
npx hardhat node

# Deploy contracts (in another terminal)
npx hardhat run scripts/deploy.js --network localhost

# Run integration tests
npx hardhat test test/integration.test.js --network localhost
```

## Performance Testing

### Backend Load Testing

```bash
# Install artillery
npm install -g artillery

# Create load test config
cat > load-test.yml << 'EOF'
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API endpoints"
    flow:
      - get:
          url: "/health"
      - get:
          url: "/api/blockchain/credit-score/0x1234567890123456789012345678901234567890"
EOF

# Run load test
artillery run load-test.yml
```

Expected results:
- p95 latency < 500ms
- Error rate < 1%
- Throughput > 100 req/s

### Smart Contract Gas Usage

```bash
cd packages/contracts

# Run with gas reporter
REPORT_GAS=true npm test

# Expected gas costs:
# - updateScore: ~100k gas
# - executePrivateTrade: ~150k gas
# - submitPrivateTransaction: ~80k gas
```

## Security Testing

### Smart Contract Security

```bash
# Install Slither
pip3 install slither-analyzer

# Run security analysis
cd packages/contracts
slither .
```

### Dependency Audit

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check all packages
npm run audit:all
```

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm test
```

## Test Data

### Mock Credit Score Input

```json
{
  "user_address": "0x1234567890123456789012345678901234567890",
  "transaction_history": [
    {
      "timestamp": 1234567890,
      "amount": 100.0,
      "tx_type": "trade",
      "success": true
    }
  ],
  "loan_history": [
    {
      "amount": 1000.0,
      "due_date": 1234567890,
      "paid_on_time": true,
      "repayment_ratio": 1.0
    }
  ],
  "portfolio": {
    "total_value": 10000.0,
    "assets": [
      {
        "symbol": "ETH",
        "value": 5000.0,
        "percentage": 0.5
      }
    ],
    "pnl_history": [0.1, 0.15, 0.12]
  }
}
```

### Mock Trading Signal Input

```json
{
  "symbol": "ETH",
  "timeframe": "1d",
  "price_history": [
    {
      "timestamp": 1234567890,
      "open": 2000.0,
      "high": 2050.0,
      "low": 1980.0,
      "close": 2020.0,
      "volume": 1000000.0
    }
  ],
  "volume_history": [1000000.0, 1100000.0, 1050000.0]
}
```

## Troubleshooting Tests

### Common Issues

**"Network timeout" errors**
```bash
# Increase test timeout in hardhat.config.js
mocha: {
  timeout: 60000
}
```

**"Out of gas" errors**
```bash
# Increase gas limit in test
await contract.function({ gasLimit: 500000 })
```

**TEE worker tests fail**
```bash
# Check Rust toolchain
rustup update

# Clean build
cargo clean && cargo build --release
```

## Coverage Goals

Target coverage by component:
- Smart Contracts: 90%+
- TEE Workers: 85%+
- Backend API: 80%+
- Mobile App: 70%+

---

**Need help? Check the troubleshooting section or open an issue**
