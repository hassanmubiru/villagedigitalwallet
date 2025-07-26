import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThirdwebProvider } from './providers/ThirdwebProvider'

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdwebProvider>
          {children}
        </ThirdwebProvider>
      </body>
    </html>
  )
}
