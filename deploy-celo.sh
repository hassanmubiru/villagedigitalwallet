#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Village Digital Wallet - Celo Deployment Script${NC}"
echo "=================================================="

# Default to alfajores testnet
NETWORK="alfajores"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --network=*)
      NETWORK="${1#*=}"
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--network=alfajores|celo]"
      echo "  --network=alfajores  Deploy to Celo Alfajores testnet (default)"
      echo "  --network=celo       Deploy to Celo mainnet"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${YELLOW}Deploying to network: ${NETWORK}${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found!${NC}"
  echo "Please create a .env file with your private key."
  echo "You can copy from .env.example and fill in your values."
  exit 1
fi

# Check if private key is set
if grep -q "your_private_key_here" .env; then
  echo -e "${RED}Error: Please set your actual private key in the .env file!${NC}"
  echo "Replace 'your_private_key_here' with your actual wallet private key."
  exit 1
fi

# Install dependencies if needed
echo -e "${YELLOW}Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Install Hardhat dependencies
echo -e "${YELLOW}Installing Hardhat dependencies...${NC}"
npm install --save-dev hardhat @nomicfoundation/hardhat-ethers @nomicfoundation/hardhat-verify @openzeppelin/hardhat-upgrades

# Compile contracts
echo -e "${YELLOW}Compiling smart contracts...${NC}"
npx hardhat compile

if [ $? -ne 0 ]; then
  echo -e "${RED}Contract compilation failed!${NC}"
  exit 1
fi

# Deploy contracts
echo -e "${YELLOW}Deploying contracts to ${NETWORK}...${NC}"
npx hardhat run scripts/deploy.js --network $NETWORK

if [ $? -eq 0 ]; then
  echo -e "${GREEN}Deployment successful!${NC}"
  
  # Update contract ABIs for the frontend
  echo -e "${YELLOW}Updating contract ABIs...${NC}"
  npm run update:abis
  
  # Verify contracts (optional)
  read -p "Do you want to verify the contracts on the blockchain explorer? (y/n): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Verifying contracts...${NC}"
    npx hardhat run scripts/manual-verify.js --network $NETWORK
  fi
  
  echo -e "${GREEN}Deployment process completed!${NC}"
  echo "Check the deployed contract addresses in app/utils/contractAddresses.ts"
  
else
  echo -e "${RED}Deployment failed!${NC}"
  exit 1
fi
