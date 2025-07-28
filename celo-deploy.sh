#!/bin/bash

# Helper script to perform a full Celo Composer deployment for Village Digital Wallet
# This script handles all steps from compilation to deployment to verification

set -e  # Exit on error

# Default to Alfajores testnet
NETWORK="alfajores"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --network=*) NETWORK="${1#*=}"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
done

# Validate network
if [ "$NETWORK" != "alfajores" ] && [ "$NETWORK" != "celo" ]; then
    echo "❌ Invalid network: $NETWORK. Must be 'alfajores' or 'celo'"
    exit 1
fi

echo "🌟 Starting Village Digital Wallet deployment to $NETWORK"

# Compile contracts
echo "📝 Compiling smart contracts..."
npx hardhat compile

# Run deployment
echo "🚀 Deploying contracts..."
node composer-deploy.js --network=$NETWORK

# Update ABIs
echo "📄 Updating contract ABIs..."
node scripts/update-contract-abis.js

echo "✅ Deployment process completed!"
echo "   Check logs above for any errors or warnings"

if [ "$NETWORK" = "alfajores" ]; then
    echo ""
    echo "🔍 To verify contracts on Alfajores Explorer:"
    echo "   npm run verify"
    echo ""
    echo "🌐 Explorer URL: https://alfajores.celoscan.io/"
else
    echo ""
    echo "🔍 To verify contracts on Celo Explorer:"
    echo "   npm run verify:mainnet"
    echo ""
    echo "🌐 Explorer URL: https://celoscan.io/"
fi

echo ""
echo "💻 To start the development server:"
echo "   npm run dev"
echo ""
