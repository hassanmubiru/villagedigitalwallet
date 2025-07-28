import { useEffect, useState } from 'react';
import { useCelo } from '../providers/CeloProvider';
import celoService from '../services/celoService';

/**
 * Custom hook for interacting with contracts on Celo
 * @param contractType Either 'savingsGroup' or 'microloanSystem'
 * @returns Contract instance and helper functions
 */
export function useContract(contractType: 'savingsGroup' | 'microloanSystem') {
  const { kit, address, connected } = useCelo();
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadContract() {
      if (!connected || !kit || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (contractType === 'savingsGroup') {
          const instance = await celoService.getSavingsGroupContract();
          setContract(instance);
        } else {
          const instance = await celoService.getMicroloanSystemContract();
          setContract(instance);
        }
      } catch (err: any) {
        console.error(`Error loading ${contractType} contract:`, err);
        setError(err.message || 'Failed to load contract');
      } finally {
        setLoading(false);
      }
    }

    loadContract();
  }, [kit, address, connected, contractType]);

  return {
    contract,
    loading,
    error,
    refresh: async () => {
      setLoading(true);
      try {
        if (contractType === 'savingsGroup') {
          const instance = await celoService.getSavingsGroupContract();
          setContract(instance);
          setError(null);
        } else {
          const instance = await celoService.getMicroloanSystemContract();
          setContract(instance);
          setError(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to refresh contract');
      } finally {
        setLoading(false);
      }
    },
  };
}

/**
 * Custom hook for getting token balances on Celo
 * @param userAddress Optional address to get balances for. If not provided, uses connected address
 * @returns CELO, cUSD, and cEUR balances and loading state
 */
export function useTokenBalances(userAddress?: string) {
  const { address: connectedAddress, connected } = useCelo();
  const address = userAddress || connectedAddress;
  const [balances, setBalances] = useState({
    CELO: '0',
    cUSD: '0',
    cEUR: '0',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBalances() {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const tokenBalances = await celoService.getAllTokenBalances(address);
        setBalances(tokenBalances);
      } catch (err: any) {
        console.error('Error fetching token balances:', err);
        setError(err.message || 'Failed to fetch token balances');
      } finally {
        setLoading(false);
      }
    }

    fetchBalances();
  }, [address]);

  return {
    ...balances,
    loading,
    error,
    refreshBalances: async () => {
      if (!address) return;
      
      setLoading(true);
      try {
        const tokenBalances = await celoService.getAllTokenBalances(address);
        setBalances(tokenBalances);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to refresh balances');
      } finally {
        setLoading(false);
      }
    },
  };
}

/**
 * Custom hook for transaction history on Celo
 * @param limit Number of transactions to fetch (default: 10)
 * @param userAddress Optional address to get transactions for. If not provided, uses connected address
 * @returns Transaction history and loading state
 */
export function useTransactionHistory(limit = 10, userAddress?: string) {
  const { address: connectedAddress, connected } = useCelo();
  const address = userAddress || connectedAddress;
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTransactions() {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const history = await celoService.getTransactionHistory(address, limit);
        setTransactions(history);
      } catch (err: any) {
        console.error('Error fetching transaction history:', err);
        setError(err.message || 'Failed to fetch transaction history');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [address, limit]);

  return {
    transactions,
    loading,
    error,
    refreshHistory: async () => {
      if (!address) return;
      
      setLoading(true);
      try {
        const history = await celoService.getTransactionHistory(address, limit);
        setTransactions(history);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to refresh transaction history');
      } finally {
        setLoading(false);
      }
    },
  };
}
