'use client'

import { useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { LanguageProvider } from '../providers/LanguageProvider'

// Components
import WalletConnect from './WalletConnect'
import Dashboard from './Dashboard'
import SavingsGroups from './SavingsGroups'
import EnhancedSavingsGroups from './EnhancedSavingsGroups'
import Loans from './Loans'
import TransferForm from './TransferForm'
import TokenBalance from './TokenBalance'
import CashInOut from './CashInOut'
import MobileNavigation from './MobileNavigation'
import EnhancedSecurity from './EnhancedSecurity'
import AnalyticsDashboard from './analytics/AnalyticsDashboard'

// Profile component (simplified)
function Profile() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600">Profile management coming soon...</p>
        </div>
      </div>
    </div>
  )
}

// Enhanced Wallet component
function EnhancedWallet() {
  const [walletTab, setWalletTab] = useState<'balance' | 'transfer' | 'cash'>('balance')

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Wallet</h1>
        
        {/* Wallet Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setWalletTab('balance')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              walletTab === 'balance'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Balance
          </button>
          <button
            onClick={() => setWalletTab('transfer')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              walletTab === 'transfer'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Transfer
          </button>
          <button
            onClick={() => setWalletTab('cash')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              walletTab === 'cash'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cash In/Out
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {walletTab === 'balance' && <TokenBalance />}
          {walletTab === 'transfer' && <TransferForm />}
          {walletTab === 'cash' && <CashInOut />}
        </div>
      </div>
    </div>
  )
}

export default function VillageWalletApp() {
  const [currentView, setCurrentView] = useState('dashboard')
  const account = useActiveAccount()

  const renderCurrentView = () => {
    if (!account) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">VW</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Village Digital Wallet
              </h1>
              <p className="text-gray-600 mb-8">
                Empowering rural communities through accessible DeFi tools on Celo blockchain
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <WalletConnect />
            </div>

            {/* Features Preview */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/50 rounded-lg p-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-green-600 font-bold">💰</span>
                </div>
                <h3 className="font-medium text-gray-900">Savings Groups</h3>
                <p className="text-sm text-gray-600">Community ROSCAs</p>
              </div>
              
              <div className="bg-white/50 rounded-lg p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-bold">🏦</span>
                </div>
                <h3 className="font-medium text-gray-900">Microloans</h3>
                <p className="text-sm text-gray-600">Accessible credit</p>
              </div>
              
              <div className="bg-white/50 rounded-lg p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-purple-600 font-bold">📱</span>
                </div>
                <h3 className="font-medium text-gray-900">Mobile Money</h3>
                <p className="text-sm text-gray-600">Easy cash in/out</p>
              </div>
              
              <div className="bg-white/50 rounded-lg p-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-yellow-600 font-bold">🏆</span>
                </div>
                <h3 className="font-medium text-gray-900">Rewards</h3>
                <p className="text-sm text-gray-600">Earn tokens</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Render views based on current selection
    switch (currentView) {
      case 'dashboard':
        return <Dashboard currentView={currentView} setCurrentView={setCurrentView} />
      case 'savings':
        return <EnhancedSavingsGroups />
      case 'loans':
        return <Loans />
      case 'wallet':
        return <EnhancedWallet />
      case 'analytics':
        return <AnalyticsDashboard />
      case 'security':
        return <EnhancedSecurity />
      case 'profile':
        return <Profile />
      default:
        return <Dashboard currentView={currentView} setCurrentView={setCurrentView} />
    }
  }

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Navigation */}
        <MobileNavigation currentView={currentView} setCurrentView={setCurrentView} />
        
        {/* Main Content */}
        <div className="lg:pl-64">
          {renderCurrentView()}
        </div>
      </div>
    </LanguageProvider>
  )
}
