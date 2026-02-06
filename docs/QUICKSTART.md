# PrivateAlpha Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+
- Rust 1.75+
- Docker Desktop
- Git

## 1. Clone & Install

```bash
cd f:\W3\iExec\iExecX

# Install all dependencies
npm install

# Build all packages
npm run build
```

## 2. Configure Environment

```bash
# Copy environment template
copy .env.example .env

# Edit .env with your values:
# - PRIVATE_KEY (your wallet private key)
# - ARBITRUM_SEPOLIA_RPC (Alchemy/Infura URL)
# - ARBISCAN_API_KEY (for contract verification)
```

## 3. Deploy Contracts

```bash
cd packages/contracts

# Start local testnet (optional)
npm run node

# Deploy to Arbitrum Sepolia
npm run deploy:testnet

# Contracts will be deployed and addresses saved to deployments/arbitrum-sepolia.json
```

## 4. Build TEE Worker

```bash
cd packages/tee-worker

# Build Rust binaries
cargo build --release

# Build Docker image
docker build -t privatealpha-tee:latest .

# Test locally
docker run --rm privatealpha-tee:latest /app/credit-scorer --help
```

## 5. Start Backend

```bash
cd packages/backend

# Install dependencies
npm install

# Start development server
npm run dev

# Backend will run on http://localhost:3000
```

## 6. Run Mobile App

```bash
cd packages/mobile

# Install dependencies
npm install

# Start Expo (web)
npm run web

# App will open in browser
```

## Test the Flow

1. **Connect Wallet** - Click "Connect Wallet" on Welcome screen
2. **Compute Score** - Watch animated credit score computation
3. **View Dashboard** - See trading opportunities
4. **Select Strategy** - Tap on an opportunity
5. **Execute Trade** - Submit MEV-protected trade

## Development Mode

Set `NODE_ENV=development` in `.env` to use mock data without:
- Deployed contracts
- iExec app
- Testnet funds

## Get Testnet Funds

- **Arbitrum Sepolia ETH**: https://faucet.quicknode.com/arbitrum/sepolia
- **iExec RLC**: https://faucet.iex.ec/

## Next Steps

- [Deploy to Production](DEPLOYMENT.md)
- [Run Tests](TESTING.md)
- [Architecture Overview](ARCHITECTURE.md)

## Troubleshooting

**Contracts won't deploy?**
- Check you have Arbitrum Sepolia ETH
- Verify RPC URL is correct
- Try increasing gas limit

**Backend won't start?**
- Check Node.js version (18+)
- Verify .env file exists
- Check port 3000 is available

**Mobile app errors?**
- Clear Expo cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Support

- GitHub Issues: Report bugs
- Documentation: Full guides in `docs/`
- Examples: Sample code in each package

---

**Ready to build? Let's go! 🚀**
