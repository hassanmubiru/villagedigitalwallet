// Contract addresses for deployed Village Digital Wallet contracts
export const CONTRACT_ADDRESSES = {
  alfajores: {
    SavingsGroup: '', // Will be updated after deployment
    MicroloanSystem: '', // Will be updated after deployment
  },
  celo: {
    SavingsGroup: '', // For mainnet deployment
    MicroloanSystem: '', // For mainnet deployment
  }
};

// Network configurations
export const NETWORK_CONFIG = {
  alfajores: {
    chainId: 44787,
    name: 'Celo Alfajores Testnet',
    rpcUrl: 'https://alfajores-forno.celo-testnet.org',
    explorerUrl: 'https://alfajores.celoscan.io',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18,
    },
  },
  celo: {
    chainId: 42220,
    name: 'Celo Mainnet',
    rpcUrl: 'https://forno.celo.org',
    explorerUrl: 'https://celoscan.io',
    nativeCurrency: {
      name: 'Celo',
      symbol: 'CELO',
      decimals: 18,
    },
  },
};

// Get current network
export const getCurrentNetwork = () => {
  return process.env.NODE_ENV === 'production' ? 'celo' : 'alfajores';
};

// Get contract address for current network
export const getContractAddress = (contractName: string) => {
  const network = getCurrentNetwork();
  return CONTRACT_ADDRESSES[network as keyof typeof CONTRACT_ADDRESSES]?.[contractName as keyof typeof CONTRACT_ADDRESSES.alfajores];
};
