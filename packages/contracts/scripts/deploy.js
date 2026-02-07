const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying PUREIS  contracts to", hre.network.name);
  console.log("=".repeat(60));

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  console.log();

  // Deploy CreditScoreRegistry
  console.log("📝 Deploying CreditScoreRegistry...");
  const CreditScoreRegistry = await hre.ethers.getContractFactory("CreditScoreRegistry");
  const creditScoreRegistry = await CreditScoreRegistry.deploy();
  await creditScoreRegistry.waitForDeployment();
  const creditScoreRegistryAddress = await creditScoreRegistry.getAddress();
  console.log("✅ CreditScoreRegistry deployed to:", creditScoreRegistryAddress);
  console.log();

  // Deploy StrategyExecutor
  console.log("📝 Deploying StrategyExecutor...");
  const StrategyExecutor = await hre.ethers.getContractFactory("StrategyExecutor");
  const strategyExecutor = await StrategyExecutor.deploy(creditScoreRegistryAddress);
  await strategyExecutor.waitForDeployment();
  const strategyExecutorAddress = await strategyExecutor.getAddress();
  console.log("✅ StrategyExecutor deployed to:", strategyExecutorAddress);
  console.log();

  // Deploy FlashbotsRelayer
  console.log("📝 Deploying FlashbotsRelayer...");
  const FlashbotsRelayer = await hre.ethers.getContractFactory("FlashbotsRelayer");
  const flashbotsRelayer = await FlashbotsRelayer.deploy();
  await flashbotsRelayer.waitForDeployment();
  const flashbotsRelayerAddress = await flashbotsRelayer.getAddress();
  console.log("✅ FlashbotsRelayer deployed to:", flashbotsRelayerAddress);
  console.log();

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      CreditScoreRegistry: creditScoreRegistryAddress,
      StrategyExecutor: strategyExecutorAddress,
      FlashbotsRelayer: flashbotsRelayerAddress,
    },
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${hre.network.name}.json`
  );
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("💾 Deployment info saved to:", deploymentFile);
  console.log();

  // Print summary
  console.log("=".repeat(60));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log();
  console.log("CreditScoreRegistry:", creditScoreRegistryAddress);
  console.log("StrategyExecutor:", strategyExecutorAddress);
  console.log("FlashbotsRelayer:", flashbotsRelayerAddress);
  console.log();

  if (hre.network.name === "arbitrumSepolia") {
    console.log("=".repeat(60));
    console.log("🔍 VERIFICATION COMMANDS");
    console.log("=".repeat(60));
    console.log(
      `npx hardhat verify --network arbitrumSepolia ${creditScoreRegistryAddress}`
    );
    console.log(
      `npx hardhat verify --network arbitrumSepolia ${strategyExecutorAddress} ${creditScoreRegistryAddress}`
    );
    console.log(
      `npx hardhat verify --network arbitrumSepolia ${flashbotsRelayerAddress}`
    );
    console.log();
  }

  console.log("✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
