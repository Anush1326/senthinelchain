const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  const SentinelChain = await hre.ethers.getContractFactory("SentinelChain");
  const sentinelChain = await SentinelChain.deploy();
  await sentinelChain.waitForDeployment();
  const sentinelChainAddress = await sentinelChain.getAddress();
  
  console.log(`SentinelChain deployed to: ${sentinelChainAddress}`);

  const SentinelToken = await hre.ethers.getContractFactory("SentinelToken");
  const sentinelToken = await SentinelToken.deploy();
  await sentinelToken.waitForDeployment();
  const sentinelTokenAddress = await sentinelToken.getAddress();

  console.log(`SentinelToken deployed to: ${sentinelTokenAddress}`);

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentInfo = {
    network: hre.network.name,
    SentinelChain: sentinelChainAddress,
    SentinelToken: sentinelTokenAddress,
    timestamp: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`Deployment info saved to deployments/${hre.network.name}.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
