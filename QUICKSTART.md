# PrivateAlpha - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies (2 minutes)

```powershell
# Navigate to project
cd f:\W3\iExec

# Install contract dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install mobile dependencies  
cd mobile
npm install
cd ..
```

### Step 2: Configure Environment (1 minute)

```powershell
# Create .env file
Copy-Item .env.example .env

# Edit .env and add:
# PRIVATE_KEY=your_wallet_private_key
# ARBITRUM_SEPOLIA_RPC=https://sepolia-rollup.arbitrum.io/rpc
```

### Step 3: Deploy Contracts (2 minutes)

```powershell
# Compile
npx hardhat compile

# Test
npx hardhat test

# Deploy (requires Arbitrum Sepolia ETH)
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```

## 📱 Run the App

### Backend API
```powershell
cd backend
npm start
# Opens on http://localhost:3000
```

### Mobile App
```powershell
cd mobile
npm run web
# Opens in browser
```

## ✅ Verify Installation

Test endpoints:
```powershell
# Health check
curl http://localhost:3000/health

# Should return: {"status":"ok","service":"PrivateAlpha Backend API"}
```

## 🎯 Next Steps

1. **Get Testnet Funds**:
   - Arbitrum Sepolia ETH: https://faucet.quicknode.com/arbitrum/sepolia
   - iExec RLC: https://faucet.iex.ec/

2. **Deploy TEE Worker** (Optional - can test with mock data):
   ```powershell
   cd privatealpha-tee
   docker build -t privatealpha-tee .
   ```

3. **Test Mobile App**:
   - Open http://localhost:19006 (Expo web)
   - Click "Connect Wallet"
   - View mock credit score and opportunities

## 🔧 Development Mode

All components work with mock data for testing:
- Backend returns mock credit scores
- Mobile app shows mock opportunities
- No iExec deployment needed initially

## ⚡ Quick Commands

```powershell
# Run all tests
npm test

# Compile contracts
npx hardhat compile

# Start backend
cd backend && npm start

# Start mobile app
cd mobile && npm run web

# Build TEE worker
cd privatealpha-tee && cargo build

# Deploy contracts
npx hardhat run scripts/deploy.js --network arbitrumSepolia
```

## 🐛 Troubleshooting

**"Module not found"**
```powershell
rm -rf node_modules
npm install
```

**"Cannot connect to network"**
- Check your RPC URL in .env
- Verify you have testnet ETH

**"Docker build failed"**
- Ensure Docker Desktop is running
- Check internet connection for downloads

## 📚 Full Documentation

See [README.md](README.md) for complete setup instructions and architecture details.

---

**Ready to build!** 🎉
