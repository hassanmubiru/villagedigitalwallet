// Microfinance Institution Partnership Integration
// Phase 3: Scale & Partnerships Implementation

export interface MicrofinanceInstitution {
  id: string
  name: string
  country: string
  type: 'bank' | 'mfi' | 'cooperative' | 'ngo'
  logo: string
  minLoanAmount: number
  maxLoanAmount: number
  interestRateRange: {
    min: number
    max: number
  }
  loanTermMonths: number[]
  requirements: string[]
  apiEndpoint: string
  supportedCurrencies: string[]
  kycLevel: 'basic' | 'enhanced' | 'full'
  creditScoreRequired: boolean
  collateralRequired: boolean
  groupLendingSupported: boolean
}

export interface CreditHistoryRecord {
  userId: string
  institutionId: string
  loanAmount: number
  currency: string
  startDate: Date
  endDate: Date
  status: 'active' | 'completed' | 'defaulted' | 'restructured'
  paymentHistory: PaymentRecord[]
  creditScore: number
  collateralType?: string
  collateralValue?: number
}

export interface PaymentRecord {
  date: Date
  amountDue: number
  amountPaid: number
  lateDays: number
  penaltyFee: number
  status: 'on_time' | 'late' | 'missed'
}

export interface FormalLoanApplication {
  id: string
  userId: string
  institutionId: string
  loanAmount: number
  currency: string
  purpose: string
  requestedTermMonths: number
  collateralOffered?: {
    type: string
    value: number
    documentation: string[]
  }
  groupGuarantors?: string[]
  businessPlan?: string
  incomeDocumentation: string[]
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed'
  applicationDate: Date
  reviewNotes?: string[]
  offeredTerms?: {
    amount: number
    interestRate: number
    termMonths: number
    conditions: string[]
  }
}

export interface InterestRateNegotiation {
  applicationId: string
  originalRate: number
  proposedRate: number
  justification: string
  counterOffers: {
    rate: number
    conditions: string[]
    validUntil: Date
  }[]
  finalRate?: number
  negotiationStatus: 'open' | 'accepted' | 'rejected' | 'expired'
}

export interface ComplianceReport {
  institutionId: string
  reportingPeriod: {
    start: Date
    end: Date
  }
  totalLoansOriginated: number
  totalAmountDisbursed: number
  defaultRate: number
  averageInterestRate: number
  kycComplianceRate: number
  auditTrail: AuditEntry[]
  regulatorySubmissionDate?: Date
}

export interface AuditEntry {
  timestamp: Date
  action: string
  userId: string
  institutionId: string
  details: Record<string, any>
  complianceFlags: string[]
}

export class MicrofinancePartnershipManager {
  private partners: Map<string, MicrofinanceInstitution> = new Map()
  private creditHistory: Map<string, CreditHistoryRecord[]> = new Map()
  private applications: Map<string, FormalLoanApplication> = new Map()

  constructor() {
    this.initializePartners()
  }

  private initializePartners() {
    // FINCA International Partnership
    this.partners.set('finca_ug', {
      id: 'finca_ug',
      name: 'FINCA Uganda',
      country: 'Uganda',
      type: 'mfi',
      logo: '/partners/finca-logo.png',
      minLoanAmount: 100000, // UGX
      maxLoanAmount: 5000000, // UGX
      interestRateRange: { min: 18, max: 28 },
      loanTermMonths: [6, 12, 18, 24, 36],
      requirements: [
        'Valid National ID',
        'Proof of business/income',
        'Group guarantee (for amounts > 1M UGX)',
        'Bank statement (3 months)'
      ],
      apiEndpoint: 'https://api.finca.ug/v1',
      supportedCurrencies: ['UGX', 'USD'],
      kycLevel: 'enhanced',
      creditScoreRequired: true,
      collateralRequired: true,
      groupLendingSupported: true
    })

    // Opportunity International Partnership
    this.partners.set('opportunity_ke', {
      id: 'opportunity_ke',
      name: 'Opportunity Kenya',
      country: 'Kenya',
      type: 'mfi',
      logo: '/partners/opportunity-logo.png',
      minLoanAmount: 5000, // KES
      maxLoanAmount: 500000, // KES
      interestRateRange: { min: 15, max: 24 },
      loanTermMonths: [3, 6, 12, 18, 24],
      requirements: [
        'Kenyan National ID',
        'M-Pesa transaction history',
        'Business registration (for business loans)',
        'Group membership certificate'
      ],
      apiEndpoint: 'https://api.opportunity.co.ke/v1',
      supportedCurrencies: ['KES', 'USD'],
      kycLevel: 'enhanced',
      creditScoreRequired: true,
      collateralRequired: false,
      groupLendingSupported: true
    })

    // Local Microfinance Institution
    this.partners.set('pride_mfi', {
      id: 'pride_mfi',
      name: 'Pride Microfinance',
      country: 'Uganda',
      type: 'mfi',
      logo: '/partners/pride-logo.png',
      minLoanAmount: 50000, // UGX
      maxLoanAmount: 2000000, // UGX
      interestRateRange: { min: 20, max: 30 },
      loanTermMonths: [6, 12, 18, 24],
      requirements: [
        'Valid ID',
        'Local council recommendation',
        'Group formation (minimum 5 members)',
        'Weekly meeting attendance record'
      ],
      apiEndpoint: 'https://api.pridemicrofinance.ug/v1',
      supportedCurrencies: ['UGX'],
      kycLevel: 'basic',
      creditScoreRequired: false,
      collateralRequired: false,
      groupLendingSupported: true
    })
  }

  // Get available partners for user based on location and credit profile
  async getEligiblePartners(
    userId: string, 
    loanAmount: number, 
    country: string,
    hasCollateral: boolean = false
  ): Promise<MicrofinanceInstitution[]> {
    const userCreditHistory = this.getUserCreditHistory(userId)
    const creditScore = this.calculateCreditScore(userCreditHistory)
    
    return Array.from(this.partners.values()).filter(partner => {
      // Country match
      if (partner.country !== country) return false
      
      // Amount range check
      if (loanAmount < partner.minLoanAmount || loanAmount > partner.maxLoanAmount) return false
      
      // Credit score requirement
      if (partner.creditScoreRequired && creditScore < 650) return false
      
      // Collateral requirement
      if (partner.collateralRequired && !hasCollateral) return false
      
      return true
    })
  }

  // Submit formal loan application to partner institution
  async submitFormalApplication(application: Omit<FormalLoanApplication, 'id' | 'applicationDate' | 'status'>): Promise<string> {
    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const formalApplication: FormalLoanApplication = {
      ...application,
      id: applicationId,
      applicationDate: new Date(),
      status: 'submitted'
    }

    this.applications.set(applicationId, formalApplication)

    // Simulate API call to partner institution
    const partner = this.partners.get(application.institutionId)
    if (partner) {
      await this.callPartnerAPI(partner, 'submit_application', formalApplication)
    }

    return applicationId
  }

  // Negotiate interest rates with partner
  async negotiateInterestRate(
    applicationId: string, 
    proposedRate: number, 
    justification: string
  ): Promise<InterestRateNegotiation> {
    const application = this.applications.get(applicationId)
    if (!application) {
      throw new Error('Application not found')
    }

    const partner = this.partners.get(application.institutionId)
    if (!partner) {
      throw new Error('Partner institution not found')
    }

    const negotiation: InterestRateNegotiation = {
      applicationId,
      originalRate: partner.interestRateRange.min,
      proposedRate,
      justification,
      counterOffers: [],
      negotiationStatus: 'open'
    }

    // Simulate negotiation logic based on credit history and risk assessment
    const userCreditHistory = this.getUserCreditHistory(application.userId)
    const creditScore = this.calculateCreditScore(userCreditHistory)

    if (creditScore > 750 && proposedRate >= partner.interestRateRange.min * 0.9) {
      negotiation.finalRate = proposedRate
      negotiation.negotiationStatus = 'accepted'
    } else {
      // Generate counter-offer
      const counterRate = Math.max(
        partner.interestRateRange.min,
        proposedRate * 1.2
      )
      
      negotiation.counterOffers.push({
        rate: counterRate,
        conditions: [
          'Provide additional collateral worth 150% of loan amount',
          'Maintain minimum balance of 20% loan amount',
          'Complete financial literacy training'
        ],
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      })
    }

    return negotiation
  }

  // Generate compliance report for regulatory submission
  async generateComplianceReport(
    institutionId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<ComplianceReport> {
    const applications = Array.from(this.applications.values())
      .filter(app => 
        app.institutionId === institutionId &&
        app.applicationDate >= startDate &&
        app.applicationDate <= endDate
      )

    const approvedApplications = applications.filter(app => app.status === 'approved' || app.status === 'disbursed')
    const totalDisbursed = approvedApplications.reduce((sum, app) => sum + app.loanAmount, 0)

    // Calculate default rate from credit history
    const institutionCreditHistory = Array.from(this.creditHistory.values())
      .flat()
      .filter(record => 
        record.institutionId === institutionId &&
        record.startDate >= startDate &&
        record.endDate <= endDate
      )

    const defaultedLoans = institutionCreditHistory.filter(record => record.status === 'defaulted')
    const defaultRate = institutionCreditHistory.length > 0 
      ? (defaultedLoans.length / institutionCreditHistory.length) * 100 
      : 0

    const partner = this.partners.get(institutionId)
    const averageRate = partner ? (partner.interestRateRange.min + partner.interestRateRange.max) / 2 : 0

    return {
      institutionId,
      reportingPeriod: { start: startDate, end: endDate },
      totalLoansOriginated: approvedApplications.length,
      totalAmountDisbursed: totalDisbursed,
      defaultRate,
      averageInterestRate: averageRate,
      kycComplianceRate: 98.5, // Simulated compliance rate
      auditTrail: await this.generateAuditTrail(institutionId, startDate, endDate)
    }
  }

  // Transfer credit history to new institution
  async transferCreditHistory(userId: string, fromInstitutionId: string, toInstitutionId: string): Promise<boolean> {
    const userHistory = this.getUserCreditHistory(userId)
    const relevantHistory = userHistory.filter(record => record.institutionId === fromInstitutionId)

    if (relevantHistory.length === 0) {
      return false
    }

    // Create portable credit score
    const portableScore = this.calculateCreditScore(relevantHistory)
    
    // Submit to new institution via API
    const toPartner = this.partners.get(toInstitutionId)
    if (toPartner) {
      await this.callPartnerAPI(toPartner, 'receive_credit_history', {
        userId,
        creditScore: portableScore,
        historyRecords: relevantHistory,
        transferDate: new Date()
      })
    }

    return true
  }

  private getUserCreditHistory(userId: string): CreditHistoryRecord[] {
    return this.creditHistory.get(userId) || []
  }

  private calculateCreditScore(history: CreditHistoryRecord[]): number {
    if (history.length === 0) return 600 // Base score

    let score = 600
    
    // Payment history (35% of score)
    const paymentHistory = history.flatMap(record => record.paymentHistory)
    const onTimePayments = paymentHistory.filter(payment => payment.status === 'on_time').length
    const totalPayments = paymentHistory.length
    
    if (totalPayments > 0) {
      const onTimeRate = onTimePayments / totalPayments
      score += (onTimeRate * 200) // Up to 200 points for perfect payment history
    }

    // Credit utilization and loan completion (30% of score)
    const completedLoans = history.filter(record => record.status === 'completed').length
    const totalLoans = history.length
    
    if (totalLoans > 0) {
      const completionRate = completedLoans / totalLoans
      score += (completionRate * 150) // Up to 150 points for loan completion
    }

    // Loan diversity and amounts (35% of score)
    const totalLoanAmount = history.reduce((sum, record) => sum + record.loanAmount, 0)
    if (totalLoanAmount > 1000000) { // Higher amounts indicate financial stability
      score += 50
    }

    return Math.min(850, Math.max(300, score))
  }

  private async callPartnerAPI(partner: MicrofinanceInstitution, endpoint: string, data: any): Promise<any> {
    // Simulate API call to partner institution
    console.log(`Calling ${partner.name} API: ${endpoint}`, data)
    
    // In production, this would be actual HTTP requests
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, data: data })
      }, 1000)
    })
  }

  private async generateAuditTrail(institutionId: string, startDate: Date, endDate: Date): Promise<AuditEntry[]> {
    // Generate sample audit trail for compliance
    return [
      {
        timestamp: startDate,
        action: 'application_received',
        userId: 'user123',
        institutionId,
        details: { applicationId: 'app123', amount: 500000 },
        complianceFlags: []
      },
      {
        timestamp: new Date(startDate.getTime() + 86400000), // +1 day
        action: 'kyc_verification_completed',
        userId: 'user123',
        institutionId,
        details: { verificationLevel: 'enhanced', documentsVerified: ['nationalId', 'proofOfIncome'] },
        complianceFlags: ['kyc_compliant']
      }
    ]
  }

  // Get all partnerships
  getAllPartners(): MicrofinanceInstitution[] {
    return Array.from(this.partners.values())
  }

  // Get specific partner
  getPartner(institutionId: string): MicrofinanceInstitution | undefined {
    return this.partners.get(institutionId)
  }
}

// Singleton instance
export const microfinanceManager = new MicrofinancePartnershipManager()
