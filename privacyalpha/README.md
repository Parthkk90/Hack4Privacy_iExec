# PrivateAlpha - Confidential DeFi Analytics iApp

> **Privacy-first financial intelligence platform powered by iExec TEE**

[![iExec](https://img.shields.io/badge/iExec-TEE-green)](https://iex.ec/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

PrivateAlpha is a confidential computing application that provides sophisticated financial analytics while keeping user data completely private. All computations happen inside a Trusted Execution Environment (TEE) - your data is never exposed.

### Features

| Feature | Description |
|---------|-------------|
| **Credit Scoring** | Private credit scores (300-850) based on on-chain history |
| **Momentum Signals** | AI-powered trading signals with technical analysis |
| **Arbitrage Scanner** | Cross-DEX arbitrage opportunity detection |
| **Risk Analysis** | Monte Carlo VaR/CVaR portfolio risk metrics |
| **Bulk Processing** | Process multiple users in a single TEE execution |

## Quick Start

### Prerequisites

- Node.js v18+
- Docker Desktop
- iApp CLI: `npm install -g @iexec/iapp`
- Ethereum wallet

### Test Locally

```bash
# Navigate to project
cd privacyalpha

# Install dependencies
npm install

# Test credit score computation
iapp test --args credit-score

# Test momentum signal generation
iapp test --args momentum ETH

# Test arbitrage scanner
iapp test --args arbitrage

# Test risk analysis
iapp test --args risk

# Run full analysis
iapp test --args full
```

### Deploy to iExec

```bash
# Deploy your iApp
iapp deploy

# Run on iExec network
iapp run <deployed-address> --args credit-score
```

## Usage

### Command Line Arguments

| Argument | Description |
|----------|-------------|
| `credit-score` | Compute private credit score |
| `momentum <symbol>` | Generate trading signal for token |
| `arbitrage [minProfit]` | Scan for arbitrage opportunities |
| `risk [confidence] [horizon]` | Calculate portfolio risk |
| `full` | Run all analyses |
| `help` | Show usage information |

### Examples

```bash
# Credit score with protected data
iapp run <address> --args credit-score --protectedData userdata

# Momentum signal for ETH
iapp run <address> --args momentum ETH

# Arbitrage with $50 minimum profit
iapp run <address> --args arbitrage 50

# Risk analysis with 99% confidence, 7-day horizon
iapp run <address> --args risk 0.99 7

# Bulk processing multiple users
iapp run <address> --args credit-score --protectedData user1 user2 user3
```

## API Reference

### Credit Score Output

```json
{
  "success": true,
  "operation": "credit-score",
  "walletAddress": "0x...",
  "score": 720,
  "tier": 3,
  "tierName": "Gold",
  "maxLeverage": 10,
  "factors": {
    "paymentHistory": 85.5,
    "utilization": 72.0,
    "tradingSkill": 68.5,
    "diversification": 75.0,
    "accountAge": 80.0
  },
  "attestationHash": "0x..."
}
```

### Momentum Signal Output

```json
{
  "success": true,
  "operation": "momentum",
  "symbol": "ETH",
  "signal": "BUY",
  "confidence": 0.75,
  "targetPrice": 2650.00,
  "stopLoss": 2400.00,
  "positionSize": 0.06,
  "indicators": {
    "rsi": 42.5,
    "momentum3m": 12.5,
    "volatility": 3.2,
    "volumeTrend": 1.25
  },
  "reasoning": "RSI approaching oversold; Positive 3M momentum; Increasing volume"
}
```

### Arbitrage Output

```json
{
  "success": true,
  "operation": "arbitrage",
  "opportunities": [{
    "type": "SAME_CHAIN",
    "token": "ETH",
    "buyVenue": { "dex": "curve", "price": 2492.00 },
    "sellVenue": { "dex": "balancer", "price": 2520.00 },
    "spreadPercent": 1.12,
    "netProfitUSD": 45.50,
    "roi": 0.91,
    "confidence": 0.85
  }]
}
```

### Risk Analysis Output

```json
{
  "success": true,
  "operation": "risk",
  "portfolioValue": 135000.00,
  "metrics": {
    "var95": { "percent": 5.2, "amount": 7020.00 },
    "var99": { "percent": 8.1, "amount": 10935.00 },
    "cvar95": { "percent": 7.8, "amount": 10530.00 },
    "volatility": { "daily": 2.8, "annual": 53.5 },
    "sharpeRatio": 1.45,
    "maxDrawdown": 12.5
  },
  "riskScore": 45,
  "riskLevel": "MODERATE"
}
```

## Project Structure

```
privacyalpha/
├── src/
│   ├── app.js                 # Main entry point
│   └── utils/
│       ├── creditScorer.js    # Credit scoring algorithm
│       ├── momentumEngine.js  # Trading signal generation
│       ├── arbitrageScanner.js# Cross-DEX arbitrage
│       ├── riskCalculator.js  # Monte Carlo VaR
│       └── bulkProcessor.js   # Bulk processing
├── input/                     # Test input data
├── output/                    # Test output results
├── cache/                     # Deployment cache
├── iapp.config.json          # iApp configuration
├── package.json
├── Dockerfile
└── README.md
```

## Credit Score Tiers

| Tier | Score Range | Max Leverage | Description |
|------|-------------|--------------|-------------|
| Bronze | 300-579 | 2x | New or risky traders |
| Silver | 580-669 | 5x | Moderate track record |
| Gold | 670-739 | 10x | Good trading history |
| Platinum | 740-850 | 20x | Excellent performance |

## Scoring Factors

| Factor | Weight | Description |
|--------|--------|-------------|
| Payment History | 35% | Loan repayment record |
| Utilization | 30% | Position sizing discipline |
| Trading Skill | 20% | Win rate and profit factor |
| Diversification | 10% | Portfolio spread |
| Account Age | 5% | Time in DeFi |

## Privacy Guarantees

- All data processing occurs inside Intel SGX enclaves
- User data is decrypted only inside the TEE
- Only computed results are returned
- TEE attestation proves computation integrity
- No logs or traces of sensitive data

## Development

```bash
# Install dependencies
npm install

# Run with demo data
iapp test --args credit-score

# Run with custom protected data mock
iapp mock protectedData
iapp test --args credit-score --protectedData myMock

# View output
cat output/result.json | jq
```

## Deployment

```bash
# Deploy to bellecour (default)
iapp deploy

# Deploy to specific chain
iapp deploy --chain bellecour

# Run on deployed app
iapp run 0x... --args full
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- [iExec](https://iex.ec/) - Confidential computing infrastructure
- Built for the Hack4Privacy hackathon

---

**Built with privacy in mind**
