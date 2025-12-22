const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Meta-Pilot AI Smart Contracts...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  
  // Get account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  // Deploy PermissionManager
  console.log("\n📋 Deploying PermissionManager...");
  const PermissionManager = await ethers.getContractFactory("PermissionManager");
  const permissionManager = await PermissionManager.deploy();
  await permissionManager.waitForDeployment();
  
  const permissionManagerAddress = await permissionManager.getAddress();
  console.log("✅ PermissionManager deployed to:", permissionManagerAddress);
  
  // Deploy AutomationExecutor
  console.log("\n🤖 Deploying AutomationExecutor...");
  const AutomationExecutor = await ethers.getContractFactory("AutomationExecutor");
  const automationExecutor = await AutomationExecutor.deploy(permissionManagerAddress);
  await automationExecutor.waitForDeployment();
  
  const automationExecutorAddress = await automationExecutor.getAddress();
  console.log("✅ AutomationExecutor deployed to:", automationExecutorAddress);
  
  // Authorize AutomationExecutor as an agent
  console.log("\n🔐 Authorizing AutomationExecutor as agent...");
  const authTx = await permissionManager.authorizeAgent(automationExecutorAddress);
  await authTx.wait();
  console.log("✅ AutomationExecutor authorized as agent");
  
  // Save deployment addresses
  const deploymentInfo = {
    network: await ethers.provider.getNetwork(),
    deployer: deployer.address,
    contracts: {
      PermissionManager: permissionManagerAddress,
      AutomationExecutor: automationExecutorAddress
    },
    deployedAt: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };
  
  console.log("\n📄 Deployment Summary:");
  console.log("=".repeat(50));
  console.log("Network:", deploymentInfo.network.name, `(Chain ID: ${deploymentInfo.network.chainId})`);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("PermissionManager:", deploymentInfo.contracts.PermissionManager);
  console.log("AutomationExecutor:", deploymentInfo.contracts.AutomationExecutor);
  console.log("Block Number:", deploymentInfo.blockNumber);
  console.log("=".repeat(50));
  
  // Write deployment info to file
  const fs = require('fs');
  const path = require('path');
  
  const deploymentPath = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }
  
  const networkName = deploymentInfo.network.name || 'unknown';
  const filename = `${networkName}-${Date.now()}.json`;
  const filepath = path.join(deploymentPath, filename);
  
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${filepath}`);
  
  // Verification instructions
  if (deploymentInfo.network.chainId === 11155111) { // Sepolia
    console.log("\n🔍 To verify contracts on Etherscan:");
    console.log(`npx hardhat verify --network sepolia ${permissionManagerAddress}`);
    console.log(`npx hardhat verify --network sepolia ${automationExecutorAddress} "${permissionManagerAddress}"`);
  }
  
  console.log("\n🎉 Deployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });