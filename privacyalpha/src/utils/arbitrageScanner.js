/**
 * PrivateAlpha Arbitrage Scanner
 * Detects cross-DEX and cross-chain arbitrage opportunities
 * All computations happen inside the TEE - opportunities remain private
 */

/**
 * DEX configurations with typical fee structures
 */
const DEX_CONFIG = {
  uniswap_v3: { name: 'Uniswap V3', chain: 'ethereum', fee: 0.003, gasEstimate: 150000 },
  sushiswap: { name: 'SushiSwap', chain: 'ethereum', fee: 0.003, gasEstimate: 120000 },
  curve: { name: 'Curve', chain: 'ethereum', fee: 0.0004, gasEstimate: 200000 },
  balancer: { name: 'Balancer', chain: 'ethereum', fee: 0.002, gasEstimate: 180000 },
  pancakeswap: { name: 'PancakeSwap', chain: 'bsc', fee: 0.0025, gasEstimate: 100000 },
  quickswap: { name: 'QuickSwap', chain: 'polygon', fee: 0.003, gasEstimate: 80000 },
  traderjoe: { name: 'Trader Joe', chain: 'avalanche', fee: 0.003, gasEstimate: 90000 },
  camelot: { name: 'Camelot', chain: 'arbitrum', fee: 0.003, gasEstimate: 100000 },
  velodrome: { name: 'Velodrome', chain: 'optimism', fee: 0.002, gasEstimate: 100000 }
};

/**
 * Gas prices by chain (in native token)
 */
const GAS_PRICES = {
  ethereum: 30, // gwei
  bsc: 5,
  polygon: 100,
  avalanche: 30,
  arbitrum: 0.1,
  optimism: 0.001
};

/**
 * Native token prices in USD
 */
const NATIVE_PRICES = {
  ethereum: 2500,
  bsc: 300,
  polygon: 0.8,
  avalanche: 35,
  arbitrum: 2500,
  optimism: 2500
};

/**
 * Scan for arbitrage opportunities across DEXes
 * @param {Object} priceData - Price quotes from multiple DEXes
 * @returns {Array} List of profitable arbitrage opportunities
 */
export function scanArbitrageOpportunities(priceData) {
  const { quotes, minProfitUSD = 10, maxSlippage = 0.005 } = priceData;

  if (!quotes || quotes.length < 2) {
    return { opportunities: [], error: 'Need at least 2 price quotes to find arbitrage' };
  }

  const opportunities = [];

  // Compare all pairs of DEXes
  for (let i = 0; i < quotes.length; i++) {
    for (let j = i + 1; j < quotes.length; j++) {
      const opportunity = analyzeArbitrage(quotes[i], quotes[j], minProfitUSD, maxSlippage);
      if (opportunity && opportunity.netProfitUSD > minProfitUSD) {
        opportunities.push(opportunity);
      }
    }
  }

  // Sort by profit descending
  opportunities.sort((a, b) => b.netProfitUSD - a.netProfitUSD);

  return {
    opportunities: opportunities.slice(0, 10), // Top 10
    scannedPairs: quotes.length * (quotes.length - 1) / 2,
    timestamp: new Date().toISOString()
  };
}

/**
 * Analyze potential arbitrage between two quotes
 */
function analyzeArbitrage(quote1, quote2, minProfitUSD, maxSlippage) {
  const token = quote1.token || quote1.symbol;
  
  // Determine buy and sell venues
  let buyQuote, sellQuote;
  if (quote1.price < quote2.price) {
    buyQuote = quote1;
    sellQuote = quote2;
  } else {
    buyQuote = quote2;
    sellQuote = quote1;
  }

  const priceDiff = sellQuote.price - buyQuote.price;
  const spreadPercent = priceDiff / buyQuote.price;

  // Skip if spread is too small
  if (spreadPercent < 0.001) return null;

  // Get DEX configs
  const buyDex = DEX_CONFIG[buyQuote.dex] || { fee: 0.003, gasEstimate: 150000, chain: 'ethereum' };
  const sellDex = DEX_CONFIG[sellQuote.dex] || { fee: 0.003, gasEstimate: 150000, chain: 'ethereum' };

  // Calculate optimal trade size based on liquidity
  const buyLiquidity = buyQuote.liquidity || 100000;
  const sellLiquidity = sellQuote.liquidity || 100000;
  const maxTradeSize = Math.min(buyLiquidity, sellLiquidity) * 0.1; // 10% of liquidity

  // Calculate costs
  const tradeAmount = Math.min(maxTradeSize, 50000); // Cap at $50k per trade
  const buyFee = tradeAmount * buyDex.fee;
  const sellFee = tradeAmount * sellDex.fee;

  // Calculate gas costs
  const buyGasCost = calculateGasCost(buyDex.chain, buyDex.gasEstimate);
  const sellGasCost = calculateGasCost(sellDex.chain, sellDex.gasEstimate);
  const totalGasCost = buyGasCost + sellGasCost;

  // Estimate slippage
  const buySlippage = estimateSlippage(tradeAmount, buyLiquidity);
  const sellSlippage = estimateSlippage(tradeAmount, sellLiquidity);
  const totalSlippage = buySlippage + sellSlippage;

  // Skip if slippage too high
  if (totalSlippage > maxSlippage) return null;

  // Calculate net profit
  const grossProfit = tradeAmount * spreadPercent;
  const totalCosts = buyFee + sellFee + totalGasCost + (tradeAmount * totalSlippage);
  const netProfit = grossProfit - totalCosts;

  if (netProfit < minProfitUSD) return null;

  // Calculate ROI
  const roi = (netProfit / tradeAmount) * 100;

  // Generate execution plan
  const executionPlan = generateExecutionPlan(buyQuote, sellQuote, tradeAmount);

  // Generate attestation
  const attestationData = JSON.stringify({
    token,
    buyDex: buyQuote.dex,
    sellDex: sellQuote.dex,
    profit: netProfit,
    timestamp: Date.now()
  });
  const attestationHash = simpleHash(attestationData);

  return {
    type: buyDex.chain === sellDex.chain ? 'SAME_CHAIN' : 'CROSS_CHAIN',
    token,
    buyVenue: {
      dex: buyQuote.dex,
      name: buyDex.name,
      chain: buyDex.chain,
      price: buyQuote.price
    },
    sellVenue: {
      dex: sellQuote.dex,
      name: sellDex.name,
      chain: sellDex.chain,
      price: sellQuote.price
    },
    spreadPercent: Math.round(spreadPercent * 10000) / 100,
    optimalTradeSize: Math.round(tradeAmount),
    costs: {
      buyFee: Math.round(buyFee * 100) / 100,
      sellFee: Math.round(sellFee * 100) / 100,
      gasCost: Math.round(totalGasCost * 100) / 100,
      slippageCost: Math.round(tradeAmount * totalSlippage * 100) / 100
    },
    grossProfitUSD: Math.round(grossProfit * 100) / 100,
    netProfitUSD: Math.round(netProfit * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    confidence: calculateConfidence(spreadPercent, totalSlippage, buyLiquidity, sellLiquidity),
    executionPlan,
    attestationHash,
    expiresIn: '30 seconds' // Arb opportunities are time-sensitive
  };
}

/**
 * Calculate gas cost in USD
 */
function calculateGasCost(chain, gasEstimate) {
  const gasPrice = GAS_PRICES[chain] || 30;
  const nativePrice = NATIVE_PRICES[chain] || 2500;
  return (gasEstimate * gasPrice * 1e-9) * nativePrice;
}

/**
 * Estimate slippage based on trade size vs liquidity
 */
function estimateSlippage(tradeSize, liquidity) {
  if (liquidity <= 0) return 0.05; // 5% default high slippage
  const impact = tradeSize / liquidity;
  return Math.min(0.05, impact * impact * 2); // Quadratic slippage model
}

/**
 * Calculate opportunity confidence
 */
function calculateConfidence(spread, slippage, buyLiquidity, sellLiquidity) {
  let confidence = 0.5;

  // Higher spread = more confident
  if (spread > 0.02) confidence += 0.2;
  else if (spread > 0.01) confidence += 0.1;

  // Lower slippage = more confident
  if (slippage < 0.002) confidence += 0.15;
  else if (slippage < 0.005) confidence += 0.05;

  // Higher liquidity = more confident
  const minLiquidity = Math.min(buyLiquidity, sellLiquidity);
  if (minLiquidity > 500000) confidence += 0.1;
  else if (minLiquidity > 100000) confidence += 0.05;

  return Math.min(0.95, Math.round(confidence * 100) / 100);
}

/**
 * Generate atomic execution plan
 */
function generateExecutionPlan(buyQuote, sellQuote, amount) {
  const buyDex = DEX_CONFIG[buyQuote.dex] || {};
  const sellDex = DEX_CONFIG[sellQuote.dex] || {};

  const steps = [];

  // Step 1: Buy on cheaper DEX
  steps.push({
    step: 1,
    action: 'BUY',
    dex: buyQuote.dex,
    chain: buyDex.chain,
    amount: Math.round(amount * 100) / 100,
    expectedPrice: buyQuote.price,
    maxSlippage: '0.5%'
  });

  // Step 2: Bridge if cross-chain
  if (buyDex.chain !== sellDex.chain) {
    steps.push({
      step: 2,
      action: 'BRIDGE',
      fromChain: buyDex.chain,
      toChain: sellDex.chain,
      estimatedTime: '2-10 minutes'
    });
  }

  // Step 3: Sell on more expensive DEX
  steps.push({
    step: steps.length + 1,
    action: 'SELL',
    dex: sellQuote.dex,
    chain: sellDex.chain,
    expectedPrice: sellQuote.price,
    maxSlippage: '0.5%'
  });

  return {
    steps,
    totalSteps: steps.length,
    estimatedExecutionTime: buyDex.chain === sellDex.chain ? '30 seconds' : '5-15 minutes',
    mevProtection: 'Flashbots recommended for Ethereum'
  };
}

/**
 * Triangular arbitrage scanner
 */
export function scanTriangularArbitrage(pairs) {
  const opportunities = [];

  // Find all possible triangular paths
  // A -> B -> C -> A where each swap is profitable
  for (const pairAB of pairs) {
    for (const pairBC of pairs) {
      if (pairAB.quoteToken !== pairBC.baseToken) continue;
      
      for (const pairCA of pairs) {
        if (pairBC.quoteToken !== pairCA.baseToken) continue;
        if (pairCA.quoteToken !== pairAB.baseToken) continue;

        const profit = calculateTriangularProfit(pairAB, pairBC, pairCA);
        if (profit > 0.001) { // Min 0.1% profit
          opportunities.push({
            type: 'TRIANGULAR',
            path: [pairAB.pair, pairBC.pair, pairCA.pair],
            profitPercent: Math.round(profit * 10000) / 100,
            estimatedProfit: Math.round(profit * 10000) / 100
          });
        }
      }
    }
  }

  return opportunities;
}

/**
 * Calculate triangular arbitrage profit
 */
function calculateTriangularProfit(pairAB, pairBC, pairCA) {
  const rateAB = pairAB.price;
  const rateBC = pairBC.price;
  const rateCA = pairCA.price;

  // Start with 1 unit of A
  // A -> B: get rateAB units of B
  // B -> C: get rateAB * rateBC units of C
  // C -> A: get rateAB * rateBC * rateCA units of A
  const finalAmount = rateAB * rateBC * rateCA;

  // Subtract fees (assume 0.3% per swap)
  const afterFees = finalAmount * (1 - 0.003) ** 3;

  return afterFees - 1; // Profit
}

/**
 * Simple hash function
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
}
