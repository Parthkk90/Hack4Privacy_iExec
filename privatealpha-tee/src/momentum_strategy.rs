use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PriceData {
    pub timestamp: i64,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SignalType {
    BUY,
    SELL,
    HOLD,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradeSignal {
    pub asset: String,
    pub signal: SignalType,
    pub confidence: f64,
    pub recommended_size: f64,
    pub entry_price: f64,
    pub target_price: f64,
    pub stop_loss: f64,
    pub reasoning: String,
}

pub fn find_momentum_signals(
    assets: Vec<String>,
    price_data: &HashMap<String, Vec<PriceData>>
) -> Vec<TradeSignal> {
    let mut signals = Vec::new();
    
    for asset in assets {
        let prices = match price_data.get(&asset) {
            Some(p) => p,
            None => {
                eprintln!("No price data for {}", asset);
                continue;
            }
        };
        
        if prices.len() < 180 {
            eprintln!("Insufficient data for {} (need 180 days)", asset);
            continue;
        }
        
        // Calculate returns
        let returns_3m = calculate_return(prices, 90);
        let returns_6m = calculate_return(prices, 180);
        let volatility = calculate_volatility(prices, 30);
        let volume_trend = calculate_volume_trend(prices, 20);
        let rsi = calculate_rsi(prices, 14);
        
        // Momentum score
        let momentum_score = 
            0.40 * normalize_return(returns_3m) +
            0.30 * normalize_return(returns_6m) +
            0.15 * volume_trend +
            0.15 * normalize_rsi(rsi);
        
        // Determine signal
        let (signal_type, confidence) = determine_signal(momentum_score, rsi, volatility);
        
        // Calculate position sizing based on volatility
        let position_size = calculate_position_size(volatility, confidence);
        
        // Get current price
        let current_price = prices.last().unwrap().close;
        
        // Calculate targets and stops
        let (target_price, stop_loss) = calculate_targets(
            current_price,
            &signal_type,
            volatility,
            returns_3m
        );
        
        // Generate reasoning
        let reasoning = format!(
            "3M return: {:.1}%, 6M return: {:.1}%, RSI: {:.1}, Vol: {:.2}%, Momentum: {:.2}",
            returns_3m * 100.0,
            returns_6m * 100.0,
            rsi,
            volatility * 100.0,
            momentum_score
        );
        
        signals.push(TradeSignal {
            asset: asset.clone(),
            signal: signal_type,
            confidence,
            recommended_size: position_size,
            entry_price: current_price,
            target_price,
            stop_loss,
            reasoning,
        });
    }
    
    // Sort by confidence (highest first)
    signals.sort_by(|a, b| b.confidence.partial_cmp(&a.confidence).unwrap());
    
    signals
}

fn calculate_return(prices: &[PriceData], days: usize) -> f64 {
    if prices.len() < days {
        return 0.0;
    }
    
    let current = prices.last().unwrap().close;
    let past = prices[prices.len() - days].close;
    
    (current - past) / past
}

fn calculate_volatility(prices: &[PriceData], days: usize) -> f64 {
    if prices.len() < days + 1 {
        return 0.0;
    }
    
    let recent = &prices[prices.len() - days..];
    
    // Calculate daily returns
    let returns: Vec<f64> = recent.windows(2)
        .map(|w| (w[1].close - w[0].close) / w[0].close)
        .collect();
    
    if returns.is_empty() {
        return 0.0;
    }
    
    // Calculate standard deviation
    let mean = returns.iter().sum::<f64>() / returns.len() as f64;
    let variance = returns.iter()
        .map(|r| (r - mean).powi(2))
        .sum::<f64>() / returns.len() as f64;
    
    variance.sqrt()
}

fn calculate_volume_trend(prices: &[PriceData], days: usize) -> f64 {
    if prices.len() < days * 2 {
        return 0.0;
    }
    
    let recent = &prices[prices.len() - days..];
    let previous = &prices[prices.len() - days * 2..prices.len() - days];
    
    let recent_avg: f64 = recent.iter().map(|p| p.volume).sum::<f64>() / recent.len() as f64;
    let previous_avg: f64 = previous.iter().map(|p| p.volume).sum::<f64>() / previous.len() as f64;
    
    if previous_avg == 0.0 {
        return 0.0;
    }
    
    ((recent_avg - previous_avg) / previous_avg).clamp(-1.0, 1.0)
}

fn calculate_rsi(prices: &[PriceData], period: usize) -> f64 {
    if prices.len() < period + 1 {
        return 50.0;
    }
    
    let recent = &prices[prices.len() - period - 1..];
    
    let mut gains = 0.0;
    let mut losses = 0.0;
    
    for window in recent.windows(2) {
        let change = window[1].close - window[0].close;
        if change > 0.0 {
            gains += change;
        } else {
            losses += change.abs();
        }
    }
    
    if losses == 0.0 {
        return 100.0;
    }
    
    let avg_gain = gains / period as f64;
    let avg_loss = losses / period as f64;
    
    let rs = avg_gain / avg_loss;
    let rsi = 100.0 - (100.0 / (1.0 + rs));
    
    rsi
}

fn normalize_return(ret: f64) -> f64 {
    // Normalize returns to 0-1 scale
    // Assume typical returns range from -50% to +100%
    ((ret + 0.5) / 1.5).clamp(0.0, 1.0)
}

fn normalize_rsi(rsi: f64) -> f64 {
    // RSI is 0-100, we want 30-70 to be neutral
    if rsi < 30.0 {
        // Oversold - bullish signal
        (30.0 - rsi) / 30.0
    } else if rsi > 70.0 {
        // Overbought - bearish signal
        -(rsi - 70.0) / 30.0
    } else {
        // Neutral zone
        0.0
    }
}

fn determine_signal(momentum_score: f64, rsi: f64, _volatility: f64) -> (SignalType, f64) {
    // Strong buy: high momentum, not overbought
    if momentum_score > 0.7 && rsi < 70.0 {
        return (SignalType::BUY, momentum_score);
    }
    
    // Buy: moderate momentum
    if momentum_score > 0.6 {
        return (SignalType::BUY, momentum_score * 0.8);
    }
    
    // Strong sell: low momentum, not oversold
    if momentum_score < 0.3 && rsi > 30.0 {
        return (SignalType::SELL, 1.0 - momentum_score);
    }
    
    // Sell: weak momentum
    if momentum_score < 0.4 {
        return (SignalType::SELL, (1.0 - momentum_score) * 0.8);
    }
    
    // Hold: everything else
    (SignalType::HOLD, 0.5)
}

fn calculate_position_size(volatility: f64, confidence: f64) -> f64 {
    // Kelly Criterion inspired position sizing
    // Higher confidence and lower volatility = larger position
    
    let base_size = 0.10; // 10% base position
    
    // Adjust for volatility (higher vol = smaller position)
    let vol_adjustment = if volatility > 0.0 {
        (0.02 / volatility).min(2.0)
    } else {
        1.0
    };
    
    // Adjust for confidence
    let confidence_adjustment = confidence;
    
    let position_size = base_size * vol_adjustment * confidence_adjustment;
    
    position_size.clamp(0.01, 0.25) // 1% to 25% of portfolio
}

fn calculate_targets(
    current_price: f64,
    signal: &SignalType,
    volatility: f64,
    momentum: f64
) -> (f64, f64) {
    match signal {
        SignalType::BUY => {
            // Target: current price + (2 * volatility + momentum bonus)
            let upside = 2.0 * volatility + momentum.abs() * 0.1;
            let target = current_price * (1.0 + upside);
            
            // Stop loss: current price - (1 * volatility)
            let downside = volatility;
            let stop = current_price * (1.0 - downside);
            
            (target, stop)
        }
        SignalType::SELL => {
            // Target: current price - (2 * volatility + momentum bonus)
            let downside = 2.0 * volatility + momentum.abs() * 0.1;
            let target = current_price * (1.0 - downside);
            
            // Stop loss: current price + (1 * volatility)
            let upside = volatility;
            let stop = current_price * (1.0 + upside);
            
            (target, stop)
        }
        SignalType::HOLD => {
            (current_price, current_price)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_price_data() -> Vec<PriceData> {
        (0..200)
            .map(|i| PriceData {
                timestamp: 1234567890 + i * 86400,
                open: 100.0 + i as f64 * 0.5,
                high: 105.0 + i as f64 * 0.5,
                low: 95.0 + i as f64 * 0.5,
                close: 100.0 + i as f64 * 0.5,
                volume: 1000000.0,
            })
            .collect()
    }

    #[test]
    fn test_calculate_return() {
        let prices = create_test_price_data();
        let ret = calculate_return(&prices, 90);
        assert!(ret > 0.0); // Upward trend
    }

    #[test]
    fn test_calculate_volatility() {
        let prices = create_test_price_data();
        let vol = calculate_volatility(&prices, 30);
        assert!(vol >= 0.0);
    }

    #[test]
    fn test_calculate_rsi() {
        let prices = create_test_price_data();
        let rsi = calculate_rsi(&prices, 14);
        assert!(rsi >= 0.0 && rsi <= 100.0);
    }

    #[test]
    fn test_find_momentum_signals() {
        let mut price_data = HashMap::new();
        price_data.insert("ETH".to_string(), create_test_price_data());
        
        let signals = find_momentum_signals(vec!["ETH".to_string()], &price_data);
        
        assert_eq!(signals.len(), 1);
        assert!(signals[0].confidence >= 0.0 && signals[0].confidence <= 1.0);
    }
}
