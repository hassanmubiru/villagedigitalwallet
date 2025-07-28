#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Village Digital Wallet with Celo Composer Integration${NC}"
echo -e "${YELLOW}Checking dependencies...${NC}"

# Check if the required packages are installed
if ! npm list @celo/react-celo &> /dev/null; then
  echo -e "${YELLOW}Installing Celo packages...${NC}"
  npm install @celo/react-celo@5.0.4 @celo-tools/use-contractkit@3.1.0 @celo/contractkit@3.2.0 --force
fi

# Build the application
echo -e "${GREEN}Building the application...${NC}"
npm run build

# Start the development server
echo -e "${GREEN}Starting the development server...${NC}"
npm run dev
