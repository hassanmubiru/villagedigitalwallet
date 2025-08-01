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
      on?: (eventName: string, callback: any) => void
      removeListener?: (eventName: string, callback: any) => void
      // Add more Ethereum provider methods as needed
    }
  }
}

export default function WalletDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return // Don't run on server
    
    const checkWalletStatus = async () => {
      const info: any = {
        hasMetaMask: !!window.ethereum?.isMetaMask,
        hasWindow: true,
        userAgent: navigator.userAgent,
        clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
        timestamp: new Date().toISOString(),
        mobileDevice: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        browser: detectBrowser(navigator.userAgent)
      }

      if (window.ethereum) {
        // Get chain ID in decimal if available
        const chainIdHex = window.ethereum.chainId;
        const chainIdDecimal = chainIdHex ? parseInt(chainIdHex, 16) : null;
        
        // Check if on Celo networks
        const isCeloAlfajores = chainIdDecimal === 44787;
        const isCeloMainnet = chainIdDecimal === 42220;
        
        info.ethereumProviders = {
          isMetaMask: window.ethereum.isMetaMask,
          isConnected: window.ethereum.isConnected ? window.ethereum.isConnected() : false,
          chainId: window.ethereum.chainId,
          chainIdDecimal: chainIdDecimal,
          networkVersion: window.ethereum.networkVersion,
          isCeloNetwork: isCeloAlfajores || isCeloMainnet,
          networkName: getNetworkName(chainIdDecimal),
          hasBasicEthereumMethods: !!(
            window.ethereum.request && 
            window.ethereum.on && 
            window.ethereum.removeListener
          )
        }
        
        // Try to get accounts if connected
        try {
          if (window.ethereum.request) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            info.ethereumProviders.accounts = accounts;
            info.ethereumProviders.hasAccounts = accounts && accounts.length > 0;
          }
        } catch (err) {
          info.ethereumProviders.accountError = (err as Error).message;
        }
      }

      setDebugInfo(info)
    }
    
    // Helper function to detect browser
    const detectBrowser = (userAgent: string): string => {
      if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
      if (userAgent.indexOf('Safari') > -1) return 'Safari';
      if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
      if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) return 'IE';
      if (userAgent.indexOf('Edge') > -1) return 'Edge';
      if (userAgent.indexOf('Opera') > -1) return 'Opera';
      return 'Unknown';
    }
    
    // Helper function to get network name
    const getNetworkName = (chainId: number | null): string => {
      if (!chainId) return 'Unknown';
      
      const networks: Record<number, string> = {
        1: 'Ethereum Mainnet',
        42220: 'Celo Mainnet',
        44787: 'Celo Alfajores Testnet',
        3: 'Ropsten',
        4: 'Rinkeby',
        5: 'Goerli',
        42: 'Kovan',
        56: 'BSC Mainnet',
        97: 'BSC Testnet',
        137: 'Polygon Mainnet',
        80001: 'Polygon Mumbai'
      };
      
      return networks[chainId] || `Unknown (${chainId})`;
    }

    checkWalletStatus()
  }, [isClient])
  
  // Helper function to detect browser
  const detectBrowser = (userAgent: string): string => {
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) return 'IE';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    if (userAgent.indexOf('Opera') > -1) return 'Opera';
    return 'Unknown';
  }
  
  // Helper function to get network name
  const getNetworkName = (chainId: number | null): string => {
    if (!chainId) return 'Unknown';
    
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      42220: 'Celo Mainnet',
      44787: 'Celo Alfajores Testnet',
      3: 'Ropsten',
      4: 'Rinkeby',
      5: 'Goerli',
      42: 'Kovan',
      56: 'BSC Mainnet',
      97: 'BSC Testnet',
      137: 'Polygon Mainnet',
      80001: 'Polygon Mumbai'
    };
    
    return networks[chainId] || `Unknown (${chainId})`;
  }
  
  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg text-xs">
        <h4 className="font-bold mb-2">
          Loading debug info...
        </h4>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg text-xs">
      <h4 className="font-bold mb-2 flex justify-between">
        <span>Wallet Debug Info:</span>
        <span className="text-gray-500">{new Date().toLocaleTimeString()}</span>
      </h4>
      
      {/* Environment Info */}
      <div className="mb-3">
        <div className="font-medium text-gray-700 mb-1">Environment</div>
        <div className="bg-white p-2 rounded">
          <div className="grid grid-cols-2 gap-1">
            <div>Browser:</div>
            <div className="font-mono">{debugInfo.browser}</div>
            <div>Mobile Device:</div>
            <div className="font-mono">{debugInfo.mobileDevice?.toString() || 'false'}</div>
            <div>Thirdweb Client ID:</div>
            <div className="font-mono truncate">{debugInfo.clientId || 'Not set'}</div>
          </div>
        </div>
      </div>
      
      {/* Ethereum Provider Info */}
      {debugInfo.ethereumProviders && (
        <div className="mb-3">
          <div className="font-medium text-gray-700 mb-1">Ethereum Provider</div>
          <div className="bg-white p-2 rounded">
            <div className="grid grid-cols-2 gap-1">
              <div>MetaMask:</div>
              <div className="font-mono">{debugInfo.hasMetaMask?.toString()}</div>
              <div>Connected:</div>
              <div className="font-mono">{debugInfo.ethereumProviders?.isConnected?.toString()}</div>
              <div>Network:</div>
              <div className="font-mono">{debugInfo.ethereumProviders?.networkName}</div>
              <div>Chain ID:</div>
              <div className="font-mono">{debugInfo.ethereumProviders?.chainId} ({debugInfo.ethereumProviders?.chainIdDecimal})</div>
              <div>Is Celo Network:</div>
              <div className={`font-mono ${debugInfo.ethereumProviders?.isCeloNetwork ? 'text-green-600' : 'text-red-600'}`}>
                {debugInfo.ethereumProviders?.isCeloNetwork?.toString()}
              </div>
              {debugInfo.ethereumProviders?.hasAccounts && (
                <>
                  <div>Connected Account:</div>
                  <div className="font-mono truncate">{debugInfo.ethereumProviders?.accounts?.[0]}</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Raw Data (collapsed) */}
      <details>
        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Show Raw Debug Data</summary>
        <pre className="whitespace-pre-wrap overflow-auto max-h-40 mt-2 bg-white p-2 rounded">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </details>
    </div>
  )
}
