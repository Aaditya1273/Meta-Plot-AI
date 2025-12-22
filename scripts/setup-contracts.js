#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Meta-Pilot AI Smart Contracts...\n');

// Step 1: Install contract dependencies
console.log('📦 Installing contract dependencies...');
try {
  process.chdir('contracts');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Contract dependencies installed\n');
} catch (error) {
  console.error('❌ Failed to install contract dependencies:', error.message);
  process.exit(1);
}

// Step 2: Compile contracts
console.log('🔨 Compiling smart contracts...');
try {
  execSync('npx hardhat compile', { stdio: 'inherit' });
  console.log('✅ Contracts compiled successfully\n');
} catch (error) {
  console.error('❌ Failed to compile contracts:', error.message);
  process.exit(1);
}

// Step 3: Check environment variables
console.log('🔍 Checking environment variables...');
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env.local not found. Please create it from .env.example');
  console.log('   Required variables:');
  console.log('   - SEPOLIA_RPC_URL');
  console.log('   - PRIVATE_KEY');
  console.log('   - ETHERSCAN_API_KEY (optional)');
  process.exit(1);
}

// Step 4: Deploy to local network (optional)
console.log('🏗️  Ready to deploy contracts!');
console.log('\nNext steps:');
console.log('1. Start local Hardhat network: cd contracts && npx hardhat node');
console.log('2. Deploy locally: cd contracts && npm run deploy:local');
console.log('3. Deploy to Sepolia: cd contracts && npm run deploy:sepolia');
console.log('4. Update .env.local with deployed contract addresses');

console.log('\n🎉 Contract setup completed!');