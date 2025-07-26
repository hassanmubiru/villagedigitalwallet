'use client'

import { ConnectButton, useActiveAccount, useActiveWallet, useDisconnect } from "thirdweb/react"
import { client, supportedChains } from "../providers/ThirdwebProvider"
import { createWallet } from "thirdweb/wallets"

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.zerion.wallet"),
]

export default function WalletConnect() {
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const { disconnect } = useDisconnect()

  if (account) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 mb-2">
            <strong>Connected Account:</strong>
          </p>
          <p className="font-mono text-sm text-green-800 break-all">
            {account.address}
          </p>
        </div>
        
        <button
          onClick={() => wallet && disconnect(wallet)}
          className="btn btn-secondary w-full"
        >
          Disconnect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm mb-4">
        Connect your wallet to start using the Village Digital Wallet. 
        We support MetaMask, Coinbase Wallet, and other popular wallets.
      </p>
      
      <ConnectButton
        client={client}
        wallets={wallets}
        chains={supportedChains}
        connectModal={{
          size: "wide",
        }}
        connectButton={{
          label: "Connect Wallet",
          className: "btn btn-primary w-full",
        }}
      />
    </div>
  )
}
