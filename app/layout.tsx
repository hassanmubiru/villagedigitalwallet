import type { Metadata } from 'next'
import './globals.css'
import { ThirdwebProvider } from './providers/ThirdwebProvider'
import { LanguageProvider } from './providers/LanguageProvider'

export const metadata: Metadata = {
  title: 'Village Digital Wallet',
  description: 'A mobile-first blockchain-powered digital wallet for rural communities with savings groups, microloans, and mobile money integration on Celo',
  keywords: ['Celo', 'DeFi', 'Mobile Money', 'Savings Groups', 'Microloans', 'ROSCA', 'Village Banking'],
  icons: {
    icon: '/favicon.svg',
    apple: '/app-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ThirdwebProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThirdwebProvider>
      </body>
    </html>
  )
}
