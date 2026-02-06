/**
 * PrivateAlpha Risk Calculator
 * Monte Carlo simulation for Value at Risk (VaR) and portfolio risk metrics
 * All computations happen inside the TEE - portfolio data remains private
 */

/**
 * Number of Monte Carlo simulations
 */
const DEFAULT_SIMULATIONS = 10000;

/**
 * Calculate comprehensive risk metrics for a portfolio
 * @param {Object} portfolioData - Portfolio holdings and parameters
 * @returns {Object} Risk metrics including VaR, CVaR, and stress tests
 */
export function calculatePortfolioRisk(portfolioData) {
  const {
    holdings = [],
    correlationMatrix,
    confidenceLevel = 0.95,
    timeHorizon = 1, // days
    simulations = DEFAULT_SIMULATIONS
  } = portfolioData;

  if (!holdings || holdings.length === 0) {
    return { error: 'No holdings provided' };
  }

  // Calculate individual asset risks
  const assetRisks = holdings.map(h => calculateAssetRisk(h));

  // Calculate portfolio metrics
  const portfolioValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const weights = holdings.map(h => h.value / portfolioValue);

  // Run Monte Carlo simulation
  const simulatedReturns = runMonteCarloSimulation(
    assetRisks,
    weights,
    correlationMatrix,
    timeHorizon,
    simulations
  );

  // Calculate VaR and CVaR
  const var95 = calculateVaR(simulatedReturns, 0.95);
  const var99 = calculateVaR(simulatedReturns, 0.99);
  const cvar95 = calculateCVaR(simulatedReturns, 0.95);

  // Calculate additional metrics
  const volatility = calculatePortfolioVolatility(assetRisks, weights, correlationMatrix);
  const sharpeRatio = calculateSharpeRatio(simulatedReturns, volatility);
  const maxDrawdown = calculateMaxDrawdown(simulatedReturns);

  // Stress test scenarios
  const stressTests = runStressTests(holdings, weights);

  // Risk score (0-100)
  const riskScore = calculateRiskScore(var95, volatility, maxDrawdown);

  // Generate attestation
  const attestationData = JSON.stringify({
    portfolioValue,
    var95,
    riskScore,
    timestamp: Date.now()
  });
  const attestationHash = simpleHash(attestationData);

  return {
    portfolioValue: Math.round(portfolioValue * 100) / 100,
    metrics: {
      var95: {
        percent: Math.round(var95 * 10000) / 100,
        amount: Math.round(portfolioValue * var95 * 100) / 100,
        description: `95% confident loss won't exceed this in ${timeHorizon} day(s)`
      },
      var99: {
        percent: Math.round(var99 * 10000) / 100,
        amount: Math.round(portfolioValue * var99 * 100) / 100,
        description: `99% confident loss won't exceed this in ${timeHorizon} day(s)`
      },
      cvar95: {
        percent: Math.round(cvar95 * 10000) / 100,
        amount: Math.round(portfolioValue * cvar95 * 100) / 100,
        description: 'Expected loss when VaR is exceeded'
      },
      volatility: {
        daily: Math.round(volatility * 10000) / 100,
        annual: Math.round(volatility * Math.sqrt(365) * 10000) / 100
      },
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 10000) / 100
    },
    riskScore: Math.round(riskScore),
    riskLevel: getRiskLevel(riskScore),
    stressTests,
    assetBreakdown: assetRisks.map((risk, i) => ({
      symbol: holdings[i].symbol,
      weight: Math.round(weights[i] * 10000) / 100,
      contribution: Math.round(risk.volatility * weights[i] * 10000) / 100
    })),
    recommendations: generateRiskRecommendations(var95, volatility, holdings),
    attestationHash,
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Calculate risk metrics for individual asset
 */
function calculateAssetRisk(holding) {
  const { symbol, returns = [], volatility: providedVol } = holding;

  let volatility = providedVol;
  let expectedReturn = 0;

  if (returns && returns.length > 0) {
    // Calculate from historical data
    expectedReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + (r - expectedReturn) ** 2, 0) / returns.length;
    volatility = Math.sqrt(variance);
  } else if (!volatility) {
    // Default volatility based on asset type
    volatility = getDefaultVolatility(symbol);
  }

  return {
    symbol,
    expectedReturn,
    volatility,
    skewness: calculateSkewness(returns),
    kurtosis: calculateKurtosis(returns)
  };
}

/**
 * Run Monte Carlo simulation
 */
function runMonteCarloSimulation(assetRisks, weights, correlationMatrix, timeHorizon, simulations) {
  const n = assetRisks.length;
  const simulatedReturns = [];

  // Generate correlated random numbers using Cholesky decomposition
  const choleskyMatrix = correlationMatrix 
    ? choleskyDecomposition(correlationMatrix)
    : identityMatrix(n);

  for (let sim = 0; sim < simulations; sim++) {
    // Generate independent standard normal random numbers
    const randoms = [];
    for (let i = 0; i < n; i++) {
      randoms.push(boxMullerRandom());
    }

    // Apply correlation
    const correlatedRandoms = multiplyMatrixVector(choleskyMatrix, randoms);

    // Calculate portfolio return for this simulation
    let portfolioReturn = 0;
    for (let i = 0; i < n; i++) {
      const assetReturn = 
        assetRisks[i].expectedReturn * timeHorizon +
        assetRisks[i].volatility * Math.sqrt(timeHorizon) * correlatedRandoms[i];
      portfolioReturn += weights[i] * assetReturn;
    }

    simulatedReturns.push(portfolioReturn);
  }

  return simulatedReturns.sort((a, b) => a - b);
}

/**
 * Calculate Value at Risk
 */
function calculateVaR(sortedReturns, confidenceLevel) {
  const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
  return Math.abs(sortedReturns[index]);
}

/**
 * Calculate Conditional Value at Risk (Expected Shortfall)
 */
function calculateCVaR(sortedReturns, confidenceLevel) {
  const varIndex = Math.floor((1 - confidenceLevel) * sortedReturns.length);
  const tailReturns = sortedReturns.slice(0, varIndex);
  if (tailReturns.length === 0) return calculateVaR(sortedReturns, confidenceLevel);
  return Math.abs(tailReturns.reduce((a, b) => a + b, 0) / tailReturns.length);
}

/**
 * Calculate portfolio volatility
 */
function calculatePortfolioVolatility(assetRisks, weights, correlationMatrix) {
  const n = weights.length;
  let variance = 0;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const correlation = correlationMatrix ? correlationMatrix[i][j] : (i === j ? 1 : 0.3);
      variance += weights[i] * weights[j] * assetRisks[i].volatility * assetRisks[j].volatility * correlation;
    }
  }

  return Math.sqrt(variance);
}

/**
 * Calculate Sharpe Ratio
 */
function calculateSharpeRatio(returns, volatility) {
  if (volatility === 0) return 0;
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const riskFreeRate = 0.05 / 365; // 5% annual, daily
  return (avgReturn - riskFreeRate) / volatility;
}

/**
 * Calculate Maximum Drawdown
 */
function calculateMaxDrawdown(returns) {
  let peak = 1;
  let maxDrawdown = 0;
  let cumReturn = 1;

  for (const ret of returns) {
    cumReturn *= (1 + ret);
    if (cumReturn > peak) {
      peak = cumReturn;
    }
    const drawdown = (peak - cumReturn) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

/**
 * Run stress test scenarios
 */
function runStressTests(holdings, weights) {
  const scenarios = [
    { name: 'Market Crash (-30%)', multiplier: -0.30 },
    { name: 'Flash Crash (-50%)', multiplier: -0.50 },
    { name: 'Black Swan (-70%)', multiplier: -0.70 },
    { name: 'BTC Dominance Shift', btcMultiplier: 0.20, altMultiplier: -0.40 },
    { name: 'DeFi Contagion', defiMultiplier: -0.60, otherMultiplier: -0.20 }
  ];

  const portfolioValue = holdings.reduce((sum, h) => sum + h.value, 0);

  return scenarios.map(scenario => {
    let loss = 0;

    for (let i = 0; i < holdings.length; i++) {
      const holding = holdings[i];
      let multiplier = scenario.multiplier || 0;

      // Apply specific multipliers
      if (scenario.btcMultiplier && holding.symbol === 'BTC') {
        multiplier = scenario.btcMultiplier;
      } else if (scenario.altMultiplier && holding.symbol !== 'BTC') {
        multiplier = scenario.altMultiplier;
      } else if (scenario.defiMultiplier && isDeFiToken(holding.symbol)) {
        multiplier = scenario.defiMultiplier;
      } else if (scenario.otherMultiplier && !isDeFiToken(holding.symbol)) {
        multiplier = scenario.otherMultiplier;
      }

      loss += holding.value * Math.abs(multiplier);
    }

    return {
      scenario: scenario.name,
      estimatedLoss: Math.round(loss * 100) / 100,
      percentLoss: Math.round((loss / portfolioValue) * 10000) / 100,
      severity: loss / portfolioValue > 0.5 ? 'CRITICAL' : loss / portfolioValue > 0.3 ? 'HIGH' : 'MODERATE'
    };
  });
}

/**
 * Calculate overall risk score (0-100)
 */
function calculateRiskScore(var95, volatility, maxDrawdown) {
  // Higher values = higher risk
  const varScore = Math.min(50, var95 * 500);
  const volScore = Math.min(30, volatility * 300);
  const ddScore = Math.min(20, maxDrawdown * 100);

  return Math.min(100, varScore + volScore + ddScore);
}

/**
 * Get risk level label
 */
function getRiskLevel(score) {
  if (score < 25) return 'LOW';
  if (score < 50) return 'MODERATE';
  if (score < 75) return 'HIGH';
  return 'VERY HIGH';
}

/**
 * Generate risk recommendations
 */
function generateRiskRecommendations(var95, volatility, holdings) {
  const recommendations = [];

  if (var95 > 0.10) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Reduce position sizes',
      reason: 'Daily VaR exceeds 10% - significant loss potential'
    });
  }

  if (volatility > 0.05) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Add stable assets (stablecoins, BTC)',
      reason: 'Portfolio volatility is elevated'
    });
  }

  // Check concentration
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const concentrations = holdings.map(h => h.value / totalValue);
  const maxConcentration = Math.max(...concentrations);

  if (maxConcentration > 0.40) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Diversify holdings',
      reason: `Single asset represents ${Math.round(maxConcentration * 100)}% of portfolio`
    });
  }

  if (holdings.length < 5) {
    recommendations.push({
      priority: 'LOW',
      action: 'Consider adding more assets',
      reason: 'Limited diversification with fewer than 5 assets'
    });
  }

  return recommendations;
}

// Utility functions

function getDefaultVolatility(symbol) {
  const volatilities = {
    BTC: 0.04, ETH: 0.05, USDT: 0.001, USDC: 0.001,
    SOL: 0.07, ARB: 0.08, OP: 0.08, MATIC: 0.06
  };
  return volatilities[symbol] || 0.06;
}

function isDeFiToken(symbol) {
  const defiTokens = ['UNI', 'AAVE', 'CRV', 'MKR', 'COMP', 'SUSHI', 'YFI', 'SNX', 'BAL'];
  return defiTokens.includes(symbol);
}

function boxMullerRandom() {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function identityMatrix(n) {
  return Array(n).fill(null).map((_, i) => 
    Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
  );
}

function choleskyDecomposition(matrix) {
  const n = matrix.length;
  const L = Array(n).fill(null).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }
      if (i === j) {
        L[i][j] = Math.sqrt(Math.max(0, matrix[i][i] - sum));
      } else {
        L[i][j] = L[j][j] > 0 ? (matrix[i][j] - sum) / L[j][j] : 0;
      }
    }
  }

  return L;
}

function multiplyMatrixVector(matrix, vector) {
  return matrix.map(row => row.reduce((sum, val, i) => sum + val * vector[i], 0));
}

function calculateSkewness(data) {
  if (!data || data.length < 3) return 0;
  const n = data.length;
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(data.reduce((sum, x) => sum + (x - mean) ** 2, 0) / n);
  if (std === 0) return 0;
  return data.reduce((sum, x) => sum + ((x - mean) / std) ** 3, 0) / n;
}

function calculateKurtosis(data) {
  if (!data || data.length < 4) return 3;
  const n = data.length;
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(data.reduce((sum, x) => sum + (x - mean) ** 2, 0) / n);
  if (std === 0) return 3;
  return data.reduce((sum, x) => sum + ((x - mean) / std) ** 4, 0) / n;
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
}
