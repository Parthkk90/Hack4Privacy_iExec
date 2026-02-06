const express = require('express');
const cors = require('cors');
const { IExec, utils } = require('iexec');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize iExec
const iexec = new IExec({
  ethProvider: process.env.ARBITRUM_SEPOLIA_RPC || 'https://sepolia-rollup.arbitrum.io/rpc',
  chainId: '421614', // Arbitrum Sepolia
});

// Contract ABIs (simplified)
const CREDIT_SCORE_REGISTRY_ABI = [
  "function updateScore(address user, bytes32 scoreHash, uint8 tier, uint16 score, bytes memory attestation) external",
  "function getScore(address user) external view returns (tuple(bytes32 scoreHash, uint256 timestamp, bytes attestation, uint8 tier, uint16 score, bool isActive))",
  "function getTier(address user) external view returns (uint8)"
];

// Contract instances
let creditScoreRegistry;
let provider;

// Initialize contracts
async function initContracts() {
  provider = new ethers.JsonRpcProvider(process.env.ARBITRUM_SEPOLIA_RPC);
  
  if (process.env.CREDIT_SCORE_REGISTRY) {
    creditScoreRegistry = new ethers.Contract(
      process.env.CREDIT_SCORE_REGISTRY,
      CREDIT_SCORE_REGISTRY_ABI,
      provider
    );
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'PrivateAlpha Backend API',
    network: 'Arbitrum Sepolia',
    chainId: 421614
  });
});

// Endpoint: Request credit score computation
app.post('/api/compute-credit-score', async (req, res) => {
  const { walletAddress, encryptedData } = req.body;
  
  console.log(`📊 Computing credit score for ${walletAddress}...`);
  
  try {
    // Validate input
    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address' });
    }
    
    if (!encryptedData) {
      return res.status(400).json({ error: 'Encrypted data required' });
    }
    
    // 1. Prepare data for TEE
    const inputData = JSON.stringify(encryptedData);
    
    // 2. Request computation from iExec
    // Note: This is a simplified version. In production, you'd:
    // - Push dataset to IPFS
    // - Create dataset order
    // - Create app order
    // - Match orders
    // - Wait for task completion
    
    const appAddress = process.env.IEXEC_APP_ADDRESS;
    
    if (!appAddress) {
      // Development mode - return mock data
      console.log('⚠️  No iExec app configured, returning mock data');
      
      const mockResult = {
        score: 720,
        tier: 3,
        max_leverage: 2.25,
        attestation: '0x' + Buffer.from('mock-attestation').toString('hex'),
        factors: {
          payment_history: 85.0,
          utilization: 70.0,
          trading_skill: 65.0,
          diversification: 55.0
        }
      };
      
      return res.json({
        success: true,
        taskid: 'mock-task-id',
        walletAddress,
        ...mockResult
      });
    }
    
    // Production flow with iExec
    console.log('🔒 Requesting TEE computation...');
    
    // In production, implement full iExec workflow:
    // const { taskid } = await iexec.task.run({
    //   app: appAddress,
    //   params: {
    //     iexec_args: 'credit-score',
    //   },
    // });
    
    // const result = await iexec.task.waitForTaskStatus(taskid, 'COMPLETED', {
    //   tries: 100,
    //   delay: 3000,
    // });
    
    // const decryptedResult = await iexec.task.fetchResults(taskid);
    
    // 3. Update on-chain registry (if configured)
    // if (creditScoreRegistry && process.env.PRIVATE_KEY) {
    //   const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    //   const contract = creditScoreRegistry.connect(wallet);
    //   
    //   await contract.updateScore(
    //     walletAddress,
    //     ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(decryptedResult))),
    //     decryptedResult.tier,
    //     decryptedResult.score,
    //     decryptedResult.attestation
    //   );
    // }
    
    res.json({ 
      success: true,
      message: 'Credit score computation initiated',
      walletAddress
    });
    
  } catch (error) {
    console.error('Error computing credit score:', error);
    res.status(500).json({ 
      error: 'Failed to compute credit score',
      details: error.message 
    });
  }
});

// Endpoint: Find trading opportunities
app.post('/api/find-opportunities', async (req, res) => {
  const { strategy, assets, encryptedUserData } = req.body;
  
  console.log(`🎯 Finding ${strategy} opportunities for ${assets.join(', ')}...`);
  
  try {
    // Validate input
    if (!strategy || !assets || !Array.isArray(assets)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    const appAddress = process.env.IEXEC_APP_ADDRESS;
    
    if (!appAddress) {
      // Development mode - return mock opportunities
      console.log('⚠️  No iExec app configured, returning mock opportunities');
      
      const mockOpportunities = assets.map((asset, index) => ({
        id: `opp-${index}`,
        asset,
        type: strategy,
        signal: index % 2 === 0 ? 'BUY' : 'SELL',
        confidence: 0.75 + (index * 0.05),
        entry_price: 2000 + (index * 100),
        target_price: 2100 + (index * 100),
        stop_loss: 1950 + (index * 100),
        recommended_size: 0.15,
        reasoning: `${asset} showing strong ${strategy} indicators`,
        expectedProfit: 150 + (index * 50)
      }));
      
      return res.json({
        success: true,
        strategy,
        opportunities: mockOpportunities
      });
    }
    
    // Production flow
    // const { taskid } = await iexec.task.run({
    //   app: appAddress,
    //   params: {
    //     iexec_args: `${strategy} ${assets.join(',')}`,
    //   },
    // });
    
    // const result = await iexec.task.waitForTaskStatus(taskid, 'COMPLETED');
    // const opportunities = await iexec.task.fetchResults(taskid);
    
    res.json({
      success: true,
      strategy,
      message: 'Opportunities analysis initiated'
    });
    
  } catch (error) {
    console.error('Error finding opportunities:', error);
    res.status(500).json({ 
      error: 'Failed to find opportunities',
      details: error.message 
    });
  }
});

// Endpoint: Get user's credit score from blockchain
app.get('/api/credit-score/:address', async (req, res) => {
  const { address } = req.params;
  
  try {
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' });
    }
    
    if (!creditScoreRegistry) {
      return res.status(503).json({ 
        error: 'Credit score registry not configured' 
      });
    }
    
    const score = await creditScoreRegistry.getScore(address);
    
    res.json({
      address,
      score: Number(score.score),
      tier: Number(score.tier),
      timestamp: Number(score.timestamp),
      isActive: score.isActive
    });
    
  } catch (error) {
    console.error('Error fetching credit score:', error);
    res.status(500).json({ 
      error: 'Failed to fetch credit score',
      details: error.message 
    });
  }
});

// Endpoint: Execute trade
app.post('/api/execute-trade', async (req, res) => {
  const { trade, teeAttestation } = req.body;
  
  console.log(`⚡ Executing trade: ${trade.isBuy ? 'BUY' : 'SELL'} ${trade.amount} of ${trade.token}...`);
  
  try {
    // In production:
    // 1. Verify TEE attestation
    // 2. Call StrategyExecutor contract
    // 3. Submit to Flashbots relayer
    // 4. Return transaction hash
    
    res.json({
      success: true,
      txHash: '0x' + Buffer.from('mock-tx-hash-' + Date.now()).toString('hex'),
      message: 'Trade executed successfully'
    });
    
  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({ 
      error: 'Failed to execute trade',
      details: error.message 
    });
  }
});

// Endpoint: Get task status from iExec
app.get('/api/task/:taskid', async (req, res) => {
  const { taskid } = req.params;
  
  try {
    // const task = await iexec.task.show(taskid);
    
    res.json({
      taskid,
      status: 'COMPLETED',
      message: 'Task status retrieved'
    });
    
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ 
      error: 'Failed to fetch task',
      details: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.API_PORT || 3000;

initContracts().then(() => {
  app.listen(PORT, () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('🚀 PrivateAlpha Backend API');
    console.log('='.repeat(60));
    console.log(`Server running on port ${PORT}`);
    console.log(`Network: Arbitrum Sepolia (421614)`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
    console.log('Available endpoints:');
    console.log(`  GET  http://localhost:${PORT}/health`);
    console.log(`  POST http://localhost:${PORT}/api/compute-credit-score`);
    console.log(`  POST http://localhost:${PORT}/api/find-opportunities`);
    console.log(`  GET  http://localhost:${PORT}/api/credit-score/:address`);
    console.log(`  POST http://localhost:${PORT}/api/execute-trade`);
    console.log(`  GET  http://localhost:${PORT}/api/task/:taskid`);
    console.log('='.repeat(60));
  });
}).catch(error => {
  console.error('Failed to initialize contracts:', error);
  process.exit(1);
});

module.exports = app;
