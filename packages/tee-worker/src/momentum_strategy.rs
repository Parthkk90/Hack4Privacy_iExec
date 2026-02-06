use crate::types::*;
use sha2::{Sha256, Digest};

pub fn generate_trading_signal(input: &TradingSignalInput) -> Result<TradingSignalOutput, String> {
    if input.price_history.len() < 30 {
        return Err("Insufficient price data (need at least 30 periods)".to_string());
    }

    let current_price = input.price_history.last().unwrap().close;
    
    // Calculate technical indicators
    let rsi = calculate_rsi(&input.price_history, 14);
    let momentum_3m = calculate_momentum(&input.price_history, 60); // ~3 months
    let momentum_6m = calculate_momentum(&input.price_history, 120); // ~6 months
    let volatility = calculate_volatility(&input.price_history, 30);
    let volume_trend = calculate_volume_trend(&input.volume_history, 20);

    // Generate signal based on momentum strategy
    let (signal, confidence, reasoning) = determine_signal(
        rsi,
        momentum_3m,
        momentum_6m,
        volatility,
        volume_trend,
    );

    // Calculate target price and stop loss
    let (target_price, stop_loss) = calculate_targets(
        current_price,
        &signal,
        volatility,
        momentum_3m,
    );

    // Calculate position size based on volatility
    let position_size = calculate_position_size(confidence, volatility);

    // Generate attestation
    let attestation = generate_signal_attestation(&input.symbol, &signal, confidence);

    Ok(TradingSignalOutput {
        symbol: input.symbol.clone(),
        signal,
        confidence,
        target_price,
        stop_loss,
        position_size,
        reasoning,
        attestation,
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    })
}

fn calculate_rsi(prices: &[PriceData], period: usize) -> f64 {
    if prices.len() < period + 1 {
        return 50.0;
    }

    let recent_prices: Vec<f64> = prices.iter()
        .rev()
        .take(period + 1)
        .map(|p| p.close)
        .collect();

    let mut gains = 0.0;
    let mut losses = 0.0;

    for i in 1..recent_prices.len() {
        let change = recent_prices[i-1] - recent_prices[i];
        if change > 0.0 {
            gains += change;
        } else {
            losses += change.abs();
        }
    }

    let avg_gain = gains / period as f64;
    let avg_loss = losses / period as f64;

    if avg_loss == 0.0 {
        return 100.0;
    }

    let rs = avg_gain / avg_loss;
    100.0 - (100.0 / (1.0 + rs))
}

fn calculate_momentum(prices: &[PriceData], lookback: usize) -> f64 {
    if prices.len() < lookback {
        return 0.0;
    }

    let current = prices.last().unwrap().close;
    let past = prices[prices.len() - lookback].close;

    ((current - past) / past) * 100.0
}

fn calculate_volatility(prices: &[PriceData], period: usize) -> f64 {
    if prices.len() < period {
        return 0.0;
    }

    let recent_prices: Vec<f64> = prices.iter()
        .rev()
        .take(period)
        .map(|p| p.close)
        .collect();

    let mean = recent_prices.iter().sum::<f64>() / period as f64;

    let variance = recent_prices.iter()
        .map(|p| (p - mean).powi(2))
        .sum::<f64>() / period as f64;

    variance.sqrt() / mean * 100.0
}

fn calculate_volume_trend(volumes: &[f64], period: usize) -> f64 {
    if volumes.len() < period * 2 {
        return 0.0;
    }

    let recent: f64 = volumes.iter().rev().take(period).sum::<f64>() / period as f64;
    let past: f64 = volumes.iter()
        .rev()
        .skip(period)
        .take(period)
        .sum::<f64>() / period as f64;

    if past == 0.0 {
        return 0.0;
    }

    ((recent - past) / past) * 100.0
}

fn determine_signal(
    rsi: f64,
    momentum_3m: f64,
    momentum_6m: f64,
    volatility: f64,
    volume_trend: f64,
) -> (String, f64, Vec<String>) {
    let mut buy_score = 0.0;
    let mut sell_score = 0.0;
    let mut reasoning = Vec::new();

    // RSI analysis
    if rsi < 30.0 {
        buy_score += 2.0;
        reasoning.push(format!("RSI oversold: {:.1}", rsi));
    } else if rsi > 70.0 {
        sell_score += 2.0;
        reasoning.push(format!("RSI overbought: {:.1}", rsi));
    }

    // Momentum analysis
    if momentum_3m > 10.0 && momentum_6m > 15.0 {
        buy_score += 3.0;
        reasoning.push(format!("Strong upward momentum: 3M={:.1}%, 6M={:.1}%", momentum_3m, momentum_6m));
    } else if momentum_3m < -10.0 && momentum_6m < -15.0 {
        sell_score += 3.0;
        reasoning.push(format!("Strong downward momentum: 3M={:.1}%, 6M={:.1}%", momentum_3m, momentum_6m));
    }

    // Volume confirmation
    if volume_trend > 20.0 {
        if buy_score > sell_score {
            buy_score += 1.0;
            reasoning.push(format!("Volume increasing: +{:.1}%", volume_trend));
        }
    }

    // Volatility check
    if volatility > 50.0 {
        reasoning.push(format!("High volatility: {:.1}% - reduce position size", volatility));
    }

    // Determine final signal
    let total_score = buy_score + sell_score;
    if total_score < 2.0 {
        return ("HOLD".to_string(), 0.3, reasoning);
    }

    if buy_score > sell_score {
        let confidence = (buy_score / (buy_score + sell_score)).min(0.95);
        ("BUY".to_string(), confidence, reasoning)
    } else if sell_score > buy_score {
        let confidence = (sell_score / (buy_score + sell_score)).min(0.95);
        ("SELL".to_string(), confidence, reasoning)
    } else {
        ("HOLD".to_string(), 0.5, reasoning)
    }
}

fn calculate_targets(
    current_price: f64,
    signal: &str,
    volatility: f64,
    momentum: f64,
) -> (f64, f64) {
    let volatility_factor = (volatility / 100.0).max(0.02).min(0.15);

    match signal {
        "BUY" => {
            let target_factor = 1.0 + (momentum.abs() / 100.0).max(0.05).min(0.20);
            let stop_factor = 1.0 - volatility_factor;
            
            (current_price * target_factor, current_price * stop_factor)
        }
        "SELL" => {
            let target_factor = 1.0 - (momentum.abs() / 100.0).max(0.05).min(0.20);
            let stop_factor = 1.0 + volatility_factor;
            
            (current_price * target_factor, current_price * stop_factor)
        }
        _ => (current_price, current_price * (1.0 - volatility_factor)),
    }
}

fn calculate_position_size(confidence: f64, volatility: f64) -> f64 {
    // Kelly criterion simplified
    let base_size = 0.1; // 10% max position
    let confidence_factor = confidence.max(0.3);
    let volatility_factor = (1.0 - (volatility / 100.0)).max(0.3);

    (base_size * confidence_factor * volatility_factor)
        .max(0.01)
        .min(0.15)
}

fn generate_signal_attestation(symbol: &str, signal: &str, confidence: f64) -> String {
    let mut hasher = Sha256::new();
    hasher.update(b"signal_attestation");
    hasher.update(symbol);
    hasher.update(signal);
    hasher.update(confidence.to_string());
    hasher.update(std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs()
        .to_string());
    format!("0x{}", hex::encode(hasher.finalize()))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_price_data(count: usize, base_price: f64) -> Vec<PriceData> {
        (0..count)
            .map(|i| {
                let price = base_price + (i as f64 * 10.0);
                PriceData {
                    timestamp: 1234567890 + (i as u64 * 86400),
                    open: price,
                    high: price * 1.02,
                    low: price * 0.98,
                    close: price,
                    volume: 1000000.0,
                }
            })
            .collect()
    }

    #[test]
    fn test_generate_trading_signal() {
        let input = TradingSignalInput {
            symbol: "ETH".to_string(),
            timeframe: "1d".to_string(),
            price_history: create_test_price_data(150, 1000.0),
            volume_history: vec![1000000.0; 150],
        };

        let result = generate_trading_signal(&input).unwrap();
        
        assert!(!result.signal.is_empty());
        assert!(result.confidence >= 0.0 && result.confidence <= 1.0);
        assert!(result.position_size > 0.0 && result.position_size <= 0.15);
        assert!(!result.attestation.is_empty());
    }

    #[test]
    fn test_rsi_calculation() {
        let prices = create_test_price_data(30, 1000.0);
        let rsi = calculate_rsi(&prices, 14);
        
        assert!(rsi >= 0.0 && rsi <= 100.0);
    }

    #[test]
    fn test_momentum_calculation() {
        let prices = create_test_price_data(120, 1000.0);
        let momentum = calculate_momentum(&prices, 60);
        
        // Should be positive for upward trend
        assert!(momentum > 0.0);
    }
}
