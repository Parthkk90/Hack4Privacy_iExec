use privatealpha_tee::{find_momentum_signals, PriceData};
use std::collections::HashMap;
use std::env;
use std::fs;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("📈 PrivateAlpha Strategy Executor - TEE Worker");
    println!("Running in secure enclave...\n");

    // Parse arguments
    let args: Vec<String> = env::args().collect();
    
    if args.len() < 2 {
        eprintln!("Usage: strategy-executor <assets>");
        eprintln!("Example: strategy-executor ETH,BTC,SOL");
        return Ok(());
    }
    
    // Parse assets
    let assets: Vec<String> = args[1]
        .split(',')
        .map(|s| s.trim().to_string())
        .collect();
    
    println!("🎯 Analyzing momentum for: {:?}", assets);
    
    // Load price data (in production, fetch from oracle or encrypted input)
    let price_data = load_price_data(&assets)?;
    
    // Find signals
    println!("🔍 Finding trading opportunities...");
    let signals = find_momentum_signals(assets, &price_data);
    
    // Output results
    let output = serde_json::to_string_pretty(&signals)?;
    println!("\n✅ Signals Generated:");
    println!("{}", output);
    
    // Write to output file for iExec
    fs::write("/iexec_out/signals.json", &output)?;
    fs::write("/iexec_out/computed.json", "{\"deterministic-output-path\": \"/iexec_out/signals.json\"}")?;
    
    Ok(())
}

fn load_price_data(assets: &[String]) -> Result<HashMap<String, Vec<PriceData>>, Box<dyn std::error::Error>> {
    // In production: fetch from price oracle or encrypted dataset
    // For testing: generate mock data
    
    let mut price_data = HashMap::new();
    
    for asset in assets {
        println!("📊 Loading price data for {}...", asset);
        
        // Generate 200 days of mock price data
        let prices: Vec<PriceData> = (0..200)
            .map(|i| {
                let base_price = match asset.as_str() {
                    "ETH" => 2000.0,
                    "BTC" => 40000.0,
                    "SOL" => 100.0,
                    _ => 100.0,
                };
                
                // Add some trend and noise
                let trend = (i as f64) * 0.5;
                let noise = (i as f64 * 0.1).sin() * 50.0;
                
                PriceData {
                    timestamp: 1234567890 + (i as i64 * 86400),
                    open: base_price + trend + noise,
                    high: base_price + trend + noise + 20.0,
                    low: base_price + trend + noise - 20.0,
                    close: base_price + trend + noise + 10.0,
                    volume: 1000000.0 + (i as f64 * 1000.0),
                }
            })
            .collect();
        
        price_data.insert(asset.clone(), prices);
    }
    
    Ok(price_data)
}
