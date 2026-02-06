use privatealpha_tee::{CreditScoreInput, compute_credit_score};
use std::env;
use std::fs;

fn main() {
    println!("🔒 PrivateAlpha Credit Scorer - TEE Worker");
    println!("==========================================");

    // Get input file from args or use default
    let args: Vec<String> = env::args().collect();
    
    if args.len() > 1 && (args[1] == "--help" || args[1] == "-h") {
        print_usage();
        return;
    }

    let input_file = if args.len() > 1 {
        &args[1]
    } else {
        "/iexec_in/input.json"
    };

    let output_file = if args.len() > 2 {
        &args[2]
    } else {
        "/iexec_out/result.json"
    };

    // Read input
    println!("📖 Reading input from: {}", input_file);
    let input_data = match fs::read_to_string(input_file) {
        Ok(data) => data,
        Err(e) => {
            eprintln!("❌ Error reading input file: {}", e);
            std::process::exit(1);
        }
    };

    // Parse input
    println!("🔍 Parsing input data...");
    let input: CreditScoreInput = match serde_json::from_str(&input_data) {
        Ok(data) => data,
        Err(e) => {
            eprintln!("❌ Error parsing input JSON: {}", e);
            std::process::exit(1);
        }
    };

    println!("👤 Computing credit score for: {}", input.user_address);
    println!("   Transaction history: {} records", input.transaction_history.len());
    println!("   Loan history: {} records", input.loan_history.len());
    println!("   Portfolio assets: {}", input.portfolio.assets.len());

    // Compute credit score
    println!("\n⚙️  Computing credit score in TEE...");
    let result = match compute_credit_score(&input) {
        Ok(score) => score,
        Err(e) => {
            eprintln!("❌ Error computing credit score: {}", e);
            std::process::exit(1);
        }
    };

    println!("\n✅ Credit Score Computed:");
    println!("   Score: {}", result.score);
    println!("   Tier: {}", result.tier);
    println!("   Payment History: {:.1}%", result.factors.payment_history);
    println!("   Utilization: {:.1}%", result.factors.utilization);
    println!("   Trading Skill: {:.1}%", result.factors.trading_skill);
    println!("   Diversification: {:.1}%", result.factors.diversification);

    // Write output
    println!("\n💾 Writing result to: {}", output_file);
    let output_json = match serde_json::to_string_pretty(&result) {
        Ok(json) => json,
        Err(e) => {
            eprintln!("❌ Error serializing output: {}", e);
            std::process::exit(1);
        }
    };

    // Create output directory if it doesn't exist
    if let Some(parent) = std::path::Path::new(output_file).parent() {
        let _ = fs::create_dir_all(parent);
    }

    if let Err(e) = fs::write(output_file, output_json) {
        eprintln!("❌ Error writing output file: {}", e);
        std::process::exit(1);
    }

    println!("\n🎉 Credit scoring completed successfully!");
}

fn print_usage() {
    println!("Usage: credit-scorer [input_file] [output_file]");
    println!();
    println!("Arguments:");
    println!("  input_file   Path to input JSON file (default: /iexec_in/input.json)");
    println!("  output_file  Path to output JSON file (default: /iexec_out/result.json)");
    println!();
    println!("Input JSON format:");
    println!(r#"{{
  "user_address": "0x...",
  "transaction_history": [...],
  "loan_history": [...],
  "portfolio": {{
    "total_value": 10000.0,
    "assets": [...],
    "pnl_history": [...]
  }}
}}"#);
}
