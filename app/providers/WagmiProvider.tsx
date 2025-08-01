"use client";

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../utils/wagmiConfig';

const queryClient = new QueryClient();

interface WagmiAppProviderProps {
  children: React.ReactNode;
}

export function WagmiAppProvider({ children }: WagmiAppProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
