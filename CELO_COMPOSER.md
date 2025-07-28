# Celo Composer Integration Guide

This document explains how Village Digital Wallet integrates with Celo Composer for a seamless development experience.

## Overview

Village Digital Wallet is built using Celo Composer, a framework designed to make it easy to build decentralized applications on the Celo blockchain. Celo Composer provides pre-built modules that simplify blockchain integration while maintaining flexibility.

## Architecture

Our application uses the following Celo Composer components:

1. **React App Module**: For the frontend with built-in Celo integration
2. **Hardhat Project Module**: For smart contract development, testing, and deployment
3. **ContractKit Integration**: For direct blockchain interaction

## Configuration Files

- **celo-composer.json**: Main configuration file that defines our project structure
- **hardhat.config.js**: Hardhat configuration with Celo network settings
- **composer-deploy.js**: Custom deployment script for Celo Composer

## Integration Points

### 1. Celo Provider

The `CeloProvider` in `app/providers/CeloProvider.tsx` establishes the connection to the Celo blockchain and provides context for:

- ContractKit instance
- Network selection (Alfajores testnet or Celo mainnet)
- Token addresses (CELO, cUSD, cEUR)
- Account connection

### 2. ThirdWeb Integration

The `ThirdwebProvider` in `app/providers/ThirdwebProvider.tsx` integrates with the Celo Provider to:

- Sync the active chain with the selected Celo network
- Provide wallet connection capabilities
- Handle transaction signing

### 3. Contract Interaction

Smart contract interaction is done through:

- `celoService.ts`: Utility for Celo-specific operations
- `contractAddresses.js`: Keeps track of deployed contract addresses
- Contract ABIs in `app/abis/`: Updated automatically during deployment

## Usage

### Development

```bash
# Start development server
npm run dev

# Setup Celo packages (if needed)
npm run celo:setup
```

### Deployment

```bash
# Deploy to Alfajores testnet
npm run celo:deploy

# Deploy to Celo mainnet
npm run celo:deploy:mainnet
```

### Contract Verification

Contract verification is handled automatically during deployment if an ETHERSCAN_API_KEY is provided in the .env file.

## Environment Variables

- `NEXT_PUBLIC_DEFAULT_NETWORK`: Set to 'alfajores' or 'celo' for testnet or mainnet
- `PRIVATE_KEY`: Deployer's private key
- `ETHERSCAN_API_KEY`: API key for contract verification on Celoscan

## Further Resources

- [Celo Composer Documentation](https://github.com/celo-org/celo-composer)
- [Celo Developer Documentation](https://docs.celo.org/developer)
- [ContractKit Documentation](https://docs.celo.org/developer/contractkit)
