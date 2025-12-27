// Deploy only the updated MetaArmy contract
const { ethers } = require("hardhat");

async function main() {
  const network = hre.network.name;
  console.log(`🚀 Deploying updated MetaArmy contract to ${network}...`);

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Use existing token and prover addresses (from your .env or constants)
  const existingArmyToken = "0x0000000000000000000000000000000000000000"; // Replace with actual token address
  const zkProverPlaceholder = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Mock prover

  // Deploy updated MetaArmy contract
  console.log("\n📄 Deploying updated MetaArmy...");
  const MetaArmy = await ethers.getContractFactory("MetaArmy");
  const metaArmy = await MetaArmy.deploy(existingArmyToken, zkProverPlaceholder);
  await metaArmy.waitForDeployment();
  const metaArmyAddress = await metaArmy.getAddress();
  
  console.log("✅ Updated MetaArmy deployed to:", metaArmyAddress);
  console.log("   Tx Hash:", metaArmy.deploymentTransaction().hash);

  // Update environment file with new address
  const fs = require('fs');
  const envContent = `
# Updated MetaArmy Contract - ${new Date().toLocaleString()}
NEXT_PUBLIC_META_PLOT_AGENT_ADDRESS=${metaArmyAddress}
`;

  fs.appendFileSync('.env.local', envContent);
  console.log("\n✅ Environment file (.env.local) updated with new MetaArmy address");
  console.log(`\n🎉 Updated MetaArmy contract is ready at: ${metaArmyAddress}`);
  
  // Also update constants.ts file
  console.log("\n📝 Don't forget to update the META_PLOT_AGENT address in app/lib/constants.ts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });