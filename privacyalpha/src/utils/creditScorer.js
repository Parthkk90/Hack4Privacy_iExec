/**
 * PrivateAlpha Credit Scorer
 * Calculates private credit scores based on on-chain trading history
 * All computations happen inside the TEE - data never exposed
 */

/**
 * Scoring weights based on traditional credit models adapted for DeFi
 */
const WEIGHTS = {
  PAYMENT_HISTORY: 0.35,      // Loan repayment history
  UTILIZATION: 0.30,          // Position sizing discipline
  TRADING_SKILL: 0.20,        // Win rate and profit factor
  DIVERSIFICATION: 0.10,      // Portfolio spread
  ACCOUNT_AGE: 0.05           // Time in DeFi
};

/**
 * Tier definitions with leverage limits
 */
const TIERS = {
  1: { name: 'Bronze', minScore: 300, maxScore: 579, maxLeverage: 2 },
  2: { name: 'Silver', minScore: 580, maxScore: 669, maxLeverage: 5 },
  3: { name: 'Gold', minScore: 670, maxScore: 739, maxLeverage: 10 },
  4: { name: 'Platinum', minScore: 740, maxScore: 850, maxLeverage: 20 }
};

/**
 * Main credit score computation function
 * @param {Object} userData - Protected user data from TEE
 * @returns {Object} Credit score result with tier and factors
 */
export function computeCreditScore(userData) {
  const {
    walletAddress,
    transactions = [],
    loans = [],
    portfolio = {},
    accountCreatedAt
  } = userData;

  // Calculate individual factor scores (0-100 scale)
  const factors = {
    paymentHistory: calculatePaymentHistory(loans),
    utilization: calculateUtilization(transactions, portfolio),
    tradingSkill: calculateTradingSkill(transactions),
    diversification: calculateDiversification(portfolio),
    accountAge: calculateAccountAge(accountCreatedAt)
  };

  // Weighted average
  const weightedScore = (
    factors.paymentHistory * WEIGHTS.PAYMENT_HISTORY +
    factors.utilization * WEIGHTS.UTILIZATION +
    factors.tradingSkill * WEIGHTS.TRADING_SKILL +
    factors.diversification * WEIGHTS.DIVERSIFICATION +
    factors.accountAge * WEIGHTS.ACCOUNT_AGE
  );

  // Convert to 300-850 credit score range
  const creditScore = Math.round(300 + (weightedScore / 100) * 550);
  const clampedScore = Math.max(300, Math.min(850, creditScore));

  // Determine tier
  const tier = getTier(clampedScore);
  const tierInfo = TIERS[tier];

  // Generate attestation hash for on-chain verification
  const attestationData = JSON.stringify({
    wallet: walletAddress,
    score: clampedScore,
    tier,
    timestamp: Date.now()
  });
  const attestationHash = simpleHash(attestationData);

  return {
    walletAddress,
    score: clampedScore,
    tier,
    tierName: tierInfo.name,
    maxLeverage: tierInfo.maxLeverage,
    factors: {
      paymentHistory: Math.round(factors.paymentHistory * 10) / 10,
      utilization: Math.round(factors.utilization * 10) / 10,
      tradingSkill: Math.round(factors.tradingSkill * 10) / 10,
      diversification: Math.round(factors.diversification * 10) / 10,
      accountAge: Math.round(factors.accountAge * 10) / 10
    },
    attestationHash,
    computedAt: new Date().toISOString()
  };
}

/**
 * Calculate payment history score based on loan repayments
 */
function calculatePaymentHistory(loans) {
  if (!loans || loans.length === 0) {
    return 50; // Neutral score for no history
  }

  let score = 0;
  let totalWeight = 0;

  for (const loan of loans) {
    const loanWeight = loan.amount || 1;
    totalWeight += loanWeight;

    if (loan.paidOnTime) {
      score += loanWeight * 100;
    } else if (loan.paid) {
      // Late payment - partial credit
      const daysLate = loan.daysLate || 30;
      const penalty = Math.min(daysLate * 2, 60);
      score += loanWeight * (100 - penalty);
    } else if (loan.defaulted) {
      score += 0; // Default = 0 points
    } else {
      // Active loan - based on current status
      score += loanWeight * (loan.currentlyOnTime ? 80 : 40);
    }
  }

  return totalWeight > 0 ? score / totalWeight : 50;
}

/**
 * Calculate utilization score based on position sizing discipline
 */
function calculateUtilization(transactions, portfolio) {
  if (!transactions || transactions.length === 0) {
    return 50;
  }

  const totalValue = portfolio.totalValue || 10000;
  
  // Analyze position sizes relative to portfolio
  let goodSizing = 0;
  let totalTrades = 0;

  for (const tx of transactions) {
    if (tx.type === 'trade' || tx.type === 'swap') {
      totalTrades++;
      const positionSize = tx.amount / totalValue;
      
      // Good sizing: 1-10% of portfolio per trade
      if (positionSize >= 0.01 && positionSize <= 0.10) {
        goodSizing += 1;
      } else if (positionSize < 0.01) {
        goodSizing += 0.7; // Too small
      } else if (positionSize <= 0.20) {
        goodSizing += 0.5; // Slightly large
      } else {
        goodSizing += 0.2; // Risky sizing
      }
    }
  }

  return totalTrades > 0 ? (goodSizing / totalTrades) * 100 : 50;
}

/**
 * Calculate trading skill based on performance metrics
 */
function calculateTradingSkill(transactions) {
  if (!transactions || transactions.length === 0) {
    return 50;
  }

  const trades = transactions.filter(tx => tx.pnl !== undefined);
  if (trades.length === 0) return 50;

  // Win rate
  const wins = trades.filter(tx => tx.pnl > 0).length;
  const winRate = wins / trades.length;

  // Profit factor
  const totalProfit = trades.filter(tx => tx.pnl > 0).reduce((sum, tx) => sum + tx.pnl, 0);
  const totalLoss = Math.abs(trades.filter(tx => tx.pnl < 0).reduce((sum, tx) => sum + tx.pnl, 0));
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : (totalProfit > 0 ? 3 : 1);

  // Average return
  const avgReturn = trades.reduce((sum, tx) => sum + (tx.pnl || 0), 0) / trades.length;

  // Combine metrics
  const winRateScore = winRate * 40; // 0-40 points
  const profitFactorScore = Math.min(profitFactor, 3) * 20; // 0-60 points (capped at 3x)
  const consistencyBonus = avgReturn > 0 ? 10 : 0;

  return Math.min(100, winRateScore + profitFactorScore + consistencyBonus);
}

/**
 * Calculate diversification score based on portfolio spread
 */
function calculateDiversification(portfolio) {
  if (!portfolio || !portfolio.holdings) {
    return 50;
  }

  const holdings = portfolio.holdings;
  const numAssets = Object.keys(holdings).length;

  if (numAssets === 0) return 30;
  if (numAssets === 1) return 40;

  // Calculate concentration using Herfindahl-Hirschman Index
  const totalValue = Object.values(holdings).reduce((sum, h) => sum + (h.value || 0), 0);
  if (totalValue === 0) return 50;

  let hhi = 0;
  for (const holding of Object.values(holdings)) {
    const share = (holding.value || 0) / totalValue;
    hhi += share * share;
  }

  // HHI ranges from 1/n (perfect diversification) to 1 (single asset)
  // Convert to 0-100 score
  const minHHI = 1 / numAssets;
  const diversificationRatio = 1 - ((hhi - minHHI) / (1 - minHHI + 0.001));
  
  // Bonus for having more assets (up to 10)
  const assetBonus = Math.min(numAssets, 10) * 3;

  return Math.min(100, diversificationRatio * 70 + assetBonus);
}

/**
 * Calculate account age score
 */
function calculateAccountAge(accountCreatedAt) {
  if (!accountCreatedAt) return 50;

  const ageMs = Date.now() - new Date(accountCreatedAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  if (ageDays < 30) return 20;
  if (ageDays < 90) return 40;
  if (ageDays < 180) return 60;
  if (ageDays < 365) return 80;
  return 100;
}

/**
 * Determine tier based on credit score
 */
function getTier(score) {
  if (score >= 740) return 4;
  if (score >= 670) return 3;
  if (score >= 580) return 2;
  return 1;
}

/**
 * Simple hash function for attestation
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

export { TIERS, WEIGHTS };
