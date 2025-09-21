#!/bin/bash

# Blockchain Voting - Deployment Script
# This script deploys the entire system

echo "🚀 Deploying Blockchain Voting System..."

# Check if Ganache is running
echo "📋 Checking Ganache connection..."
if ! curl -s http://127.0.0.1:7545 > /dev/null; then
    echo "❌ Ganache is not running. Please start Ganache first:"
    echo "   ganache-cli"
    exit 1
fi
echo "✅ Ganache is running"

# Deploy smart contracts
echo "📦 Deploying smart contracts..."
cd contracts
npm run deploy
if [ $? -eq 0 ]; then
    echo "✅ Smart contracts deployed successfully"
else
    echo "❌ Smart contract deployment failed"
    exit 1
fi
cd ..

# Get contract address (this would need to be updated based on actual deployment)
echo "📝 Please update the following files with the deployed contract address:"
echo "   - frontend/.env (REACT_APP_CONTRACT_ADDRESS)"
echo "   - backend/.env (CONTRACT_ADDRESS)"

# Start backend
echo "🖥️ Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start frontend
echo "🌐 Starting frontend application..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "🎉 Deployment completed!"
echo ""
echo "Services running:"
echo "  - Backend: http://localhost:3001"
echo "  - Frontend: http://localhost:3000"
echo "  - Ganache: http://127.0.0.1:7545"
echo ""
echo "To stop all services, press Ctrl+C"

# Wait for user to stop
wait

