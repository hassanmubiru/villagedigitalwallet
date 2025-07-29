# Village Digital Wallet - Celo Deployment Guide

## Quick Deployment to Celo

Your Village Digital Wallet is ready for deployment to the Celo blockchain! Here's how to deploy:

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

Your deployment includes:
- **SavingsGroup Contract**: For village savings circles and group financial management
- **MicroloanSystem Contract**: For peer-to-peer lending and microcredit functionality

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
