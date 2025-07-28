'use client'

import { ThirdwebProvider as Provider } from "thirdweb/react"
import { createThirdwebClient, defineChain } from "thirdweb"

// Define Celo chains
const celo = defineChain({
  id: 42220,
  name: "Celo",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpc: "https://forno.celo.org",
  explorers: ["https://explorer.celo.org"],
});

const celoAlfajores = defineChain({
  id: 44787,
  name: "Celo Alfajores",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpc: "https://alfajores-forno.celo-testnet.org",
  explorers: ["https://alfajores-blockscout.celo-testnet.org"],
  testnet: true,
});

// Create the thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "11cd270615f1968861313dbd6d968954"
});

export function ThirdwebProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "11cd270615f1968861313dbd6d968954"}
      activeChain={celoAlfajores}
    >
      {children}
    </Provider>
  );
}