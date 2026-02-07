const hre = require("hardhat");

async function main() {
  const address = "0xBf8E022195f387dB0C28C741d1A7b1BeD1144B3C";
  
  console.log("Checking balance for:", address);
  
  const balance = await hre.ethers.provider.getBalance(address);
  const balanceInEth = hre.ethers.formatEther(balance);
  
  console.log("Balance:", balanceInEth, "ETH");
  
  if (parseFloat(balanceInEth) < 0.01) {
    console.log("\n❌ Insufficient balance. Need at least 0.01 ETH for deployment.");
    process.exit(1);
  }
  
  console.log("✅ Wallet is funded and ready for deployment!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
