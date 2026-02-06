use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreditScoreInput {
    pub user_address: String,
    pub transaction_history: Vec<Transaction>,
    pub loan_history: Vec<Loan>,
    pub portfolio: Portfolio,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub timestamp: u64,
    pub amount: f64,
    pub tx_type: String,
    pub success: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Loan {
    pub amount: f64,
    pub due_date: u64,
    pub paid_on_time: bool,
    pub repayment_ratio: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Portfolio {
    pub total_value: f64,
    pub assets: Vec<Asset>,
    pub pnl_history: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Asset {
    pub symbol: String,
    pub value: f64,
    pub percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreditScoreOutput {
    pub user_address: String,
    pub score: u32,
    pub tier: u8,
    pub factors: ScoreFactors,
    pub encrypted_score: String,
    pub attestation: String,
    pub timestamp: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoreFactors {
    pub payment_history: f64,
    pub utilization: f64,
    pub trading_skill: f64,
    pub diversification: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingSignalInput {
    pub symbol: String,
    pub timeframe: String,
    pub price_history: Vec<PriceData>,
    pub volume_history: Vec<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PriceData {
    pub timestamp: u64,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TradingSignalOutput {
    pub symbol: String,
    pub signal: String, // "BUY", "SELL", "HOLD"
    pub confidence: f64,
    pub target_price: f64,
    pub stop_loss: f64,
    pub position_size: f64,
    pub reasoning: Vec<String>,
    pub attestation: String,
    pub timestamp: u64,
}
