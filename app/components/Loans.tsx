'use client'

import { useState } from 'react'
import { useLanguage } from '../providers/LanguageProvider'
import { useActiveAccount } from 'thirdweb/react'
import { 
  CreditCard, 
  Plus, 
  CheckCircle, 
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  Percent,
  Target,
  TrendingUp,
  Award
} from 'lucide-react'
import { Loan, LoanPayment } from '../types'

export default function Loans() {
  const { t } = useLanguage()
  const account = useActiveAccount()
  const [activeTab, setActiveTab] = useState<'my-loans' | 'available' | 'request'>('my-loans')

  // Mock data - replace with real data from blockchain/backend
  const [myLoans] = useState<Loan[]>([
    {
      id: '1',
      borrowerId: account?.address || '',
      lenderId: 'village-farmers-group',
      groupId: '1',
      amount: '200.00',
      interestRate: 5,
      duration: 30,
      purpose: 'Buying seeds for farming season',
      status: 'repaying',
      collateral: 'Future harvest commitment',
      createdAt: new Date('2024-07-01'),
      approvedAt: new Date('2024-07-02'),
      disbursedAt: new Date('2024-07-03'),
      dueDate: new Date('2024-08-02'),
      totalRepaid: '150.00',
      contractAddress: '0x123...'
    },
    {
      id: '2',
      borrowerId: account?.address || '',
      amount: '100.00',
      interestRate: 3,
      duration: 14,
      purpose: 'Emergency medical expenses',
      status: 'pending',
      createdAt: new Date('2024-07-20'),
      dueDate: new Date('2024-08-03'),
      totalRepaid: '0.00'
    }
  ])

  const [availableLoans] = useState([
    {
      id: '3',
      lender: 'Women\'s Savings Circle',
      maxAmount: '500.00',
      interestRate: 4,
      maxDuration: 60,
      requirements: ['Group member', 'Verified identity', 'Collateral'],
      approvalTime: '24 hours'
    },
    {
      id: '4',
      lender: 'Micro-finance Partner',
      maxAmount: '1000.00',
      interestRate: 8,
      maxDuration: 90,
      requirements: ['Credit score > 70', 'Stable income', 'Guarantor'],
      approvalTime: '3-5 days'
    }
  ])

  const [loanRequest, setLoanRequest] = useState({
    amount: '',
    duration: '30',
    purpose: '',
    collateral: '',
    groupId: ''
  })

  const [loanPayments] = useState<LoanPayment[]>([
    {
      id: '1',
      loanId: '1',
      amount: '50.00',
      transactionHash: '0xabc...',
      timestamp: new Date('2024-07-10'),
      isOnTime: true
    },
    {
      id: '2',
      loanId: '1',
      amount: '50.00',
      transactionHash: '0xdef...',
      timestamp: new Date('2024-07-17'),
      isOnTime: true
    },
    {
      id: '3',
      loanId: '1',
      amount: '50.00',
      transactionHash: '0xghi...',
      timestamp: new Date('2024-07-24'),
      isOnTime: true
    }
  ])

  const handleLoanRequest = async () => {
    // In a real app, this would interact with smart contracts
    console.log('Requesting loan:', loanRequest)
    setLoanRequest({
      amount: '',
      duration: '30',
      purpose: '',
      collateral: '',
      groupId: ''
    })
    setActiveTab('my-loans')
  }

  const handleLoanPayment = async (loanId: string, amount: string) => {
    // In a real app, this would trigger a blockchain transaction
    console.log('Making loan payment:', { loanId, amount })
  }

  const calculateProgress = (loan: Loan) => {
    const totalAmount = parseFloat(loan.amount) * (1 + loan.interestRate / 100)
    const repaid = parseFloat(loan.totalRepaid)
    return Math.min((repaid / totalAmount) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'repaying': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'defaulted': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const MyLoansTab = () => (
    <div className="space-y-6">
      {myLoans.map((loan) => {
        const progress = calculateProgress(loan)
        const totalAmount = parseFloat(loan.amount) * (1 + loan.interestRate / 100)
        const remainingAmount = totalAmount - parseFloat(loan.totalRepaid)
        
        return (
          <div key={loan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {loan.purpose}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {loan.groupId ? `Group Loan - ${loan.lenderId}` : 'Individual Loan'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{loan.amount}</div>
                <div className="text-sm text-gray-600">Principal (CELO)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{loan.interestRate}%</div>
                <div className="text-sm text-gray-600">Interest Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{loan.duration}</div>
                <div className="text-sm text-gray-600">Days</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {loan.dueDate.toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">Due Date</div>
              </div>
            </div>

            {loan.status === 'repaying' && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Repayment Progress</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Paid: {loan.totalRepaid} CELO</span>
                  <span className="text-gray-600">Remaining: {remainingAmount.toFixed(2)} CELO</span>
                </div>
              </div>
            )}

            {loan.status === 'repaying' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleLoanPayment(loan.id, '50.00')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Make Payment (50 CELO)
                </button>
                <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  View Payment History
                </button>
              </div>
            )}

            {loan.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-800">Awaiting approval from lender</span>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {myLoans.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Loans Yet</h3>
          <p className="text-gray-600 mb-6">Request your first loan to get started</p>
          <button
            onClick={() => setActiveTab('request')}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Request Loan
          </button>
        </div>
      )}
    </div>
  )

  const AvailableLoansTab = () => (
    <div className="space-y-6">
      {availableLoans.map((loan) => (
        <div key={loan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{loan.lender}</h3>
              <p className="text-sm text-gray-600 mt-1">Trusted community lender</p>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">Verified</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">Up to {loan.maxAmount}</div>
              <div className="text-sm text-gray-600">Max Amount (CELO)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{loan.interestRate}%</div>
              <div className="text-sm text-gray-600">Interest Rate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{loan.maxDuration}</div>
              <div className="text-sm text-gray-600">Max Duration (days)</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{loan.approvalTime}</div>
              <div className="text-sm text-gray-600">Approval Time</div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
            <ul className="space-y-1">
              {loan.requirements.map((req, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => setActiveTab('request')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Apply for Loan
          </button>
        </div>
      ))}
    </div>
  )

  const RequestTab = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Request New Loan</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Amount (CELO)
          </label>
          <input
            type="number"
            step="0.01"
            value={loanRequest.amount}
            onChange={(e) => setLoanRequest({ ...loanRequest, amount: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Duration (days)
          </label>
          <select
            value={loanRequest.duration}
            onChange={(e) => setLoanRequest({ ...loanRequest, duration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose of Loan
          </label>
          <textarea
            value={loanRequest.purpose}
            onChange={(e) => setLoanRequest({ ...loanRequest, purpose: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Describe what you need the loan for"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Collateral (optional)
          </label>
          <input
            type="text"
            value={loanRequest.collateral}
            onChange={(e) => setLoanRequest({ ...loanRequest, collateral: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What can you offer as collateral?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Lender
          </label>
          <select
            value={loanRequest.groupId}
            onChange={(e) => setLoanRequest({ ...loanRequest, groupId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a lender</option>
            <option value="1">Village Farmers Group</option>
            <option value="2">Women&apos;s Savings Circle</option>
            <option value="microfinance">Micro-finance Partner</option>
          </select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Loan Terms Preview</h4>
          {loanRequest.amount && (
            <div className="space-y-1 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>Principal Amount:</span>
                <span>{loanRequest.amount} CELO</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Interest (5%):</span>
                <span>{(parseFloat(loanRequest.amount || '0') * 0.05).toFixed(2)} CELO</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total to Repay:</span>
                <span>{(parseFloat(loanRequest.amount || '0') * 1.05).toFixed(2)} CELO</span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLoanRequest}
          disabled={!loanRequest.amount || !loanRequest.purpose}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Loan Request
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Microloans</h1>
          <p className="text-gray-600">
            Access affordable credit from your community and trusted partners
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('my-loans')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my-loans'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Loans
          </button>
          <button
            onClick={() => setActiveTab('available')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'available'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Available Loans
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'request'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Request Loan
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'my-loans' && <MyLoansTab />}
        {activeTab === 'available' && <AvailableLoansTab />}
        {activeTab === 'request' && <RequestTab />}
      </div>
    </div>
  )
}
