'use client'

import { ConnectButton, useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react"
import { client, supportedChains } from "../providers/ThirdwebProvider"
import { createWallet } from "thirdweb/wallets"
import WalletDebugInfo from "./WalletDebugInfo"

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      isConnected?: () => boolean
      chainId?: string
      networkVersion?: string
      request?: (args: { method: string; params?: any[] }) => Promise<any>
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

  // Check if MetaMask is available
  const isMetaMaskAvailable = typeof window !== 'undefined' && !!window.ethereum?.isMetaMask

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
        </div>
        
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
      
      <WalletDebugInfo />
    </div>
  )
}
