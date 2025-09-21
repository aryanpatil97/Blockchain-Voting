#!/bin/bash

# Blockchain Voting - macOS Setup Script
# Run this script in Terminal

echo "🚀 Setting up Blockchain Voting on macOS..."

# Check if Node.js is installed
echo "📋 Checking prerequisites..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js from https://nodejs.org/ or use: brew install node"
    exit 1
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm found: $NPM_VERSION"
else
    echo "❌ npm not found. Please install npm"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install contracts dependencies
echo "📦 Installing smart contract dependencies..."
cd contracts
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Create environment files
echo "⚙️ Creating environment files..."

# Contracts .env
if [ ! -f "contracts/.env" ]; then
    cp contracts/.env.example contracts/.env
    echo "✅ Created contracts/.env"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
fi

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
fi

echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start Ganache: ganache-cli"
echo "2. Deploy contracts: cd contracts && npm run deploy"
echo "3. Start backend: cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "For detailed instructions, see README.md"

