# Deployment Guide

Complete guide for deploying PrivateAlpha to production.

## Prerequisites

- [ ] Arbitrum Sepolia ETH for gas
- [ ] iExec RLC tokens
- [ ] Alchemy/Infura API key
- [ ] Docker Hub account
- [ ] Cloud hosting account (Railway/Render)

## Step 1: Deploy Smart Contracts

### 1.1 Configure Environment

```bash
cd packages/contracts

# Edit .env file
PRIVATE_KEY=your_private_key_here
ARBITRUM_SEPOLIA_RPC=https://arb-sepolia.g.alchemy.com/v2/YOUR_KEY
ARBISCAN_API_KEY=your_arbiscan_api_key
```

### 1.2 Deploy Contracts

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to testnet
npm run deploy:testnet
```

**Output:**
```
✅ CreditScoreRegistry deployed to: 0xabc...
✅ StrategyExecutor deployed to: 0xdef...
✅ FlashbotsRelayer deployed to: 0xghi...
```

### 1.3 Verify Contracts

```bash
npm run verify
```

### 1.4 Save Addresses

Contract addresses are automatically saved to:
`packages/contracts/deployments/arbitrum-sepolia.json`

Update root `.env`:
```env
CREDIT_SCORE_REGISTRY_ADDRESS=0xabc...
STRATEGY_EXECUTOR_ADDRESS=0xdef...
FLASHBOTS_RELAYER_ADDRESS=0xghi...
```

## Step 2: Deploy TEE Worker to iExec

### 2.1 Build Docker Image

```bash
cd packages/tee-worker

# Build image
docker build -t yourusername/privatealpha-tee:latest .

# Test locally
docker run --rm privatealpha-tee:latest /app/credit-scorer --help
```

### 2.2 Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Push image
docker push yourusername/privatealpha-tee:latest
```

### 2.3 Initialize iExec

```bash
# Install iExec SDK globally
npm install -g iexec

# Create wallet
iexec wallet create

# Show wallet address
iexec wallet show

# Get RLC from faucet
# Visit: https://faucet.iex.ec/
# Request RLC for your wallet address
```

### 2.4 Update iexec.json

Edit `packages/tee-worker/iexec.json`:
```json
{
  "app": {
    "owner": "YOUR_WALLET_ADDRESS",
    "name": "privatealpha-tee",
    "multiaddr": "registry.hub.docker.com/yourusername/privatealpha-tee:latest"
  }
}
```

### 2.5 Deploy App to iExec

```bash
# Deploy app
iexec app deploy --chain arbitrum-sepolia

# Output:
# App deployed: 0xAPP_ADDRESS
```

### 2.6 Test Execution

```bash
# Create test input
echo '{"user_address":"0x...","transaction_history":[],"loan_history":[],"portfolio":{"total_value":10000,"assets":[],"pnl_history":[]}}' > input.json

# Run task
iexec app run 0xAPP_ADDRESS \
  --chain arbitrum-sepolia \
  --workerpool 0x0000000000000000000000000000000000000000

# Check task status
iexec task show TASK_ID --chain arbitrum-sepolia

# Download result
iexec task download TASK_ID --chain arbitrum-sepolia
```

### 2.7 Update Environment

Add to root `.env`:
```env
IEXEC_APP_ADDRESS=0xYOUR_APP_ADDRESS
```

## Step 3: Deploy Backend API

### Option A: Railway

```bash
cd packages/backend

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables in Railway dashboard:
# - ARBITRUM_SEPOLIA_RPC
# - CREDIT_SCORE_REGISTRY_ADDRESS
# - STRATEGY_EXECUTOR_ADDRESS
# - FLASHBOTS_RELAYER_ADDRESS
# - IEXEC_APP_ADDRESS
# - NODE_ENV=production

# Deploy
railway up
```

### Option B: Render

1. **Create Web Service**
   - Go to render.com
   - New → Web Service
   - Connect GitHub repo
   - Root Directory: `packages/backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Add Environment Variables**
   - Go to Environment tab
   - Add all variables from `.env`

3. **Deploy**
   - Click "Manual Deploy" → "Deploy latest commit"

### 3.1 Test Backend

```bash
# Test health endpoint
curl https://your-backend-url.railway.app/health

# Test credit score endpoint
curl https://your-backend-url.railway.app/api/blockchain/credit-score/0x...
```

### 3.2 Update Mobile App

Edit `packages/mobile/.env`:
```env
EXPO_PUBLIC_API_URL=https://your-backend-url.railway.app/api
```

## Step 4: Deploy Mobile App

### 4.1 Configure

```bash
cd packages/mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize EAS
eas build:configure
```

### 4.2 Build for Web

```bash
# Build web version
npm run build

# Deploy to Vercel/Netlify
# or serve from packages/mobile/web-build/
```

### 4.3 Build for iOS

```bash
# Build iOS app
eas build --platform ios

# Submit to TestFlight
eas submit --platform ios
```

### 4.4 Build for Android

```bash
# Build Android app
eas build --platform android

# Submit to Google Play (Internal Testing)
eas submit --platform android
```

## Step 5: Authorize TEE Workers

After deploying contracts and TEE workers, authorize them:

```bash
cd packages/contracts

# Create authorize script
cat > scripts/authorize-tee.js << 'EOF'
const hre = require("hardhat");

async function main() {
  const registryAddress = process.env.CREDIT_SCORE_REGISTRY_ADDRESS;
  const teeWorkerAddress = "YOUR_WALLET_ADDRESS"; // From iExec wallet

  const registry = await hre.ethers.getContractAt(
    "CreditScoreRegistry",
    registryAddress
  );

  console.log("Authorizing TEE worker:", teeWorkerAddress);
  const tx = await registry.authorizeTEEWorker(teeWorkerAddress, true);
  await tx.wait();
  console.log("✅ TEE worker authorized!");
}

main().catch(console.error);
EOF

# Run authorization
npx hardhat run scripts/authorize-tee.js --network arbitrumSepolia
```

## Step 6: Final Testing

### 6.1 End-to-End Test

1. **Open Mobile App**
   - Connect wallet
   - Compute credit score
   - Verify score appears on dashboard

2. **Check Backend Logs**
   - Verify API requests
   - Check TEE task submission
   - Confirm blockchain reads

3. **Verify On-Chain**
   - Check contract on Arbiscan
   - Verify score was written
   - Check events emitted

### 6.2 Performance Testing

```bash
# Load test backend
npm install -g artillery

cat > load-test.yml << 'EOF'
config:
  target: "https://your-backend-url.railway.app"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Health check"
    flow:
      - get:
          url: "/health"
EOF

artillery run load-test.yml
```

## Step 7: Monitoring Setup

### 7.1 Backend Monitoring

**Sentry (Error Tracking)**
```bash
npm install @sentry/node

# Add to server.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

**Logging**
```bash
# Railway logs
railway logs

# Render logs
# View in Render dashboard
```

### 7.2 Smart Contract Monitoring

Use Tenderly or Defender:
1. Import contracts
2. Set up alerts for:
   - Failed transactions
   - Large leverage trades
   - TEE worker changes

### 7.3 Mobile App Analytics

Add Google Analytics:
```bash
npm install @react-native-firebase/analytics

# Configure in App.js
```

## Step 8: Documentation & Support

### 8.1 Update README

Update root README with:
- Live app URL
- API endpoint
- Contract addresses
- Support links

### 8.2 Create Status Page

Use Statuspage.io or similar:
- Backend API status
- Smart contract status
- TEE worker availability

## Production Checklist

- [ ] Smart contracts deployed & verified
- [ ] TEE workers deployed to iExec
- [ ] Backend API deployed with HTTPS
- [ ] Mobile app built & deployed
- [ ] TEE workers authorized in contracts
- [ ] End-to-end testing complete
- [ ] Monitoring & alerts configured
- [ ] Documentation updated
- [ ] Support channels set up
- [ ] Backup & recovery plan
- [ ] Security audit (for mainnet)

## Rollback Procedure

If issues arise:

1. **Backend**: Revert to previous Railway/Render deployment
2. **Mobile**: Roll back Expo publish
3. **Contracts**: Cannot rollback, deploy new version
4. **TEE Worker**: Push previous Docker image tag

## Maintenance

### Weekly
- Check error logs
- Review transaction costs
- Monitor uptime

### Monthly
- Update dependencies
- Review security advisories
- Analyze usage metrics

### Quarterly
- Performance optimization
- Feature planning
- User feedback review

---

**Need help? Check troubleshooting guide or open an issue on GitHub**
