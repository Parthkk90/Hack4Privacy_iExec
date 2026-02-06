use privatealpha_tee::{TradingSignalInput, generate_trading_signal};
use std::env;
use std::fs;

fn main() {
    println!("📊 PrivateAlpha Strategy Executor - TEE Worker");
    println!("=============================================");

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
    let input: TradingSignalInput = match serde_json::from_str(&input_data) {
        Ok(data) => data,
        Err(e) => {
            eprintln!("❌ Error parsing input JSON: {}", e);
            std::process::exit(1);
        }
    };

    println!("📈 Generating trading signal for: {}", input.symbol);
    println!("   Timeframe: {}", input.timeframe);
    println!("   Price data points: {}", input.price_history.len());
    println!("   Volume data points: {}", input.volume_history.len());

    // Generate trading signal
    println!("\n⚙️  Analyzing market data in TEE...");
    let result = match generate_trading_signal(&input) {
        Ok(signal) => signal,
        Err(e) => {
            eprintln!("❌ Error generating trading signal: {}", e);
            std::process::exit(1);
        }
    };

    println!("\n✅ Trading Signal Generated:");
    println!("   Signal: {}", result.signal);
    println!("   Confidence: {:.1}%", result.confidence * 100.0);
    println!("   Target Price: ${:.2}", result.target_price);
    println!("   Stop Loss: ${:.2}", result.stop_loss);
    println!("   Position Size: {:.1}%", result.position_size * 100.0);
    println!("\n   Reasoning:");
    for reason in &result.reasoning {
        println!("     • {}", reason);
    }

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

    println!("\n🎉 Strategy execution completed successfully!");
}

fn print_usage() {
    println!("Usage: strategy-executor [input_file] [output_file]");
    println!();
    println!("Arguments:");
    println!("  input_file   Path to input JSON file (default: /iexec_in/input.json)");
    println!("  output_file  Path to output JSON file (default: /iexec_out/result.json)");
    println!();
    println!("Input JSON format:");
    println!(r#"{{
  "symbol": "ETH",
  "timeframe": "1d",
  "price_history": [...],
  "volume_history": [...]
}}"#);
}
