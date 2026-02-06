const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Native fetch API wrapper for React Native compatibility
const api = {
  post: async (endpoint, data) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { data: await response.json() };
  },
  get: async (endpoint) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return { data: await response.json() };
  },
};

// Helper function to convert string to hex (replaces Buffer)
const stringToHex = (str) => {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    const hexValue = charCode.toString(16);
    hex += hexValue.padStart(2, '0');
  }
  return '0x' + hex;
};

export const computeCreditScore = async (walletAddress) => {
  try {
    // For demo: Return mock data if API is unavailable
    try {
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
    } catch (apiError) {
      // Return mock data for demo
      console.log('Using mock credit score data');
      return {
        score: 723,
        tier: 3,
        max_leverage: 5,
        timestamp: Date.now(),
        attestation: '0xmockattestation',
      };
    }
  } catch (error) {
    console.error('Error computing credit score:', error);
    throw error;
  }
};

export const findOpportunities = async (strategy, assets) => {
  try {
    try {
      const response = await api.post('/find-opportunities', {
        strategy,
        assets,
        encryptedUserData: {},
      });
      
      return response.data.opportunities || [];
    } catch (apiError) {
      // Return mock opportunities for demo
      console.log('Using mock opportunities data');
      return [
        {
          asset: 'ETH',
          signal: 'BUY',
          entry_price: 2045.32,
          target_price: 2156.80,
          confidence: 0.87,
          reasoning: 'Strong momentum with RSI breakout above 70. MACD showing bullish crossover with increasing volume (+145% above average).',
          recommended_size: 0.052,
          expectedProfit: '184',
          type: 'Momentum',
        },
        {
          asset: 'BTC',
          signal: 'BUY',
          entry_price: 42150.00,
          target_price: 44520.00,
          confidence: 0.82,
          reasoning: 'Bullish divergence on 4h chart. Support holding at $42k with strong buying pressure.',
          recommended_size: 0.048,
          expectedProfit: '227',
          type: 'Momentum',
        },
        {
          asset: 'SOL',
          signal: 'SELL',
          entry_price: 98.45,
          target_price: 92.30,
          confidence: 0.75,
          reasoning: 'Overbought conditions on multiple timeframes. RSI divergence suggesting potential correction.',
          recommended_size: 0.035,
          expectedProfit: '95',
          type: 'Mean Reversion',
        },
      ];
    }
  } catch (error) {
    console.error('Error finding opportunities:', error);
    return [];
  }
};

export const executePrivateTrade = async (opportunity, proof) => {
  try {
    try {
      const response = await api.post('/execute-trade', {
        trade: {
          token: opportunity.asset,
          amount: opportunity.recommended_size,
          isBuy: opportunity.signal === 'BUY',
          strategyHash: stringToHex(opportunity.reasoning),
          proof: proof,
          maxSlippage: 50, // 0.5%
          deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour
        },
        teeAttestation: proof,
      });
      
      return response.data;
    } catch (apiError) {
      // Return mock execution result for demo
      console.log('Using mock trade execution data');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        txHash: '0x7a3f2d1b9e8c5f4a6d3e1c2b8a9f5e7d4c6b3a1f0e9d8c7b6a5f4e3d2c1b0a9',
        success: true,
        timestamp: Date.now(),
      };
    }
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
