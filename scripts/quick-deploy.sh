#!/bin/bash

# Meta-Pilot AI Quick Deployment Script
# This script automates the entire deployment process

set -e

echo "🚀 Meta-Pilot AI Quick Deployment"
echo "=================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "Please copy .env.example to .env.local and fill in your API keys"
    echo "Required: GOOGLE_GENERATIVE_AI_API_KEY, NEXT_PUBLIC_INFURA_KEY, PRIVATE_KEY"
    exit 1
fi

echo "✅ Environment file found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup and deploy contracts
echo "🏗️  Setting up smart contracts..."
cd contracts
npm install
echo "Compiling contracts..."
npx hardhat compile

echo "🚀 Deploying to Sepolia..."
npm run deploy:sepolia

# Extract contract addresses (this would need to be implemented)
echo "📝 Contract addresses will be displayed above"
echo "Please update your .env.local with the deployed addresses"

cd ..

# Build frontend
echo "🌐 Building frontend..."
npm run build

echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with deployed contract addresses"
echo "2. Deploy Envio indexer: cd envio && envio deploy --network sepolia"
echo "3. Deploy frontend: vercel deploy --prod"
echo "4. Test the application"
echo "5. Record demo video"
echo ""
echo "🏆 Ready to win the hackathon!"