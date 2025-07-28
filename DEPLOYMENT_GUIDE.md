# Smart Contract Deployment Guide

This guide walks you through deploying your Village Digital Wallet smart contracts to the Celo blockchain (both testnet and mainnet).

## Prerequisites

Before deploying, ensure you have:

1. A wallet with sufficient CELO tokens for gas fees
2. Your private key (keep this secure and never commit it to git!)
3. Node.js and NPM installed

## Step 1: Configure Your Environment

1. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your wallet's private key:
   ```
   PRIVATE_KEY=your_private_key_here
   ```
   
   ⚠️ **IMPORTANT**: Never share your private key or commit the `.env` file to git!

## Step 2: Get Testnet Funds

For Alfajores testnet deployment:

1. Visit the [Celo Faucet](https://faucet.celo.org)
2. Request both CELO and cUSD tokens by entering your wallet address
3. Wait for the tokens to be sent to your wallet (typically less than a minute)

## Step 3: Deploying Contracts

### Testnet Deployment (Recommended First)

To deploy to Alfajores testnet:

```bash
npx hardhat run scripts/deploy.js --network alfajores
```

### Mainnet Deployment

⚠️ **CAUTION**: Only deploy to mainnet after thorough testing on testnet!

To deploy to Celo mainnet:

```bash
npx hardhat run scripts/deploy.js --network celo
```

## Step 4: After Deployment

1. Save the contract addresses displayed in the console output:
   ```
   SavingsGroup deployed to: 0x...
   MicroloanSystem deployed to: 0x...
   ```

2. Update your frontend to use these addresses:
   - Create or update `/app/utils/contractAddresses.ts` with the new addresses

3. Verify your contracts (optional but recommended):
   ```bash
   npx hardhat verify --network alfajores CONTRACT_ADDRESS CONSTRUCTOR_ARGS
   ```

## Step 5: Interacting with Deployed Contracts

You can interact with your deployed contracts in several ways:

### Using Hardhat Console

```bash
npx hardhat console --network alfajores
```

Then you can interact with your contracts:

```javascript
const SavingsGroup = await ethers.getContractFactory("SavingsGroup");
const savingsGroup = await SavingsGroup.attach("YOUR_DEPLOYED_ADDRESS");
await savingsGroup.getGroupDetails();
```

### Using Thirdweb SDK

Your frontend already integrates with Thirdweb, which makes interacting with these contracts straightforward. Example:

```typescript
import { useContract } from "thirdweb/react";

// In your component
const { contract } = useContract("YOUR_CONTRACT_ADDRESS");
```

## Troubleshooting

### Common Issues

1. **Insufficient funds**: Make sure you have enough CELO in your wallet for gas fees
2. **Nonce too high**: Clear your transaction history or reset your account in MetaMask
3. **Transaction underpriced**: Increase the gas price in hardhat.config.js

### Getting Help

If you encounter issues:
1. Check the Hardhat and Celo documentation
2. Review your contract code for bugs
3. Open an issue in the repository

## Security Considerations

- Keep your private key secure and never expose it
- Test thoroughly on testnet before mainnet deployment
- Consider a multi-sig wallet for production deployments
- Implement proper access control in your contracts

Remember to update your frontend application to use the newly deployed contract addresses!
