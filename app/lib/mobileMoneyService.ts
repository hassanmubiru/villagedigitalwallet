/**
 * Enhanced Mobile Money Integration System
 * Supports multiple providers across East and West Africa
 */

export interface MobileMoneyProvider {
  id: string;
  name: string;
  countries: string[];
  currency: string;
  apiEndpoint: string;
  supportedOperations: MobileMoneyOperation[];
  exchangeRate?: number; // Rate to CELO
  fees: FeeStructure;
}

export interface MobileMoneyOperation {
  type: 'cash-in' | 'cash-out' | 'balance-check' | 'transaction-status';
  minimumAmount: number;
  maximumAmount: number;
  processingTime: string; // e.g., "1-5 minutes"
}

export interface FeeStructure {
  cashIn: FeeRange[];
  cashOut: FeeRange[];
  currency: string;
}

export interface FeeRange {
  minAmount: number;
  maxAmount: number;
  fee: number;
  percentage?: number;
}

export interface MobileMoneyTransaction {
  id: string;
  providerId: string;
  type: 'cash-in' | 'cash-out';
  amount: number;
  currency: string;
  celoAmount: number;
  phoneNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  initiatedAt: Date;
  completedAt?: Date;
  fees: number;
  exchangeRate: number;
  providerTransactionId?: string;
  failureReason?: string;
}

export interface PaymentInstruction {
  providerId: string;
  instructions: string[];
  ussdCode?: string;
  appDeepLink?: string;
  qrCode?: string;
  expiresAt: Date;
}

// Supported Mobile Money Providers
export const MOBILE_MONEY_PROVIDERS: Record<string, MobileMoneyProvider> = {
  MTN_UG: {
    id: 'MTN_UG',
    name: 'MTN Mobile Money Uganda',
    countries: ['UG'],
    currency: 'UGX',
    apiEndpoint: 'https://api.mtn.com/v1/uganda/mobilemoney',
    supportedOperations: [
      { type: 'cash-in', minimumAmount: 1000, maximumAmount: 5000000, processingTime: '1-3 minutes' },
      { type: 'cash-out', minimumAmount: 1000, maximumAmount: 2000000, processingTime: '1-5 minutes' }
    ],
    fees: {
      currency: 'UGX',
      cashIn: [
        { minAmount: 1000, maxAmount: 50000, fee: 200 },
        { minAmount: 50001, maxAmount: 500000, fee: 1000 },
        { minAmount: 500001, maxAmount: 5000000, fee: 2000 }
      ],
      cashOut: [
        { minAmount: 1000, maxAmount: 50000, fee: 300 },
        { minAmount: 50001, maxAmount: 500000, fee: 1500 },
        { minAmount: 500001, maxAmount: 2000000, fee: 3000 }
      ]
    }
  },
  AIRTEL_UG: {
    id: 'AIRTEL_UG',
    name: 'Airtel Money Uganda',
    countries: ['UG'],
    currency: 'UGX',
    apiEndpoint: 'https://api.airtel.com/v1/uganda/airtelmoney',
    supportedOperations: [
      { type: 'cash-in', minimumAmount: 500, maximumAmount: 4000000, processingTime: '1-3 minutes' },
      { type: 'cash-out', minimumAmount: 500, maximumAmount: 1500000, processingTime: '1-5 minutes' }
    ],
    fees: {
      currency: 'UGX',
      cashIn: [
        { minAmount: 500, maxAmount: 49999, fee: 150 },
        { minAmount: 50000, maxAmount: 499999, fee: 900 },
        { minAmount: 500000, maxAmount: 4000000, fee: 1800 }
      ],
      cashOut: [
        { minAmount: 500, maxAmount: 49999, fee: 250 },
        { minAmount: 50000, maxAmount: 499999, fee: 1200 },
        { minAmount: 500000, maxAmount: 1500000, fee: 2500 }
      ]
    }
  },
  MPESA_KE: {
    id: 'MPESA_KE',
    name: 'M-Pesa Kenya',
    countries: ['KE'],
    currency: 'KES',
    apiEndpoint: 'https://api.safaricom.co.ke/mpesa/v1',
    supportedOperations: [
      { type: 'cash-in', minimumAmount: 10, maximumAmount: 150000, processingTime: '1-2 minutes' },
      { type: 'cash-out', minimumAmount: 10, maximumAmount: 100000, processingTime: '1-3 minutes' }
    ],
    fees: {
      currency: 'KES',
      cashIn: [
        { minAmount: 10, maxAmount: 999, fee: 5 },
        { minAmount: 1000, maxAmount: 9999, fee: 15 },
        { minAmount: 10000, maxAmount: 150000, fee: 50 }
      ],
      cashOut: [
        { minAmount: 10, maxAmount: 999, fee: 8 },
        { minAmount: 1000, maxAmount: 9999, fee: 20 },
        { minAmount: 10000, maxAmount: 100000, fee: 75 }
      ]
    }
  },
  ORANGE_SN: {
    id: 'ORANGE_SN',
    name: 'Orange Money Senegal',
    countries: ['SN'],
    currency: 'XOF',
    apiEndpoint: 'https://api.orange.com/v1/senegal/orangemoney',
    supportedOperations: [
      { type: 'cash-in', minimumAmount: 100, maximumAmount: 2000000, processingTime: '2-5 minutes' },
      { type: 'cash-out', minimumAmount: 100, maximumAmount: 1000000, processingTime: '2-7 minutes' }
    ],
    fees: {
      currency: 'XOF',
      cashIn: [
        { minAmount: 100, maxAmount: 9999, fee: 50 },
        { minAmount: 10000, maxAmount: 99999, fee: 200 },
        { minAmount: 100000, maxAmount: 2000000, fee: 500 }
      ],
      cashOut: [
        { minAmount: 100, maxAmount: 9999, fee: 75 },
        { minAmount: 10000, maxAmount: 99999, fee: 300 },
        { minAmount: 100000, maxAmount: 1000000, fee: 750 }
      ]
    }
  }
};

export class EnhancedMobileMoneyService {
  private transactions: Map<string, MobileMoneyTransaction> = new Map();
  private exchangeRates: Map<string, number> = new Map();

  constructor() {
    this.initializeExchangeRates();
  }

  /**
   * Initialize exchange rates (in production, this would come from a real-time API)
   */
  private async initializeExchangeRates() {
    // Sample rates - in production, fetch from exchange rate API
    this.exchangeRates.set('UGX', 0.00027); // 1 UGX = 0.00027 CELO
    this.exchangeRates.set('KES', 0.0095);  // 1 KES = 0.0095 CELO
    this.exchangeRates.set('XOF', 0.0017);  // 1 XOF = 0.0017 CELO
    this.exchangeRates.set('GHS', 0.16);    // 1 GHS = 0.16 CELO
  }

  /**
   * Get available providers for a specific country
   */
  getProvidersForCountry(countryCode: string): MobileMoneyProvider[] {
    return Object.values(MOBILE_MONEY_PROVIDERS).filter(
      provider => provider.countries.includes(countryCode)
    );
  }

  /**
   * Calculate fees for a transaction
   */
  calculateFees(providerId: string, type: 'cash-in' | 'cash-out', amount: number): number {
    const provider = MOBILE_MONEY_PROVIDERS[providerId];
    if (!provider) throw new Error('Provider not found');

    const feeStructure = type === 'cash-in' ? provider.fees.cashIn : provider.fees.cashOut;
    
    for (const feeRange of feeStructure) {
      if (amount >= feeRange.minAmount && amount <= feeRange.maxAmount) {
        if (feeRange.percentage) {
          return Math.max(feeRange.fee, amount * feeRange.percentage / 100);
        }
        return feeRange.fee;
      }
    }

    // Default to highest fee range if amount exceeds all ranges
    const highestRange = feeStructure[feeStructure.length - 1];
    return highestRange.percentage ? amount * highestRange.percentage / 100 : highestRange.fee;
  }

  /**
   * Convert local currency to CELO
   */
  convertToCelo(amount: number, currency: string): number {
    const rate = this.exchangeRates.get(currency);
    if (!rate) throw new Error(`Exchange rate not found for ${currency}`);
    return amount * rate;
  }

  /**
   * Convert CELO to local currency
   */
  convertFromCelo(celoAmount: number, currency: string): number {
    const rate = this.exchangeRates.get(currency);
    if (!rate) throw new Error(`Exchange rate not found for ${currency}`);
    return celoAmount / rate;
  }

  /**
   * Initiate cash-in transaction
   */
  async initiateCashIn(
    providerId: string,
    phoneNumber: string,
    amount: number,
    userWalletAddress: string
  ): Promise<{ transactionId: string; instructions: PaymentInstruction }> {
    const provider = MOBILE_MONEY_PROVIDERS[providerId];
    if (!provider) throw new Error('Provider not found');

    // Validate amount
    const cashInOp = provider.supportedOperations.find(op => op.type === 'cash-in');
    if (!cashInOp || amount < cashInOp.minimumAmount || amount > cashInOp.maximumAmount) {
      throw new Error(`Amount must be between ${cashInOp?.minimumAmount} and ${cashInOp?.maximumAmount} ${provider.currency}`);
    }

    const transactionId = this.generateTransactionId();
    const fees = this.calculateFees(providerId, 'cash-in', amount);
    const netAmount = amount - fees;
    const celoAmount = this.convertToCelo(netAmount, provider.currency);
    const exchangeRate = this.exchangeRates.get(provider.currency)!;

    const transaction: MobileMoneyTransaction = {
      id: transactionId,
      providerId,
      type: 'cash-in',
      amount,
      currency: provider.currency,
      celoAmount,
      phoneNumber,
      status: 'pending',
      initiatedAt: new Date(),
      fees,
      exchangeRate
    };

    this.transactions.set(transactionId, transaction);

    // Generate payment instructions
    const instructions = this.generatePaymentInstructions(provider, transaction);

    // In production, call the actual provider API
    await this.callProviderAPI(provider, 'initiate-payment', {
      phoneNumber,
      amount,
      reference: transactionId,
      callback: `${process.env.BASE_URL}/api/mobile-money/callback`
    });

    return { transactionId, instructions };
  }

  /**
   * Initiate cash-out transaction
   */
  async initiateCashOut(
    providerId: string,
    phoneNumber: string,
    celoAmount: number,
    userWalletAddress: string
  ): Promise<{ transactionId: string; estimatedTime: string }> {
    const provider = MOBILE_MONEY_PROVIDERS[providerId];
    if (!provider) throw new Error('Provider not found');

    const localAmount = this.convertFromCelo(celoAmount, provider.currency);
    const fees = this.calculateFees(providerId, 'cash-out', localAmount);
    const netAmount = localAmount - fees;

    // Validate amount
    const cashOutOp = provider.supportedOperations.find(op => op.type === 'cash-out');
    if (!cashOutOp || netAmount < cashOutOp.minimumAmount || netAmount > cashOutOp.maximumAmount) {
      throw new Error(`Net amount must be between ${cashOutOp?.minimumAmount} and ${cashOutOp?.maximumAmount} ${provider.currency}`);
    }

    const transactionId = this.generateTransactionId();
    const exchangeRate = this.exchangeRates.get(provider.currency)!;

    const transaction: MobileMoneyTransaction = {
      id: transactionId,
      providerId,
      type: 'cash-out',
      amount: localAmount,
      currency: provider.currency,
      celoAmount,
      phoneNumber,
      status: 'processing',
      initiatedAt: new Date(),
      fees,
      exchangeRate
    };

    this.transactions.set(transactionId, transaction);

    // In production, call the actual provider API
    await this.callProviderAPI(provider, 'send-money', {
      phoneNumber,
      amount: netAmount,
      reference: transactionId,
      callback: `${process.env.BASE_URL}/api/mobile-money/callback`
    });

    return { 
      transactionId, 
      estimatedTime: cashOutOp.processingTime 
    };
  }

  /**
   * Generate payment instructions for cash-in
   */
  private generatePaymentInstructions(
    provider: MobileMoneyProvider,
    transaction: MobileMoneyTransaction
  ): PaymentInstruction {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    switch (provider.id) {
      case 'MTN_UG':
        return {
          providerId: provider.id,
          instructions: [
            'Dial *165# on your MTN phone',
            'Select option 1 (Send Money)',
            'Enter merchant code: 123456',
            `Enter amount: ${transaction.amount} UGX`,
            `Enter reference: ${transaction.id}`,
            'Confirm with your PIN'
          ],
          ussdCode: '*165#',
          expiresAt
        };

      case 'AIRTEL_UG':
        return {
          providerId: provider.id,
          instructions: [
            'Dial *185# on your Airtel phone',
            'Select option 1 (Send Money)',
            'Enter merchant code: 789012',
            `Enter amount: ${transaction.amount} UGX`,
            `Enter reference: ${transaction.id}`,
            'Confirm with your PIN'
          ],
          ussdCode: '*185#',
          expiresAt
        };

      case 'MPESA_KE':
        return {
          providerId: provider.id,
          instructions: [
            'Open M-Pesa app or dial *334#',
            'Select Lipa na M-Pesa',
            'Select Buy Goods and Services',
            'Enter Till Number: 567890',
            `Enter amount: ${transaction.amount} KES`,
            `Enter reference: ${transaction.id}`,
            'Enter your M-Pesa PIN'
          ],
          ussdCode: '*334#',
          appDeepLink: 'mpesa://pay?till=567890&amount=' + transaction.amount,
          expiresAt
        };

      default:
        return {
          providerId: provider.id,
          instructions: [
            'Follow your mobile money provider instructions',
            `Amount: ${transaction.amount} ${transaction.currency}`,
            `Reference: ${transaction.id}`
          ],
          expiresAt
        };
    }
  }

  /**
   * Handle webhook callbacks from mobile money providers
   */
  async handleProviderCallback(payload: any): Promise<void> {
    const { transactionId, status, providerTransactionId, failureReason } = payload;
    
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    transaction.status = status;
    transaction.providerTransactionId = providerTransactionId;
    transaction.failureReason = failureReason;

    if (status === 'completed') {
      transaction.completedAt = new Date();
      
      // For cash-in transactions, mint CELO tokens to user's wallet
      if (transaction.type === 'cash-in') {
        await this.mintCeloTokens(transaction);
      }
    }

    this.transactions.set(transactionId, transaction);

    // Notify user via websocket or push notification
    await this.notifyUser(transaction);
  }

  /**
   * Get transaction status
   */
  getTransactionStatus(transactionId: string): MobileMoneyTransaction | null {
    return this.transactions.get(transactionId) || null;
  }

  /**
   * Get user's transaction history
   */
  getUserTransactionHistory(phoneNumber: string): MobileMoneyTransaction[] {
    return Array.from(this.transactions.values())
      .filter(tx => tx.phoneNumber === phoneNumber)
      .sort((a, b) => b.initiatedAt.getTime() - a.initiatedAt.getTime());
  }

  /**
   * Check provider service status
   */
  async checkProviderStatus(providerId: string): Promise<{ available: boolean; message?: string }> {
    const provider = MOBILE_MONEY_PROVIDERS[providerId];
    if (!provider) {
      return { available: false, message: 'Provider not found' };
    }

    try {
      // In production, ping the provider's status endpoint
      const response = await this.callProviderAPI(provider, 'status', {});
      return { available: true };
    } catch (error) {
      return { 
        available: false, 
        message: `${provider.name} is currently unavailable. Please try again later.` 
      };
    }
  }

  /**
   * Update exchange rates (call this periodically)
   */
  async updateExchangeRates(): Promise<void> {
    try {
      // In production, fetch from a real exchange rate API
      const rates = await this.fetchExchangeRates();
      for (const [currency, rate] of Object.entries(rates)) {
        this.exchangeRates.set(currency, rate);
      }
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    }
  }

  // Private helper methods
  private generateTransactionId(): string {
    return 'MMT' + Date.now() + Math.random().toString(36).substr(2, 9);
  }

  private async callProviderAPI(provider: MobileMoneyProvider, endpoint: string, data: any): Promise<any> {
    // Mock implementation - in production, make actual HTTP requests
    console.log(`Calling ${provider.name} API: ${endpoint}`, data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success response
    return { success: true, reference: data.reference };
  }

  private async mintCeloTokens(transaction: MobileMoneyTransaction): Promise<void> {
    // In production, interact with smart contract to mint tokens
    console.log(`Minting ${transaction.celoAmount} CELO for transaction ${transaction.id}`);
  }

  private async notifyUser(transaction: MobileMoneyTransaction): Promise<void> {
    // In production, send push notification or websocket message
    console.log(`Notifying user about transaction ${transaction.id} status: ${transaction.status}`);
  }

  private async fetchExchangeRates(): Promise<Record<string, number>> {
    // Mock exchange rates - in production, fetch from API like CoinGecko or similar
    return {
      'UGX': 0.00027,
      'KES': 0.0095,
      'XOF': 0.0017,
      'GHS': 0.16
    };
  }
}

// Export singleton instance
export const mobileMoneyService = new EnhancedMobileMoneyService();
