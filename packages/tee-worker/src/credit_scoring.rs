use crate::types::*;
use sha2::{Sha256, Digest};

pub fn compute_credit_score(input: &CreditScoreInput) -> Result<CreditScoreOutput, String> {
    // Calculate individual factors
    let payment_score = calculate_payment_history(&input.loan_history);
    let utilization_score = calculate_utilization(&input.transaction_history);
    let skill_score = calculate_trading_skill(&input.portfolio);
    let diversity_score = calculate_diversification(&input.portfolio);

    // Weight the factors (40%, 30%, 20%, 10%)
    let weighted_score = 
        (payment_score * 0.4) +
        (utilization_score * 0.3) +
        (skill_score * 0.2) +
        (diversity_score * 0.1);

    // Convert to credit score range (300-850)
    let credit_score = 300 + ((weighted_score / 100.0) * 550.0) as u32;
    let credit_score = credit_score.min(850).max(300);

    // Determine tier
    let tier = calculate_tier(credit_score);

    // Create factors output
    let factors = ScoreFactors {
        payment_history: payment_score,
        utilization: utilization_score,
        trading_skill: skill_score,
        diversification: diversity_score,
    };

    // Generate encrypted score (simplified for testnet)
    let encrypted_score = generate_encrypted_score(credit_score, &input.user_address);

    // Generate attestation
    let attestation = generate_attestation(&input.user_address, credit_score);

    Ok(CreditScoreOutput {
        user_address: input.user_address.clone(),
        score: credit_score,
        tier,
        factors,
        encrypted_score,
        attestation,
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    })
}

fn calculate_payment_history(loans: &[Loan]) -> f64 {
    if loans.is_empty() {
        return 50.0; // Neutral score for no history
    }

    let on_time_payments = loans.iter().filter(|l| l.paid_on_time).count();
    let total_loans = loans.len();
    let on_time_ratio = on_time_payments as f64 / total_loans as f64;

    let avg_repayment_ratio: f64 = loans.iter()
        .map(|l| l.repayment_ratio)
        .sum::<f64>() / total_loans as f64;

    // Score: 70% based on on-time payments, 30% on repayment amount
    ((on_time_ratio * 0.7 + avg_repayment_ratio * 0.3) * 100.0)
        .min(100.0)
        .max(0.0)
}

fn calculate_utilization(transactions: &[Transaction]) -> f64 {
    if transactions.is_empty() {
        return 50.0;
    }

    let successful_txs = transactions.iter().filter(|t| t.success).count();
    let total_txs = transactions.len();
    let success_rate = successful_txs as f64 / total_txs as f64;

    let total_volume: f64 = transactions.iter()
        .map(|t| t.amount.abs())
        .sum();

    let avg_tx_size = total_volume / total_txs as f64;

    // Higher success rate and reasonable tx sizes = better score
    let volume_score = if avg_tx_size > 1000.0 { 80.0 } else { avg_tx_size / 1000.0 * 80.0 };
    
    ((success_rate * 0.6 + (volume_score / 100.0) * 0.4) * 100.0)
        .min(100.0)
        .max(0.0)
}

fn calculate_trading_skill(portfolio: &Portfolio) -> f64 {
    if portfolio.pnl_history.is_empty() {
        return 50.0;
    }

    // Calculate Sharpe-like ratio
    let returns = &portfolio.pnl_history;
    let avg_return: f64 = returns.iter().sum::<f64>() / returns.len() as f64;
    
    let variance: f64 = returns.iter()
        .map(|r| (r - avg_return).powi(2))
        .sum::<f64>() / returns.len() as f64;
    
    let std_dev = variance.sqrt();

    let sharpe = if std_dev > 0.0 {
        avg_return / std_dev
    } else {
        0.0
    };

    // Convert Sharpe to 0-100 score (Sharpe > 2 = excellent)
    let score = ((sharpe / 2.0) * 100.0).min(100.0).max(0.0);
    
    // Adjust for positive/negative returns
    if avg_return > 0.0 {
        score
    } else {
        score * 0.5 // Penalty for negative returns
    }
}

fn calculate_diversification(portfolio: &Portfolio) -> f64 {
    if portfolio.assets.is_empty() {
        return 0.0;
    }

    let num_assets = portfolio.assets.len();
    
    // Calculate Herfindahl index (concentration)
    let herfindahl: f64 = portfolio.assets.iter()
        .map(|a| a.percentage.powi(2))
        .sum();

    // Lower Herfindahl = better diversification
    let diversification_index = 1.0 - herfindahl;

    // Combine number of assets and distribution
    let asset_score = (num_assets as f64 / 10.0).min(1.0) * 50.0;
    let distribution_score = diversification_index * 50.0;

    (asset_score + distribution_score).min(100.0).max(0.0)
}

fn calculate_tier(score: u32) -> u8 {
    match score {
        750..=850 => 4, // Platinum
        650..=749 => 3, // Gold
        550..=649 => 2, // Silver
        _ => 1,         // Bronze
    }
}

fn generate_encrypted_score(score: u32, user_address: &str) -> String {
    // Simplified encryption for testnet
    // In production: use AES-GCM with TEE-derived keys
    let mut hasher = Sha256::new();
    hasher.update(score.to_string());
    hasher.update(user_address);
    format!("0x{}", hex::encode(hasher.finalize()))
}

fn generate_attestation(user_address: &str, score: u32) -> String {
    // Simplified attestation for testnet
    // In production: generate SGX/SCONE remote attestation
    let mut hasher = Sha256::new();
    hasher.update(b"attestation");
    hasher.update(user_address);
    hasher.update(score.to_string());
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

    #[test]
    fn test_credit_score_calculation() {
        let input = CreditScoreInput {
            user_address: "0x1234567890123456789012345678901234567890".to_string(),
            transaction_history: vec![
                Transaction {
                    timestamp: 1234567890,
                    amount: 100.0,
                    tx_type: "trade".to_string(),
                    success: true,
                },
            ],
            loan_history: vec![
                Loan {
                    amount: 1000.0,
                    due_date: 1234567890,
                    paid_on_time: true,
                    repayment_ratio: 1.0,
                },
            ],
            portfolio: Portfolio {
                total_value: 10000.0,
                assets: vec![
                    Asset {
                        symbol: "ETH".to_string(),
                        value: 5000.0,
                        percentage: 0.5,
                    },
                    Asset {
                        symbol: "BTC".to_string(),
                        value: 5000.0,
                        percentage: 0.5,
                    },
                ],
                pnl_history: vec![0.1, 0.15, 0.12, 0.18, 0.2],
            },
        };

        let result = compute_credit_score(&input).unwrap();
        
        assert!(result.score >= 300 && result.score <= 850);
        assert!(result.tier >= 1 && result.tier <= 4);
        assert!(!result.encrypted_score.is_empty());
        assert!(!result.attestation.is_empty());
    }

    #[test]
    fn test_tier_calculation() {
        assert_eq!(calculate_tier(800), 4);
        assert_eq!(calculate_tier(700), 3);
        assert_eq!(calculate_tier(600), 2);
        assert_eq!(calculate_tier(500), 1);
    }
}
