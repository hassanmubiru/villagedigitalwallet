'use client'

import { useEffect, useState } from 'react'
import { useTokenBalances, useTransactionHistory } from '../hooks/useCeloContracts'
import { useCelo } from '../providers/CeloProvider'
import celoService from '../services/celoService'

interface CeloOverviewProps {
  address?: string;
}

export default function CeloOverview({ address: externalAddress }: CeloOverviewProps) {
  const { connect, address: celoAddress, connected, network } = useCelo()
  const userAddress = externalAddress || celoAddress || ""
  const { CELO, cUSD, cEUR, loading: balancesLoading, refreshBalances } = useTokenBalances(userAddress)
  const { transactions, loading: txLoading } = useTransactionHistory(5, userAddress)
  const [networkId, setNetworkId] = useState<number | null>(null)

  useEffect(() => {
    async function getNetworkInfo() {
      if (connected) {
        try {
          const id = await celoService.getNetworkId()
          setNetworkId(id)
        } catch (error) {
          console.error("Failed to get network ID:", error)
        }
      }
    }
    
    getNetworkInfo()
  }, [connected])

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Celo Network Overview</h2>
      
      {!connected ? (
        <div className="mb-6">
          <p className="text-gray-600 mb-4">Connect your wallet to see your Celo account details</p>
          <button
            onClick={() => connect()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-medium text-green-800 mb-2">Connected Account</h3>
            <p className="font-mono text-sm text-green-700 break-all">{userAddress}</p>
            <p className="text-sm text-green-600 mt-1">Network: {network} {networkId && `(ID: ${networkId})`}</p>
          </div>
          
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Token Balances</h3>
              <button 
                onClick={refreshBalances}
                className="text-sm text-blue-500 hover:text-blue-700"
                disabled={balancesLoading}
              >
                {balancesLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-md bg-yellow-50 border-yellow-200">
                <p className="text-sm text-yellow-700">CELO</p>
                <p className="font-medium text-lg">{balancesLoading ? '...' : CELO}</p>
              </div>
              <div className="p-4 border rounded-md bg-green-50 border-green-200">
                <p className="text-sm text-green-700">cUSD</p>
                <p className="font-medium text-lg">{balancesLoading ? '...' : cUSD}</p>
              </div>
              <div className="p-4 border rounded-md bg-blue-50 border-blue-200">
                <p className="text-sm text-blue-700">cEUR</p>
                <p className="font-medium text-lg">{balancesLoading ? '...' : cEUR}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-3">Recent Transactions</h3>
            {txLoading ? (
              <p className="text-gray-500">Loading transactions...</p>
            ) : transactions.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hash</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Block</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((tx, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm font-mono text-blue-600 truncate">
                          <a 
                            href={celoService.getExplorerUrl(tx.hash)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {tx.hash.substring(0, 10)}...
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{tx.blockNumber}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          {tx.formattedValue ? `${tx.formattedValue} CELO` : '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No transactions found</p>
            )}
          </div>
        </>
      )}
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Explorer: <a 
          href={celoService.getExplorerUrl()} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {network === 'alfajores' ? 'Alfajores Celoscan' : 'Celoscan'}
        </a></p>
      </div>
    </div>
  )
}
