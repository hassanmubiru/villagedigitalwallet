// Contract addresses for Village Digital Wallet

// Contract addresses from deployment on July 28, 2025
export const CONTRACT_ADDRESSES = {
  alfajores: {
    // Test network - these addresses will be updated after successful deployment
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
