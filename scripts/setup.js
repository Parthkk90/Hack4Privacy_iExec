const hre = require("hardhat");

async function main() {
  const addresses = require("../deployment-addresses.json");

  console.log("🔧 Setting up PrivateAlpha contracts...\n");

  // Get contracts
  const creditScoreRegistry = await hre.ethers.getContractAt(
    "CreditScoreRegistry",
    addresses.contracts.CreditScoreRegistry
  );

  const strategyExecutor = await hre.ethers.getContractAt(
    "StrategyExecutor",
    addresses.contracts.StrategyExecutor
  );

  const flashbotsRelayer = await hre.ethers.getContractAt(
    "FlashbotsRelayer",
    addresses.contracts.FlashbotsRelayer
  );

  // TODO: Replace with actual TEE worker address from iExec
  const TEE_WORKER_ADDRESS = process.env.TEE_WORKER_ADDRESS || "0x0000000000000000000000000000000000000000";

  console.log("📝 Authorizing TEE worker:", TEE_WORKER_ADDRESS);

  // Authorize TEE worker in CreditScoreRegistry
  console.log("├─ Authorizing in CreditScoreRegistry...");
  const tx1 = await creditScoreRegistry.setTEEAuthorization(TEE_WORKER_ADDRESS, true);
  await tx1.wait();
  console.log("   ✅ Done");

  // Authorize TEE worker in StrategyExecutor
  console.log("├─ Authorizing in StrategyExecutor...");
  const tx2 = await strategyExecutor.setTEEAuthorization(TEE_WORKER_ADDRESS, true);
  await tx2.wait();
  console.log("   ✅ Done");

  // Authorize relayer in FlashbotsRelayer
  console.log("└─ Authorizing in FlashbotsRelayer...");
  const tx3 = await flashbotsRelayer.setRelayerAuthorization(TEE_WORKER_ADDRESS, true);
  await tx3.wait();
  console.log("   ✅ Done");

  console.log("\n✅ Setup complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
