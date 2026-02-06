const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying PrivateAlpha contracts to Arbitrum Sepolia...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy CreditScoreRegistry
  console.log("📋 Deploying CreditScoreRegistry...");
  const CreditScoreRegistry = await hre.ethers.getContractFactory("CreditScoreRegistry");
  const creditScoreRegistry = await CreditScoreRegistry.deploy();
  await creditScoreRegistry.waitForDeployment();
  const creditScoreRegistryAddress = await creditScoreRegistry.getAddress();
  console.log("✅ CreditScoreRegistry deployed to:", creditScoreRegistryAddress);

  // Deploy StrategyExecutor
  console.log("\n⚡ Deploying StrategyExecutor...");
  const StrategyExecutor = await hre.ethers.getContractFactory("StrategyExecutor");
  const strategyExecutor = await StrategyExecutor.deploy(creditScoreRegistryAddress);
  await strategyExecutor.waitForDeployment();
  const strategyExecutorAddress = await strategyExecutor.getAddress();
  console.log("✅ StrategyExecutor deployed to:", strategyExecutorAddress);

  // Deploy FlashbotsRelayer
  console.log("\n🔒 Deploying FlashbotsRelayer...");
  const FlashbotsRelayer = await hre.ethers.getContractFactory("FlashbotsRelayer");
  const flashbotsRelayer = await FlashbotsRelayer.deploy();
  await flashbotsRelayer.waitForDeployment();
  const flashbotsRelayerAddress = await flashbotsRelayer.getAddress();
  console.log("✅ FlashbotsRelayer deployed to:", flashbotsRelayerAddress);

  // Wait for block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await creditScoreRegistry.deploymentTransaction().wait(5);
  await strategyExecutor.deploymentTransaction().wait(5);
  await flashbotsRelayer.deploymentTransaction().wait(5);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📦 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network: Arbitrum Sepolia (421614)");
  console.log("Deployer:", deployer.address);
  console.log("\nContract Addresses:");
  console.log("├─ CreditScoreRegistry:", creditScoreRegistryAddress);
  console.log("├─ StrategyExecutor:", strategyExecutorAddress);
  console.log("└─ FlashbotsRelayer:", flashbotsRelayerAddress);
  console.log("\n💡 Next Steps:");
  console.log("1. Verify contracts on Arbiscan:");
  console.log(`   npx hardhat verify --network arbitrumSepolia ${creditScoreRegistryAddress}`);
  console.log(`   npx hardhat verify --network arbitrumSepolia ${strategyExecutorAddress} ${creditScoreRegistryAddress}`);
  console.log(`   npx hardhat verify --network arbitrumSepolia ${flashbotsRelayerAddress}`);
  console.log("\n2. Update .env file with contract addresses");
  console.log("3. Authorize TEE worker addresses");
  console.log("=".repeat(60));

  // Save addresses to file
  const fs = require("fs");
  const addresses = {
    network: "arbitrumSepolia",
    chainId: 421614,
    deployer: deployer.address,
    contracts: {
      CreditScoreRegistry: creditScoreRegistryAddress,
      StrategyExecutor: strategyExecutorAddress,
      FlashbotsRelayer: flashbotsRelayerAddress
    },
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    "deployment-addresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\n✅ Addresses saved to deployment-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
