import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// iApp Configuration
export const IAPP_ADDRESS = '0x77978b4d66E473c804a891B9CfA2352f235af59C';
export const NETWORK = 'bellecour';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased for TEE operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// CREDIT SCORE APIs
// ============================================================

/**
 * Compute credit score using TEE-based iApp
 * @param {string} userAddress - User's wallet address
 * @param {Object} data - Protected financial data
 * @returns {Promise<{taskId: string, dealId: string}>}
 */
export const computeCreditScore = async (userAddress, data) => {
  const response = await api.post('/tee/compute-credit-score', {
    userAddress,
    protectedData: data,
  });
  return response.data;
};

/**
 * Get on-chain credit score from smart contract
 * @param {string} address - Wallet address
 * @returns {Promise<{score: number, tier: string, timestamp: number}>}
 */
export const getCreditScore = async (address) => {
  const response = await api.get(`/blockchain/credit-score/${address}`);
  return response.data;
};

// ============================================================
// MOMENTUM SIGNAL APIs
// ============================================================

/**
 * Generate AI-powered trading signals using TEE
 * @param {string} userAddress - User's wallet address
 * @param {Object} marketData - Token pair and market data
 * @returns {Promise<{taskId: string, dealId: string}>}
 */
export const generateMomentumSignal = async (userAddress, marketData) => {
  const response = await api.post('/tee/generate-signal', {
    userAddress,
    marketData,
  });
  return response.data;
};

// ============================================================
// ARBITRAGE SCANNER APIs
// ============================================================

/**
 * Scan for cross-DEX arbitrage opportunities
 * @param {string} userAddress - User's wallet address
 * @param {Object} scanParams - Tokens to scan, DEXs to include
 * @returns {Promise<{taskId: string, dealId: string}>}
 */
export const scanArbitrageOpportunities = async (userAddress, scanParams) => {
  const response = await api.post('/tee/scan-arbitrage', {
    userAddress,
    scanParams,
  });
  return response.data;
};

// ============================================================
// RISK ANALYSIS APIs
// ============================================================

/**
 * Analyze portfolio risk using Monte Carlo simulation
 * @param {string} userAddress - User's wallet address
 * @param {Object} portfolioData - Holdings and positions
 * @returns {Promise<{taskId: string, dealId: string}>}
 */
export const analyzeRisk = async (userAddress, portfolioData) => {
  const response = await api.post('/tee/analyze-risk', {
    userAddress,
    portfolioData,
  });
  return response.data;
};

// ============================================================
// TASK & RESULT APIs
// ============================================================

/**
 * Get iExec task result by taskId
 * @param {string} taskId - The iExec task ID
 * @returns {Promise<{status: string, result: Object}>}
 */
export const getTaskResult = async (taskId) => {
  const response = await api.get(`/tee/task/${taskId}`);
  return response.data;
};

/**
 * Get deployed iApp information
 * @returns {Promise<{address: string, network: string, explorerUrl: string}>}
 */
export const getIAppInfo = async () => {
  const response = await api.get('/tee/iapp-info');
  return response.data;
};

/**
 * Poll for task completion
 * @param {string} taskId - The iExec task ID
 * @param {number} intervalMs - Polling interval in milliseconds
 * @param {number} maxAttempts - Maximum polling attempts
 * @returns {Promise<Object>} - Final task result
 */
export const pollTaskResult = async (taskId, intervalMs = 5000, maxAttempts = 60) => {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getTaskResult(taskId);
    
    if (result.status === 'COMPLETED') {
      return result;
    }
    
    if (result.status === 'FAILED' || result.status === 'TIMEOUT') {
      throw new Error(`Task failed: ${result.error || 'Unknown error'}`);
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error('Task polling timeout');
};

// ============================================================
// TRADING APIs
// ============================================================

/**
 * Find trading opportunities based on strategy
 * @param {string} strategy - Strategy type (momentum, arbitrage, etc.)
 * @param {string} userAddress - User's wallet address
 * @returns {Promise<{opportunities: Array}>}
 */
export const findOpportunities = async (strategy, userAddress) => {
  const response = await api.post('/trading/opportunities', {
    strategy,
    userAddress,
  });
  return response.data;
};

/**
 * Execute a trade through Flashbots
 * @param {Object} tradeData - Trade parameters
 * @returns {Promise<{txId: string, status: string}>}
 */
export const executeTrade = async (tradeData) => {
  const response = await api.post('/trading/execute', tradeData);
  return response.data;
};

/**
 * Get trade execution status
 * @param {string} txId - Transaction ID
 * @returns {Promise<{status: string, receipt: Object}>}
 */
export const getTradeStatus = async (txId) => {
  const response = await api.get(`/trading/trade/${txId}`);
  return response.data;
};

// ============================================================
// CONVENIENCE FUNCTIONS
// ============================================================

/**
 * Full credit score computation flow (submit + poll + return)
 * @param {string} userAddress - User's wallet address
 * @param {Object} data - Financial data
 * @returns {Promise<{score: number, tier: string, recommendations: Array}>}
 */
export const computeCreditScoreFull = async (userAddress, data) => {
  // Submit task
  const { taskId } = await computeCreditScore(userAddress, data);
  
  // Poll for result
  const result = await pollTaskResult(taskId);
  
  return result.result;
};

/**
 * Full momentum signal flow (submit + poll + return)
 * @param {string} userAddress - User's wallet address
 * @param {Object} marketData - Market data
 * @returns {Promise<{signal: string, confidence: number, indicators: Object}>}
 */
export const generateMomentumSignalFull = async (userAddress, marketData) => {
  // Submit task
  const { taskId } = await generateMomentumSignal(userAddress, marketData);
  
  // Poll for result
  const result = await pollTaskResult(taskId);
  
  return result.result;
};

export default {
  // Config
  IAPP_ADDRESS,
  NETWORK,
  
  // Credit Score
  computeCreditScore,
  computeCreditScoreFull,
  getCreditScore,
  
  // Momentum
  generateMomentumSignal,
  generateMomentumSignalFull,
  
  // Arbitrage
  scanArbitrageOpportunities,
  
  // Risk
  analyzeRisk,
  
  // Tasks
  getTaskResult,
  getIAppInfo,
  pollTaskResult,
  
  // Trading
  findOpportunities,
  executeTrade,
  getTradeStatus,
};
