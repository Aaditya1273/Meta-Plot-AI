// Setup script for Meta-Plot AI
const fs = require('fs');
const path = require('path');

console.log('🚀 Meta-Plot AI Setup Script');
console.log('===============================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📋 Creating .env.local from template...');
  const examplePath = path.join(__dirname, '..', '.env.example');
  fs.copyFileSync(examplePath, envPath);
  console.log('✅ .env.local created! Please edit it with your actual values.\n');
} else {
  console.log('✅ .env.local already exists.\n');
}

// Check required environment variables
console.log('🔍 Checking environment variables...');
require('dotenv').config({ path: envPath });

const requiredVars = [
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
  'SEPOLIA_RPC_URL',
  'PRIVATE_KEY'
];

const optionalVars = [
  'GEMINI_API_KEY',
  'ETHERSCAN_API_KEY'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n📝 Please edit .env.local with your actual values:');
  console.log('   1. Get WalletConnect Project ID: https://cloud.walletconnect.com/');
  console.log('   2. Get Infura API Key: https://infura.io/');
  console.log('   3. Add your deployment wallet private key (use a test wallet!)');
  console.log('   4. Get Sepolia ETH: https://sepoliafaucet.com/\n');
} else {
  console.log('✅ All required environment variables are set!\n');
}

// Check optional variables
const missingOptional = optionalVars.filter(varName => !process.env[varName] || process.env[varName] === `your_${varName.toLowerCase()}_here`);

if (missingOptional.length > 0) {
  console.log('🔧 Optional enhancements available:');
  missingOptional.forEach(varName => {
    if (varName === 'GEMINI_API_KEY') {
      console.log('   - GEMINI_API_KEY: Enable AI-powered intent parsing');
      console.log('     Get it at: https://makersuite.google.com/app/apikey');
    } else if (varName === 'ETHERSCAN_API_KEY') {
      console.log('   - ETHERSCAN_API_KEY: Enable automatic contract verification');
      console.log('     Get it at: https://etherscan.io/apis');
    }
  });
  console.log('');
}

// Check if contracts directory exists and has the contract
const contractPath = path.join(__dirname, '..', 'contracts', 'MetaPlotAgent.sol');
if (fs.existsSync(contractPath)) {
  console.log('✅ Smart contract found: MetaPlotAgent.sol');
} else {
  console.log('❌ Smart contract not found. Please check contracts/MetaPlotAgent.sol');
}

// Check if hardhat.config.js exists
const hardhatConfigPath = path.join(__dirname, '..', 'hardhat.config.js');
if (fs.existsSync(hardhatConfigPath)) {
  console.log('✅ Hardhat configuration found');
} else {
  console.log('❌ Hardhat configuration missing');
}

console.log('\n📋 Next Steps:');
console.log('1. Edit .env.local with your actual API keys');
console.log('2. Run: npm install');
console.log('3. Run: npm run compile');
console.log('4. Run: npm run deploy');
console.log('5. Update Envio config with deployed contract address');
console.log('6. Run: npm run dev');

console.log('\n🎯 Hackathon Resources:');
console.log('- MetaMask Smart Accounts Kit: https://docs.metamask.io/wallet/how-to/use-smart-accounts/');
console.log('- Envio Documentation: https://docs.envio.dev/');
console.log('- Sepolia Faucet: https://sepoliafaucet.com/');
console.log('- Aave Testnet Faucet: https://staging.aave.com/faucet/');

console.log('\n🏆 Good luck with the hackathon! 🚀');