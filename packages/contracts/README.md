# Smart Contracts Package

Solidity smart contracts for the PUREIS  trading platform, deployed on Arbitrum Sepolia.

## Contracts

### CreditScoreRegistry.sol
Stores encrypted credit scores with TEE attestations. Features:
- Score updates from authorized TEE workers
- Tier-based leverage calculation (0.75x - 3.0x)
- Score expiration (30 days)
- Attestation verification

### StrategyExecutor.sol
Executes trading strategies with proof verification. Features:
- Private trade execution
- Computation proof verification
- Replay attack prevention
- Integration with CreditScoreRegistry

### FlashbotsRelayer.sol
Provides MEV-protected transaction submission. Features:
- Encrypted transaction submission
- Block deadline enforcement
- Relayer authorization
- Transaction cancellation with refunds

## Setup

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

### Local Development
```bash
# Start local node
npm run node

# Deploy (in another terminal)
npm run deploy:local
```

### Arbitrum Sepolia Testnet
```bash
# Configure .env file first
npm run deploy:testnet

# Verify contracts
npm run verify
```

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/CreditScoreRegistry.test.js

# Generate coverage report
npm run test:coverage
```

## Gas Optimization

Contracts are optimized with:
- Optimizer enabled (200 runs)
- Via IR compilation
- Efficient storage patterns
- Minimal external calls

## Security

- OpenZeppelin contracts for security patterns
- ReentrancyGuard on sensitive functions
- Access control with Ownable
- Input validation throughout
- Comprehensive test coverage

## Contract Addresses

After deployment, addresses will be saved to `deployments/arbitrum-sepolia.json`

## License

MIT
