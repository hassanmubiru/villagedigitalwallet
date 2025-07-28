import { useEffect, createContext, useContext, useState, ReactNode } from 'react';
import { getCeloKit, getCeloTokenAddresses } from '../lib/celoUtils';
import { ContractKit } from '@celo/contractkit';

// Create context for Celo interactions
interface CeloContextType {
  kit: ContractKit | null;
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
  const [kit, setKit] = useState<ContractKit | null>(null);
  const [network, setNetwork] = useState<'alfajores' | 'mainnet'>(initialNetwork);
  const [tokenAddresses, setTokenAddresses] = useState(getCeloTokenAddresses(initialNetwork));
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  // Initialize kit when network changes
  useEffect(() => {
    const initializeKit = async () => {
      try {
        const newKit = getCeloKit(network);
        setKit(newKit);
        setTokenAddresses(getCeloTokenAddresses(network));
      } catch (error) {
        console.error('Failed to initialize ContractKit:', error);
      }
    };

    initializeKit();
  }, [network]);

  // Connect function to be used with wallet providers
  const connect = async () => {
    if (!kit || connecting) return;
    
    setConnecting(true);
    
    try {
      // This implementation will be replaced by the actual wallet connection
      // Currently just a placeholder as actual connection will be handled by ThirdwebProvider
      
      // Once connected, you would get the account like this:
      // const accounts = await kit.web3.eth.getAccounts();
      // if (accounts && accounts[0]) {
      //   setAddress(accounts[0]);
      //   setConnected(true);
      // }
      
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
    setNetwork,
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
