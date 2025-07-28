/**
 * Helper functions to add Celo networks to MetaMask
 */

// Network parameters for Celo Mainnet
const CELO_MAINNET = {
  chainId: '0xa4ec',
  chainName: 'Celo Mainnet',
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
    decimals: 18
  },
  rpcUrls: ['https://forno.celo.org'],
  blockExplorerUrls: ['https://explorer.celo.org/'],
  iconUrls: ['https://celostatic.b-cdn.net/celo-logo.png']
};

// Network parameters for Celo Alfajores (testnet)
const CELO_ALFAJORES = {
  chainId: '0xaef3',
  chainName: 'Celo Alfajores Testnet',
  nativeCurrency: {
    name: 'CELO',
    symbol: 'CELO',
    decimals: 18
  },
  rpcUrls: ['https://alfajores-forno.celo-testnet.org'],
  blockExplorerUrls: ['https://alfajores.celoscan.io/'],
  iconUrls: ['https://celostatic.b-cdn.net/celo-logo.png']
};

/**
 * Add Celo network to MetaMask
 * @param {boolean} testnet Whether to add testnet or mainnet
 * @returns {Promise<boolean>} Success status
 */
export async function addCeloToMetaMask(testnet = true): Promise<boolean> {
  if (!window.ethereum || !window.ethereum.request) {
    console.error('MetaMask is not installed!');
    return false;
  }

  try {
    // Request to add the network
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [testnet ? CELO_ALFAJORES : CELO_MAINNET]
    });
    
    return true;
  } catch (error) {
    console.error('Failed to add Celo network to MetaMask:', error);
    return false;
  }
}

/**
 * Switch to Celo network in MetaMask
 * @param {boolean} testnet Whether to switch to testnet or mainnet
 * @returns {Promise<boolean>} Success status
 */
export async function switchToCeloNetwork(testnet = true): Promise<boolean> {
  if (!window.ethereum || !window.ethereum.request) {
    console.error('MetaMask is not installed!');
    return false;
  }

  const chainId = testnet ? CELO_ALFAJORES.chainId : CELO_MAINNET.chainId;

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });
    
    return true;
  } catch (error: any) {
    // Error code 4902 means the chain hasn't been added yet
    if (error.code === 4902) {
      try {
        await addCeloToMetaMask(testnet);
        return true;
      } catch (addError) {
        console.error('Failed to add Celo network:', addError);
        return false;
      }
    }
    console.error('Failed to switch to Celo network:', error);
    return false;
  }
}

export default {
  addCeloToMetaMask,
  switchToCeloNetwork
};
