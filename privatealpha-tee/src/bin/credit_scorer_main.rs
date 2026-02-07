use PUREIS _tee::compute_credit_score;
use std::env;
use std::fs;
use std::io::{self, Read};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🔒 PUREIS  Credit Scorer - TEE Worker");
    println!("Running in secure enclave...\n");

    // Read input from args or stdin
    let input_data = read_input()?;
    
    println!("📊 Computing credit score...");
    
    // Compute credit score in TEE
    let result = compute_credit_score(&input_data)?;
    
    // Output result as JSON
    let output = serde_json::to_string_pretty(&result)?;
    println!("\n✅ Credit Score Computed Successfully:");
    println!("{}", output);
    
    // In production, this would:
    // 1. Encrypt the result
    // 2. Submit to blockchain via oracle
    // 3. Return task result to iExec
    
    // Write to output file for iExec
    fs::write("/iexec_out/result.json", output)?;
    fs::write("/iexec_out/computed.json", "{\"deterministic-output-path\": \"/iexec_out/result.json\"}")?;
    
    Ok(())
}

fn read_input() -> Result<Vec<u8>, Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    
    if args.len() > 1 {
        // Read from file
        let filename = &args[1];
        println!("📥 Reading from file: {}", filename);
        let data = fs::read(filename)?;
        Ok(data)
    } else if let Ok(iexec_in) = env::var("IEXEC_IN") {
        // Read from iExec input directory
        let input_file = format!("{}/input.json", iexec_in);
        println!("📥 Reading from iExec input: {}", input_file);
        let data = fs::read(input_file)?;
        Ok(data)
    } else {
        // Read from stdin
        println!("📥 Reading from stdin...");
        let mut buffer = Vec::new();
        io::stdin().read_to_end(&mut buffer)?;
        Ok(buffer)
    }
}
