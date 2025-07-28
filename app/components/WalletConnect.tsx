'use client'

import { ConnectButton, useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react"
import { client, supportedChains } from "../providers/ThirdwebProvider"
import { createWallet } from "thirdweb/wallets"
import { useEffect, useState } from "react"
import celoService from "../services/celoService"
import { switchToCeloNetwork } from "../utils/networkHelpers"

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      isConnected?: () => boolean
      chainId?: string
      networkVersion?: string
      request?: (args: { method: string; params?: any[] }) => Promise<any>
      on?: (eventName: string, callback: any) => void
      removeListener?: (eventName: string, callback: any) => void
      // Add more Ethereum provider methods as needed
    }
  }
}

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"), 
  createWallet("me.rainbow"),
  createWallet("io.zerion.wallet"),
  createWallet("com.trustwallet.app"),
]

export default function WalletConnect() {
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const { disconnect } = useDisconnect()
  const [isCeloNetwork, setIsCeloNetwork] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if MetaMask is available
  const isMetaMaskAvailable = typeof window !== 'undefined' && !!window.ethereum?.isMetaMask
  
  // Connect to Celo network when wallet is connected
  useEffect(() => {
    async function connectToCelo() {
      if (account && wallet && window.ethereum) {
        try {
          // Check if on Celo network already
          const chainId = parseInt(window.ethereum.chainId || '0x0', 16)
          const isCeloAlfajores = chainId === 44787 // 0xaef3
          const isCeloMainnet = chainId === 42220 // 0xa4ec
          
          setIsCeloNetwork(isCeloAlfajores || isCeloMainnet)
          
          if (isCeloAlfajores || isCeloMainnet) {
            // Connect to Celo using the window.ethereum provider
            await celoService.connectWithWallet(
              account.address, 
              window.ethereum
            )
            console.log("Connected to Celo network")
          }
        } catch (error) {
          console.error("Failed to connect to Celo network:", error)
        }
      }
    }
    
    connectToCelo()
    
    // Listen for chain changes
    if (window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        const chainIdNum = parseInt(chainId, 16)
        setIsCeloNetwork(chainIdNum === 44787 || chainIdNum === 42220)
      }
      
      window.ethereum.on('chainChanged', handleChainChanged)
      
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [account, wallet])
  
  // Function to switch to Celo Alfajores testnet
  const handleSwitchNetwork = async () => {
    setIsLoading(true)
    try {
      await switchToCeloNetwork(true) // true for testnet
      setIsCeloNetwork(true)
    } catch (error) {
      console.error("Failed to switch to Celo network:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (account) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 mb-2">
            <strong>✅ Connected Account:</strong>
          </p>
          <p className="font-mono text-sm text-green-800 break-all">
            {account.address}
          </p>
          {wallet && (
            <p className="text-xs text-green-600 mt-1">
              Connected via {wallet.id}
            </p>
          )}
          
          {!isCeloNetwork && (
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
              <p className="text-xs text-yellow-800">
                ⚠️ Not connected to Celo network
              </p>
            </div>
          )}
        </div>
        
        {!isCeloNetwork && (
          <button
            onClick={handleSwitchNetwork}
            disabled={isLoading}
            className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg transition-colors mb-2"
          >
            {isLoading ? 'Switching...' : 'Switch to Celo Network'}
          </button>
        )}
        
        <button
          onClick={() => wallet && disconnect(wallet)}
          className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Disconnect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!isMetaMaskAvailable && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 mb-2">
            <strong>⚠️ MetaMask Not Detected</strong>
          </p>
          <p className="text-xs text-yellow-700">
            Please install MetaMask browser extension to connect your wallet.{' '}
            <a 
              href="https://metamask.io/download/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-yellow-900"
            >
              Download MetaMask
            </a>
          </p>
        </div>
      )}
      
      <p className="text-gray-600 text-sm mb-4">
        Connect your wallet to start using the Village Digital Wallet. 
        We support MetaMask, Coinbase Wallet, Trust Wallet, and other popular wallets.
      </p>
      
      <ConnectButton
        client={client}
        wallets={wallets}
        chains={supportedChains}
        connectModal={{
          size: "wide",
          title: "Connect Your Wallet",
          showThirdwebBranding: false,
        }}
        connectButton={{
          label: "Connect Wallet",
          className: "w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors",
        }}
      />
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Don&apos;t have a wallet? Install MetaMask or another supported wallet from their official website.</p>
      </div>
    </div>
  )
}
