'use client'

import { 
  Home, 
  Users, 
  CreditCard, 
  Wallet, 
  User,
  Settings,
  Globe,
  BarChart3,
  Shield,
  Store,
  QrCode,
  Leaf,
  CircleDollarSign,
  Vote,
  Zap
} from 'lucide-react'
import { useLanguage } from '../providers/LanguageProvider'
import { CompactLanguageSelector } from './LanguageSelector'

interface MobileNavigationProps {
  currentView: string
  setCurrentView: (view: string) => void
}

export default function MobileNavigation({ currentView, setCurrentView }: MobileNavigationProps) {
  const { t } = useLanguage()

  const navItems = [
    { id: 'dashboard', icon: Home, label: t('dashboard') },
    { id: 'savings', icon: Users, label: t('savings') },
    { id: 'loans', icon: CreditCard, label: t('loans') },
    { id: 'wallet', icon: Wallet, label: t('wallet') },
    { id: 'governance', icon: Vote, label: 'Governance' },
    { id: 'automation', icon: Zap, label: 'Automation' },
    { id: 'merchants', icon: Store, label: t('merchant_payments') },
  ]

  const moreItems = [
    { id: 'qr-payment', icon: QrCode, label: t('qr_payment') },
    { id: 'carbon', icon: Leaf, label: t('carbon_credits') },
    { id: 'analytics', icon: BarChart3, label: t('analytics') },
    { id: 'security', icon: Shield, label: t('security') },
    { id: 'profile', icon: User, label: t('profile') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ]

  return (
    <>
      {/* Top Language Selector - Mobile */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center lg:hidden">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-600">{t('language')}</span>
        </div>
        <CompactLanguageSelector />
        
        <div className="text-sm text-gray-600">
          Village Wallet
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-50">
        <div className="grid grid-cols-7 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                  isActive 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VW</span>
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">
              Village Wallet
            </span>
          </div>

          {/* Language Selector */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">{t('language')}</span>
              </div>
              <CompactLanguageSelector />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {/* Main Navigation Items */}
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-green-700 bg-green-100'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              )
            })}
            
            {/* Separator */}
            <div className="border-t border-gray-200 my-4"></div>
            
            {/* Additional Items */}
            {moreItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-green-700 bg-green-100'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Powered by Celo Blockchain
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
