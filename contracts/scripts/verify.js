const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const deploymentPath = path.join(__dirname, `../deployments/${hre.network.name}.json`);
  
  if (!fs.existsSync(deploymentPath)) {
    console.error(`No deployment found for network: ${hre.network.name}`);
    return;
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  
  console.log("Verifying SentinelChain...");
  try {
    await hre.run("verify:verify", {
      address: deployment.SentinelChain,
      constructorArguments: [],
    });
    console.log("SentinelChain verified successfully");
  } catch (e) {
    console.log("SentinelChain verification failed:", e.message);
  }

  console.log("Verifying SentinelToken...");
  try {
    await hre.run("verify:verify", {
      address: deployment.SentinelToken,
      constructorArguments: [],
    });
    console.log("SentinelToken verified successfully");
  } catch (e) {
    console.log("SentinelToken verification failed:", e.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
