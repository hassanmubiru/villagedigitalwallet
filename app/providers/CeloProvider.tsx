'use client'

import { createContext, useContext, useState, ReactNode } from 'react';

// Create context for Celo interactions
interface CeloContextType {
  kit: any | null;
  network: 'alfajores' | 'mainnet';
  setNetwork: (network: 'alfajores' | 'mainnet') => void;
  tokenAddresses: {
    cUSD: string;
    CELO: string;
    cEUR: string;
  };
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  address: string | null;
}

// Helper function to get token addresses
function getCeloTokenAddresses(network: 'alfajores' | 'mainnet') {
  if (network === 'mainnet') {
    return {
      cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
      CELO: '0x471EcE3750Da237f93B8E339c536989b8978a438',
      cEUR: '0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73',
    };
  } else {
    // Alfajores testnet addresses
    return {
      cUSD: '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1',
      CELO: '0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9',
      cEUR: '0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F',
    };
  }
}

const defaultContext: CeloContextType = {
  kit: null,
  network: 'alfajores',
  setNetwork: () => {},
  tokenAddresses: {
    cUSD: '',
    CELO: '',
    cEUR: '',
  },
  connected: false,
  connecting: false,
  connect: async () => {},
  address: null,
};

const CeloContext = createContext<CeloContextType>(defaultContext);

export const useCelo = () => useContext(CeloContext);

interface CeloProviderProps {
  children: ReactNode;
  initialNetwork?: 'alfajores' | 'mainnet';
}

export function CeloProvider({ 
  children, 
  initialNetwork = 'alfajores' 
}: CeloProviderProps) {
  const [kit, setKit] = useState<any | null>(null);
  const [network, setNetwork] = useState<'alfajores' | 'mainnet'>(initialNetwork);
  const [tokenAddresses, setTokenAddresses] = useState(getCeloTokenAddresses(initialNetwork));
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  // Update token addresses when network changes
  const handleNetworkChange = (newNetwork: 'alfajores' | 'mainnet') => {
    setNetwork(newNetwork);
    setTokenAddresses(getCeloTokenAddresses(newNetwork));
  };

  // Connect function to be used with wallet providers
  const connect = async () => {
    if (connecting) return;
    
    setConnecting(true);
    
    try {
      // This implementation will be replaced by the actual wallet connection
      // Currently just a placeholder as actual connection will be handled by ThirdwebProvider
      console.log('Wallet connection would happen here, but is handled by ThirdwebProvider');
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const contextValue: CeloContextType = {
    kit,
    network,
    setNetwork: handleNetworkChange,
    tokenAddresses,
    connected,
    connecting,
    connect,
    address,
  };

  return (
    <CeloContext.Provider value={contextValue}>
      {children}
    </CeloContext.Provider>
  );
}
