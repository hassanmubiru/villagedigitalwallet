import React, { useState, useEffect } from 'react'
import { governmentIDIntegration } from '../lib/governmentIDIntegration'
import { microfinanceManager } from '../lib/microfinancePartners'
import { crossBorderTransferSystem } from '../lib/crossBorderTransfers'
import { insuranceProductManager } from '../lib/insuranceProducts'
import { useLanguage } from '../providers/LanguageProvider'

interface DashboardProps {
  userId: string
}

export default function Dashboard({ userId }: DashboardProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<'kyc' | 'loans' | 'transfers' | 'insurance'>('kyc')
  const [userVerification, setUserVerification] = useState<any>(null)
  const [userLoans, setUserLoans] = useState<any[]>([])
  const [userPolicies, setUserPolicies] = useState<any[]>([])
  const [transferHistory, setTransferHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Load verification status
        const verification = await governmentIDIntegration.getUserTaxData(userId)
        setUserVerification(verification)

        // Load available partners and simulate user applications
        const partners = microfinanceManager.getAllPartners()
        // Simulate user loan applications for demo
        const mockUserLoans = partners.slice(0, 2).map((partner, index) => ({
          id: `loan_${index}`,
          loanType: 'business',
          amount: 1000000 + (index * 500000),
          partnerName: partner.name,
          interestRate: partner.interestRateRange.min,
          termMonths: partner.loanTermMonths[0],
          status: index === 0 ? 'approved' : 'pending',
          applicationDate: new Date(Date.now() - index * 30 * 24 * 60 * 60 * 1000)
        }))
        setUserLoans(mockUserLoans)

        // Load insurance policies
        const policies = insuranceProductManager.getUserPolicies(userId)
        setUserPolicies(policies)

        // Load transfer history (mock data for demo)
        setTransferHistory([])
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [userId])

  const loadUserData = async () => {
    setLoading(true)
    try {
      // Load verification status
      const verification = await governmentIDIntegration.getUserTaxData(userId)
      setUserVerification(verification)

      // Load available partners and simulate user applications
      const partners = microfinanceManager.getAllPartners()
      const mockUserLoans = partners.slice(0, 2).map((partner, index) => ({
        id: `loan_${index}`,
        loanType: 'business',
        amount: 1000000 + (index * 500000),
        partnerName: partner.name,
        interestRate: partner.interestRateRange.min,
        termMonths: partner.loanTermMonths[0],
        status: index === 0 ? 'approved' : 'pending',
        applicationDate: new Date(Date.now() - index * 30 * 24 * 60 * 60 * 1000)
      }))
      setUserLoans(mockUserLoans)

      // Load insurance policies
      const policies = insuranceProductManager.getUserPolicies(userId)
      setUserPolicies(policies)

      // Load transfer history (mock data for demo)
      setTransferHistory([])
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSubmit = async (formData: any) => {
    setLoading(true)
    try {
      const requestId = await governmentIDIntegration.submitVerificationRequest(
        userId,
        formData.documentType,
        formData.documentNumber,
        formData.documentImage,
        formData.countryCode,
        formData.verificationLevel,
        {
          selfieImage: formData.selfieImage,
          fingerprintData: formData.fingerprintData
        }
      )
      
      alert(t('verification_submitted_successfully'))
      await loadUserData()
    } catch (error) {
      console.error('Verification error:', error)
      alert(t('verification_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleLoanApplication = async (formData: any) => {
    setLoading(true)
    try {
      const application = await microfinanceManager.submitFormalApplication({
        userId,
        institutionId: formData.partnerId,
        loanAmount: formData.amount,
        currency: 'UGX',
        purpose: formData.purpose,
        requestedTermMonths: 12,
        collateralOffered: formData.collateral ? {
          type: 'business_assets',
          value: formData.amount * 1.5,
          documentation: ['asset_valuation']
        } : undefined,
        businessPlan: formData.businessPlan,
        incomeDocumentation: ['bank_statements', 'business_records']
      })
      
      alert(t('loan_application_submitted'))
      await loadUserData()
    } catch (error) {
      console.error('Loan application error:', error)
      alert(t('loan_application_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleInsurancePurchase = async (formData: any) => {
    setLoading(true)
    try {
      const policy = await insuranceProductManager.purchasePolicy(
        userId,
        formData.productId,
        formData.coverageAmount,
        formData.beneficiaries,
        formData.groupId
      )
      
      alert(t('insurance_policy_created'))
      await loadUserData()
    } catch (error) {
      console.error('Insurance purchase error:', error)
      alert(t('insurance_purchase_failed'))
    } finally {
      setLoading(false)
    }
  }

  const renderKYCSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{t('identity_verification')}</h3>
        
        {userVerification ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">{t('verification_status')}</p>
                <p className="text-green-600">{userVerification.complianceStatus}</p>
              </div>
              <div className="text-green-500">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{t('tax_compliance')}</h4>
                <p className="text-sm text-gray-600">{t('tax_id')}: {userVerification.taxIdentificationNumber}</p>
                <p className="text-sm text-gray-600">{t('status')}: {userVerification.complianceStatus}</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{t('social_services')}</h4>
                <p className="text-sm text-gray-600">{t('eligible_services')}: 3</p>
                <p className="text-sm text-gray-600">{t('last_assessment')}: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        ) : (
          <VerificationForm onSubmit={handleVerificationSubmit} loading={loading} />
        )}
      </div>
    </div>
  )

  const renderLoansSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('microfinance_loans')}</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            {t('apply_for_loan')}
          </button>
        </div>
        
        {userLoans.length > 0 ? (
          <div className="space-y-4">
            {userLoans.map((loan: any) => (
              <div key={loan.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{loan.loanType}</h4>
                    <p className="text-sm text-gray-600">{t('amount')}: {loan.amount.toLocaleString()} UGX</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                    loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t(loan.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">{t('partner')}: {loan.partnerName}</p>
                    <p className="text-gray-600">{t('interest_rate')}: {loan.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{t('term')}: {loan.termMonths} {t('months')}</p>
                    <p className="text-gray-600">{t('applied')}: {new Date(loan.applicationDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{t('no_loan_applications')}</p>
            <LoanApplicationForm onSubmit={handleLoanApplication} loading={loading} />
          </div>
        )}
      </div>
    </div>
  )

  const renderTransfersSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('cross_border_transfers')}</h3>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            {t('send_money')}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800">{t('available_corridors')}</h4>
            <p className="text-2xl font-bold text-blue-600">12</p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800">{t('supported_currencies')}</h4>
            <p className="text-2xl font-bold text-green-600">6</p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-800">{t('transfer_partners')}</h4>
            <p className="text-2xl font-bold text-purple-600">8</p>
          </div>
        </div>
        
        {transferHistory.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium">{t('recent_transfers')}</h4>
            {transferHistory.map((transfer: any) => (
              <div key={transfer.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{transfer.fromCountry} → {transfer.toCountry}</p>
                    <p className="text-sm text-gray-600">
                      {transfer.sendAmount} {transfer.fromCurrency} → {transfer.receiveAmount} {transfer.toCurrency}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    transfer.status === 'completed' ? 'bg-green-100 text-green-800' :
                    transfer.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {t(transfer.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{t('no_transfers_yet')}</p>
            <p className="text-sm text-gray-500">{t('send_money_internationally')}</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderInsuranceSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('insurance_products')}</h3>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            {t('buy_insurance')}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">{t('crop_insurance')}</h4>
            <p className="text-sm text-gray-600 mb-3">{t('weather_based_crop_protection')}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">150,000 UGX</span>
              <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                {t('learn_more')}
              </button>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">{t('health_insurance')}</h4>
            <p className="text-sm text-gray-600 mb-3">{t('family_health_coverage')}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">300,000 UGX</span>
              <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                {t('learn_more')}
              </button>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">{t('life_insurance')}</h4>
            <p className="text-sm text-gray-600 mb-3">{t('life_protection_coverage')}</p>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold">100,000 UGX</span>
              <button className="bg-purple-500 text-white px-3 py-1 rounded text-sm">
                {t('learn_more')}
              </button>
            </div>
          </div>
        </div>
        
        {userPolicies.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium">{t('your_policies')}</h4>
            {userPolicies.map((policy: any) => (
              <div key={policy.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-medium">{policy.productId}</h5>
                    <p className="text-sm text-gray-600">{t('policy_number')}: {policy.policyNumber}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    policy.status === 'active' ? 'bg-green-100 text-green-800' :
                    policy.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t(policy.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">{t('coverage')}: {policy.coverageAmount.toLocaleString()} UGX</p>
                    <p className="text-gray-600">{t('premium')}: {policy.premiumAmount.toLocaleString()} UGX</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{t('start_date')}: {new Date(policy.startDate).toLocaleDateString()}</p>
                    <p className="text-gray-600">{t('end_date')}: {new Date(policy.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{t('no_insurance_policies')}</p>
            <p className="text-sm text-gray-500">{t('protect_your_assets')}</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('phase_3_services')}</h1>
        <p className="text-gray-600">{t('advanced_financial_services')}</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'kyc', label: t('identity_kyc'), icon: '🆔' },
            { id: 'loans', label: t('microfinance'), icon: '💰' },
            { id: 'transfers', label: t('cross_border'), icon: '🌍' },
            { id: 'insurance', label: t('insurance'), icon: '🛡️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'kyc' && renderKYCSection()}
          {activeTab === 'loans' && renderLoansSection()}
          {activeTab === 'transfers' && renderTransfersSection()}
          {activeTab === 'insurance' && renderInsuranceSection()}
        </>
      )}
    </div>
  )
}

// Verification Form Component
const VerificationForm = ({ onSubmit, loading }: { onSubmit: (data: any) => void, loading: boolean }) => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    documentType: 'national_id',
    documentNumber: '',
    countryCode: 'UG',
    verificationLevel: 'basic',
    documentImage: '',
    selfieImage: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('document_type')}
          </label>
          <select
            value={formData.documentType}
            onChange={(e) => setFormData({...formData, documentType: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="national_id">{t('national_id')}</option>
            <option value="passport">{t('passport')}</option>
            <option value="voter_id">{t('voter_id')}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('document_number')}
          </label>
          <input
            type="text"
            value={formData.documentNumber}
            onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder={t('enter_document_number')}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('country')}
          </label>
          <select
            value={formData.countryCode}
            onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="UG">{t('uganda')}</option>
            <option value="KE">{t('kenya')}</option>
            <option value="TZ">{t('tanzania')}</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('verification_level')}
          </label>
          <select
            value={formData.verificationLevel}
            onChange={(e) => setFormData({...formData, verificationLevel: e.target.value})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="basic">{t('basic')}</option>
            <option value="enhanced">{t('enhanced')}</option>
            <option value="full">{t('full')}</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? t('submitting') : t('submit_verification')}
      </button>
    </form>
  )
}

// Loan Application Form Component
const LoanApplicationForm = ({ onSubmit, loading }: { onSubmit: (data: any) => void, loading: boolean }) => {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    partnerId: 'finca_international',
    loanType: 'business',
    amount: 1000000,
    purpose: '',
    collateral: '',
    businessPlan: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('loan_amount')} (UGX)
        </label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value)})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          min="100000"
          max="10000000"
          step="100000"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('loan_purpose')}
        </label>
        <textarea
          value={formData.purpose}
          onChange={(e) => setFormData({...formData, purpose: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          rows={3}
          placeholder={t('describe_loan_purpose')}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? t('submitting') : t('apply_for_loan')}
      </button>
    </form>
  )
}
