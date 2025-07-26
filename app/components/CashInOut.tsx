'use client'

import { useState } from 'react'
import { useLanguage } from '../providers/LanguageProvider'
import { useActiveAccount } from 'thirdweb/react'
import { 
  Smartphone, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Star,
  Phone
} from 'lucide-react'
import { CashInOutRequest, Agent } from '../types'

export default function CashInOut() {
  const { t } = useLanguage()
  const account = useActiveAccount()
  const [activeTab, setActiveTab] = useState<'cash-in' | 'cash-out'>('cash-in')
  const [selectedMethod, setSelectedMethod] = useState<'mobile_money' | 'agent'>('mobile_money')
  
  const [request, setRequest] = useState({
    amount: '',
    phoneNumber: '',
    agentId: ''
  })

  // Mock data for agents
  const [nearbyAgents] = useState<Agent[]>([
    {
      id: '1',
      name: 'John\'s Shop',
      phoneNumber: '+254712345678',
      address: 'Market Street, Nakuru',
      location: { latitude: -0.3031, longitude: 36.0800 },
      isActive: true,
      rating: 4.8,
      totalTransactions: 245
    },
    {
      id: '2',
      name: 'Mary\'s Kiosk',
      phoneNumber: '+254723456789',
      address: 'Main Road, Nakuru',
      location: { latitude: -0.3041, longitude: 36.0810 },
      isActive: true,
      rating: 4.6,
      totalTransactions: 189
    },
    {
      id: '3',
      name: 'Village Store',
      phoneNumber: '+254734567890',
      address: 'Bus Station, Nakuru',
      location: { latitude: -0.3021, longitude: 36.0790 },
      isActive: true,
      rating: 4.9,
      totalTransactions: 312
    }
  ])

  // Mock transaction history
  const [recentTransactions] = useState<CashInOutRequest[]>([
    {
      id: '1',
      userId: account?.address || '',
      type: 'cash_in',
      amount: '100.00',
      method: 'mobile_money',
      phoneNumber: '+254712345678',
      status: 'completed',
      createdAt: new Date('2024-07-20'),
      completedAt: new Date('2024-07-20')
    },
    {
      id: '2',
      userId: account?.address || '',
      type: 'cash_out',
      amount: '50.00',
      method: 'agent',
      agentId: '1',
      status: 'completed',
      createdAt: new Date('2024-07-18'),
      completedAt: new Date('2024-07-18')
    }
  ])

  const handleSubmitRequest = async () => {
    // In a real app, this would integrate with mobile money APIs
    console.log('Processing request:', {
      type: activeTab.replace('-', '_'),
      method: selectedMethod,
      ...request
    })
    
    // Reset form
    setRequest({
      amount: '',
      phoneNumber: '',
      agentId: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const MobileMoneyForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount (CELO)
        </label>
        <input
          type="number"
          step="0.01"
          value={request.amount}
          onChange={(e) => setRequest({ ...request, amount: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mobile Money Number
        </label>
        <input
          type="tel"
          value={request.phoneNumber}
          onChange={(e) => setRequest({ ...request, phoneNumber: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="+254712345678"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Smartphone className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Supported Networks:</p>
            <ul className="space-y-1">
              <li>• M-Pesa (Safaricom)</li>
              <li>• Airtel Money</li>
              <li>• Orange Money</li>
              <li>• T-Kash (Telkom)</li>
            </ul>
          </div>
        </div>
      </div>

      {activeTab === 'cash-in' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">How it works:</h4>
          <ol className="text-sm text-green-800 space-y-1">
            <li>1. Enter amount and mobile number</li>
            <li>2. You'll receive an SMS with payment instructions</li>
            <li>3. Complete payment on your mobile money app</li>
            <li>4. CELO tokens will be credited to your wallet</li>
          </ol>
        </div>
      )}

      {activeTab === 'cash-out' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-orange-900 mb-2">How it works:</h4>
          <ol className="text-sm text-orange-800 space-y-1">
            <li>1. Enter amount and mobile number</li>
            <li>2. CELO tokens will be deducted from your wallet</li>
            <li>3. You'll receive cash on your mobile money account</li>
            <li>4. Transaction usually completes in 1-5 minutes</li>
          </ol>
        </div>
      )}
    </div>
  )

  const AgentForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount (CELO)
        </label>
        <input
          type="number"
          step="0.01"
          value={request.amount}
          onChange={(e) => setRequest({ ...request, amount: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Agent
        </label>
        <div className="space-y-3">
          {nearbyAgents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => setRequest({ ...request, agentId: agent.id })}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                request.agentId === agent.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{agent.name}</h4>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {agent.address}
                  </p>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm text-gray-600">{agent.rating}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  {agent.phoneNumber}
                </span>
                <span>{agent.totalTransactions} transactions</span>
              </div>
              
              {agent.isActive && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                    Available
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {activeTab === 'cash-in' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">How it works:</h4>
          <ol className="text-sm text-green-800 space-y-1">
            <li>1. Select an agent and amount</li>
            <li>2. Visit the agent with cash</li>
            <li>3. Agent will transfer CELO to your wallet</li>
            <li>4. Show transaction confirmation to agent</li>
          </ol>
        </div>
      )}

      {activeTab === 'cash-out' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-orange-900 mb-2">How it works:</h4>
          <ol className="text-sm text-orange-800 space-y-1">
            <li>1. Select an agent and amount</li>
            <li>2. CELO tokens will be transferred to agent</li>
            <li>3. Visit agent to collect cash</li>
            <li>4. Agent fee: 1% of transaction amount</li>
          </ol>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cash In/Out</h1>
          <p className="text-gray-600">
            Convert between cash and CELO tokens using mobile money or local agents
          </p>
        </div>

        {/* Cash In/Out Toggle */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('cash-in')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
              activeTab === 'cash-in'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 mr-2" />
            Cash In
          </button>
          <button
            onClick={() => setActiveTab('cash-out')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center ${
              activeTab === 'cash-out'
                ? 'bg-white text-orange-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Cash Out
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Method Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Method</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedMethod('mobile_money')}
                className={`p-4 border rounded-lg text-center transition-all ${
                  selectedMethod === 'mobile_money'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Smartphone className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">Mobile Money</div>
                <div className="text-sm text-gray-600">M-Pesa, Airtel Money</div>
              </button>
              
              <button
                onClick={() => setSelectedMethod('agent')}
                className={`p-4 border rounded-lg text-center transition-all ${
                  selectedMethod === 'agent'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <div className="font-medium">Local Agent</div>
                <div className="text-sm text-gray-600">Visit nearby agent</div>
              </button>
            </div>
          </div>

          {/* Form */}
          {selectedMethod === 'mobile_money' ? <MobileMoneyForm /> : <AgentForm />}

          {/* Submit Button */}
          <button
            onClick={handleSubmitRequest}
            disabled={!request.amount || (selectedMethod === 'mobile_money' ? !request.phoneNumber : !request.agentId)}
            className={`w-full py-3 px-4 rounded-lg font-medium mt-6 transition-colors ${
              activeTab === 'cash-in'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {activeTab === 'cash-in' ? 'Start Cash In' : 'Start Cash Out'}
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
          
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'cash_in' ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {transaction.type === 'cash_in' ? (
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.type === 'cash_in' ? 'Cash In' : 'Cash Out'} - {transaction.amount} CELO
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.createdAt.toLocaleDateString()} • {transaction.method.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
