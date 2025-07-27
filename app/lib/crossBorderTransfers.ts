// Cross-Border Money Transfer System
// Phase 3: International Remittances and Multi-Currency Support

export interface Currency {
  code: string
  name: string
  symbol: string
  decimalPlaces: number
  exchangeRate: number // Rate to USD
  countryCode: string
  isStable: boolean
  blockchainNetwork?: string
  contractAddress?: string
}

export interface ExchangeRate {
  fromCurrency: string
  toCurrency: string
  rate: number
  inverseRate: number
  lastUpdated: Date
  source: string
  spread: number
  isLive: boolean
}

export interface PaymentCorridor {
  id: string
  fromCountry: string
  toCountry: string
  fromCurrency: string
  toCurrency: string
  isActive: boolean
  minAmount: number
  maxAmount: number
  transferFeePercent: number
  fixedFee: number
  estimatedDeliveryMinutes: number
  regulatoryRequirements: string[]
  supportedMethods: PaymentMethod[]
  complianceLevel: 'basic' | 'enhanced' | 'full'
}

export interface PaymentMethod {
  id: string
  name: string
  type: 'mobile_money' | 'bank_transfer' | 'cash_pickup' | 'crypto_wallet' | 'agent_network'
  isAvailable: boolean
  processingTimeMinutes: number
  feePercent: number
  fixedFee: number
  limits: {
    min: number
    max: number
    dailyLimit: number
    monthlyLimit: number
  }
  requiredInfo: string[]
}

export interface CrossBorderTransfer {
  id: string
  senderId: string
  recipientId: string
  fromCountry: string
  toCountry: string
  fromCurrency: string
  toCurrency: string
  sendAmount: number
  receiveAmount: number
  exchangeRate: number
  transferFee: number
  totalCost: number
  paymentMethod: string
  deliveryMethod: string
  status: TransferStatus
  complianceChecks: ComplianceCheck[]
  estimatedDelivery: Date
  actualDelivery?: Date
  trackingNumber: string
  purpose: string
  sourceOfFunds: string
  beneficiaryRelationship: string
  createdAt: Date
  updatedAt: Date
  cancellationReason?: string
  refundAmount?: number
  refundDate?: Date
}

export type TransferStatus = 
  | 'initiated'
  | 'compliance_check'
  | 'awaiting_payment'
  | 'payment_confirmed'
  | 'processing'
  | 'sent_to_partner'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'refunded'

export interface ComplianceCheck {
  type: 'aml' | 'sanctions' | 'pep' | 'kyc' | 'tax_reporting'
  status: 'pending' | 'passed' | 'failed' | 'manual_review'
  checkedAt: Date
  result?: any
  flags: string[]
  riskScore: number
}

export interface TransferPartner {
  id: string
  name: string
  type: 'money_transfer_operator' | 'bank' | 'mobile_money' | 'crypto_exchange'
  countries: string[]
  currencies: string[]
  apiEndpoint: string
  isActive: boolean
  trustScore: number
  averageProcessingTime: number
  successRate: number
  supportedMethods: PaymentMethod[]
  complianceRating: 'A' | 'B' | 'C'
  regulatoryLicenses: string[]
}

export interface RemittanceReport {
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalTransfers: number
    totalVolume: number
    averageAmount: number
    successRate: number
    topCorridors: CorridorStats[]
    topCurrencies: CurrencyStats[]
  }
  compliance: {
    amlChecks: number
    sanctionsHits: number
    manualReviews: number
    reportedToAuthorities: number
  }
  partnersPerformance: PartnerPerformanceStats[]
}

export interface CorridorStats {
  corridor: string
  transferCount: number
  volume: number
  averageAmount: number
  successRate: number
}

export interface CurrencyStats {
  currency: string
  sendVolume: number
  receiveVolume: number
  transferCount: number
  averageRate: number
}

export interface PartnerPerformanceStats {
  partnerId: string
  partnerName: string
  transferCount: number
  successRate: number
  averageProcessingTime: number
  customerSatisfaction: number
}

export class CrossBorderTransferSystem {
  private currencies: Map<string, Currency> = new Map()
  private exchangeRates: Map<string, ExchangeRate> = new Map()
  private paymentCorridors: Map<string, PaymentCorridor> = new Map()
  private transfers: Map<string, CrossBorderTransfer> = new Map()
  private partners: Map<string, TransferPartner> = new Map()
  private complianceEngine: ComplianceEngine
  private rateProvider: ExchangeRateProvider

  constructor() {
    this.complianceEngine = new ComplianceEngine()
    this.rateProvider = new ExchangeRateProvider()
    this.initializeCurrencies()
    this.initializePaymentCorridors()
    this.initializePartners()
    this.startRateUpdates()
  }

  private initializeCurrencies() {
    const currencyData: Currency[] = [
      {
        code: 'UGX',
        name: 'Ugandan Shilling',
        symbol: 'UGX',
        decimalPlaces: 0,
        exchangeRate: 0.00027, // to USD
        countryCode: 'UG',
        isStable: false
      },
      {
        code: 'KES',
        name: 'Kenyan Shilling',
        symbol: 'KSh',
        decimalPlaces: 2,
        exchangeRate: 0.0077, // to USD
        countryCode: 'KE',
        isStable: false
      },
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        decimalPlaces: 2,
        exchangeRate: 1.0,
        countryCode: 'US',
        isStable: true
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        decimalPlaces: 2,
        exchangeRate: 1.08,
        countryCode: 'EU',
        isStable: true
      },
      {
        code: 'GBP',
        name: 'British Pound',
        symbol: '£',
        decimalPlaces: 2,
        exchangeRate: 1.26,
        countryCode: 'GB',
        isStable: true
      },
      {
        code: 'CUSD',
        name: 'Celo Dollar',
        symbol: 'cUSD',
        decimalPlaces: 18,
        exchangeRate: 1.0,
        countryCode: 'GL', // Global
        isStable: true,
        blockchainNetwork: 'Celo',
        contractAddress: '0x765DE816845861e75A25fCA122bb6898B8B1282a'
      }
    ]

    currencyData.forEach(currency => {
      this.currencies.set(currency.code, currency)
    })
  }

  private initializePaymentCorridors() {
    const corridors: PaymentCorridor[] = [
      {
        id: 'UG-KE',
        fromCountry: 'UG',
        toCountry: 'KE',
        fromCurrency: 'UGX',
        toCurrency: 'KES',
        isActive: true,
        minAmount: 10000, // UGX
        maxAmount: 5000000, // UGX
        transferFeePercent: 2.5,
        fixedFee: 5000,
        estimatedDeliveryMinutes: 30,
        regulatoryRequirements: ['sender_kyc', 'recipient_verification'],
        supportedMethods: [
          {
            id: 'mobile_money_ug_ke',
            name: 'Mobile Money Transfer',
            type: 'mobile_money',
            isAvailable: true,
            processingTimeMinutes: 15,
            feePercent: 1.5,
            fixedFee: 2000,
            limits: {
              min: 10000,
              max: 1000000,
              dailyLimit: 2000000,
              monthlyLimit: 10000000
            },
            requiredInfo: ['phone_number', 'recipient_name']
          }
        ],
        complianceLevel: 'enhanced'
      },
      {
        id: 'UG-US',
        fromCountry: 'UG',
        toCountry: 'US',
        fromCurrency: 'UGX',
        toCurrency: 'USD',
        isActive: true,
        minAmount: 50000, // UGX
        maxAmount: 50000000, // UGX
        transferFeePercent: 3.5,
        fixedFee: 15000,
        estimatedDeliveryMinutes: 120,
        regulatoryRequirements: ['full_kyc', 'source_of_funds', 'purpose_verification'],
        supportedMethods: [
          {
            id: 'bank_transfer_ug_us',
            name: 'Bank Wire Transfer',
            type: 'bank_transfer',
            isAvailable: true,
            processingTimeMinutes: 60,
            feePercent: 2.0,
            fixedFee: 10000,
            limits: {
              min: 50000,
              max: 10000000,
              dailyLimit: 20000000,
              monthlyLimit: 100000000
            },
            requiredInfo: ['bank_account', 'swift_code', 'recipient_address']
          }
        ],
        complianceLevel: 'full'
      }
    ]

    corridors.forEach(corridor => {
      this.paymentCorridors.set(corridor.id, corridor)
    })
  }

  private initializePartners() {
    const partners: TransferPartner[] = [
      {
        id: 'airtel_money',
        name: 'Airtel Money',
        type: 'mobile_money',
        countries: ['UG', 'KE', 'TZ', 'RW'],
        currencies: ['UGX', 'KES', 'TZS', 'RWF'],
        apiEndpoint: 'https://api.airtel.africa/merchant/v1',
        isActive: true,
        trustScore: 95,
        averageProcessingTime: 15,
        successRate: 98.5,
        supportedMethods: [],
        complianceRating: 'A',
        regulatoryLicenses: ['PSP-UG-001', 'PSP-KE-002']
      },
      {
        id: 'western_union',
        name: 'Western Union',
        type: 'money_transfer_operator',
        countries: ['US', 'GB', 'UG', 'KE', 'NG', 'GH'],
        currencies: ['USD', 'GBP', 'EUR', 'UGX', 'KES', 'NGN', 'GHS'],
        apiEndpoint: 'https://api.westernunion.com/v1',
        isActive: true,
        trustScore: 99,
        averageProcessingTime: 45,
        successRate: 99.2,
        supportedMethods: [],
        complianceRating: 'A',
        regulatoryLicenses: ['MSB-US-001', 'FCA-GB-001']
      }
    ]

    partners.forEach(partner => {
      this.partners.set(partner.id, partner)
    })
  }

  // Initiate cross-border transfer
  async initiateTransfer(transferRequest: {
    senderId: string
    recipientInfo: {
      name: string
      phoneNumber?: string
      accountNumber?: string
      address?: string
    }
    fromCountry: string
    toCountry: string
    fromCurrency: string
    toCurrency: string
    sendAmount: number
    paymentMethod: string
    deliveryMethod: string
    purpose: string
    sourceOfFunds: string
    beneficiaryRelationship: string
  }): Promise<CrossBorderTransfer> {
    
    // Generate transfer ID
    const transferId = `xb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Get corridor
    const corridorId = `${transferRequest.fromCountry}-${transferRequest.toCountry}`
    const corridor = this.paymentCorridors.get(corridorId)
    
    if (!corridor || !corridor.isActive) {
      throw new Error(`Transfer corridor ${corridorId} not available`)
    }

    // Validate amount limits
    if (transferRequest.sendAmount < corridor.minAmount || transferRequest.sendAmount > corridor.maxAmount) {
      throw new Error(`Amount must be between ${corridor.minAmount} and ${corridor.maxAmount}`)
    }

    // Calculate exchange rate and fees
    const exchangeRate = await this.getExchangeRate(transferRequest.fromCurrency, transferRequest.toCurrency)
    const transferFee = this.calculateTransferFee(transferRequest.sendAmount, corridor)
    const receiveAmount = (transferRequest.sendAmount - transferFee) * exchangeRate.rate
    const totalCost = transferRequest.sendAmount + transferFee

    // Create transfer
    const transfer: CrossBorderTransfer = {
      id: transferId,
      senderId: transferRequest.senderId,
      recipientId: `recipient_${Date.now()}`,
      fromCountry: transferRequest.fromCountry,
      toCountry: transferRequest.toCountry,
      fromCurrency: transferRequest.fromCurrency,
      toCurrency: transferRequest.toCurrency,
      sendAmount: transferRequest.sendAmount,
      receiveAmount,
      exchangeRate: exchangeRate.rate,
      transferFee,
      totalCost,
      paymentMethod: transferRequest.paymentMethod,
      deliveryMethod: transferRequest.deliveryMethod,
      status: 'initiated',
      complianceChecks: [],
      estimatedDelivery: new Date(Date.now() + corridor.estimatedDeliveryMinutes * 60 * 1000),
      trackingNumber: this.generateTrackingNumber(),
      purpose: transferRequest.purpose,
      sourceOfFunds: transferRequest.sourceOfFunds,
      beneficiaryRelationship: transferRequest.beneficiaryRelationship,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.transfers.set(transferId, transfer)

    // Start compliance checks
    await this.performComplianceChecks(transfer)

    return transfer
  }

  // Perform compliance checks
  private async performComplianceChecks(transfer: CrossBorderTransfer): Promise<void> {
    transfer.status = 'compliance_check'
    transfer.updatedAt = new Date()

    const checks: ComplianceCheck[] = []

    // AML check
    const amlCheck = await this.complianceEngine.performAMLCheck(transfer)
    checks.push(amlCheck)

    // Sanctions screening
    const sanctionsCheck = await this.complianceEngine.performSanctionsCheck(transfer)
    checks.push(sanctionsCheck)

    // PEP screening
    const pepCheck = await this.complianceEngine.performPEPCheck(transfer)
    checks.push(pepCheck)

    // Tax reporting check
    if (transfer.sendAmount > 1000000) { // Threshold for tax reporting
      const taxCheck = await this.complianceEngine.performTaxReportingCheck(transfer)
      checks.push(taxCheck)
    }

    transfer.complianceChecks = checks

    // Determine if manual review is needed
    const highRiskChecks = checks.filter(check => 
      check.riskScore > 70 || check.status === 'failed' || check.flags.length > 0
    )

    if (highRiskChecks.length > 0) {
      transfer.status = 'compliance_check' // Keep in manual review
    } else {
      transfer.status = 'awaiting_payment'
    }

    this.transfers.set(transfer.id, transfer)
  }

  // Get exchange rate
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate> {
    const rateKey = `${fromCurrency}-${toCurrency}`
    let rate = this.exchangeRates.get(rateKey)

    if (!rate || !this.isRateRecent(rate.lastUpdated)) {
      rate = await this.rateProvider.fetchRate(fromCurrency, toCurrency)
      this.exchangeRates.set(rateKey, rate)
    }

    return rate
  }

  // Calculate transfer fee
  private calculateTransferFee(amount: number, corridor: PaymentCorridor): number {
    const percentFee = amount * (corridor.transferFeePercent / 100)
    return percentFee + corridor.fixedFee
  }

  // Process payment
  async processPayment(transferId: string, paymentProof: any): Promise<void> {
    const transfer = this.transfers.get(transferId)
    if (!transfer) {
      throw new Error('Transfer not found')
    }

    if (transfer.status !== 'awaiting_payment') {
      throw new Error('Transfer not ready for payment')
    }

    // Verify payment with payment method
    const paymentVerified = await this.verifyPayment(transfer, paymentProof)
    
    if (paymentVerified) {
      transfer.status = 'payment_confirmed'
      transfer.updatedAt = new Date()
      
      // Send to partner for processing
      await this.sendToPartner(transfer)
    } else {
      transfer.status = 'failed'
      transfer.updatedAt = new Date()
    }

    this.transfers.set(transferId, transfer)
  }

  // Send transfer to partner
  private async sendToPartner(transfer: CrossBorderTransfer): Promise<void> {
    transfer.status = 'processing'
    transfer.updatedAt = new Date()

    // Select best partner for corridor
    const partner = await this.selectBestPartner(transfer)
    
    if (partner) {
      // Send to partner API
      const partnerResponse = await this.callPartnerAPI(partner, transfer)
      
      if (partnerResponse.success) {
        transfer.status = 'sent_to_partner'
      } else {
        transfer.status = 'failed'
      }
    } else {
      transfer.status = 'failed'
    }

    transfer.updatedAt = new Date()
    this.transfers.set(transfer.id, transfer)
  }

  // Track transfer status
  async getTransferStatus(transferId: string): Promise<CrossBorderTransfer | undefined> {
    const transfer = this.transfers.get(transferId)
    
    if (transfer && transfer.status === 'sent_to_partner') {
      // Poll partner for updates
      await this.updateTransferFromPartner(transfer)
    }

    return transfer
  }

  // Cancel transfer
  async cancelTransfer(transferId: string, reason: string): Promise<void> {
    const transfer = this.transfers.get(transferId)
    if (!transfer) {
      throw new Error('Transfer not found')
    }

    if (!['initiated', 'compliance_check', 'awaiting_payment'].includes(transfer.status)) {
      throw new Error('Transfer cannot be cancelled at this stage')
    }

    // Process refund if payment was made
    const needsRefund = transfer.status === 'payment_confirmed'

    transfer.status = 'cancelled'
    transfer.cancellationReason = reason
    transfer.updatedAt = new Date()

    if (needsRefund) {
      await this.processRefund(transfer)
    }

    this.transfers.set(transferId, transfer)
  }

  // Generate remittance report
  async generateRemittanceReport(startDate: Date, endDate: Date): Promise<RemittanceReport> {
    const transfers = Array.from(this.transfers.values())
      .filter(t => t.createdAt >= startDate && t.createdAt <= endDate)

    const completedTransfers = transfers.filter(t => t.status === 'completed')
    const totalVolume = completedTransfers.reduce((sum, t) => sum + t.sendAmount, 0)
    
    // Calculate corridor stats
    const corridorMap = new Map<string, { count: number, volume: number, successful: number }>()
    transfers.forEach(transfer => {
      const corridor = `${transfer.fromCountry}-${transfer.toCountry}`
      const stats = corridorMap.get(corridor) || { count: 0, volume: 0, successful: 0 }
      stats.count++
      stats.volume += transfer.sendAmount
      if (transfer.status === 'completed') stats.successful++
      corridorMap.set(corridor, stats)
    })

    const topCorridors: CorridorStats[] = Array.from(corridorMap.entries())
      .map(([corridor, stats]) => ({
        corridor,
        transferCount: stats.count,
        volume: stats.volume,
        averageAmount: stats.volume / stats.count,
        successRate: (stats.successful / stats.count) * 100
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10)

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalTransfers: transfers.length,
        totalVolume,
        averageAmount: totalVolume / completedTransfers.length || 0,
        successRate: (completedTransfers.length / transfers.length) * 100,
        topCorridors,
        topCurrencies: []
      },
      compliance: {
        amlChecks: transfers.filter(t => t.complianceChecks.some(c => c.type === 'aml')).length,
        sanctionsHits: 0,
        manualReviews: transfers.filter(t => t.complianceChecks.some(c => c.status === 'manual_review')).length,
        reportedToAuthorities: 0
      },
      partnersPerformance: []
    }
  }

  // Helper methods
  private generateTrackingNumber(): string {
    return `VDW${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  }

  private isRateRecent(lastUpdated: Date): boolean {
    const ageMinutes = (Date.now() - lastUpdated.getTime()) / (1000 * 60)
    return ageMinutes < 5 // Rates expire after 5 minutes
  }

  private async verifyPayment(transfer: CrossBorderTransfer, paymentProof: any): Promise<boolean> {
    // Simulate payment verification
    console.log(`Verifying payment for transfer ${transfer.id}`, paymentProof)
    return true
  }

  private async selectBestPartner(transfer: CrossBorderTransfer): Promise<TransferPartner | undefined> {
    const eligiblePartners = Array.from(this.partners.values()).filter(partner =>
      partner.isActive &&
      partner.countries.includes(transfer.fromCountry) &&
      partner.countries.includes(transfer.toCountry) &&
      partner.currencies.includes(transfer.fromCurrency) &&
      partner.currencies.includes(transfer.toCurrency)
    )

    if (eligiblePartners.length === 0) return undefined

    // Select partner with best trust score and success rate
    return eligiblePartners.reduce((best, current) =>
      (current.trustScore * current.successRate) > (best.trustScore * best.successRate) ? current : best
    )
  }

  private async callPartnerAPI(partner: TransferPartner, transfer: CrossBorderTransfer): Promise<any> {
    // Simulate partner API call
    console.log(`Sending transfer ${transfer.id} to partner ${partner.name}`)
    return { success: true, partnerTransferId: `${partner.id}_${Date.now()}` }
  }

  private async updateTransferFromPartner(transfer: CrossBorderTransfer): Promise<void> {
    // Simulate partner status update
    if (Math.random() > 0.7) { // 30% chance of completion
      transfer.status = 'completed'
      transfer.actualDelivery = new Date()
    }
  }

  private async processRefund(transfer: CrossBorderTransfer): Promise<void> {
    transfer.refundAmount = transfer.totalCost
    transfer.refundDate = new Date()
    transfer.status = 'refunded'
  }

  private startRateUpdates(): void {
    setInterval(async () => {
      await this.updateAllExchangeRates()
    }, 5 * 60 * 1000) // Update every 5 minutes
  }

  private async updateAllExchangeRates(): Promise<void> {
    const currencyCodes = Array.from(this.currencies.keys())
    
    for (const from of currencyCodes) {
      for (const to of currencyCodes) {
        if (from !== to) {
          try {
            const rate = await this.rateProvider.fetchRate(from, to)
            this.exchangeRates.set(`${from}-${to}`, rate)
          } catch (error) {
            console.error(`Failed to update rate ${from}-${to}:`, error)
          }
        }
      }
    }
  }

  // Public getters
  getTransfer(transferId: string): CrossBorderTransfer | undefined {
    return this.transfers.get(transferId)
  }

  getAvailableCorridors(): PaymentCorridor[] {
    return Array.from(this.paymentCorridors.values()).filter(c => c.isActive)
  }

  getSupportedCurrencies(): Currency[] {
    return Array.from(this.currencies.values())
  }

  getPartners(): TransferPartner[] {
    return Array.from(this.partners.values()).filter(p => p.isActive)
  }
}

// Helper classes
class ComplianceEngine {
  async performAMLCheck(transfer: CrossBorderTransfer): Promise<ComplianceCheck> {
    // Simulate AML check
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      type: 'aml',
      status: 'passed',
      checkedAt: new Date(),
      flags: [],
      riskScore: Math.random() * 50 // Low risk score
    }
  }

  async performSanctionsCheck(transfer: CrossBorderTransfer): Promise<ComplianceCheck> {
    // Simulate sanctions screening
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      type: 'sanctions',
      status: 'passed',
      checkedAt: new Date(),
      flags: [],
      riskScore: Math.random() * 30
    }
  }

  async performPEPCheck(transfer: CrossBorderTransfer): Promise<ComplianceCheck> {
    // Simulate PEP screening
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      type: 'pep',
      status: 'passed',
      checkedAt: new Date(),
      flags: [],
      riskScore: Math.random() * 40
    }
  }

  async performTaxReportingCheck(transfer: CrossBorderTransfer): Promise<ComplianceCheck> {
    // Simulate tax reporting check
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      type: 'tax_reporting',
      status: 'passed',
      checkedAt: new Date(),
      flags: ['large_amount'],
      riskScore: 60
    }
  }
}

class ExchangeRateProvider {
  async fetchRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate> {
    // Simulate rate API call
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const baseRates: { [key: string]: number } = {
      'USD': 1.0,
      'UGX': 3700,
      'KES': 129,
      'EUR': 0.85,
      'GBP': 0.79,
      'CUSD': 1.0
    }

    const fromRate = baseRates[fromCurrency] || 1
    const toRate = baseRates[toCurrency] || 1
    const rate = toRate / fromRate
    
    return {
      fromCurrency,
      toCurrency,
      rate,
      inverseRate: 1 / rate,
      lastUpdated: new Date(),
      source: 'VillageWallet Exchange',
      spread: 0.01, // 1% spread
      isLive: true
    }
  }
}

// Singleton instance
export const crossBorderTransferSystem = new CrossBorderTransferSystem()
