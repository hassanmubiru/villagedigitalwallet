// Government ID System Integration
// Phase 3: KYC Compliance and Identity Verification

export interface GovernmentIDSystem {
  countryCode: string
  systemName: string
  apiEndpoint: string
  supportedDocuments: IDDocumentType[]
  verificationLevels: VerificationLevel[]
  apiKey: string
  rateLimits: {
    requestsPerMinute: number
    requestsPerDay: number
  }
}

export interface IDDocumentType {
  type: 'national_id' | 'passport' | 'drivers_license' | 'voter_id' | 'birth_certificate'
  name: string
  requiredFields: string[]
  validationPattern: string
  expiryRequired: boolean
}

export interface VerificationLevel {
  level: 'basic' | 'enhanced' | 'full'
  requirements: string[]
  maxTransactionLimit: number
  renewalPeriodDays: number
}

export interface IdentityVerificationRequest {
  id: string
  userId: string
  documentType: string
  documentNumber: string
  documentImage: string // Base64 encoded image
  selfieImage?: string // For enhanced verification
  fingerprintData?: string // For biometric verification
  voterRegistrationNumber?: string
  birthCertificateNumber?: string
  status: 'pending' | 'verified' | 'rejected' | 'expired'
  verificationLevel: 'basic' | 'enhanced' | 'full'
  verifiedAt?: Date
  expiryDate?: Date
  rejectionReason?: string
  complianceFlags: string[]
}

export interface TaxComplianceData {
  userId: string
  taxIdentificationNumber: string
  taxPaymentHistory: TaxPayment[]
  complianceStatus: 'compliant' | 'non_compliant' | 'under_review'
  lastReportingPeriod: Date
  nextReportingDue: Date
  exemptionStatus?: 'exempt' | 'partial_exempt' | 'not_exempt'
}

export interface TaxPayment {
  year: number
  quarter?: number
  amountDue: number
  amountPaid: number
  paymentDate?: Date
  status: 'paid' | 'overdue' | 'partial' | 'exempted'
  penaltyAmount: number
}

export interface SocialServiceEligibility {
  userId: string
  services: SocialService[]
  eligibilityScore: number
  lastAssessmentDate: Date
  nextReviewDate: Date
}

export interface SocialService {
  serviceId: string
  serviceName: string
  provider: string
  eligibilityStatus: 'eligible' | 'not_eligible' | 'pending_review'
  benefitAmount?: number
  benefitType: 'cash' | 'voucher' | 'service' | 'subsidy'
  applicationRequired: boolean
  documentationRequired: string[]
}

export interface ComplianceReport {
  generatedAt: Date
  reportingPeriod: {
    start: Date
    end: Date
  }
  verificationMetrics: {
    totalVerifications: number
    successfulVerifications: number
    rejectedVerifications: number
    fraudAttempts: number
  }
  taxComplianceMetrics: {
    compliantUsers: number
    nonCompliantUsers: number
    totalTaxCollected: number
  }
  socialServiceMetrics: {
    eligibleUsers: number
    activeBeneficiaries: number
    totalBenefitsDistributed: number
  }
  auditTrail: ComplianceAuditEntry[]
}

export interface ComplianceAuditEntry {
  timestamp: Date
  action: string
  userId: string
  documentType?: string
  verificationLevel?: string
  result: 'success' | 'failure' | 'fraud_detected'
  ipAddress: string
  userAgent: string
  complianceFlags: string[]
}

export class GovernmentIDIntegration {
  private idSystems: Map<string, GovernmentIDSystem> = new Map()
  private verificationRequests: Map<string, IdentityVerificationRequest> = new Map()
  private taxData: Map<string, TaxComplianceData> = new Map()
  private socialServices: Map<string, SocialServiceEligibility> = new Map()

  constructor() {
    this.initializeIDSystems()
  }

  private initializeIDSystems() {
    // Uganda National ID System
    this.idSystems.set('UG', {
      countryCode: 'UG',
      systemName: 'Uganda National Identification and Registration Authority (NIRA)',
      apiEndpoint: 'https://api.nira.go.ug/v1',
      supportedDocuments: [
        {
          type: 'national_id',
          name: 'Uganda National ID',
          requiredFields: ['documentNumber', 'dateOfBirth', 'fullName'],
          validationPattern: '^[A-Z]{2}[0-9]{8}[A-Z]{3}$',
          expiryRequired: false
        },
        {
          type: 'passport',
          name: 'Uganda Passport',
          requiredFields: ['passportNumber', 'expiryDate', 'fullName'],
          validationPattern: '^[A-Z]{2}[0-9]{7}$',
          expiryRequired: true
        },
        {
          type: 'voter_id',
          name: 'Voter Registration Card',
          requiredFields: ['voterNumber', 'constituency'],
          validationPattern: '^[0-9]{10}$',
          expiryRequired: false
        }
      ],
      verificationLevels: [
        {
          level: 'basic',
          requirements: ['National ID verification'],
          maxTransactionLimit: 1000000, // UGX
          renewalPeriodDays: 365
        },
        {
          level: 'enhanced',
          requirements: ['National ID + Selfie verification', 'Address verification'],
          maxTransactionLimit: 5000000, // UGX
          renewalPeriodDays: 730
        },
        {
          level: 'full',
          requirements: ['National ID + Biometric verification', 'Tax compliance check', 'Reference verification'],
          maxTransactionLimit: 50000000, // UGX
          renewalPeriodDays: 730
        }
      ],
      apiKey: process.env.NIRA_API_KEY || 'demo_key',
      rateLimits: {
        requestsPerMinute: 10,
        requestsPerDay: 1000
      }
    })

    // Kenya Huduma Number System
    this.idSystems.set('KE', {
      countryCode: 'KE',
      systemName: 'Kenya Integrated Population Registration Services (IPRS)',
      apiEndpoint: 'https://api.iprs.go.ke/v1',
      supportedDocuments: [
        {
          type: 'national_id',
          name: 'Kenya National ID',
          requiredFields: ['idNumber', 'fullName', 'dateOfBirth'],
          validationPattern: '^[0-9]{8}$',
          expiryRequired: false
        },
        {
          type: 'passport',
          name: 'Kenya Passport',
          requiredFields: ['passportNumber', 'expiryDate'],
          validationPattern: '^[A-Z]{2}[0-9]{6}$',
          expiryRequired: true
        }
      ],
      verificationLevels: [
        {
          level: 'basic',
          requirements: ['National ID verification'],
          maxTransactionLimit: 100000, // KES
          renewalPeriodDays: 365
        },
        {
          level: 'enhanced',
          requirements: ['National ID + KRA PIN verification'],
          maxTransactionLimit: 1000000, // KES
          renewalPeriodDays: 730
        }
      ],
      apiKey: process.env.IPRS_API_KEY || 'demo_key',
      rateLimits: {
        requestsPerMinute: 5,
        requestsPerDay: 500
      }
    })
  }

  // Submit identity verification request
  async submitVerificationRequest(
    userId: string,
    documentType: string,
    documentNumber: string,
    documentImage: string,
    countryCode: string,
    verificationLevel: 'basic' | 'enhanced' | 'full' = 'basic',
    additionalData?: {
      selfieImage?: string
      fingerprintData?: string
      voterRegistrationNumber?: string
    }
  ): Promise<string> {
    const requestId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const verificationRequest: IdentityVerificationRequest = {
      id: requestId,
      userId,
      documentType,
      documentNumber,
      documentImage,
      selfieImage: additionalData?.selfieImage,
      fingerprintData: additionalData?.fingerprintData,
      voterRegistrationNumber: additionalData?.voterRegistrationNumber,
      status: 'pending',
      verificationLevel,
      complianceFlags: []
    }

    this.verificationRequests.set(requestId, verificationRequest)

    // Process verification with government API
    const idSystem = this.idSystems.get(countryCode)
    if (idSystem) {
      await this.processGovernmentVerification(verificationRequest, idSystem)
    }

    return requestId
  }

  // Process government verification
  private async processGovernmentVerification(
    request: IdentityVerificationRequest,
    idSystem: GovernmentIDSystem
  ): Promise<void> {
    try {
      // Simulate government API call
      const verificationResult = await this.callGovernmentAPI(idSystem, {
        documentType: request.documentType,
        documentNumber: request.documentNumber,
        verificationLevel: request.verificationLevel
      })

      if (verificationResult.valid) {
        request.status = 'verified'
        request.verifiedAt = new Date()
        
        // Set expiry based on verification level
        const level = idSystem.verificationLevels.find(l => l.level === request.verificationLevel)
        if (level) {
          request.expiryDate = new Date(Date.now() + level.renewalPeriodDays * 24 * 60 * 60 * 1000)
        }

        // Add compliance flags
        request.complianceFlags.push('government_verified', `${idSystem.countryCode}_compliant`)
        
        if (request.verificationLevel === 'enhanced' || request.verificationLevel === 'full') {
          request.complianceFlags.push('enhanced_kyc')
        }
      } else {
        request.status = 'rejected'
        request.rejectionReason = verificationResult.reason || 'Document verification failed'
      }
    } catch (error) {
      request.status = 'rejected'
      request.rejectionReason = 'System error during verification'
    }

    this.verificationRequests.set(request.id, request)
  }

  // Check tax compliance
  async checkTaxCompliance(userId: string, taxId: string, countryCode: string): Promise<TaxComplianceData> {
    const existingData = this.taxData.get(userId)
    if (existingData && this.isDataCurrent(existingData.lastReportingPeriod)) {
      return existingData
    }

    // Simulate tax authority API call
    const taxHistory = await this.getTaxHistory(taxId, countryCode)
    
    const complianceData: TaxComplianceData = {
      userId,
      taxIdentificationNumber: taxId,
      taxPaymentHistory: taxHistory,
      complianceStatus: this.calculateComplianceStatus(taxHistory),
      lastReportingPeriod: new Date(),
      nextReportingDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      exemptionStatus: 'not_exempt'
    }

    this.taxData.set(userId, complianceData)
    return complianceData
  }

  // Check social service eligibility
  async checkSocialServiceEligibility(
    userId: string, 
    verificationData: IdentityVerificationRequest
  ): Promise<SocialServiceEligibility> {
    const services: SocialService[] = []

    // Check for agricultural subsidies
    if (this.isRuralUser(verificationData)) {
      services.push({
        serviceId: 'agric_subsidy',
        serviceName: 'Agricultural Input Subsidy',
        provider: 'Ministry of Agriculture',
        eligibilityStatus: 'eligible',
        benefitAmount: 500000, // UGX
        benefitType: 'voucher',
        applicationRequired: true,
        documentationRequired: ['farm_registration', 'land_certificate']
      })
    }

    // Check for health insurance
    if (this.isLowIncomeUser(userId)) {
      services.push({
        serviceId: 'health_insurance',
        serviceName: 'National Health Insurance',
        provider: 'Ministry of Health',
        eligibilityStatus: 'eligible',
        benefitType: 'service',
        applicationRequired: true,
        documentationRequired: ['income_certificate', 'family_composition']
      })
    }

    // Check for education support
    services.push({
      serviceId: 'education_support',
      serviceName: 'Universal Primary Education Support',
      provider: 'Ministry of Education',
      eligibilityStatus: 'eligible',
      benefitType: 'cash',
      benefitAmount: 200000, // UGX per child
      applicationRequired: false,
      documentationRequired: ['birth_certificate', 'school_enrollment']
    })

    const eligibilityScore = this.calculateEligibilityScore(services)

    const eligibility: SocialServiceEligibility = {
      userId,
      services,
      eligibilityScore,
      lastAssessmentDate: new Date(),
      nextReviewDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6 months
    }

    this.socialServices.set(userId, eligibility)
    return eligibility
  }

  // Generate compliance report for regulators
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<ComplianceReport> {
    const verifications = Array.from(this.verificationRequests.values())
      .filter(req => req.verifiedAt && req.verifiedAt >= startDate && req.verifiedAt <= endDate)

    const successfulVerifications = verifications.filter(v => v.status === 'verified').length
    const rejectedVerifications = verifications.filter(v => v.status === 'rejected').length
    const fraudAttempts = verifications.filter(v => v.complianceFlags.includes('fraud_detected')).length

    const taxData = Array.from(this.taxData.values())
    const compliantUsers = taxData.filter(t => t.complianceStatus === 'compliant').length
    const nonCompliantUsers = taxData.filter(t => t.complianceStatus === 'non_compliant').length

    const socialServiceData = Array.from(this.socialServices.values())
    const eligibleUsers = socialServiceData.filter(s => s.eligibilityScore > 70).length
    const activeBeneficiaries = socialServiceData.filter(s => 
      s.services.some(service => service.eligibilityStatus === 'eligible')
    ).length

    return {
      generatedAt: new Date(),
      reportingPeriod: { start: startDate, end: endDate },
      verificationMetrics: {
        totalVerifications: verifications.length,
        successfulVerifications,
        rejectedVerifications,
        fraudAttempts
      },
      taxComplianceMetrics: {
        compliantUsers,
        nonCompliantUsers,
        totalTaxCollected: this.calculateTotalTaxCollected(taxData, startDate, endDate)
      },
      socialServiceMetrics: {
        eligibleUsers,
        activeBeneficiaries,
        totalBenefitsDistributed: this.calculateTotalBenefits(socialServiceData)
      },
      auditTrail: await this.generateAuditTrail(startDate, endDate)
    }
  }

  // Helper methods
  private async callGovernmentAPI(idSystem: GovernmentIDSystem, data: any): Promise<any> {
    // Simulate government API call
    console.log(`Calling ${idSystem.systemName} API`, data)
    
    return new Promise(resolve => {
      setTimeout(() => {
        // Simulate successful verification for demo
        resolve({
          valid: true,
          data: {
            fullName: 'John Doe',
            dateOfBirth: '1990-01-01',
            nationality: idSystem.countryCode
          }
        })
      }, 2000)
    })
  }

  private async getTaxHistory(taxId: string, countryCode: string): Promise<TaxPayment[]> {
    // Simulate tax authority API call
    return [
      {
        year: 2024,
        amountDue: 500000,
        amountPaid: 500000,
        paymentDate: new Date('2024-06-15'),
        status: 'paid',
        penaltyAmount: 0
      },
      {
        year: 2023,
        amountDue: 400000,
        amountPaid: 400000,
        paymentDate: new Date('2023-06-10'),
        status: 'paid',
        penaltyAmount: 0
      }
    ]
  }

  private calculateComplianceStatus(taxHistory: TaxPayment[]): 'compliant' | 'non_compliant' | 'under_review' {
    const recentPayments = taxHistory.filter(payment => 
      payment.year >= new Date().getFullYear() - 2
    )

    const overduePayments = recentPayments.filter(payment => payment.status === 'overdue')
    return overduePayments.length === 0 ? 'compliant' : 'non_compliant'
  }

  private isDataCurrent(lastUpdate: Date): boolean {
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceUpdate < 30 // Data is current if updated within 30 days
  }

  private isRuralUser(verificationData: IdentityVerificationRequest): boolean {
    // Simplified logic - in production, this would use address data
    return verificationData.complianceFlags.includes('rural_address')
  }

  private isLowIncomeUser(userId: string): boolean {
    // Simplified logic - in production, this would use income verification
    return true // Assume eligible for demo
  }

  private calculateEligibilityScore(services: SocialService[]): number {
    const eligibleServices = services.filter(s => s.eligibilityStatus === 'eligible').length
    return (eligibleServices / services.length) * 100
  }

  private calculateTotalTaxCollected(taxData: TaxComplianceData[], startDate: Date, endDate: Date): number {
    return taxData.reduce((total, userData) => {
      const relevantPayments = userData.taxPaymentHistory.filter(payment => 
        payment.paymentDate && 
        payment.paymentDate >= startDate && 
        payment.paymentDate <= endDate
      )
      return total + relevantPayments.reduce((sum, payment) => sum + payment.amountPaid, 0)
    }, 0)
  }

  private calculateTotalBenefits(socialServiceData: SocialServiceEligibility[]): number {
    return socialServiceData.reduce((total, userEligibility) => {
      const eligibleBenefits = userEligibility.services
        .filter(service => service.eligibilityStatus === 'eligible' && service.benefitAmount)
        .reduce((sum, service) => sum + (service.benefitAmount || 0), 0)
      return total + eligibleBenefits
    }, 0)
  }

  private async generateAuditTrail(startDate: Date, endDate: Date): Promise<ComplianceAuditEntry[]> {
    // Generate sample audit trail
    return [
      {
        timestamp: startDate,
        action: 'identity_verification_started',
        userId: 'user123',
        documentType: 'national_id',
        verificationLevel: 'basic',
        result: 'success',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        complianceFlags: ['government_verified']
      }
    ]
  }

  // Public getters
  getVerificationRequest(requestId: string): IdentityVerificationRequest | undefined {
    return this.verificationRequests.get(requestId)
  }

  getUserTaxData(userId: string): TaxComplianceData | undefined {
    return this.taxData.get(userId)
  }

  getUserSocialServices(userId: string): SocialServiceEligibility | undefined {
    return this.socialServices.get(userId)
  }

  getSupportedCountries(): string[] {
    return Array.from(this.idSystems.keys())
  }

  getCountryIDSystem(countryCode: string): GovernmentIDSystem | undefined {
    return this.idSystems.get(countryCode)
  }
}

// Singleton instance
export const governmentIDIntegration = new GovernmentIDIntegration()
