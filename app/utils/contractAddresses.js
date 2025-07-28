// Contract addresses for Village Digital Wallet

// Replace these addresses with the ones from your deployment
export const CONTRACT_ADDRESSES = {
  alfajores: {
    // Test network
    savingsGroup: "0x...", // Replace with your SavingsGroup address after deployment
    microloanSystem: "0x..."  // Replace with your MicroloanSystem address after deployment
  },
  celo: {
    // Mainnet - only update after production deployment
    savingsGroup: "",
    microloanSystem: ""
  }
};

// Export a function to get the correct addresses based on the network
export function getContractAddresses(networkName) {
  return CONTRACT_ADDRESSES[networkName] || CONTRACT_ADDRESSES.alfajores;
}
