import { useEffect, useState } from 'react'

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

export default function WalletDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const checkWalletStatus = () => {
      const info: any = {
        hasMetaMask: typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
        hasWindow: typeof window !== 'undefined',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
        timestamp: new Date().toISOString()
      }

      if (typeof window !== 'undefined' && window.ethereum) {
        info.ethereumProviders = {
          isMetaMask: window.ethereum.isMetaMask,
          isConnected: window.ethereum.isConnected ? window.ethereum.isConnected() : false,
          chainId: window.ethereum.chainId,
          networkVersion: window.ethereum.networkVersion,
        }
      }

      setDebugInfo(info)
    }

    checkWalletStatus()
  }, [])

  return (
    <div className="bg-gray-100 p-4 rounded-lg text-xs">
      <h4 className="font-bold mb-2">Wallet Debug Info:</h4>
      <pre className="whitespace-pre-wrap overflow-auto max-h-40">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}
