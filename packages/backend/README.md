# Backend API Package

Node.js REST API for PrivateAlpha, orchestrating blockchain interactions and TEE computations.

## Features

- **Blockchain Integration**: Read credit scores from Arbitrum Sepolia
- **iExec TEE**: Submit and monitor computation tasks
- **Trading Endpoints**: Find opportunities and execute trades
- **Mock Mode**: Development mode without testnet dependencies

## API Endpoints

### Health Check
```
GET /health
```

### Blockchain
```
GET /api/blockchain/credit-score/:address
GET /api/blockchain/credit-score-details/:address
```

### TEE Computation
```
POST /api/tee/compute-credit-score
GET /api/tee/task/:taskId
```

### Trading
```
POST /api/trading/opportunities
POST /api/trading/execute
GET /api/trading/trade/:txId
```

## Setup

```bash
# Install dependencies
npm install

# Configure environment (in root .env)
ARBITRUM_SEPOLIA_RPC=https://arb-sepolia.g.alchemy.com/v2/YOUR_KEY
CREDIT_SCORE_REGISTRY_ADDRESS=0x...
IEXEC_APP_ADDRESS=0x...

# Start development server
npm run dev

# Start production server
npm start
```

## Development

```bash
# Run with auto-reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Deployment

### Railway
```bash
railway login
railway init
railway up
```

### Render
```bash
# Connect GitHub repo in Render dashboard
# Set environment variables
# Deploy
```

## Mock Mode

Set `NODE_ENV=development` to use mock responses without needing:
- Deployed contracts
- iExec app
- Testnet funds

## License

MIT
