const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  const deploymentFile = path.join(__dirname, `../deployments/${network}.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error(`❌ Deployment file not found for network: ${network}`);
    console.log(`Please deploy contracts first: npm run deploy:${network}`);
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  console.log("🔍 Verifying contracts on", network);
  console.log("=".repeat(60));

  try {
    // Verify CreditScoreRegistry
    console.log("\n📝 Verifying CreditScoreRegistry...");
    await hre.run("verify:verify", {
      address: deployment.contracts.CreditScoreRegistry,
      constructorArguments: [],
    });
    console.log("✅ CreditScoreRegistry verified");

    // Verify StrategyExecutor
    console.log("\n📝 Verifying StrategyExecutor...");
    await hre.run("verify:verify", {
      address: deployment.contracts.StrategyExecutor,
      constructorArguments: [deployment.contracts.CreditScoreRegistry],
    });
    console.log("✅ StrategyExecutor verified");

    // Verify FlashbotsRelayer
    console.log("\n📝 Verifying FlashbotsRelayer...");
    await hre.run("verify:verify", {
      address: deployment.contracts.FlashbotsRelayer,
      constructorArguments: [],
    });
    console.log("✅ FlashbotsRelayer verified");

    console.log("\n✨ All contracts verified successfully!");
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
