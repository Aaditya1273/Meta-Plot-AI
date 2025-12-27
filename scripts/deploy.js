// Deployment script for Meta-Pilot AI contracts
const { ethers } = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`🚀 Deploying MetaArmy 3.0 contracts to ${network}...`);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // 1. Deploy MetaArmyToken ($ARMY)
  console.log("\n💰 Deploying MetaArmyToken ($ARMY)...");
  const MetaArmyToken = await ethers.getContractFactory("MetaArmyToken");
  const armyToken = await MetaArmyToken.deploy();
  await armyToken.waitForDeployment();
  const armyTokenAddress = await armyToken.getAddress();
  console.log("✅ MetaArmyToken deployed to:", armyTokenAddress);
  console.log("   Tx Hash:", armyToken.deploymentTransaction().hash);

  // 2. Deploy MetaArmy Registry
  console.log("\n🛡️ Deploying MetaArmyRegistry...");
  const MetaArmyRegistry = await ethers.getContractFactory("MetaArmyRegistry");
  const registry = await MetaArmyRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ MetaArmyRegistry deployed to:", registryAddress);
  console.log("   Tx Hash:", registry.deploymentTransaction().hash);

  // 3. Deploy MetaArmy
  console.log("\n📄 Deploying MetaArmy...");
  const zkProverPlaceholder = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Mock prover
  const MetaArmy = await ethers.getContractFactory("MetaArmy");
  const metaArmy = await MetaArmy.deploy(armyTokenAddress, zkProverPlaceholder);
  await metaArmy.waitForDeployment();
  const metaArmyAddress = await metaArmy.getAddress();
  console.log("✅ MetaArmy deployed to:", metaArmyAddress);
  console.log("   Tx Hash:", metaArmy.deploymentTransaction().hash);

  // 4. Deploy Staking
  console.log("\n💎 Deploying MetaArmyStaking...");
  const MetaArmyStaking = await ethers.getContractFactory("MetaArmyStaking");
  const staking = await MetaArmyStaking.deploy(armyTokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("✅ MetaArmyStaking deployed to:", stakingAddress);
  console.log("   Tx Hash:", staking.deploymentTransaction().hash);

  // 5. Deploy Vault
  console.log("\n🏦 Deploying MetaArmyVault...");
  const MetaArmyVault = await ethers.getContractFactory("MetaArmyVault");
  const vault = await MetaArmyVault.deploy(armyTokenAddress, "MetaArmy Vault Token", "mARMY");
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("✅ MetaArmyVault deployed to:", vaultAddress);
  console.log("   Tx Hash:", vault.deploymentTransaction().hash);

  // 6. Deploy Governance (Timelock + DAO)
  console.log("\n⚖️ Deploying Governance...");
  const Timelock = await ethers.getContractFactory("TimelockController");
  const timelock = await Timelock.deploy(0, [], [], deployer.address);
  await timelock.waitForDeployment();
  const timelockAddress = await timelock.getAddress();

  const DAO = await ethers.getContractFactory("MetaArmyDAO");
  const dao = await DAO.deploy(armyTokenAddress, timelockAddress);
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  console.log("✅ MetaArmyDAO deployed to:", daoAddress);
  console.log("   Tx Hash:", dao.deploymentTransaction().hash);

  // Save deployment info
  const deploymentInfo = {
    network: network,
    contracts: {
      MetaArmyToken: armyTokenAddress,
      MetaArmy: metaArmyAddress,
      MetaArmyRegistry: registryAddress,
      MetaArmyStaking: stakingAddress,
      MetaArmyVault: vaultAddress,
      MetaArmyDAO: daoAddress,
      Timelock: timelockAddress
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Update environment file
  const fs = require('fs');
  const envContent = `
# MetaArmy 3.0 Full Suite Deployment - ${new Date().toLocaleString()}
NEXT_PUBLIC_META_ARMY_ADDRESS=${metaArmyAddress}
NEXT_PUBLIC_ARMY_TOKEN_ADDRESS=${armyTokenAddress}
NEXT_PUBLIC_REGISTRY_ADDRESS=${registryAddress}
NEXT_PUBLIC_STAKING_ADDRESS=${stakingAddress}
NEXT_PUBLIC_VAULT_ADDRESS=${vaultAddress}
NEXT_PUBLIC_DAO_ADDRESS=${daoAddress}
NEXT_PUBLIC_NETWORK=${network}
`;

  fs.writeFileSync('.env.local', envContent, { flag: 'a' });
  console.log("\n✅ Environment file (.env.local) updated");

  console.log("\n🎉 MetaArmy 3.0 is ready!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
