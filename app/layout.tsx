import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThirdwebProvider } from './providers/ThirdwebProvider'
import { CeloProvider } from './providers/CeloProvider'
import { LanguageProvider } from './providers/LanguageProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Village Digital Wallet',
  description: 'A mobile-first blockchain-powered digital wallet for rural communities with savings groups, microloans, and mobile money integration on Celo',
  keywords: ['Celo', 'DeFi', 'Mobile Money', 'Savings Groups', 'Microloans', 'ROSCA', 'Village Banking'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get initial network from environment variable or default to 'alfajores'
  const initialNetwork = (process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'alfajores') as 'alfajores' | 'mainnet';

  return (
    <html lang="en">
      <body className={inter.className}>
        <CeloProvider initialNetwork={initialNetwork}>
          <ThirdwebProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </ThirdwebProvider>
        </CeloProvider>
      </body>
    </html>
  )
}
