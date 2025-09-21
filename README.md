# Blockchain Voting

A secure, transparent, and decentralized voting system built on blockchain technology. This platform ensures tamper-proof elections with complete transparency and verifiability.

## 🌟 Features

- **🔒 Secure**: Built on Ethereum blockchain with smart contracts
- **👁️ Transparent**: All votes are publicly verifiable
- **🌐 Decentralized**: No central authority controls the voting process
- **📱 Responsive**: Works seamlessly across all devices
- **⚡ Real-time**: Live election results and updates
- **🛡️ Tamper-proof**: Immutable vote records on the blockchain

## 🏗️ Architecture

```
Blockchain Voting/
├── contracts/          # Smart contracts (Solidity)
├── frontend/          # React application
├── backend/           # Express.js API server
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **MetaMask** browser extension
- **Ganache** (for local development)

### Installation

#### For Windows (PowerShell/CMD)

```powershell
# Clone the repository
git clone <repository-url>
cd Blockchain-Voting

# Install dependencies for all components
npm run install:all

# Start Ganache (in a separate terminal)
ganache-cli

# Deploy smart contracts
cd contracts
npm run deploy

# Start the backend server (in a separate terminal)
cd ../backend
npm run dev

# Start the frontend (in a separate terminal)
cd ../frontend
npm start
```

#### For macOS (Terminal)

```bash
# Clone the repository
git clone <repository-url>
cd Blockchain-Voting

# Install dependencies for all components
npm run install:all

# Start Ganache (in a separate terminal)
ganache-cli

# Deploy smart contracts
cd contracts
npm run deploy

# Start the backend server (in a separate terminal)
cd ../backend
npm run dev

# Start the frontend (in a separate terminal)
cd ../frontend
npm start
```

## 📋 Detailed Setup Instructions

### 1. Environment Setup

#### Windows Setup

1. **Install Node.js**:
   - Download from [nodejs.org](https://nodejs.org/)
   - Run the installer and follow the setup wizard
   - Verify installation: `node --version` and `npm --version`

2. **Install Ganache**:
   - Download from [trufflesuite.com/ganache](https://trufflesuite.com/ganache/)
   - Install and launch Ganache
   - Create a new workspace with default settings

3. **Install MetaMask**:
   - Add the MetaMask extension to your browser
   - Create a new wallet or import existing
   - Add Ganache network (Network ID: 5777, RPC URL: http://127.0.0.1:7545)

#### macOS Setup

1. **Install Node.js**:
   ```bash
   # Using Homebrew
   brew install node
   
   # Or download from nodejs.org
   # Verify installation
   node --version
   npm --version
   ```

2. **Install Ganache**:
   ```bash
   # Using Homebrew
   brew install --cask ganache
   
   # Or download from trufflesuite.com/ganache
   ```

3. **Install MetaMask**:
   - Add the MetaMask extension to your browser
   - Create a new wallet or import existing
   - Add Ganache network (Network ID: 5777, RPC URL: http://127.0.0.1:7545)

### 2. Smart Contract Deployment

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npm run compile

# Deploy to local network
npm run deploy

# Copy the deployed contract address
# Update frontend/.env with REACT_APP_CONTRACT_ADDRESS
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration
# Start the server
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with contract address and network details
# Start the development server
npm start
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in the following locations:

#### contracts/.env
```env
PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_project_id_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
NETWORK_ID=5777
RPC_URL=http://127.0.0.1:7545
```

#### frontend/.env
```env
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_NETWORK_ID=5777
REACT_APP_RPC_URL=http://127.0.0.1:7545
```

#### backend/.env
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
CONTRACT_ADDRESS=0x...
NETWORK_ID=5777
RPC_URL=http://127.0.0.1:7545
```

## 🎯 Usage

### For Voters

1. **Connect Wallet**: Click "Connect Wallet" and authorize MetaMask
2. **Get Authorized**: Wait for admin to authorize your wallet address
3. **View Elections**: Browse available elections
4. **Cast Vote**: Select your preferred candidate and submit
5. **Verify Results**: View real-time results and verify on blockchain

### For Administrators

1. **Access Admin Panel**: Navigate to `/admin` (requires owner privileges)
2. **Authorize Voters**: Add voter addresses to the system
3. **Add Candidates**: Create candidate profiles with names and parties
4. **Create Elections**: Set up new elections with start/end times
5. **Monitor Results**: Track voting progress and final results

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Backend Tests

```bash
cd backend
npm test
```

## 🚀 Deployment

### Smart Contracts

#### Local Network (Ganache)
```bash
cd contracts
npm run deploy
```

#### Testnet (Sepolia)
```bash
cd contracts
truffle migrate --network sepolia
```

#### Mainnet
```bash
cd contracts
truffle migrate --network mainnet
```

### Frontend

#### Development
```bash
cd frontend
npm start
```

#### Production Build
```bash
cd frontend
npm run build
# Deploy the 'build' folder to your hosting service
```

### Backend

#### Development
```bash
cd backend
npm run dev
```

#### Production
```bash
cd backend
npm start
```

## 🔍 Troubleshooting

### Common Issues

#### MetaMask Connection Issues

**Problem**: Cannot connect to MetaMask
**Solution**:
1. Ensure MetaMask is installed and unlocked
2. Check that you're on the correct network (Ganache: Network ID 5777)
3. Refresh the page and try again
4. Clear browser cache and cookies

#### Contract Not Found

**Problem**: "Contract not found" error
**Solution**:
1. Verify the contract is deployed: `cd contracts && npm run deploy`
2. Check the contract address in frontend/.env
3. Ensure you're on the correct network
4. Restart the frontend application

#### Transaction Failures

**Problem**: Transactions failing or pending
**Solution**:
1. Check your account has sufficient ETH for gas
2. Increase gas limit in MetaMask
3. Ensure the contract is not paused
4. Verify you have the required permissions

#### Network Issues

**Problem**: Cannot connect to blockchain
**Solution**:
1. Verify Ganache is running on port 7545
2. Check network configuration in MetaMask
3. Ensure RPC URL is correct: http://127.0.0.1:7545
4. Restart Ganache if necessary

### Performance Issues

#### Slow Loading

**Solution**:
1. Clear browser cache
2. Restart the development servers
3. Check network connectivity
4. Reduce the number of concurrent requests

#### High Gas Costs

**Solution**:
1. Use a local network (Ganache) for development
2. Optimize smart contract functions
3. Batch multiple operations when possible

## 📚 API Documentation

### Backend Endpoints

#### Health Check
```
GET /health
```
Returns the health status of the backend service.

#### API Status
```
GET /api/status
```
Returns the current API status and version information.

#### Contract Information
```
GET /api/contract
```
Returns the deployed contract address and network information.

## 🔒 Security Considerations

### Smart Contract Security

- **OpenZeppelin**: Uses battle-tested security libraries
- **Reentrancy Protection**: Prevents reentrancy attacks
- **Access Control**: Only authorized users can perform sensitive operations
- **Pausable**: Contract can be paused in case of emergency

### Frontend Security

- **Input Validation**: All user inputs are validated
- **Rate Limiting**: API requests are rate-limited
- **HTTPS**: Use HTTPS in production
- **Environment Variables**: Sensitive data stored in environment variables

### Best Practices

1. **Never commit private keys** to version control
2. **Use environment variables** for sensitive configuration
3. **Test thoroughly** on testnets before mainnet deployment
4. **Keep dependencies updated** for security patches
5. **Monitor contract events** for suspicious activity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review the [documentation](#-documentation)
3. Open an issue on GitHub
4. Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core voting functionality
- **v1.1.0** - Added admin panel and enhanced UI
- **v1.2.0** - Improved security and performance optimizations

## 🎉 Acknowledgments

- Built with [React](https://reactjs.org/)
- Smart contracts powered by [Solidity](https://soliditylang.org/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Blockchain integration via [Web3.js](https://web3js.readthedocs.io/)
- Security standards from [OpenZeppelin](https://openzeppelin.com/)

---

**Blockchain Voting** - Revolutionizing democracy through technology 🗳️

