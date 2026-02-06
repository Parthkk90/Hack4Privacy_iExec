import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const computeCreditScore = async (walletAddress) => {
  try {
    // Mock wallet data for testing
    const mockWalletData = {
      address: walletAddress,
      trades: [
        { timestamp: 1234567890, token: 'ETH', amount: 1.0, price: 2000, is_buy: true, pnl_percent: 5.0 },
        { timestamp: 1234567891, token: 'BTC', amount: 0.1, price: 40000, is_buy: true, pnl_percent: -2.0 },
      ],
      loans: [
        { timestamp: 1234567890, protocol: 'Aave', amount: 1000, repaid: true, liquidated: false },
      ],
      liquidations: 0,
      total_volume: 6000,
    };
    
    const response = await api.post('/compute-credit-score', {
      walletAddress,
      encryptedData: mockWalletData,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error computing credit score:', error);
    throw error;
  }
};

export const findOpportunities = async (strategy, assets) => {
  try {
    const response = await api.post('/find-opportunities', {
      strategy,
      assets,
      encryptedUserData: {},
    });
    
    return response.data.opportunities || [];
  } catch (error) {
    console.error('Error finding opportunities:', error);
    throw error;
  }
};

export const executePrivateTrade = async (opportunity, proof) => {
  try {
    const response = await api.post('/execute-trade', {
      trade: {
        token: opportunity.asset,
        amount: opportunity.recommended_size,
        isBuy: opportunity.signal === 'BUY',
        strategyHash: '0x' + Buffer.from(opportunity.reasoning).toString('hex'),
        proof: proof,
        maxSlippage: 50, // 0.5%
        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      },
      teeAttestation: proof,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error executing trade:', error);
    throw error;
  }
};

export const getCreditScore = async (address) => {
  try {
    const response = await api.get(`/credit-score/${address}`);
    return response.data;
  } catch (error) {
    console.error('Error getting credit score:', error);
    throw error;
  }
};

export default api;
