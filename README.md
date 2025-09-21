# Blockchain Voting

A decentralized voting system built on Ethereum blockchain technology, providing transparent, secure, and tamper-proof elections.

## Features

- **Decentralized Architecture**: Built on Ethereum blockchain for transparency and immutability
- **Secure Voting**: Smart contract-based voting with role-based access control
- **Modern UI**: Responsive React frontend with TypeScript and Tailwind CSS
- **Cross-Platform**: Compatible with Windows and macOS development environments
- **MetaMask Integration**: Seamless wallet connection and transaction handling

## Prerequisites

### Required Software

- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **Git**
- **MetaMask** browser extension

### Installation Instructions

#### Windows (PowerShell/Command Prompt)

1. **Install Node.js**:
   - Download from [nodejs.org](https://nodejs.org/)
   - Run the installer and follow the setup wizard
   - Verify installation:
   ```cmd
   node --version
   npm --version
   ```

2. **Install Git**:
   - Download from [git-scm.com](https://git-scm.com/)
   - Run installer with default settings

#### macOS (Terminal)

1. **Install Node.js**:
   - Using Homebrew (recommended):
   ```bash
   brew install node
   ```
   - Or download from [nodejs.org](https://nodejs.org/)
   - Verify installation:
   ```bash
   node --version
   npm --version
   ```

2. **Install Git** (if not already installed):
   ```bash
   brew install git
   ```

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd blockchain-voting

# Install dependencies
npm run setup
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
# For development, the default values should work with Ganache
```

### 3. Start Local Blockchain

**Option A: Using Ganache CLI**
```bash
npm run ganache
```

**Option B: Using Ganache GUI**
- Download and install [Ganache](https://trufflesuite.com/ganache/)
- Create new workspace with default settings
- Note the RPC server address (usually http://127.0.0.1:7545)

### 4. Deploy Smart Contracts

```bash
# Compile contracts
npm run compile

# Deploy to local network
npm run migrate
```

### 5. Start Frontend

```bash
# Start React development server
npm run frontend:start
```

The application will open at `http://localhost:3000`

## Development Workflow

### Smart Contract Development

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to specific network
truffle migrate --network development
truffle migrate --network sepolia  # for testnet
```

### Frontend Development

```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## MetaMask Configuration

### Local Development (Ganache)

1. Open MetaMask extension
2. Click network dropdown → "Add Network" → "Add a network manually"
3. Configure:
   - **Network Name**: Ganache Local
   - **New RPC URL**: http://127.0.0.1:8545 (or 7545 for Ganache GUI)
   - **Chain ID**: 1337 (or 5777 for Ganache GUI)
   - **Currency Symbol**: ETH

### Import Test Account

1. Copy private key from Ganache
2. MetaMask → Account menu → "Import Account"
3. Paste private key

## Testing

### Smart Contract Tests

```bash
# Run all contract tests
npm run test

# Run specific test file
truffle test test/VotingContract.test.js
```

### Frontend Tests

```bash
cd frontend
npm test
```

## Deployment

### Testnet Deployment (Sepolia)

1. **Get Test ETH**:
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Request test ETH for your wallet

2. **Configure Environment**:
   ```bash
   # Update .env file
   INFURA_PROJECT_ID="your_infura_project_id"
   MNEMONIC="your twelve word mnemonic phrase"
   ```

3. **Deploy**:
   ```bash
   truffle migrate --network sepolia
   ```

## Project Structure

```
blockchain-voting/
├── contracts/              # Smart contracts
├── migrations/             # Deployment scripts
├── test/                   # Contract tests
├── frontend/               # React application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── truffle-config.js      # Truffle configuration
├── package.json           # Project dependencies
└── .env                   # Environment variables
```

## Troubleshooting

### Common Issues

**1. "Network not found" error**
- Ensure Ganache is running
- Check network configuration in truffle-config.js
- Verify MetaMask is connected to correct network

**2. "Insufficient funds" error**
- Ensure your account has ETH for gas fees
- For testnet: get test ETH from faucet
- For local: import account from Ganache

**3. "Contract not deployed" error**
- Run `npm run migrate` to deploy contracts
- Check if migration completed successfully
- Verify contract address in frontend configuration

**4. Frontend not connecting to contracts**
- Ensure contracts are deployed
- Check contract addresses in environment variables
- Verify MetaMask is connected and on correct network

### Platform-Specific Issues

**Windows**:
- Use PowerShell or Command Prompt as administrator if needed
- Ensure Windows Defender doesn't block Node.js

**macOS**:
- Use `sudo` if permission errors occur during global installs
- Ensure Xcode Command Line Tools are installed: `xcode-select --install`

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review existing GitHub issues
3. Create new issue with detailed description and error logs