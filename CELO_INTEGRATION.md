# Celo Integration Guide for Village Digital Wallet

This guide explains how to use the Celo blockchain integration in the Village Digital Wallet.

## Setup & Installation

1. **Install Dependencies**
   ```bash
   # Use the setup script to install Celo packages with --force flag
   ./setup-celo-packages.sh
   ```

2. **Configure Environment**
   Create a `.env.local` file in the project root with:
   ```
   # Network Configuration
   NEXT_PUBLIC_DEFAULT_NETWORK=alfajores  # Use 'celo' for mainnet
   
   # Contract Verification (for deployment)
   ETHERSCAN_API_KEY=your_celoscan_api_key_here
   ```

## Using Celo Features

### Connecting to Celo Network

1. **Connect Wallet**: Use the wallet connect button in the app
2. **Switch Network**: If not already on Celo, click "Switch to Celo Network" button
3. **Verify Connection**: You should see a confirmation when connected to Celo

### Working with Celo Tokens

The app supports both CELO (native token) and cUSD (Celo Dollar stablecoin):

- **CELO**: Used for transaction fees and can be transferred between users
- **cUSD**: Used for savings groups and loans

### Development with Celo

#### CeloService

The `celoService.ts` provides utility functions for interacting with the Celo blockchain:

```typescript
import celoService from "../services/celoService";

// Connect to Celo with wallet
await celoService.connectWithWallet(address, provider);

// Get CELO balance
const celoBalance = await celoService.getCeloBalance(address);

// Get cUSD balance
const cusdBalance = await celoService.getcUSDBalance(address);

// Transfer CELO
await celoService.transferCELO(recipientAddress, amount);

// Transfer cUSD
await celoService.transfercUSD(recipientAddress, amount);
```

#### ContractService

The `contractService.ts` provides functions for interacting with the smart contracts:

```typescript
import contractService from "../services/contractService";

// Connect wallet
await contractService.connect(address, provider);

// Savings Group functions
const groupName = await contractService.getSavingsGroupName();
const groupBalance = await contractService.getSavingsGroupBalance();
const members = await contractService.getSavingsGroupMembers();
await contractService.joinSavingsGroup();
await contractService.makeContribution();

// Microloan functions
await contractService.requestLoan(amount, duration);
const loanDetails = await contractService.getLoanDetails(loanId);
const userLoans = await contractService.getUserLoans();
await contractService.repayLoan(loanId);
```

## Contract Deployment

The contracts are deployed to the Celo blockchain using Hardhat:

1. **Deploy Contracts**
   ```bash
   npx hardhat run scripts/deploy.js --network alfajores
   ```

2. **Verify Contracts**
   ```bash
   npx hardhat run scripts/verify-contracts.js --network alfajores
   ```

## Network Helpers

The `networkHelpers.ts` utility provides functions to add and switch to Celo networks:

```typescript
import { switchToCeloNetwork } from "../utils/networkHelpers";

// Switch to Celo Alfajores testnet
await switchToCeloNetwork(true); 

// Switch to Celo mainnet
await switchToCeloNetwork(false);
```

## Testing on Alfajores Testnet

1. Get test CELO from the [Celo Faucet](https://faucet.celo.org)
2. Use the app with your funded wallet
3. Create savings groups and test microloan functionality
4. Monitor transactions on [Alfajores Celoscan](https://alfajores.celoscan.io/)

## Production Deployment

For production, update the environment variable:
```
NEXT_PUBLIC_DEFAULT_NETWORK=celo
```

This will use the mainnet contract addresses and network configuration.
