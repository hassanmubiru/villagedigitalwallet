// Import the auto-generated contract addresses
import { contractAddresses as addresses } from '../lib/contractAddresses';

/**
 * Get contract addresses for the specified network
 * @param {string} networkName - 'alfajores' or 'celo'
 * @returns Contract addresses for the network
 */
export function getContractAddresses(networkName = 'alfajores') {
  return addresses[networkName] || addresses.alfajores;
}

// Re-export the addresses object for direct access
export const CONTRACT_ADDRESSES = addresses;
