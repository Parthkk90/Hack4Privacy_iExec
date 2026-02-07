# PUREIS  Backend API

Production-ready Express.js backend for PUREIS , featuring full iExec TEE integration, transaction signing, gas optimization, and comprehensive error handling.

## Features

### ✅ Transaction Signing
- **Wallet Management**: Automatic wallet initialization from `PRIVATE_KEY` environment variable
- **Signer Integration**: ethers.js Wallet connected to all contract instances
- **Nonce Management**: Automatic transaction sequencing
- **Retry Logic**: Exponential backoff for failed transactions (max 3 retries)

### ✅ Gas Estimation & Optimization
- **Pre-Transaction Estimation**: `estimateGas()` called before every transaction
- **Safety Buffer**: 20% buffer added to estimated gas limits
- **Dynamic Gas Pricing**: Fetches current network fees via `getFeeData()`
- **Gas Price Cap**: Maximum 50 gwei configurable limit
- **Usage Reporting**: Logs actual gas consumed post-transaction

### ✅ Error Handling
- **Categorized Errors**: Network, validation, authorization, timeout errors
- **Retryable Flags**: Client notified which errors can be retried
- **Enhanced Messages**: User-friendly error descriptions
- **Development Mode**: Full stack traces in dev environment
- **Global Middleware**: Catches uncaught exceptions

### ✅ TEE Result Parsing
- **Format Detection**: Handles string, Buffer, and object inputs
- **Field Validation**: Ensures required fields (score, tier, attestation) present
- **Range Checks**: Validates score (300-850) and tier (1-4)
- **Hex Conversion**: Automatically converts attestation to bytes format
- **Error Recovery**: Graceful handling of malformed TEE responses

### ✅ Contract Attestation Updates
- **Score Hash**: Generates keccak256 hash of score data
- **Gas Estimation**: Pre-estimates updateScore() transaction
- **Retry Logic**: 3 attempts with exponential backoff
- **Confirmation Wait**: Waits for 2 block confirmations
- **Event Logging**: Returns transaction hash, block, and gas used

### ✅ iExec Task Failure Handling
- **Status Polling**: Checks task status every 5 seconds
- **Timeout Detection**: 5-minute maximum wait time
- **Failure States**: Detects FAILED, TIMEOUT, CANCELLED statuses
- **Automatic Retry**: Retries network errors (not task failures)
- **Result Fetching**: Automatically retrieves and parses completed results

## API Endpoints

### `POST /api/compute-credit-score`
Compute user credit score via TEE with on-chain attestation update.

**Request:**
```json
{
  "walletAddress": "0x...",
  "encryptedData": {
    "income": "encrypted",
    "tradingHistory": "encrypted"
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "taskId": "0x1234...",
  "walletAddress": "0x...",
  "score": 720,
  "tier": 3,
  "max_leverage": 2.25,
  "attestation": "0xabcd...",
  "transaction": {
    "txHash": "0x5678...",
    "blockNumber": 12345,
    "gasUsed": "89432"
  },
  "factors": {
    "payment_history": 85.0,
    "utilization": 70.0,
    "trading_skill": 65.0,
    "diversification": 55.0
  }
}
```

**Response (Error):**
```json
{
  "error": "TEE computation timeout",
  "message": "The credit score computation took too long. Please try again.",
  "retryable": true
}
```

### `POST /api/execute-trade`
Execute a trading strategy with TEE proof verification.

**Request:**
```json
{
  "trade": {
    "token": "0x...",
    "amount": 1.5,
    "isBuy": true,
    "strategyHash": "0xabcd...",
    "maxSlippage": 100,
    "deadline": 1735000000
  },
  "teeAttestation": {
    "proof": "0x1234..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x...",
  "blockNumber": 12346,
  "gasUsed": "156789",
  "trade": {
    "token": "0x...",
    "amount": 1.5,
    "type": "BUY"
  }
}
```

### `GET /api/task/:taskid`
Get iExec task status and results.

**Response (Completed):**
```json
{
  "taskid": "0x...",
  "status": "COMPLETED",
  "result": {
    "score": 720,
    "tier": 3,
    "attestation": "0x..."
  },
  "completedAt": "2024-01-15T10:30:00Z",
  "message": "Task completed successfully"
}
```

**Response (Failed):**
```json
{
  "taskid": "0x...",
  "status": "FAILED",
  "error": "Task execution failed",
  "details": "TEE verification failed",
  "retryable": false
}
```

### `GET /api/credit-score/:address`
Fetch on-chain credit score.

**Response:**
```json
{
  "address": "0x...",
  "score": 720,
  "tier": 3,
  "timestamp": 1735000000,
  "isActive": true
}
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Required
PRIVATE_KEY=0x...                               # Wallet for signing transactions
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup...  # RPC endpoint
CREDIT_SCORE_REGISTRY=0x...                     # Deployed contract address
STRATEGY_EXECUTOR=0x...                         # Deployed contract address
IEXEC_APP_ADDRESS=0x...                         # TEE app address

# Optional
API_PORT=3000                                    # Default: 3000
MAX_GAS_PRICE_GWEI=50                           # Default: 50
GAS_MULTIPLIER=1.2                              # Default: 1.2 (20% buffer)
NODE_ENV=development                            # development | production
```

### Gas Configuration

Adjust gas settings for different networks:

- **Arbitrum Sepolia**: MAX_GAS_PRICE=50, MULTIPLIER=1.2 (recommended)
- **Arbitrum One**: MAX_GAS_PRICE=2, MULTIPLIER=1.1 (L2 is cheap)
- **Ethereum**: MAX_GAS_PRICE=200, MULTIPLIER=1.3 (higher volatility)

## Installation

```bash
cd backend
npm install
```

## Running

### Development Mode
```bash
npm run dev
```
- Mock data returned when contracts not configured
- Full error stack traces
- CORS enabled for localhost

### Production Mode
```bash
NODE_ENV=production npm start
```
- Requires all contracts configured
- Minimal error details
- Restricted CORS

## Error Codes

| Code | Type | Retryable | Description |
|------|------|-----------|-------------|
| 400 | Validation | No | Invalid request parameters |
| 402 | Payment | No | Insufficient funds for gas/trade |
| 403 | Authorization | No | Unauthorized or insufficient tier |
| 404 | Not Found | No | Task/resource not found |
| 500 | Server | No | Internal server error |
| 503 | Network | Yes | Network connectivity issues |
| 504 | Timeout | Yes | TEE computation timeout |

When `retryable: true`, clients should implement exponential backoff retry.

## Logging

All operations log with emoji prefixes:

- 🚀 Server startup
- 📊 Task status checks
- 🔒 TEE operations
- ⚡ Trade executions
- ⛽ Gas estimations
- ✅ Successful operations
- ⚠️ Warnings
- ❌ Errors

## Security

### Transaction Safety
- Private keys loaded from environment (never hardcoded)
- Gas price capped to prevent excessive fees
- Gas estimation prevents out-of-gas failures
- 2-block confirmation wait before reporting success

### TEE Verification
- Attestation required for all score updates
- Proof verification in smart contracts
- TEE worker authorization checks

### Input Validation
- All addresses validated with `ethers.isAddress()`
- Numeric ranges checked (score, tier, amounts)
- Required fields validated before processing

## Testing

```bash
# Test with mock data (no contracts needed)
npm run dev

# Test credit score endpoint
curl -X POST http://localhost:3000/api/compute-credit-score \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0xBf8E022195f387dB0C28C741d1A7b1BeD1144B3C","encryptedData":{}}'

# Test trade endpoint
curl -X POST http://localhost:3000/api/execute-trade \
  -H "Content-Type: application/json" \
  -d '{"trade":{"token":"0x...","amount":1,"isBuy":true},"teeAttestation":{"proof":"0x..."}}'
```

## Architecture

```
┌──────────────┐
│ Mobile App   │
└──────┬───────┘
       │ REST API
┌──────▼───────────────────────────────┐
│     Express.js Server                │
│  ┌────────────────────────────────┐ │
│  │ Transaction Signing & Gas Mgmt │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ TEE Integration & Task Monitor │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ Error Handling & Retry Logic   │ │
│  └────────────────────────────────┘ │
└──────┬───────────────┬───────────────┘
       │               │
   ┌───▼────┐    ┌─────▼──────┐
   │ iExec  │    │ Arbitrum   │
   │  TEE   │    │  Sepolia   │
   └────────┘    └────────────┘
```

## Dependencies

- **express**: Web server framework
- **cors**: Cross-origin resource sharing
- **ethers**: Blockchain interaction (v6)
- **iexec**: TEE computation client
- **dotenv**: Environment configuration

## Development Notes

### Adding New Endpoints

1. Add route handler with try-catch
2. Validate inputs with specific error messages
3. Use utility functions (estimateGasWithBuffer, retryWithBackoff)
4. Return structured JSON with success/error fields
5. Log operations with emoji prefixes

### Transaction Pattern

```javascript
// Estimate gas
const gasLimit = await estimateGasWithBuffer(contract.method, ...args);

// Get gas price
const gasPrice = await getOptimalGasPrice();

// Execute with retry
const tx = await retryWithBackoff(async () => {
  return await contract.method(...args, { gasLimit, gasPrice });
});

// Wait for confirmation
const receipt = await tx.wait(2);
```

### TEE Pattern

```javascript
// Submit task
const task = await retryWithBackoff(async () => {
  return await iexec.task.run({ app, params });
});

// Wait for completion
const result = await waitForIExecTask(task.taskid);

// Parse and validate
const parsed = parseTEEResult(result);

// Update on-chain
await updateCreditScoreOnChain(address, parsed);
```

## Support

For issues or questions:
- GitHub: https://github.com/Parthkk90/Hack4Privacy_iExec
- Documentation: See ARCHITECTURE.md in project root
