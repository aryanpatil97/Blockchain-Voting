# Blockchain Voting - Windows Setup Script
# Run this script in PowerShell as Administrator

Write-Host "🚀 Setting up Blockchain Voting on Windows..." -ForegroundColor Green

# Check if Node.js is installed
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Install contracts dependencies
Write-Host "📦 Installing smart contract dependencies..." -ForegroundColor Yellow
cd contracts
npm install
cd ..

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
cd frontend
npm install
cd ..

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
cd backend
npm install
cd ..

# Create environment files
Write-Host "⚙️ Creating environment files..." -ForegroundColor Yellow

# Contracts .env
if (!(Test-Path "contracts\.env")) {
    Copy-Item "contracts\.env.example" "contracts\.env"
    Write-Host "✅ Created contracts/.env" -ForegroundColor Green
}

# Frontend .env
if (!(Test-Path "frontend\.env")) {
    Copy-Item "frontend\.env.example" "frontend\.env"
    Write-Host "✅ Created frontend/.env" -ForegroundColor Green
}

# Backend .env
if (!(Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
}

Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start Ganache: ganache-cli" -ForegroundColor White
Write-Host "2. Deploy contracts: cd contracts && npm run deploy" -ForegroundColor White
Write-Host "3. Start backend: cd backend && npm run dev" -ForegroundColor White
Write-Host "4. Start frontend: cd frontend && npm start" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see README.md" -ForegroundColor Yellow

