#!/bin/bash

# Set variables
NETWORK="alfajores"  # Default to Alfajores testnet
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Help function
function show_help {
    echo -e "${BOLD}Village Digital Wallet - Deployment Script${NC}"
    echo -e "Usage: $0 [options]"
    echo
    echo "Options:"
    echo "  -h, --help      Show this help message"
    echo "  -n, --network   Network to deploy to (hardhat, alfajores, celo)"
    echo
}

# Process arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -n|--network)
            NETWORK="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Error: Unknown option $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Check if .env file exists
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo -e "Please create a .env file with PRIVATE_KEY=your_private_key_here"
    exit 1
fi

# Validate network
case $NETWORK in
    hardhat|alfajores|celo)
        # Valid network
        ;;
    *)
        echo -e "${RED}Error: Invalid network '$NETWORK'${NC}"
        echo -e "Please use one of: hardhat, alfajores, celo"
        exit 1
        ;;
esac

echo -e "${BOLD}Starting deployment to $NETWORK network${NC}"

# Compile contracts
echo -e "${YELLOW}Compiling contracts...${NC}"
cd "$PROJECT_DIR" && npx hardhat compile
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to compile contracts${NC}"
    exit 1
fi
echo -e "${GREEN}Contracts compiled successfully${NC}"

# Deploy contracts
echo -e "${YELLOW}Deploying contracts to $NETWORK...${NC}"
cd "$PROJECT_DIR" && npx hardhat run scripts/deploy.js --network $NETWORK
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to deploy contracts${NC}"
    exit 1
fi
echo -e "${GREEN}Contracts deployed successfully${NC}"

# If not hardhat network, verify contracts
if [ "$NETWORK" != "hardhat" ]; then
    echo -e "${YELLOW}Waiting 30 seconds before verification...${NC}"
    sleep 30
    
    echo -e "${YELLOW}Verifying contracts...${NC}"
    cd "$PROJECT_DIR" && npx hardhat run scripts/verify-contracts.js --network $NETWORK
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}Warning: Contract verification might have failed${NC}"
    else
        echo -e "${GREEN}Contracts verified successfully${NC}"
    fi
fi

echo -e "${GREEN}${BOLD}Deployment completed!${NC}"
echo -e "You can now start your application with: npm run dev"
