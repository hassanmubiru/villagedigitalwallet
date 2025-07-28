# Private Key Setup Guide

Follow these steps to properly set up your private key for smart contract deployment.

## Step 1: Export your private key from MetaMask

1. Open your MetaMask extension
2. Click on the three dots in the upper-right corner
3. Select "Account details"
4. Click "Export Private Key"
5. Enter your MetaMask password
6. Copy the displayed private key (it should be a hexadecimal string)

## Step 2: Add the private key to your .env file

1. Open the `.env` file in your project
2. Replace the placeholder text with your actual private key:

```
PRIVATE_KEY=yourPrivateKeyHere
```

Important notes:
- If your private key starts with `0x`, include it as is (our code will handle it)
- Make sure there are no extra spaces before or after the key
- Keep your private key secure and NEVER commit the .env file to git

## Step 3: Get testnet funds

1. Go to the [Celo Faucet](https://faucet.celo.org)
2. Enter your wallet address (the one associated with the private key)
3. Request both CELO and cUSD tokens
4. Wait for the transaction to complete

## Step 4: Deploy your contracts

1. Run the deployment script:
   ```bash
   npx hardhat run scripts/deploy.js --network alfajores
   ```

2. Save the contract addresses from the terminal output

3. Verify your deployment:
   ```bash
   npx hardhat run scripts/verify-deployment.js --network alfajores YOUR_CONTRACT_ADDRESS
   ```
   (Replace YOUR_CONTRACT_ADDRESS with the address from step 2)

## Troubleshooting

If you encounter the "private key too short" error:
- Make sure you've added your actual private key to the .env file
- The private key should be a 64-character hexadecimal string (possibly with a 0x prefix)
- Check for any extra spaces or line breaks in the .env file

If you're having trouble with the deployment:
- Ensure you have sufficient CELO for gas fees
- Try increasing the gas limit in hardhat.config.js
- Check your network connection
