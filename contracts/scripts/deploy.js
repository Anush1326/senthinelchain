const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`Starting deployment of SentinelChain to network: ${hre.network.name}...`);

  const [deployer] = await hre.ethers.getSigners();
  if (deployer) {
    console.log(`Deployer address: ${deployer.address}`);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`Deployer balance: ${hre.ethers.formatEther(balance)} POL/MATIC`);
  }

  // Deploy SentinelChain
  const SentinelChain = await hre.ethers.getContractFactory("SentinelChain");
  const sentinelChain = await SentinelChain.deploy();
  await sentinelChain.waitForDeployment();

  const contractAddress = await sentinelChain.getAddress();
  console.log(`✅ SentinelChain successfully deployed to: ${contractAddress}`);

  // Deploy SentinelToken (optional utility token)
  const SentinelToken = await hre.ethers.getContractFactory("SentinelToken");
  const sentinelToken = await SentinelToken.deploy();
  await sentinelToken.waitForDeployment();

  const tokenAddress = await sentinelToken.getAddress();
  console.log(`✅ SentinelToken successfully deployed to: ${tokenAddress}`);

  // Save deployment metadata
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    SentinelChain: contractAddress,
    SentinelToken: tokenAddress,
    deployer: deployer ? deployer.address : "N/A",
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`📄 Deployment receipt saved to deployments/${hre.network.name}.json`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
