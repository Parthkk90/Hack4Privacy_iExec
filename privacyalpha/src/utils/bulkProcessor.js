/**
 * PrivateAlpha Bulk Processor
 * Efficiently process multiple protected data items in a single TEE execution
 * Designed for iExec's bulk processing bonus prize
 */

import { computeCreditScore } from './creditScorer.js';
import { generateMomentumSignal } from './momentumEngine.js';
import { scanArbitrageOpportunities } from './arbitrageScanner.js';
import { calculatePortfolioRisk } from './riskCalculator.js';

/**
 * Process multiple users' protected data in bulk
 * More efficient than individual requests - saves gas and TEE overhead
 * 
 * @param {Array} protectedDataItems - Array of deserialized protected data
 * @param {string} operation - Type of operation to perform
 * @returns {Object} Aggregated results for all items
 */
export async function processBulk(protectedDataItems, operation = 'credit-score') {
  const startTime = Date.now();
  const results = [];
  const errors = [];

  console.log(`Starting bulk processing: ${protectedDataItems.length} items for ${operation}`);

  for (let i = 0; i < protectedDataItems.length; i++) {
    const item = protectedDataItems[i];
    const itemId = item.id || item.walletAddress || `item_${i + 1}`;

    try {
      let result;

      switch (operation) {
        case 'credit-score':
          result = processCredItScoreItem(item);
          break;
        case 'momentum':
          result = processMomentumItem(item);
          break;
        case 'arbitrage':
          result = processArbitrageItem(item);
          break;
        case 'risk':
          result = processRiskItem(item);
          break;
        case 'full-analysis':
          result = processFullAnalysis(item);
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      results.push({
        itemId,
        success: true,
        data: result
      });

    } catch (error) {
      console.error(`Error processing item ${itemId}:`, error.message);
      errors.push({
        itemId,
        error: error.message
      });
    }
  }

  const processingTime = Date.now() - startTime;

  // Generate bulk attestation
  const attestationData = JSON.stringify({
    operation,
    itemCount: protectedDataItems.length,
    successCount: results.length,
    errorCount: errors.length,
    timestamp: Date.now()
  });
  const bulkAttestationHash = simpleHash(attestationData);

  return {
    operation,
    summary: {
      totalItems: protectedDataItems.length,
      successful: results.length,
      failed: errors.length,
      processingTimeMs: processingTime,
      avgTimePerItem: Math.round(processingTime / protectedDataItems.length)
    },
    results,
    errors: errors.length > 0 ? errors : undefined,
    bulkAttestationHash,
    processedAt: new Date().toISOString()
  };
}

/**
 * Process credit score for single item
 */
function processCredItScoreItem(item) {
  const userData = {
    walletAddress: item.walletAddress || item.address,
    transactions: item.transactions || item.txHistory || [],
    loans: item.loans || item.loanHistory || [],
    portfolio: item.portfolio || {},
    accountCreatedAt: item.accountCreatedAt || item.firstTxDate
  };

  return computeCreditScore(userData);
}

/**
 * Process momentum signal for single item
 */
function processMomentumItem(item) {
  const marketData = {
    symbol: item.symbol || item.token,
    priceHistory: item.priceHistory || item.prices || [],
    volumeHistory: item.volumeHistory || item.volumes || [],
    currentPrice: item.currentPrice || (item.priceHistory && item.priceHistory[item.priceHistory.length - 1]?.close)
  };

  return generateMomentumSignal(marketData);
}

/**
 * Process arbitrage scan for single item
 */
function processArbitrageItem(item) {
  const priceData = {
    quotes: item.quotes || item.dexPrices || [],
    minProfitUSD: item.minProfitUSD || 10,
    maxSlippage: item.maxSlippage || 0.005
  };

  return scanArbitrageOpportunities(priceData);
}

/**
 * Process risk calculation for single item
 */
function processRiskItem(item) {
  const portfolioData = {
    holdings: item.holdings || item.portfolio || [],
    correlationMatrix: item.correlationMatrix,
    confidenceLevel: item.confidenceLevel || 0.95,
    timeHorizon: item.timeHorizon || 1,
    simulations: item.simulations || 5000 // Reduced for bulk processing
  };

  return calculatePortfolioRisk(portfolioData);
}

/**
 * Process full analysis (all operations)
 */
function processFullAnalysis(item) {
  const results = {};

  // Credit Score
  if (item.walletAddress || item.transactions) {
    results.creditScore = processCredItScoreItem(item);
  }

  // Momentum Signals
  if (item.priceHistory || item.prices) {
    results.momentum = processMomentumItem(item);
  }

  // Arbitrage (if DEX quotes provided)
  if (item.quotes || item.dexPrices) {
    results.arbitrage = processArbitrageItem(item);
  }

  // Risk Analysis
  if (item.holdings || item.portfolio) {
    results.risk = processRiskItem(item);
  }

  return results;
}

/**
 * Aggregate statistics across bulk results
 */
export function aggregateBulkResults(bulkResults) {
  if (!bulkResults.results || bulkResults.results.length === 0) {
    return null;
  }

  const operation = bulkResults.operation;
  const successfulResults = bulkResults.results.filter(r => r.success);

  switch (operation) {
    case 'credit-score':
      return aggregateCreditScores(successfulResults);
    case 'momentum':
      return aggregateMomentumSignals(successfulResults);
    case 'risk':
      return aggregateRiskMetrics(successfulResults);
    default:
      return null;
  }
}

/**
 * Aggregate credit scores
 */
function aggregateCreditScores(results) {
  const scores = results.map(r => r.data.score);
  const tiers = results.map(r => r.data.tier);

  return {
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    medianScore: scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)],
    minScore: Math.min(...scores),
    maxScore: Math.max(...scores),
    tierDistribution: {
      bronze: tiers.filter(t => t === 1).length,
      silver: tiers.filter(t => t === 2).length,
      gold: tiers.filter(t => t === 3).length,
      platinum: tiers.filter(t => t === 4).length
    },
    totalProcessed: results.length
  };
}

/**
 * Aggregate momentum signals
 */
function aggregateMomentumSignals(results) {
  const signals = results.map(r => r.data.signal);
  const confidences = results.map(r => r.data.confidence);

  return {
    signalDistribution: {
      strongBuy: signals.filter(s => s === 'STRONG_BUY').length,
      buy: signals.filter(s => s === 'BUY').length,
      hold: signals.filter(s => s === 'HOLD').length,
      sell: signals.filter(s => s === 'SELL').length,
      strongSell: signals.filter(s => s === 'STRONG_SELL').length
    },
    averageConfidence: Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length * 100) / 100,
    highConfidenceSignals: results.filter(r => r.data.confidence > 0.7).map(r => ({
      symbol: r.data.symbol,
      signal: r.data.signal,
      confidence: r.data.confidence
    })),
    totalProcessed: results.length
  };
}

/**
 * Aggregate risk metrics
 */
function aggregateRiskMetrics(results) {
  const riskScores = results.map(r => r.data.riskScore);
  const var95s = results.map(r => r.data.metrics?.var95?.percent || 0);

  return {
    averageRiskScore: Math.round(riskScores.reduce((a, b) => a + b, 0) / riskScores.length),
    averageVaR95: Math.round(var95s.reduce((a, b) => a + b, 0) / var95s.length * 100) / 100,
    riskLevelDistribution: {
      low: results.filter(r => r.data.riskLevel === 'LOW').length,
      moderate: results.filter(r => r.data.riskLevel === 'MODERATE').length,
      high: results.filter(r => r.data.riskLevel === 'HIGH').length,
      veryHigh: results.filter(r => r.data.riskLevel === 'VERY HIGH').length
    },
    highRiskPortfolios: results.filter(r => r.data.riskScore > 70).map(r => ({
      itemId: r.itemId,
      riskScore: r.data.riskScore,
      var95: r.data.metrics?.var95?.percent
    })),
    totalProcessed: results.length
  };
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
