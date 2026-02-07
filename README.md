# 🔐 PrivacyAlpha - AI-Powered Private Trading on iExec TEE

<p align="center">
  <img src="https://img.shields.io/badge/Blockchain-Arbitrum%20Sepolia-blue" alt="Arbitrum"/>
  <img src="https://img.shields.io/badge/TEE-iExec%20Confidential%20Computing-green" alt="iExec"/>
  <img src="https://img.shields.io/badge/Mobile-React%20Native%20%2B%20Expo-purple" alt="React Native"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="MIT"/>
</p>

**PrivacyAlpha** is a privacy-preserving DeFi trading platform that leverages **iExec Trusted Execution Environment (TEE)** to execute AI-driven trading strategies with complete confidentiality. Your trading algorithms and positions are never exposed to the public blockchain.

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRIVACYALPHA SYSTEM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────────────┐  │
│  │  Mobile App  │───▶│   Backend    │───▶│     iExec TEE Worker         │  │
│  │  (React      │    │   (Node.js   │    │  ┌────────────────────────┐  │  │
│  │   Native)    │    │    Express)  │    │  │ Secure Enclave (SGX)   │  │  │
│  │              │    │              │    │  │ ┌──────────────────┐   │  │  │
│  │ • Dashboard  │    │ • Price API  │    │  │ │ Trading Strategy │   │  │  │
│  │ • Trading UI │    │ • Math Engine│    │  │ │ Credit Scoring   │   │  │  │
│  │ • Credit     │    │ • TEE Bridge │    │  │ │ Risk Calculator  │   │  │  │
│  │   Score      │    │              │    │  │ └──────────────────┘   │  │  │
│  └──────────────┘    └──────────────┘    │  └────────────────────────┘  │  │
│         │                   │            └──────────────────────────────┘  │
│         │                   │                          │                    │
│         ▼                   ▼                          ▼                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Arbitrum Sepolia Blockchain                        │  │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────────┐   │  │
│  │  │StrategyExecutor │  │CreditScoreRegistry│  │  FlashbotsRelayer  │   │  │
│  │  │     V2          │  │                   │  │                    │   │  │
│  │  └─────────────────┘  └──────────────────┘  └────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧮 Mathematical Models

### 1. Momentum Strategy Engine

Our trading engine uses a sophisticated multi-timeframe momentum analysis combining several technical indicators:

#### RSI (Relative Strength Index) - 14-Period

```
                    100
RSI = 100 - ─────────────────
             1 + (AvgGain/AvgLoss)

Where:
  AvgGain = EMA of gains over 14 periods
  AvgLoss = EMA of losses over 14 periods
```

**Signal Interpretation:**
```
RSI Value    │ Signal      │ Action
─────────────┼─────────────┼──────────
> 70         │ Overbought  │ SELL
< 30         │ Oversold    │ BUY
30-70        │ Neutral     │ HOLD
```

#### MACD (Moving Average Convergence Divergence)

```
MACD Line = EMA₁₂(Price) - EMA₂₆(Price)
Signal Line = EMA₉(MACD Line)
Histogram = MACD Line - Signal Line

Signal:
  • MACD crosses above Signal → BUY
  • MACD crosses below Signal → SELL
```

**MACD Visualization:**
```
Price Momentum
     ▲
 +2% │      ╭──╮
 +1% │    ╭─╯  ╰──╮     ← MACD Line
  0% │──╭─╯        ╰───────────
 -1% │  │           ╭─╮
 -2% │╭─╯        ──╯  ╰── ← Signal Line
     └────────────────────────▶ Time
        BUY↑    SELL↓    BUY↑
```

### 2. Multi-Timeframe Momentum Scoring

We analyze price momentum across multiple timeframes with weighted importance:

```
┌────────────────────────────────────────────────────────────────────┐
│                MOMENTUM SCORE CALCULATION                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  MomentumScore = w₁(M₇) + w₂(M₃₀) + w₃(M₉₀)                       │
│                                                                    │
│  Where:                                                            │
│    M₇  = 7-day momentum  (weight: 0.5)  ← Short-term signals      │
│    M₃₀ = 30-day momentum (weight: 0.35) ← Medium-term trend       │
│    M₉₀ = 90-day momentum (weight: 0.15) ← Long-term direction     │
│                                                                    │
│  Momentum = (CurrentPrice - PastPrice) / PastPrice                │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

**Timeframe Weight Distribution:**
```
Weight
  ▲
50%│ ████████████████████████████████████  ← 7-day (50%)
   │
35%│ █████████████████████████  ← 30-day (35%)
   │
15%│ ██████████  ← 90-day (15%)
   └──────────────────────────────────────▶
     7d        30d        90d     Timeframe
```

### 3. ATR (Average True Range) - Volatility Measurement

```
True Range = max(High - Low, |High - PrevClose|, |Low - PrevClose|)

ATR₁₄ = EMA₁₄(True Range)

Volatility Level:
  • ATR/Price < 2%  → LOW volatility
  • ATR/Price 2-5%  → MEDIUM volatility
  • ATR/Price > 5%  → HIGH volatility
```

### 4. Sharpe Ratio - Risk-Adjusted Returns

```
              E[Rₚ] - Rᶠ
Sharpe = ─────────────────
              σₚ

Where:
  E[Rₚ] = Expected portfolio return
  Rᶠ    = Risk-free rate (3.5% annual)
  σₚ    = Standard deviation of returns

Interpretation:
  • Sharpe > 2.0 → Excellent risk-adjusted return
  • Sharpe 1-2   → Good
  • Sharpe < 1   → Below average
```

**Sharpe Ratio Visualization:**
```
Return
  ▲
  │                    ╭─── High Sharpe (2.5)
  │                 ╭──╯    Good risk/reward
  │              ╭──╯
  │           ╭──╯─────── Low Sharpe (0.5)
  │        ╭──╯           More risk for same return
  │     ╭──╯
  │  ╭──╯
  └──┴────────────────────────────────────▶ Risk (σ)
```

### 5. Kelly Criterion - Optimal Position Sizing

```
┌────────────────────────────────────────────────────────────────────┐
│                    KELLY CRITERION                                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│         p(b + 1) - 1                                               │
│  f* = ─────────────────                                            │
│              b                                                      │
│                                                                    │
│  Where:                                                            │
│    f* = Optimal fraction of capital to risk                       │
│    p  = Probability of winning (derived from confidence)          │
│    b  = Win/loss ratio (expected return / max loss)               │
│                                                                    │
│  Safety: We use Half-Kelly (f*/2) to reduce volatility            │
│                                                                    │
│  Example:                                                          │
│    Confidence: 75% → p = 0.75                                      │
│    Expected Return: 15% → Win/Loss ratio b = 3                     │
│    Kelly: (0.75 × 4 - 1) / 3 = 0.67 (67%)                         │
│    Half-Kelly Position: 33.5% of portfolio                        │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 6. Signal Determination Algorithm

```
┌─────────────────────────────────────────────────────────────────┐
│                   SIGNAL GENERATION FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   [Price Data] ──▶ [Calculate Indicators] ──▶ [Normalize Scores]│
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │              Combined Signal Score                       │   │
│   │                                                         │   │
│   │  Score = 0.35(RSI) + 0.25(MACD) + 0.25(Mom) + 0.15(Vol)│   │
│   └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           ▼                                     │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │  Score ≥ 0.65  →  STRONG BUY   (High Confidence)       │   │
│   │  Score ≥ 0.52  →  BUY          (Moderate Confidence)   │   │
│   │  Score ≤ 0.35  →  STRONG SELL  (High Confidence)       │   │
│   │  Score ≤ 0.48  →  SELL         (Moderate Confidence)   │   │
│   │  Otherwise     →  HOLD         (No clear signal)       │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7. Credit Score Calculation

```
Credit Score Range: 300 - 850

Components:
┌──────────────────────────────────────────────────────────────────┐
│  Component           │ Weight │ Calculation                      │
├──────────────────────┼────────┼──────────────────────────────────┤
│  Wallet Age          │  20%   │ days_active / 365 × 170         │
│  Transaction Count   │  25%   │ min(tx_count / 100, 1) × 212    │
│  Unique Interactions │  15%   │ unique_contracts × 10           │
│  Balance Consistency │  20%   │ avg_balance_ratio × 170         │
│  DeFi Participation  │  20%   │ defi_protocols × 25             │
├──────────────────────┼────────┼──────────────────────────────────┤
│  Final Score         │  100%  │ 300 + Σ(weighted_components)    │
└──────────────────────┴────────┴──────────────────────────────────┘

Tier System:
  • Tier 5 (800-850): Diamond   - 0.1% fees, max leverage
  • Tier 4 (750-799): Platinum  - 0.2% fees
  • Tier 3 (700-749): Gold      - 0.3% fees
  • Tier 2 (650-699): Silver    - 0.4% fees
  • Tier 1 (300-649): Bronze    - 0.5% fees
```

---

## 🔐 Privacy & Security

### iExec TEE Integration

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TEE EXECUTION FLOW                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  User Request                  TEE Enclave                  Blockchain  │
│       │                            │                            │       │
│       │  1. Encrypt Strategy       │                            │       │
│       │──────────────────────────▶ │                            │       │
│       │                            │                            │       │
│       │    2. Execute in Enclave   │                            │       │
│       │    [Strategy hidden from   │                            │       │
│       │     everyone including     │                            │       │
│       │     infrastructure]        │                            │       │
│       │                            │                            │       │
│       │                            │  3. Submit Signed TX       │       │
│       │                            │ ─────────────────────────▶ │       │
│       │                            │                            │       │
│       │  4. Return Attestation     │                            │       │
│       │ ◀────────────────────────  │                            │       │
│                                                                         │
│  What's Private:                   What's Public:                       │
│  ✓ Trading algorithm               ✓ Transaction hash                   │
│  ✓ Position sizes                  ✓ Token transfers                    │
│  ✓ Entry/exit logic                ✓ TEE attestation                    │
│  ✓ Stop-loss levels                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### MEV Protection

```
Traditional Trade:              PrivacyAlpha Trade:
                                
Mempool ──▶ Frontrunner ──▶ TX  TEE ──▶ Direct to Block
    │           │                      (No mempool exposure)
    │     Sandwich Attack              
    │           │               
    ▼           ▼               Savings: 1.5-3% per trade
  User Loses $$$                (No frontrunning possible)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- React Native / Expo CLI
- Arbitrum Sepolia testnet ETH

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/privacyalpha.git
cd privacyalpha/hack4privacy

# Install dependencies
cd backend && npm install
cd ../mobile && npm install

# Configure environment
cp backend/.env.example backend/.env
# Edit .env with your private key

# Start backend
cd backend && node src/server.js

# Start mobile app (new terminal)
cd mobile && npx expo start
```

### Environment Variables

```env
PRIVATE_KEY=your_wallet_private_key
ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
IEXEC_APP_ADDRESS=0x77978b4d66E473c804a891B9CfA2352f235af59C
```

---

## 📁 Project Structure

```
hack4privacy/
├── backend/
│   └── src/
│       └── server.js          # Express API + Trading Engine
├── mobile/
│   └── src/
│       ├── screens/
│       │   ├── DashboardScreen.js
│       │   ├── StrategyScreen.js
│       │   ├── ExecutionScreen.js
│       │   └── CreditScoreScreen.js
│       └── services/
│           ├── apiService.js       # Backend API client
│           └── blockchainService.js # Web3 integration
├── contracts/
│   ├── StrategyExecutor.sol
│   ├── CreditScoreRegistry.sol
│   └── FlashbotsRelayer.sol
└── privacyalpha/               # TEE Worker (Rust)
    └── src/
        ├── credit_scorer.rs
        └── strategy_executor.rs
```

---

## 🔗 Deployed Contracts (Arbitrum Sepolia)

| Contract | Address |
|----------|---------|
| StrategyExecutorV2 | `0x775A3bE5287314EC1c4dfFbBCa6fD18a1d4CDc32` |
| CreditScoreRegistry | `0xFa3e2a954B10A951Ca5FaaE9c6f0E2EFf58C8EC5` |
| FlashbotsRelayer | `0x81F9B758f597218A5dE87d95C63F46109de02ae6` |
| MockToken | `0x7D7275db87773E8861Bc8457924437E96ae3EB6A` |

**iExec TEE App:** `0x77978b4d66E473c804a891B9CfA2352f235af59C`

---

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/find-opportunities` | POST | Get AI trading signals |
| `/api/execute-trade` | POST | Execute trade on-chain |
| `/api/compute-credit-score` | POST | Calculate credit score |
| `/api/credit-score/:address` | GET | Get stored credit score |
| `/health` | GET | Server health check |

---

## 🧪 Testing

```bash
# Test trading opportunities
curl -X POST http://localhost:3000/api/find-opportunities \
  -H "Content-Type: application/json" \
  -d '{"strategy":"momentum","assets":["ETH","BTC","SOL"]}'

# Test trade execution
curl -X POST http://localhost:3000/api/execute-trade \
  -H "Content-Type: application/json" \
  -d '{"trade":{"token":"0x...","amount":100,"isBuy":true}}'
```

---

## 🏆 Hackathon Submission

Built for **iExec Hack4Privacy Hackathon**

**Key Innovations:**
- First mobile-first private trading platform on iExec
- Real-time AI signals with 90-day momentum analysis
- On-chain credit scoring with TEE attestation  
- MEV-protected trade execution

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  <b>Built with ❤️ for privacy-preserving DeFi</b>
</p>
