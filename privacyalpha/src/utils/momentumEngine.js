/**
 * PrivateAlpha Momentum Engine
 * AI-powered trading signal generation using momentum strategies
 * All computations happen inside the TEE - strategies remain private
 */

/**
 * Signal types
 */
export const SIGNALS = {
  STRONG_BUY: 'STRONG_BUY',
  BUY: 'BUY',
  HOLD: 'HOLD',
  SELL: 'SELL',
  STRONG_SELL: 'STRONG_SELL'
};

/**
 * Generate trading signals based on momentum analysis
 * @param {Object} marketData - Price and volume data
 * @returns {Object} Trading signal with confidence and reasoning
 */
export function generateMomentumSignal(marketData) {
  const {
    symbol,
    priceHistory = [],
    volumeHistory = [],
    currentPrice
  } = marketData;

  if (priceHistory.length < 30) {
    return {
      symbol,
      signal: SIGNALS.HOLD,
      confidence: 0,
      error: 'Insufficient price data (need at least 30 periods)'
    };
  }

  // Calculate technical indicators
  const indicators = {
    rsi: calculateRSI(priceHistory, 14),
    momentum3m: calculateMomentum(priceHistory, 60),
    momentum6m: calculateMomentum(priceHistory, 120),
    macdSignal: calculateMACD(priceHistory),
    volatility: calculateVolatility(priceHistory, 30),
    volumeTrend: calculateVolumeTrend(volumeHistory, 20),
    sma20: calculateSMA(priceHistory, 20),
    sma50: calculateSMA(priceHistory, 50),
    ema12: calculateEMA(priceHistory, 12)
  };

  // Generate signal based on combined indicators
  const { signal, confidence, reasoning } = determineSignal(indicators, currentPrice);

  // Calculate targets
  const { targetPrice, stopLoss } = calculateTargets(
    currentPrice,
    signal,
    indicators.volatility,
    indicators.momentum3m
  );

  // Position sizing based on confidence and volatility
  const positionSize = calculatePositionSize(confidence, indicators.volatility);

  // Generate attestation for on-chain verification
  const attestationData = JSON.stringify({
    symbol,
    signal,
    confidence,
    timestamp: Date.now()
  });
  const attestationHash = simpleHash(attestationData);

  return {
    symbol,
    signal,
    confidence: Math.round(confidence * 100) / 100,
    targetPrice: Math.round(targetPrice * 100) / 100,
    stopLoss: Math.round(stopLoss * 100) / 100,
    positionSize: Math.round(positionSize * 100) / 100,
    indicators: {
      rsi: Math.round(indicators.rsi * 100) / 100,
      momentum3m: Math.round(indicators.momentum3m * 10000) / 100,
      volatility: Math.round(indicators.volatility * 10000) / 100,
      volumeTrend: Math.round(indicators.volumeTrend * 100) / 100
    },
    reasoning,
    attestationHash,
    generatedAt: new Date().toISOString()
  };
}

/**
 * Calculate Relative Strength Index (RSI)
 */
function calculateRSI(prices, period) {
  if (prices.length < period + 1) return 50;

  const closes = prices.slice(-period - 1).map(p => p.close || p);
  let gains = 0, losses = 0;

  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate price momentum over period
 */
function calculateMomentum(prices, period) {
  if (prices.length < period) {
    period = prices.length;
  }
  if (period < 2) return 0;

  const currentPrice = prices[prices.length - 1].close || prices[prices.length - 1];
  const pastPrice = prices[prices.length - period].close || prices[prices.length - period];

  return (currentPrice - pastPrice) / pastPrice;
}

/**
 * Calculate MACD signal
 */
function calculateMACD(prices) {
  if (prices.length < 26) return { value: 0, signal: 0, histogram: 0 };

  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  
  // Signal line is 9-period EMA of MACD
  const signalLine = macdLine * 0.2; // Simplified
  const histogram = macdLine - signalLine;

  return { value: macdLine, signal: signalLine, histogram };
}

/**
 * Calculate volatility (standard deviation of returns)
 */
function calculateVolatility(prices, period) {
  if (prices.length < period) return 0.02;

  const returns = [];
  for (let i = prices.length - period; i < prices.length; i++) {
    const curr = prices[i].close || prices[i];
    const prev = prices[i - 1]?.close || prices[i - 1] || curr;
    returns.push((curr - prev) / prev);
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
  return Math.sqrt(variance);
}

/**
 * Calculate volume trend
 */
function calculateVolumeTrend(volumes, period) {
  if (!volumes || volumes.length < period) return 1;

  const recent = volumes.slice(-period / 2);
  const older = volumes.slice(-period, -period / 2);

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  return olderAvg > 0 ? recentAvg / olderAvg : 1;
}

/**
 * Calculate Simple Moving Average
 */
function calculateSMA(prices, period) {
  if (prices.length < period) return prices[prices.length - 1]?.close || prices[prices.length - 1];

  const slice = prices.slice(-period);
  return slice.reduce((sum, p) => sum + (p.close || p), 0) / period;
}

/**
 * Calculate Exponential Moving Average
 */
function calculateEMA(prices, period) {
  if (prices.length < period) return calculateSMA(prices, prices.length);

  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);

  for (let i = period; i < prices.length; i++) {
    const price = prices[i].close || prices[i];
    ema = (price - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Determine trading signal based on indicators
 */
function determineSignal(indicators, currentPrice) {
  let bullishPoints = 0;
  let bearishPoints = 0;
  const reasons = [];

  // RSI analysis
  if (indicators.rsi < 30) {
    bullishPoints += 2;
    reasons.push('RSI oversold');
  } else if (indicators.rsi < 40) {
    bullishPoints += 1;
    reasons.push('RSI approaching oversold');
  } else if (indicators.rsi > 70) {
    bearishPoints += 2;
    reasons.push('RSI overbought');
  } else if (indicators.rsi > 60) {
    bearishPoints += 1;
    reasons.push('RSI approaching overbought');
  }

  // Momentum analysis
  if (indicators.momentum3m > 0.2) {
    bullishPoints += 2;
    reasons.push('Strong 3M momentum');
  } else if (indicators.momentum3m > 0.05) {
    bullishPoints += 1;
    reasons.push('Positive 3M momentum');
  } else if (indicators.momentum3m < -0.2) {
    bearishPoints += 2;
    reasons.push('Strong negative 3M momentum');
  } else if (indicators.momentum3m < -0.05) {
    bearishPoints += 1;
    reasons.push('Negative 3M momentum');
  }

  // Volume trend
  if (indicators.volumeTrend > 1.5) {
    bullishPoints += 1;
    reasons.push('Increasing volume');
  } else if (indicators.volumeTrend < 0.7) {
    bearishPoints += 1;
    reasons.push('Declining volume');
  }

  // Price vs moving averages
  if (currentPrice > indicators.sma20 && currentPrice > indicators.sma50) {
    bullishPoints += 1;
    reasons.push('Price above key MAs');
  } else if (currentPrice < indicators.sma20 && currentPrice < indicators.sma50) {
    bearishPoints += 1;
    reasons.push('Price below key MAs');
  }

  // MACD
  if (indicators.macdSignal.histogram > 0) {
    bullishPoints += 1;
    reasons.push('MACD bullish');
  } else if (indicators.macdSignal.histogram < 0) {
    bearishPoints += 1;
    reasons.push('MACD bearish');
  }

  // Determine signal
  const netScore = bullishPoints - bearishPoints;
  const totalPoints = bullishPoints + bearishPoints;
  const confidence = totalPoints > 0 ? Math.abs(netScore) / totalPoints : 0;

  let signal;
  if (netScore >= 4) {
    signal = SIGNALS.STRONG_BUY;
  } else if (netScore >= 2) {
    signal = SIGNALS.BUY;
  } else if (netScore <= -4) {
    signal = SIGNALS.STRONG_SELL;
  } else if (netScore <= -2) {
    signal = SIGNALS.SELL;
  } else {
    signal = SIGNALS.HOLD;
  }

  return {
    signal,
    confidence: Math.min(0.95, 0.5 + confidence * 0.45),
    reasoning: reasons.join('; ')
  };
}

/**
 * Calculate target price and stop loss
 */
function calculateTargets(currentPrice, signal, volatility, momentum) {
  const atr = currentPrice * volatility * 2; // Approximate ATR

  let targetMultiplier, stopMultiplier;

  switch (signal) {
    case SIGNALS.STRONG_BUY:
      targetMultiplier = 3;
      stopMultiplier = 1;
      break;
    case SIGNALS.BUY:
      targetMultiplier = 2;
      stopMultiplier = 1;
      break;
    case SIGNALS.STRONG_SELL:
      targetMultiplier = -3;
      stopMultiplier = -1;
      break;
    case SIGNALS.SELL:
      targetMultiplier = -2;
      stopMultiplier = -1;
      break;
    default:
      return { targetPrice: currentPrice, stopLoss: currentPrice };
  }

  const isBullish = signal === SIGNALS.BUY || signal === SIGNALS.STRONG_BUY;
  const targetPrice = currentPrice + (atr * targetMultiplier);
  const stopLoss = isBullish 
    ? currentPrice - (atr * Math.abs(stopMultiplier))
    : currentPrice + (atr * Math.abs(stopMultiplier));

  return { targetPrice, stopLoss };
}

/**
 * Calculate position size based on confidence and volatility
 */
function calculatePositionSize(confidence, volatility) {
  // Base position size: 5% of portfolio
  const baseSize = 0.05;
  
  // Adjust based on confidence (0.5 to 1.5x)
  const confidenceMultiplier = 0.5 + confidence;
  
  // Reduce size for high volatility (inverse relationship)
  const volatilityMultiplier = Math.max(0.5, 1 - volatility * 10);

  return Math.min(0.10, baseSize * confidenceMultiplier * volatilityMultiplier);
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
