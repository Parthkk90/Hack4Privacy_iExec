# TEE Worker Package

Rust-based Trusted Execution Environment workers for confidential computation on iExec.

## Workers

### Credit Scorer (`credit-scorer`)
Computes private credit scores based on:
- Payment history (40%)
- Credit utilization (30%)
- Trading skill (20%)
- Portfolio diversification (10%)

### Strategy Executor (`strategy-executor`)
Generates private trading signals using:
- Momentum indicators
- RSI analysis
- Volatility calculations
- Volume trends

## Development

### Prerequisites
- Rust 1.75+
- Docker Desktop
- iExec SDK

### Setup

```bash
# Install dependencies
cargo build

# Run tests
cargo test

# Build release
cargo build --release
```

### Docker Build

```bash
# Build Docker image
docker build -t privatealpha-tee:latest .

# Test locally
docker run --rm privatealpha-tee:latest /app/credit-scorer --help
```

## Deployment to iExec

### 1. Build and Push Docker Image

```bash
# Build image
docker build -t yourusername/privatealpha-tee:latest .

# Push to Docker Hub
docker login
docker push yourusername/privatealpha-tee:latest
```

### 2. Initialize iExec

```bash
# Create wallet
iexec wallet create

# Get RLC from faucet
# Visit: https://faucet.iex.ec/

# Show wallet
iexec wallet show
```

### 3. Deploy App

```bash
# Deploy to iExec marketplace
iexec app deploy --chain arbitrum-sepolia

# Deploy dataset (if needed)
iexec dataset deploy --chain arbitrum-sepolia
```

### 4. Test Execution

```bash
# Buy computation
iexec app run <APP_ADDRESS> --chain arbitrum-sepolia

# Check task
iexec task show <TASK_ID> --chain arbitrum-sepolia

# Download result
iexec task download <TASK_ID> --chain arbitrum-sepolia
```

## TEE Features

- **Confidential Computation**: All data processed in SGX enclave
- **Attestation**: Remote attestation for proof of execution
- **Encryption**: End-to-end encryption for inputs/outputs
- **SCONE Framework**: Production-ready TEE framework

## Testing

```bash
# Run unit tests
cargo test

# Run specific test
cargo test test_credit_score_calculation

# Test with output
cargo test -- --nocapture
```

## Security

- Secure enclave execution (SGX)
- Encrypted input/output
- No data leakage
- Attestation verification
- Side-channel protection

## License

MIT
