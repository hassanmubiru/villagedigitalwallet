#!/bin/bash

# Script to install Celo packages with the --force flag
# This is needed because of dependency conflicts with ethers.js versions

echo "Installing Celo ContractKit and dependencies..."

# Install @celo/contractkit with --force flag
npm install @celo/contractkit --force

# Install other Celo packages if needed
npm install @celo/identity --force
npm install @celo/react-celo --force

echo "Installation complete!"
echo "Note: --force flag was used to bypass dependency conflicts."
echo "Be aware that this could cause issues with other packages."

# Check if packages were installed successfully
if npm list @celo/contractkit >/dev/null 2>&1; then
  echo "✅ @celo/contractkit installed successfully."
else
  echo "❌ Failed to install @celo/contractkit. Please try again manually."
  exit 1
fi

echo ""
echo "Next steps:"
echo "1. Deploy contracts: npm run deploy"
echo "2. Verify contracts: npm run verify"
echo "3. Start development server: npm run dev"

exit 0
