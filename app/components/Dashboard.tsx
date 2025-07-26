'use client'

import { useState } from 'react'
import { useLanguage } from '../providers/LanguageProvider'
import { useActiveAccount } from 'thirdweb/react'
import { 
  Home, 
  Users, 
  CreditCard, 
  Wallet, 
  User, 
  Plus,
  TrendingUp,
  Clock,
  Award,
  Bell
} from 'lucide-react'

interface DashboardProps {
  currentView: string
  setCurrentView: (view: string) => void
}

export default function Dashboard({ currentView, setCurrentView }: DashboardProps) {
  const { t, language } = useLanguage()
  const account = useActiveAccount()
  
  // Mock data - in a real app, this would come from your backend/blockchain
  const [userStats] = useState({
    totalSavings: '1,250.00',
    activeGroups: 3,
    pendingLoans: 1,
    rewardsEarned: '45.50',
    reputation: 95
  })

  const [recentActivity] = useState([
    {
      id: '1',
      type: 'contribution',
      description: 'Village Farmers Group - Monthly Contribution',
      amount: '50.00',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      type: 'payout',
      description: 'Women\'s Savings Circle - Payout Received',
      amount: '500.00',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      type: 'loan_payment',
      description: 'Mikopo Group - Loan Payment',
      amount: '25.00',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  ])

  const [upcomingEvents] = useState([
    {
      id: '1',
      type: 'contribution_due',
      title: 'Village Farmers Group',
      description: 'Monthly contribution due',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      amount: '50.00'
    },
    {
      id: '2',
      type: 'payout_ready',
      title: 'Women\'s Savings Circle',
      description: 'Next payout available',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      amount: '600.00'
    }
  ])

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <Wallet className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {t('connectWallet')}
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Connect your wallet to access your village digital wallet and manage your savings groups and loans.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VW</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  Village Wallet
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <span className="ml-2 text-sm text-gray-700">
                  {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.totalSavings} CELO</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Groups</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.activeGroups}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Loans</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.pendingLoans}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rewards</p>
                <p className="text-2xl font-bold text-gray-900">{userStats.rewardsEarned} CELO</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'contribution' ? 'bg-green-100' :
                        activity.type === 'payout' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {activity.type === 'contribution' && <TrendingUp className="w-5 h-5 text-green-600" />}
                        {activity.type === 'payout' && <Wallet className="w-5 h-5 text-blue-600" />}
                        {activity.type === 'loan_payment' && <CreditCard className="w-5 h-5 text-purple-600" />}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        activity.type === 'payout' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {activity.type === 'payout' ? '+' : '-'}{activity.amount} CELO
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Events</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {event.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {event.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {event.amount} CELO
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setCurrentView('savings')}
              className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Join Group</p>
            </button>

            <button
              onClick={() => setCurrentView('loans')}
              className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Request Loan</p>
            </button>

            <button
              onClick={() => setCurrentView('wallet')}
              className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Send Money</p>
            </button>

            <button
              onClick={() => setCurrentView('profile')}
              className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">Profile</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
