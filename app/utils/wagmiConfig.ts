"use client";

import { createConfig, http } from 'wagmi';
import { celo, celoAlfajores } from 'wagmi/chains';
import { metaMask, walletConnect, injected } from 'wagmi/connectors';

// Create WalletConnect projectId (for demo purposes, use a placeholder)
const projectId = 'village-digital-wallet-demo';

export const wagmiConfig = createConfig({
  chains: [celoAlfajores, celo],
  connectors: [
    metaMask(),
    walletConnect({ projectId }),
    injected(),
  ],
  transports: {
    [celoAlfajores.id]: http('https://alfajores-forno.celo-testnet.org'),
    [celo.id]: http('https://forno.celo.org'),
  },
});

export { celoAlfajores, celo };
