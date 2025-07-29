'use client'

import { ThirdwebProvider as Provider } from "thirdweb/react"
import { createThirdwebClient } from "thirdweb"
import { useCelo } from "./CeloProvider"
import { useEffect, useState } from "react"
import { celo } from "thirdweb/chains"
import { defineChain } from "thirdweb/chains"

// Define Celo Alfajores testnet
const celoAlfajores = defineChain({
  id: 44787,
  name: "Celo Alfajores",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpc: "https://alfajores-forno.celo-testnet.org",
});

// Create the thirdweb client
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "11cd270615f1968861313dbd6d968954"
});

// Export the supported chains for use in other components
export const supportedChains = [celoAlfajores, celo];

export function ThirdwebProvider({ children }: { children: React.ReactNode }) {
  const { network } = useCelo();
  const [activeChain, setActiveChain] = useState(celoAlfajores);
  
  // Update active chain when Celo network changes
  useEffect(() => {
    setActiveChain(network === 'mainnet' ? celo : celoAlfajores);
  }, [network]);
  
  return (
    <Provider>
      {children}
    </Provider>
  );
}