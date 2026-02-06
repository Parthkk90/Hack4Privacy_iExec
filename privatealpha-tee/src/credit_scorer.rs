use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Deserialize, Clone)]
pub struct Trade {
    pub timestamp: i64,
    pub token: String,
    pub amount: f64,
    pub price: f64,
    pub is_buy: bool,
    pub pnl_percent: f64,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Loan {
    pub timestamp: i64,
    pub protocol: String,
    pub amount: f64,
    pub repaid: bool,
    pub liquidated: bool,
}

#[derive(Debug, Deserialize)]
pub struct WalletData {
    pub address: String,
    pub trades: Vec<Trade>,
    pub loans: Vec<Loan>,
    pub liquidations: u32,
    pub total_volume: f64,
}

#[derive(Debug, Serialize)]
pub struct CreditScore {
    pub score: u16,        // 300-850
    pub tier: u8,          // 1-4
    pub max_leverage: f64, // 1.0-3.0
    pub attestation: String,
    pub factors: ScoreFactors,
}

#[derive(Debug, Serialize)]
pub struct ScoreFactors {
    pub payment_history: f64,
    pub utilization: f64,
    pub trading_skill: f64,
    pub diversification: f64,
}

pub fn compute_credit_score(encrypted_data: &[u8]) -> Result<CreditScore, Box<dyn std::error::Error>> {
    // 1. Decrypt data inside TEE
    let wallet_data: WalletData = decrypt_and_parse(encrypted_data)?;
    
    // 2. Calculate factors
    let payment_score = calculate_payment_history(&wallet_data);
    let utilization_score = calculate_utilization(&wallet_data);
    let sophistication_score = calculate_trading_skill(&wallet_data);
    let diversification_score = calculate_portfolio_diversity(&wallet_data);
    
    // 3. Weighted sum
    let raw_score = 
        payment_score * 0.40 +
        utilization_score * 0.30 +
        sophistication_score * 0.20 +
        diversification_score * 0.10;
    
    // 4. Normalize to FICO-like scale (300-850)
    let final_score = (raw_score * 5.5 + 300.0).clamp(300.0, 850.0) as u16;
    
    // 5. Determine tier
    let tier = match final_score {
        750..=850 => 4, // Platinum
        650..=749 => 3, // Gold
        550..=649 => 2, // Silver
        _ => 1,         // Bronze
    };
    
    // 6. Calculate max leverage
    let max_leverage = (tier as f64) * 0.75;
    
    // 7. Generate attestation
    let attestation = generate_attestation(&wallet_data.address, final_score)?;
    
    Ok(CreditScore {
        score: final_score,
        tier,
        max_leverage,
        attestation,
        factors: ScoreFactors {
            payment_history: payment_score,
            utilization: utilization_score,
            trading_skill: sophistication_score,
            diversification: diversification_score,
        },
    })
}

fn decrypt_and_parse(encrypted_data: &[u8]) -> Result<WalletData, Box<dyn std::error::Error>> {
    // In production TEE:
    // 1. Use TEE-sealed keys
    // 2. Decrypt with AES-GCM
    // 3. Verify data integrity
    
    // For development/testing: assume data is JSON
    let json_str = String::from_utf8_lossy(encrypted_data);
    let wallet_data: WalletData = serde_json::from_str(&json_str)?;
    Ok(wallet_data)
}

fn calculate_payment_history(data: &WalletData) -> f64 {
    if data.loans.is_empty() {
        return 50.0; // Neutral for no history
    }
    
    let total_loans = data.loans.len() as f64;
    let liquidations = data.liquidations as f64;
    let repaid = data.loans.iter().filter(|l| l.repaid).count() as f64;
    
    // Calculate on-time payment rate
    let on_time_rate = repaid / total_loans;
    let liquidation_penalty = liquidations / total_loans;
    
    // Score: 0-100
    let score = ((on_time_rate - liquidation_penalty) * 100.0).clamp(0.0, 100.0);
    
    score
}

fn calculate_utilization(data: &WalletData) -> f64 {
    if data.loans.is_empty() {
        return 70.0; // Good utilization for no loans
    }
    
    // Calculate average utilization across loans
    let total_borrowed: f64 = data.loans.iter().map(|l| l.amount).sum();
    let total_available = total_borrowed * 1.5; // Assume credit limit is 1.5x borrowed
    
    let utilization_rate = total_borrowed / total_available;
    
    // Optimal utilization is 30% - penalize both extremes
    let optimal = 0.30;
    let distance = (utilization_rate - optimal).abs();
    let score = (100.0 - (distance * 200.0)).clamp(0.0, 100.0);
    
    score
}

fn calculate_trading_skill(data: &WalletData) -> f64 {
    if data.trades.is_empty() {
        return 50.0; // Neutral for no trades
    }
    
    // Calculate Sharpe ratio from trade history
    let returns: Vec<f64> = data.trades
        .iter()
        .map(|t| t.pnl_percent)
        .collect();
    
    let mean_return = returns.iter().sum::<f64>() / returns.len() as f64;
    
    let variance = returns.iter()
        .map(|r| (r - mean_return).powi(2))
        .sum::<f64>() / returns.len() as f64;
    
    let std_dev = variance.sqrt();
    
    let sharpe = if std_dev > 0.0 {
        mean_return / std_dev
    } else {
        0.0
    };
    
    // Calculate win rate
    let winning_trades = data.trades.iter().filter(|t| t.pnl_percent > 0.0).count() as f64;
    let win_rate = winning_trades / data.trades.len() as f64;
    
    // Combine Sharpe ratio and win rate
    // Normalize Sharpe (typically -3 to 3) to 0-100
    let sharpe_score = ((sharpe + 3.0) / 6.0 * 100.0).clamp(0.0, 100.0);
    let win_rate_score = win_rate * 100.0;
    
    // Weighted average
    let score = sharpe_score * 0.6 + win_rate_score * 0.4;
    
    score
}

fn calculate_portfolio_diversity(data: &WalletData) -> f64 {
    if data.trades.is_empty() {
        return 40.0; // Below average for no trades
    }
    
    // Count unique tokens traded
    let mut tokens: Vec<String> = data.trades
        .iter()
        .map(|t| t.token.clone())
        .collect();
    tokens.sort();
    tokens.dedup();
    
    let unique_tokens = tokens.len() as f64;
    
    // More tokens = better diversification (up to a point)
    let diversity_score = (unique_tokens * 15.0).clamp(0.0, 100.0);
    
    // Calculate volume distribution (Gini coefficient would be ideal)
    let total_volume = data.total_volume;
    let mut token_volumes: HashMap<String, f64> = HashMap::new();
    
    for trade in &data.trades {
        let volume = token_volumes.entry(trade.token.clone()).or_insert(0.0);
        *volume += trade.amount * trade.price;
    }
    
    // Calculate concentration
    let max_concentration = token_volumes
        .values()
        .map(|v| v / total_volume)
        .max_by(|a, b| a.partial_cmp(b).unwrap())
        .unwrap_or(1.0);
    
    let concentration_score = (1.0 - max_concentration) * 100.0;
    
    // Combine scores
    let score = diversity_score * 0.6 + concentration_score * 0.4;
    
    score
}

fn generate_attestation(address: &str, score: u16) -> Result<String, Box<dyn std::error::Error>> {
    use sha2::{Sha256, Digest};
    
    // In production TEE:
    // 1. Generate SCONE/SGX remote attestation
    // 2. Include enclave measurement (MRENCLAVE)
    // 3. Sign with TEE private key
    // 4. Include timestamp and nonce
    
    // For development: generate simple hash-based attestation
    let timestamp = chrono::Utc::now().timestamp();
    let data = format!("{}:{}:{}", address, score, timestamp);
    
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    let result = hasher.finalize();
    
    let attestation = hex::encode(result);
    
    Ok(attestation)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_wallet_data() -> WalletData {
        WalletData {
            address: "0x1234567890123456789012345678901234567890".to_string(),
            trades: vec![
                Trade {
                    timestamp: 1234567890,
                    token: "ETH".to_string(),
                    amount: 1.0,
                    price: 2000.0,
                    is_buy: true,
                    pnl_percent: 5.0,
                },
                Trade {
                    timestamp: 1234567891,
                    token: "BTC".to_string(),
                    amount: 0.1,
                    price: 40000.0,
                    is_buy: true,
                    pnl_percent: -2.0,
                },
            ],
            loans: vec![
                Loan {
                    timestamp: 1234567890,
                    protocol: "Aave".to_string(),
                    amount: 1000.0,
                    repaid: true,
                    liquidated: false,
                },
            ],
            liquidations: 0,
            total_volume: 6000.0,
        }
    }

    #[test]
    fn test_calculate_payment_history() {
        let data = create_test_wallet_data();
        let score = calculate_payment_history(&data);
        assert!(score > 50.0);
        assert!(score <= 100.0);
    }

    #[test]
    fn test_calculate_trading_skill() {
        let data = create_test_wallet_data();
        let score = calculate_trading_skill(&data);
        assert!(score >= 0.0);
        assert!(score <= 100.0);
    }

    #[test]
    fn test_tier_assignment() {
        // Test tier boundaries
        assert_eq!(match 800 {
            750..=850 => 4,
            650..=749 => 3,
            550..=649 => 2,
            _ => 1,
        }, 4);
        
        assert_eq!(match 700 {
            750..=850 => 4,
            650..=749 => 3,
            550..=649 => 2,
            _ => 1,
        }, 3);
    }
}
