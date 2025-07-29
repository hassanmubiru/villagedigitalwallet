# Village Digital Wallet - Celo Deployment Guide

## 🎉 Complete Smart Contract Integration

Your Village Digital Wallet now includes comprehensive smart contracts for:

- **💰 Savings Groups**: Community-managed savings circles with automated contributions
- **🏦 Microloans**: Peer-to-peer lending with automated repayments
- **🗳️ Governance**: Community decision-making with voting tokens and reputation system
- **🤖 Automation**: Smart contract automation for recurring transactions and governance

## Quick Deployment to Celo

### Prerequisites

1. **Get Testnet CELO tokens**:
   - Visit [Celo Alfajores Faucet](https://faucet.celo.org/alfajores)
   - Enter your wallet address to receive free testnet CELO for gas fees

2. **Configure your wallet**:
   - Make sure your `.env` file has your private key configured
   - Never commit your private key to version control

### Deployment Commands

#### Deploy to Alfajores Testnet (Recommended for testing)
```bash
./deploy-celo.sh --network=alfajores
```

#### Deploy to Celo Mainnet (Production)
```bash
./deploy-celo.sh --network=celo
```

### Verify Deployment
```bash
./verify-deployment.sh --network=alfajores
```

### What Gets Deployed

Your comprehensive deployment includes:

#### Core Financial Contracts
- **SavingsGroup Contract**: For village savings circles and group financial management
- **MicroloanSystem Contract**: For peer-to-peer lending and microcredit functionality

#### Governance System
- **VillageGovernance Contract**: Complete governance system with:
  - Voting token distribution based on contributions
  - Reputation-based voting power
  - Proposal creation and execution
  - Community decision-making on interest rates, loans, and system upgrades

#### Automation Framework
- **VillageAutomation Contract**: Smart contract automation including:
  - Automated savings contributions (daily/weekly/monthly)
  - Automatic loan repayments
  - Interest calculations and compounding
  - Governance proposal execution

### Frontend Integration

The React frontend now includes:

#### New Features
1. **🏛️ Governance Dashboard**:
   - View and create proposals
   - Vote on community decisions
   - Track voting power and reputation
   - Execute approved proposals

2. **🤖 Automation Center**:
   - Set up recurring savings contributions
   - Automate loan repayments
   - Schedule interest calculations
   - Monitor all automated tasks

3. **📊 Enhanced Analytics**:
   - Governance participation metrics
   - Automation task performance
   - Community engagement tracking

#### Mobile-First Design
- Governance voting accessible on mobile
- Automation management from your phone
- Seamless integration with existing features

### After Deployment

1. Contract addresses will be automatically updated in `app/utils/contractAddresses.ts`
2. The frontend will connect to your deployed contracts
3. You can verify contracts on [CeloScan](https://alfajores.celoscan.io) (testnet) or [CeloScan](https://celoscan.io) (mainnet)

### Network Information

- **Alfajores Testnet**: Chain ID 44787, free testnet for development
- **Celo Mainnet**: Chain ID 42220, production network

### Getting Help

If you encounter any issues:
1. Check that your wallet has sufficient CELO for gas fees
2. Verify your `.env` configuration
3. Make sure you're connected to the correct network
4. Check the Hardhat console output for detailed error messages

### Frontend Integration

After successful deployment, your React app will automatically:
- Connect to the deployed contracts
- Enable savings group functionality
- Support microloan operations
- Work with Celo mobile wallets like Valora

Happy deploying! 🚀
