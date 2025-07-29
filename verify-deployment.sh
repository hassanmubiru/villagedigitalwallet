#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Village Digital Wallet - Deployment Verification${NC}"
echo "=================================================="

NETWORK="alfajores"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --network=*)
      NETWORK="${1#*=}"
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${YELLOW}Verifying deployment on network: ${NETWORK}${NC}"

# Check if deployment was successful by looking for contract addresses
if [ -f "deployed-contracts.json" ]; then
  echo -e "${GREEN}Found deployed contracts file${NC}"
  cat deployed-contracts.json
else
  echo -e "${YELLOW}No deployed-contracts.json found. Checking deployment logs...${NC}"
fi

# Check network connectivity
echo -e "${YELLOW}Testing network connectivity...${NC}"
if [ "$NETWORK" = "alfajores" ]; then
  curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' https://alfajores-forno.celo-testnet.org > /dev/null
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully connected to Celo Alfajores testnet${NC}"
  else
    echo -e "${RED}✗ Failed to connect to Celo Alfajores testnet${NC}"
  fi
elif [ "$NETWORK" = "celo" ]; then
  curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' https://forno.celo.org > /dev/null
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully connected to Celo mainnet${NC}"
  else
    echo -e "${RED}✗ Failed to connect to Celo mainnet${NC}"
  fi
fi

# Check if contracts are compiled
if [ -d "artifacts/contracts" ]; then
  echo -e "${GREEN}✓ Smart contracts are compiled${NC}"
  ls -la artifacts/contracts/
else
  echo -e "${RED}✗ Smart contracts not compiled. Run: npx hardhat compile${NC}"
fi

# Check if .env is properly configured
if [ -f ".env" ]; then
  if grep -q "your_private_key_here" .env; then
    echo -e "${RED}✗ Private key not configured in .env file${NC}"
  else
    echo -e "${GREEN}✓ Environment variables configured${NC}"
  fi
else
  echo -e "${RED}✗ .env file not found${NC}"
fi

echo -e "${YELLOW}Verification complete${NC}"
