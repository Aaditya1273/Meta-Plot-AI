# Meta-Pilot AI Quick Deployment Script (PowerShell)
# This script automates the entire deployment process for Windows

Write-Host "🚀 Meta-Pilot AI Quick Deployment" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ .env.local not found!" -ForegroundColor Red
    Write-Host "Please copy .env.example to .env.local and fill in your API keys" -ForegroundColor Yellow
    Write-Host "Required: GOOGLE_GENERATIVE_AI_API_KEY, NEXT_PUBLIC_INFURA_KEY, PRIVATE_KEY" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

# Setup and deploy contracts
Write-Host "🏗️  Setting up smart contracts..." -ForegroundColor Blue
Set-Location contracts
npm install
Write-Host "Compiling contracts..." -ForegroundColor Blue
npx hardhat compile

Write-Host "🚀 Deploying to Sepolia..." -ForegroundColor Blue
npm run deploy:sepolia

Write-Host "📝 Contract addresses displayed above" -ForegroundColor Yellow
Write-Host "Please update your .env.local with the deployed addresses" -ForegroundColor Yellow

Set-Location ..

# Build frontend
Write-Host "🌐 Building frontend..." -ForegroundColor Blue
npm run build

Write-Host "✅ Deployment preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.local with deployed contract addresses" -ForegroundColor White
Write-Host "2. Deploy Envio indexer: cd envio && envio deploy --network sepolia" -ForegroundColor White
Write-Host "3. Deploy frontend: vercel deploy --prod" -ForegroundColor White
Write-Host "4. Test the application" -ForegroundColor White
Write-Host "5. Record demo video" -ForegroundColor White
Write-Host ""
Write-Host "🏆 Ready to win the hackathon!" -ForegroundColor Green