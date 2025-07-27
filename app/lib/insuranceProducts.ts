// Insurance Product Integration System
// Phase 3: Micro-Insurance Products for Rural Communities

export interface InsuranceProduct {
  id: string
  name: string
  type: InsuranceType
  category: 'crop' | 'livestock' | 'health' | 'life' | 'weather' | 'property' | 'business'
  provider: string
  description: string
  coverage: CoverageDetails
  premium: PremiumStructure
  eligibility: EligibilityRequirements
  claims: ClaimsProcess
  isActive: boolean
  availableRegions: string[]
  minimumAge?: number
  maximumAge?: number
  requiresMedicalExam: boolean
  paymentFrequency: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'annual'
  gracePeriodDays: number
  waitingPeriodDays: number
  renewalTerms: RenewalTerms
}

export type InsuranceType = 
  | 'parametric' 
  | 'indemnity' 
  | 'index_based' 
  | 'micro_insurance'
  | 'group_insurance'

export interface CoverageDetails {
  maxCoverageAmount: number
  deductible: number
  coveredPerils: string[]
  exclusions: string[]
  beneficiaries: BeneficiaryType[]
  geographicCoverage: string[]
  seasonalRestrictions?: string[]
}

export interface BeneficiaryType {
  relationship: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other'
  maxBeneficiaries: number
  requiredDocuments: string[]
}

export interface PremiumStructure {
  basePremium: number
  currency: string
  calculationMethod: 'fixed' | 'percentage_of_coverage' | 'risk_based' | 'income_based'
  riskFactors: RiskFactor[]
  discounts: DiscountStructure[]
  loadingFactors: LoadingFactor[]
  paymentOptions: PaymentOption[]
}

export interface RiskFactor {
  factor: string
  description: string
  impact: 'increase' | 'decrease'
  multiplier: number
  conditions: string[]
}

export interface DiscountStructure {
  type: 'group_discount' | 'loyalty_discount' | 'early_payment' | 'digital_payment' | 'good_health'
  percentage: number
  conditions: string[]
  validUntil?: Date
}

export interface LoadingFactor {
  reason: string
  percentage: number
  description: string
}

export interface PaymentOption {
  method: 'mobile_money' | 'bank_transfer' | 'cash' | 'crypto' | 'micro_savings'
  processingFee: number
  minimumAmount: number
  frequency: string[]
}

export interface EligibilityRequirements {
  minimumIncome?: number
  maximumIncome?: number
  requiredDocuments: string[]
  eligibilityChecks: EligibilityCheck[]
  exclusions: string[]
  groupRequirements?: GroupRequirements
}

export interface EligibilityCheck {
  type: 'age_verification' | 'income_verification' | 'health_screening' | 'location_verification' | 'occupation_check'
  required: boolean
  documents: string[]
  validityPeriodDays: number
}

export interface GroupRequirements {
  minimumMembers: number
  maximumMembers: number
  groupType: 'family' | 'village' | 'cooperative' | 'business' | 'association'
  leadershipRequirements: string[]
}

export interface ClaimsProcess {
  reportingMethods: string[]
  documentationRequired: string[]
  maxReportingDays: number
  investigationProcess: InvestigationStep[]
  settlementTimeframe: string
  appealProcess: AppealStep[]
  paymentMethods: string[]
}

export interface InvestigationStep {
  step: number
  description: string
  timeline: string
  requiredDocuments: string[]
  responsibleParty: string
}

export interface AppealStep {
  level: number
  description: string
  timeframe: string
  requiredDocuments: string[]
  authority: string
}

export interface RenewalTerms {
  autoRenewal: boolean
  renewalNotificationDays: number
  rateChangeNotificationDays: number
  renewalDiscounts: DiscountStructure[]
  nonRenewalConditions: string[]
}

export interface InsurancePolicy {
  id: string
  productId: string
  policyNumber: string
  userId: string
  groupId?: string
  status: PolicyStatus
  startDate: Date
  endDate: Date
  coverageAmount: number
  premiumAmount: number
  premiumFrequency: string
  nextPremiumDue: Date
  beneficiaries: PolicyBeneficiary[]
  paymentHistory: PremiumPayment[]
  claims: InsuranceClaim[]
  renewalHistory: PolicyRenewal[]
  documents: PolicyDocument[]
  riskAssessment: RiskAssessmentResult
  issuedAt: Date
  lastUpdated: Date
}

export type PolicyStatus = 
  | 'active'
  | 'pending_payment'
  | 'suspended'
  | 'cancelled'
  | 'expired'
  | 'pending_approval'
  | 'declined'

export interface PolicyBeneficiary {
  id: string
  name: string
  relationship: string
  percentage: number
  phoneNumber: string
  idDocument: string
  address: string
  isActive: boolean
}

export interface PremiumPayment {
  id: string
  amount: number
  currency: string
  paymentMethod: string
  paidAt: Date
  dueDate: Date
  status: 'paid' | 'pending' | 'overdue' | 'failed'
  transactionId: string
  gracePeriodExpiry?: Date
}

export interface InsuranceClaim {
  id: string
  claimNumber: string
  policyId: string
  userId: string
  incidentDate: Date
  reportedDate: Date
  claimType: string
  claimAmount: number
  status: ClaimStatus
  description: string
  location: string
  documents: ClaimDocument[]
  investigation: ClaimInvestigation
  settlement: ClaimSettlement
  appealHistory: ClaimAppeal[]
  createdAt: Date
  updatedAt: Date
}

export type ClaimStatus = 
  | 'reported'
  | 'under_investigation'
  | 'approved'
  | 'rejected'
  | 'settled'
  | 'appealed'
  | 'closed'

export interface ClaimDocument {
  id: string
  type: string
  filename: string
  uploadedAt: Date
  verificationStatus: 'pending' | 'verified' | 'rejected'
  fileUrl: string
}

export interface ClaimInvestigation {
  investigatorId: string
  investigatorName: string
  startDate: Date
  completedDate?: Date
  findings: string
  recommendations: string
  evidenceGathered: string[]
  status: 'pending' | 'in_progress' | 'completed'
}

export interface ClaimSettlement {
  approvedAmount: number
  rejectedAmount: number
  rejectionReason?: string
  settlementDate?: Date
  paymentMethod: string
  paymentReference?: string
  deductions: SettlementDeduction[]
}

export interface SettlementDeduction {
  type: 'deductible' | 'depreciation' | 'policy_limit' | 'other'
  amount: number
  description: string
}

export interface ClaimAppeal {
  id: string
  appealDate: Date
  reason: string
  documentation: string[]
  reviewDate?: Date
  decision?: 'upheld' | 'overturned' | 'modified'
  newSettlement?: ClaimSettlement
}

export interface PolicyDocument {
  id: string
  type: 'policy_certificate' | 'terms_conditions' | 'premium_receipt' | 'claim_form'
  filename: string
  generatedAt: Date
  fileUrl: string
  isValid: boolean
}

export interface PolicyRenewal {
  id: string
  renewalDate: Date
  previousPolicyId: string
  newPolicyId: string
  premiumChange: number
  coverageChanges: string[]
  renewalMethod: 'automatic' | 'manual'
  notificationSent: boolean
}

export interface RiskAssessmentResult {
  overallRisk: 'low' | 'medium' | 'high'
  riskFactors: AssessedRiskFactor[]
  recommendations: string[]
  premiumAdjustment: number
  assessmentDate: Date
  validUntil: Date
  assessorId: string
}

export interface AssessedRiskFactor {
  factor: string
  rating: 'low' | 'medium' | 'high'
  impact: number
  description: string
  evidence: string[]
}

export interface WeatherData {
  date: Date
  location: string
  temperature: {
    min: number
    max: number
    average: number
  }
  rainfall: number
  humidity: number
  windSpeed: number
  conditions: string
  alerts: WeatherAlert[]
}

export interface WeatherAlert {
  type: 'drought' | 'flood' | 'storm' | 'frost' | 'hail' | 'extreme_temperature'
  severity: 'low' | 'medium' | 'high' | 'extreme'
  startDate: Date
  endDate?: Date
  affectedAreas: string[]
  description: string
}

export interface ParametricTrigger {
  id: string
  productId: string
  triggerType: 'weather' | 'satellite' | 'market_price' | 'commodity_index'
  parameter: string
  threshold: number
  operator: 'greater_than' | 'less_than' | 'equal_to' | 'between'
  measurement_period: string
  location: string
  dataSource: string
  isActive: boolean
  payoutStructure: PayoutStructure
}

export interface PayoutStructure {
  calculation: 'fixed' | 'linear' | 'stepped'
  minimumPayout: number
  maximumPayout: number
  payoutLevels: PayoutLevel[]
}

export interface PayoutLevel {
  condition: string
  payoutPercentage: number
  description: string
}

export class InsuranceProductManager {
  private products: Map<string, InsuranceProduct> = new Map()
  private policies: Map<string, InsurancePolicy> = new Map()
  private claims: Map<string, InsuranceClaim> = new Map()
  private weatherData: Map<string, WeatherData[]> = new Map()
  private parametricTriggers: Map<string, ParametricTrigger> = new Map()

  constructor() {
    this.initializeProducts()
    this.initializeParametricTriggers()
    this.startWeatherMonitoring()
  }

  private initializeProducts() {
    const products: InsuranceProduct[] = [
      {
        id: 'crop_maize_weather',
        name: 'Maize Weather Index Insurance',
        type: 'parametric',
        category: 'crop',
        provider: 'Pula Advisors',
        description: 'Weather-based crop insurance for maize farmers protecting against drought and excess rainfall',
        coverage: {
          maxCoverageAmount: 2000000, // UGX
          deductible: 0,
          coveredPerils: ['drought', 'excess_rainfall', 'delayed_onset', 'early_cessation'],
          exclusions: ['war', 'civil_unrest', 'nuclear_hazard', 'poor_farming_practices'],
          beneficiaries: [
            {
              relationship: 'self',
              maxBeneficiaries: 1,
              requiredDocuments: ['national_id']
            }
          ],
          geographicCoverage: ['Central_Uganda', 'Eastern_Uganda', 'Western_Uganda'],
          seasonalRestrictions: ['rainy_season_a', 'rainy_season_b']
        },
        premium: {
          basePremium: 150000, // UGX
          currency: 'UGX',
          calculationMethod: 'percentage_of_coverage',
          riskFactors: [
            {
              factor: 'farm_location',
              description: 'Geographic risk based on historical weather patterns',
              impact: 'increase',
              multiplier: 1.2,
              conditions: ['high_risk_zone']
            },
            {
              factor: 'farm_size',
              description: 'Larger farms get volume discounts',
              impact: 'decrease',
              multiplier: 0.9,
              conditions: ['farm_size_greater_than_5_acres']
            }
          ],
          discounts: [
            {
              type: 'group_discount',
              percentage: 15,
              conditions: ['minimum_10_farmers', 'same_cooperative'],
              validUntil: new Date('2024-12-31')
            },
            {
              type: 'digital_payment',
              percentage: 5,
              conditions: ['mobile_money_payment']
            }
          ],
          loadingFactors: [],
          paymentOptions: [
            {
              method: 'mobile_money',
              processingFee: 1000,
              minimumAmount: 50000,
              frequency: ['seasonal', 'monthly']
            }
          ]
        },
        eligibility: {
          requiredDocuments: ['national_id', 'land_title_or_lease', 'farming_permit'],
          eligibilityChecks: [
            {
              type: 'location_verification',
              required: true,
              documents: ['gps_coordinates', 'land_certificate'],
              validityPeriodDays: 365
            },
            {
              type: 'occupation_check',
              required: true,
              documents: ['farming_license'],
              validityPeriodDays: 365
            }
          ],
          exclusions: ['commercial_large_scale_farming'],
          groupRequirements: {
            minimumMembers: 5,
            maximumMembers: 50,
            groupType: 'cooperative',
            leadershipRequirements: ['registered_cooperative_leader']
          }
        },
        claims: {
          reportingMethods: ['mobile_app', 'ussd', 'agent_network', 'phone_call'],
          documentationRequired: ['farm_photos', 'weather_report', 'farming_records'],
          maxReportingDays: 30,
          investigationProcess: [
            {
              step: 1,
              description: 'Satellite data verification',
              timeline: '3-5 days',
              requiredDocuments: ['satellite_imagery'],
              responsibleParty: 'technical_team'
            },
            {
              step: 2,
              description: 'Ground truthing visit',
              timeline: '7-10 days',
              requiredDocuments: ['field_assessment_report'],
              responsibleParty: 'field_agent'
            }
          ],
          settlementTimeframe: '15-21 days',
          appealProcess: [
            {
              level: 1,
              description: 'Internal review',
              timeframe: '7 days',
              requiredDocuments: ['appeal_letter', 'additional_evidence'],
              authority: 'claims_manager'
            }
          ],
          paymentMethods: ['mobile_money', 'bank_transfer']
        },
        isActive: true,
        availableRegions: ['UG', 'KE', 'TZ'],
        requiresMedicalExam: false,
        paymentFrequency: 'seasonal',
        gracePeriodDays: 15,
        waitingPeriodDays: 30,
        renewalTerms: {
          autoRenewal: true,
          renewalNotificationDays: 30,
          rateChangeNotificationDays: 45,
          renewalDiscounts: [
            {
              type: 'loyalty_discount',
              percentage: 10,
              conditions: ['no_claims_previous_season']
            }
          ],
          nonRenewalConditions: ['excessive_claims', 'fraud_detected']
        }
      },
      {
        id: 'health_basic_family',
        name: 'Basic Family Health Insurance',
        type: 'indemnity',
        category: 'health',
        provider: 'Uganda Health Insurance',
        description: 'Basic health coverage for families including outpatient, inpatient, and emergency care',
        coverage: {
          maxCoverageAmount: 5000000, // UGX per year
          deductible: 50000,
          coveredPerils: ['illness', 'injury', 'emergency', 'maternity', 'preventive_care'],
          exclusions: ['cosmetic_surgery', 'experimental_treatments', 'pre_existing_conditions'],
          beneficiaries: [
            {
              relationship: 'spouse',
              maxBeneficiaries: 1,
              requiredDocuments: ['marriage_certificate', 'national_id']
            },
            {
              relationship: 'child',
              maxBeneficiaries: 6,
              requiredDocuments: ['birth_certificate', 'immunization_record']
            }
          ],
          geographicCoverage: ['Uganda_nationwide']
        },
        premium: {
          basePremium: 300000, // UGX per year
          currency: 'UGX',
          calculationMethod: 'risk_based',
          riskFactors: [
            {
              factor: 'age',
              description: 'Premium increases with age',
              impact: 'increase',
              multiplier: 1.05,
              conditions: ['age_over_50']
            },
            {
              factor: 'family_size',
              description: 'Additional premium per family member',
              impact: 'increase',
              multiplier: 1.2,
              conditions: ['more_than_4_members']
            }
          ],
          discounts: [
            {
              type: 'group_discount',
              percentage: 20,
              conditions: ['workplace_group', 'minimum_20_members']
            }
          ],
          loadingFactors: [
            {
              reason: 'high_risk_occupation',
              percentage: 25,
              description: 'Jobs with higher injury risk'
            }
          ],
          paymentOptions: [
            {
              method: 'mobile_money',
              processingFee: 2000,
              minimumAmount: 100000,
              frequency: ['monthly', 'quarterly', 'annual']
            }
          ]
        },
        eligibility: {
          minimumIncome: 200000, // UGX per month
          maximumIncome: 2000000, // UGX per month
          requiredDocuments: ['national_id', 'income_certificate', 'residence_proof'],
          eligibilityChecks: [
            {
              type: 'health_screening',
              required: true,
              documents: ['medical_report', 'health_questionnaire'],
              validityPeriodDays: 180
            },
            {
              type: 'income_verification',
              required: true,
              documents: ['salary_slip', 'bank_statement'],
              validityPeriodDays: 90
            }
          ],
          exclusions: ['age_over_70', 'terminal_illness']
        },
        claims: {
          reportingMethods: ['mobile_app', 'phone_call', 'hospital_direct_billing'],
          documentationRequired: ['medical_report', 'receipts', 'prescription'],
          maxReportingDays: 90,
          investigationProcess: [
            {
              step: 1,
              description: 'Medical records review',
              timeline: '5-7 days',
              requiredDocuments: ['hospital_records'],
              responsibleParty: 'medical_reviewer'
            }
          ],
          settlementTimeframe: '10-14 days',
          appealProcess: [
            {
              level: 1,
              description: 'Medical board review',
              timeframe: '14 days',
              requiredDocuments: ['medical_opinion', 'additional_tests'],
              authority: 'medical_board'
            }
          ],
          paymentMethods: ['mobile_money', 'bank_transfer', 'direct_payment_to_provider']
        },
        isActive: true,
        availableRegions: ['UG'],
        minimumAge: 18,
        maximumAge: 65,
        requiresMedicalExam: true,
        paymentFrequency: 'monthly',
        gracePeriodDays: 30,
        waitingPeriodDays: 90,
        renewalTerms: {
          autoRenewal: true,
          renewalNotificationDays: 60,
          rateChangeNotificationDays: 90,
          renewalDiscounts: [
            {
              type: 'loyalty_discount',
              percentage: 5,
              conditions: ['continuous_coverage_2_years']
            }
          ],
          nonRenewalConditions: ['fraud', 'excessive_claims_abuse']
        }
      }
    ]

    products.forEach(product => {
      this.products.set(product.id, product)
    })
  }

  private initializeParametricTriggers() {
    const triggers: ParametricTrigger[] = [
      {
        id: 'drought_trigger_central_ug',
        productId: 'crop_maize_weather',
        triggerType: 'weather',
        parameter: 'rainfall',
        threshold: 50, // mm per month
        operator: 'less_than',
        measurement_period: 'monthly',
        location: 'Central_Uganda',
        dataSource: 'Uganda_Meteorological_Authority',
        isActive: true,
        payoutStructure: {
          calculation: 'linear',
          minimumPayout: 250000, // UGX
          maximumPayout: 2000000, // UGX
          payoutLevels: [
            {
              condition: 'rainfall_30_50mm',
              payoutPercentage: 25,
              description: 'Mild drought conditions'
            },
            {
              condition: 'rainfall_10_30mm',
              payoutPercentage: 50,
              description: 'Moderate drought conditions'
            },
            {
              condition: 'rainfall_below_10mm',
              payoutPercentage: 100,
              description: 'Severe drought conditions'
            }
          ]
        }
      }
    ]

    triggers.forEach(trigger => {
      this.parametricTriggers.set(trigger.id, trigger)
    })
  }

  // Purchase insurance policy
  async purchasePolicy(
    userId: string,
    productId: string,
    coverageAmount: number,
    beneficiaries: PolicyBeneficiary[],
    groupId?: string
  ): Promise<InsurancePolicy> {
    const product = this.products.get(productId)
    if (!product || !product.isActive) {
      throw new Error('Product not available')
    }

    // Validate eligibility
    await this.validateEligibility(userId, product)

    // Calculate premium
    const premium = await this.calculatePremium(userId, product, coverageAmount)

    // Perform risk assessment
    const riskAssessment = await this.performRiskAssessment(userId, product)

    const policyId = `pol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const policyNumber = this.generatePolicyNumber(product.type, product.category)

    const policy: InsurancePolicy = {
      id: policyId,
      productId,
      policyNumber,
      userId,
      groupId,
      status: 'pending_payment',
      startDate: new Date(),
      endDate: this.calculateEndDate(product.paymentFrequency),
      coverageAmount,
      premiumAmount: premium.totalPremium,
      premiumFrequency: product.paymentFrequency,
      nextPremiumDue: new Date(),
      beneficiaries,
      paymentHistory: [],
      claims: [],
      renewalHistory: [],
      documents: [],
      riskAssessment,
      issuedAt: new Date(),
      lastUpdated: new Date()
    }

    this.policies.set(policyId, policy)
    return policy
  }

  // Process premium payment
  async processPremiumPayment(
    policyId: string,
    amount: number,
    paymentMethod: string,
    transactionId: string
  ): Promise<void> {
    const policy = this.policies.get(policyId)
    if (!policy) {
      throw new Error('Policy not found')
    }

    const payment: PremiumPayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency: 'UGX',
      paymentMethod,
      paidAt: new Date(),
      dueDate: policy.nextPremiumDue,
      status: 'paid',
      transactionId
    }

    policy.paymentHistory.push(payment)
    policy.status = 'active'
    policy.nextPremiumDue = this.calculateNextPremiumDue(policy)
    policy.lastUpdated = new Date()

    this.policies.set(policyId, policy)
  }

  // Submit insurance claim
  async submitClaim(
    policyId: string,
    incidentDate: Date,
    claimType: string,
    claimAmount: number,
    description: string,
    location: string,
    documents: ClaimDocument[]
  ): Promise<InsuranceClaim> {
    const policy = this.policies.get(policyId)
    if (!policy) {
      throw new Error('Policy not found')
    }

    if (policy.status !== 'active') {
      throw new Error('Policy not active')
    }

    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const claimNumber = this.generateClaimNumber()

    const claim: InsuranceClaim = {
      id: claimId,
      claimNumber,
      policyId,
      userId: policy.userId,
      incidentDate,
      reportedDate: new Date(),
      claimType,
      claimAmount,
      status: 'reported',
      description,
      location,
      documents,
      investigation: {
        investigatorId: '',
        investigatorName: '',
        startDate: new Date(),
        findings: '',
        recommendations: '',
        evidenceGathered: [],
        status: 'pending'
      },
      settlement: {
        approvedAmount: 0,
        rejectedAmount: 0,
        paymentMethod: '',
        deductions: []
      },
      appealHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.claims.set(claimId, claim)
    policy.claims.push(claim)

    // Start investigation for parametric products
    const product = this.products.get(policy.productId)
    if (product?.type === 'parametric') {
      await this.processParametricClaim(claim)
    } else {
      await this.startClaimInvestigation(claim)
    }

    return claim
  }

  // Process parametric claim automatically
  private async processParametricClaim(claim: InsuranceClaim): Promise<void> {
    const policy = this.policies.get(claim.policyId)
    if (!policy) return

    const product = this.products.get(policy.productId)
    if (!product) return

    // Get relevant triggers
    const triggers = Array.from(this.parametricTriggers.values())
      .filter(t => t.productId === product.id && t.isActive)

    for (const trigger of triggers) {
      const payoutAmount = await this.evaluateParametricTrigger(trigger, claim)
      
      if (payoutAmount > 0) {
        claim.status = 'approved'
        claim.settlement.approvedAmount = payoutAmount
        claim.settlement.settlementDate = new Date()
        claim.settlement.paymentMethod = 'mobile_money'
        claim.updatedAt = new Date()
        
        this.claims.set(claim.id, claim)
        break
      }
    }
  }

  // Start traditional claim investigation
  private async startClaimInvestigation(claim: InsuranceClaim): Promise<void> {
    claim.status = 'under_investigation'
    claim.investigation.status = 'in_progress'
    claim.investigation.investigatorId = 'inv_001'
    claim.investigation.investigatorName = 'John Investigator'
    claim.updatedAt = new Date()

    this.claims.set(claim.id, claim)

    // Simulate investigation process
    setTimeout(async () => {
      await this.completeInvestigation(claim.id)
    }, 7 * 24 * 60 * 60 * 1000) // 7 days
  }

  // Complete claim investigation
  private async completeInvestigation(claimId: string): Promise<void> {
    const claim = this.claims.get(claimId)
    if (!claim) return

    claim.investigation.status = 'completed'
    claim.investigation.completedDate = new Date()
    claim.investigation.findings = 'Claim verified and eligible for compensation'
    claim.investigation.recommendations = 'Approve full claim amount'

    // Approve claim (simplified logic)
    claim.status = 'approved'
    claim.settlement.approvedAmount = claim.claimAmount * 0.9 // 90% after deductible
    claim.settlement.deductions = [
      {
        type: 'deductible',
        amount: claim.claimAmount * 0.1,
        description: 'Policy deductible'
      }
    ]
    claim.settlement.settlementDate = new Date()
    claim.settlement.paymentMethod = 'mobile_money'
    claim.updatedAt = new Date()

    this.claims.set(claimId, claim)
  }

  // Evaluate parametric trigger
  private async evaluateParametricTrigger(
    trigger: ParametricTrigger,
    claim: InsuranceClaim
  ): Promise<number> {
    // Get weather data for the claim location and period
    const weatherData = await this.getWeatherData(claim.location, claim.incidentDate)
    
    if (trigger.parameter === 'rainfall') {
      const totalRainfall = weatherData.reduce((sum, data) => sum + data.rainfall, 0)
      
      if (totalRainfall < trigger.threshold) {
        // Calculate payout based on severity
        const severityRatio = (trigger.threshold - totalRainfall) / trigger.threshold
        const payout = trigger.payoutStructure.minimumPayout + 
          (severityRatio * (trigger.payoutStructure.maximumPayout - trigger.payoutStructure.minimumPayout))
        
        return Math.min(payout, trigger.payoutStructure.maximumPayout)
      }
    }

    return 0
  }

  // Get weather data
  private async getWeatherData(location: string, startDate: Date): Promise<WeatherData[]> {
    // Simulate weather API call
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    const data: WeatherData[] = []

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      data.push({
        date: new Date(d),
        location,
        temperature: {
          min: 18 + Math.random() * 5,
          max: 28 + Math.random() * 8,
          average: 23 + Math.random() * 5
        },
        rainfall: Math.random() * 20, // Simulated low rainfall for drought
        humidity: 60 + Math.random() * 30,
        windSpeed: 5 + Math.random() * 10,
        conditions: 'partly_cloudy',
        alerts: []
      })
    }

    return data
  }

  // Start weather monitoring
  private startWeatherMonitoring(): void {
    setInterval(async () => {
      await this.checkParametricTriggers()
    }, 24 * 60 * 60 * 1000) // Check daily
  }

  // Check parametric triggers
  private async checkParametricTriggers(): Promise<void> {
    const activeTriggers = Array.from(this.parametricTriggers.values())
      .filter(t => t.isActive)

    for (const trigger of activeTriggers) {
      const currentWeather = await this.getCurrentWeatherData(trigger.location)
      
      if (this.isTriggerConditionMet(trigger, currentWeather)) {
        await this.triggerAutomaticPayouts(trigger)
      }
    }
  }

  // Helper methods
  private async validateEligibility(userId: string, product: InsuranceProduct): Promise<void> {
    // Simplified eligibility validation
    console.log(`Validating eligibility for user ${userId} and product ${product.name}`)
    return Promise.resolve()
  }

  private async calculatePremium(
    userId: string,
    product: InsuranceProduct,
    coverageAmount: number
  ): Promise<{ totalPremium: number; breakdown: any }> {
    let basePremium = product.premium.basePremium
    
    if (product.premium.calculationMethod === 'percentage_of_coverage') {
      basePremium = coverageAmount * 0.05 // 5% of coverage
    }

    return {
      totalPremium: basePremium,
      breakdown: {
        base: basePremium,
        discounts: 0,
        loadings: 0
      }
    }
  }

  private async performRiskAssessment(
    userId: string,
    product: InsuranceProduct
  ): Promise<RiskAssessmentResult> {
    return {
      overallRisk: 'medium',
      riskFactors: [
        {
          factor: 'location',
          rating: 'medium',
          impact: 1.1,
          description: 'Geographic risk assessment',
          evidence: ['historical_weather_data']
        }
      ],
      recommendations: ['Regular monitoring', 'Risk mitigation practices'],
      premiumAdjustment: 0,
      assessmentDate: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      assessorId: 'system'
    }
  }

  private calculateEndDate(paymentFrequency: string): Date {
    const now = new Date()
    switch (paymentFrequency) {
      case 'annual':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
      case 'seasonal':
        return new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000) // 6 months
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
      default:
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    }
  }

  private calculateNextPremiumDue(policy: InsurancePolicy): Date {
    const current = new Date()
    switch (policy.premiumFrequency) {
      case 'monthly':
        return new Date(current.getFullYear(), current.getMonth() + 1, current.getDate())
      case 'seasonal':
        return new Date(current.getTime() + 6 * 30 * 24 * 60 * 60 * 1000)
      case 'annual':
        return new Date(current.getFullYear() + 1, current.getMonth(), current.getDate())
      default:
        return new Date(current.getFullYear(), current.getMonth() + 1, current.getDate())
    }
  }

  private generatePolicyNumber(type: InsuranceType, category: string): string {
    const prefix = `${type.substring(0, 3).toUpperCase()}${category.substring(0, 3).toUpperCase()}`
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }

  private generateClaimNumber(): string {
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `CLM${timestamp}${random}`
  }

  private async getCurrentWeatherData(location: string): Promise<WeatherData> {
    // Simulate current weather API call
    return {
      date: new Date(),
      location,
      temperature: {
        min: 20,
        max: 30,
        average: 25
      },
      rainfall: Math.random() * 50,
      humidity: 70,
      windSpeed: 8,
      conditions: 'partly_cloudy',
      alerts: []
    }
  }

  private isTriggerConditionMet(trigger: ParametricTrigger, weather: WeatherData): boolean {
    if (trigger.parameter === 'rainfall') {
      return weather.rainfall < trigger.threshold
    }
    return false
  }

  private async triggerAutomaticPayouts(trigger: ParametricTrigger): Promise<void> {
    // Find active policies for this product
    const eligiblePolicies = Array.from(this.policies.values())
      .filter(p => p.productId === trigger.productId && p.status === 'active')

    for (const policy of eligiblePolicies) {
      // Create automatic claim
      const claim: InsuranceClaim = {
        id: `auto_claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        claimNumber: this.generateClaimNumber(),
        policyId: policy.id,
        userId: policy.userId,
        incidentDate: new Date(),
        reportedDate: new Date(),
        claimType: 'parametric_trigger',
        claimAmount: policy.coverageAmount,
        status: 'approved',
        description: `Automatic payout triggered by ${trigger.parameter} conditions`,
        location: trigger.location,
        documents: [],
        investigation: {
          investigatorId: 'system',
          investigatorName: 'Automated System',
          startDate: new Date(),
          completedDate: new Date(),
          findings: 'Parametric trigger conditions met',
          recommendations: 'Automatic payout approved',
          evidenceGathered: [`${trigger.parameter}_data`],
          status: 'completed'
        },
        settlement: {
          approvedAmount: trigger.payoutStructure.maximumPayout,
          rejectedAmount: 0,
          settlementDate: new Date(),
          paymentMethod: 'mobile_money',
          deductions: []
        },
        appealHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      this.claims.set(claim.id, claim)
      policy.claims.push(claim)
    }
  }

  // Public getters
  getProducts(): InsuranceProduct[] {
    return Array.from(this.products.values()).filter(p => p.isActive)
  }

  getProduct(productId: string): InsuranceProduct | undefined {
    return this.products.get(productId)
  }

  getPolicy(policyId: string): InsurancePolicy | undefined {
    return this.policies.get(policyId)
  }

  getUserPolicies(userId: string): InsurancePolicy[] {
    return Array.from(this.policies.values()).filter(p => p.userId === userId)
  }

  getClaim(claimId: string): InsuranceClaim | undefined {
    return this.claims.get(claimId)
  }

  getUserClaims(userId: string): InsuranceClaim[] {
    return Array.from(this.claims.values()).filter(c => c.userId === userId)
  }
}

// Singleton instance
export const insuranceProductManager = new InsuranceProductManager()
