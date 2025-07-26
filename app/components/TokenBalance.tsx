'use client'

import { useActiveAccount, useWalletBalance } from "thirdweb/react"
import { client } from "../providers/ThirdwebProvider"
import { celo } from "thirdweb/chains"
import { defineChain } from "thirdweb/chains"

// Define Celo Alfajores testnet
const celoAlfajores = defineChain({
  id: 44787,
  name: "Celo Alfajores",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpc: "https://alfajores-forno.celo-testnet.org",
})
import { useState, useEffect } from "react"

export default function TokenBalance() {
  const account = useActiveAccount()
  const [selectedChain, setSelectedChain] = useState(celoAlfajores)
  
  // Get CELO balance
  const { data: celoBalance, isLoading: celoLoading } = useWalletBalance({
    client,
    chain: selectedChain,
    address: account?.address,
  })

  if (!account) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Connect your wallet to view balance</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Chain Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Network:
        </label>
        <select
          value={selectedChain.id}
          onChange={(e) => {
            const chainId = parseInt(e.target.value)
            setSelectedChain(chainId === celo.id ? celo : celoAlfajores)
          }}
          className="input"
        >
          <option value={celoAlfajores.id}>Celo Alfajores (Testnet)</option>
          <option value={celo.id}>Celo Mainnet</option>
        </select>
      </div>

      {/* Balance Display */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          {selectedChain.name} Balance
        </h3>
        
        {celoLoading ? (
          <div className="flex items-center space-x-2">
            <div className="spinner"></div>
            <span className="text-blue-600">Loading balance...</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">CELO:</span>
              <span className="font-mono text-lg text-blue-800">
                {celoBalance ? `${celoBalance.displayValue} ${celoBalance.symbol}` : '0 CELO'}
              </span>
            </div>
            {celoBalance && BigInt(celoBalance.value) > BigInt(0) && (
              <p className="text-sm text-blue-600">
                ≈ ${((parseFloat(celoBalance.displayValue) * 0.5).toFixed(4))} USD
              </p>
            )}
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="text-sm text-gray-600">
        <p>
          <strong>Address:</strong> {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </p>
        <p>
          <strong>Chain ID:</strong> {selectedChain.id}
        </p>
      </div>
    </div>
  )
}
