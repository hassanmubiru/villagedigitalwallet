// Phase 4: Ecosystem Expansion - Merchant Payment Solutions
// Comprehensive merchant payment infrastructure for local businesses

export interface Merchant {
  id: string;
  name: string;
  category: MerchantCategory;
  address: string;
  phone: string;
  email?: string;
  walletAddress: string;
  qrCode: string;
  isVerified: boolean;
  registrationDate: Date;
  businessLicense?: string;
  taxId?: string;
  description?: string;
  logo?: string;
  operatingHours?: OperatingHours;
  paymentMethods: PaymentMethod[];
  feeStructure: FeeStructure;
  monthlyVolume: number;
  totalTransactions: number;
  rating: number;
  status: MerchantStatus;
}

export interface OperatingHours {
  monday: { open: string; close: string; closed?: boolean };
  tuesday: { open: string; close: string; closed?: boolean };
  wednesday: { open: string; close: string; closed?: boolean };
  thursday: { open: string; close: string; closed?: boolean };
  friday: { open: string; close: string; closed?: boolean };
  saturday: { open: string; close: string; closed?: boolean };
  sunday: { open: string; close: string; closed?: boolean };
}

export interface PaymentMethod {
  id: string;
  type: 'qr_code' | 'nfc' | 'pos_terminal' | 'mobile_payment' | 'cash_on_delivery';
  name: string;
  isActive: boolean;
  processingFee: number; // percentage
  settlementTime: string; // e.g., "instant", "24h", "3 days"
}

export interface FeeStructure {
  transactionFee: number; // percentage
  fixedFee: number; // fixed amount in base currency
  monthlyFee: number;
  volumeDiscounts: VolumeDiscount[];
}

export interface VolumeDiscount {
  minimumVolume: number;
  discountPercentage: number;
  description: string;
}

export interface MerchantTransaction {
  id: string;
  merchantId: string;
  customerId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: TransactionStatus;
  timestamp: Date;
  description: string;
  receiptNumber: string;
  fees: {
    merchantFee: number;
    networkFee: number;
    totalFee: number;
  };
  settlementDate?: Date;
  refundId?: string;
  metadata?: Record<string, any>;
}

export interface QRCodePayment {
  merchantId: string;
  amount?: number;
  currency: string;
  description?: string;
  expiresAt?: Date;
  isDynamic: boolean; // true for variable amounts, false for fixed
  qrCodeData: string;
  paymentUrl: string;
}

export interface POSIntegration {
  terminalId: string;
  merchantId: string;
  model: string;
  firmwareVersion: string;
  lastSync: Date;
  isOnline: boolean;
  supportedPaymentMethods: string[];
  encryptionLevel: string;
}

export type MerchantCategory = 
  | 'retail'
  | 'grocery'
  | 'restaurant'
  | 'agriculture'
  | 'healthcare'
  | 'education'
  | 'services'
  | 'transportation'
  | 'entertainment'
  | 'other';

export type MerchantStatus = 'active' | 'pending' | 'suspended' | 'inactive';

export type TransactionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'disputed';

// Merchant Services Class
export class MerchantServices {
  private merchants: Map<string, Merchant> = new Map();
  private transactions: Map<string, MerchantTransaction> = new Map();

  constructor() {
    this.initializeDefaultMerchants();
  }

  // Merchant Registration and Management
  async registerMerchant(merchantData: Omit<Merchant, 'id' | 'registrationDate' | 'qrCode' | 'monthlyVolume' | 'totalTransactions' | 'rating'>): Promise<Merchant> {
    const merchant: Merchant = {
      ...merchantData,
      id: this.generateId(),
      registrationDate: new Date(),
      qrCode: this.generateQRCode(merchantData.walletAddress),
      monthlyVolume: 0,
      totalTransactions: 0,
      rating: 0,
    };

    this.merchants.set(merchant.id, merchant);
    return merchant;
  }

  async updateMerchant(merchantId: string, updates: Partial<Merchant>): Promise<Merchant | null> {
    const merchant = this.merchants.get(merchantId);
    if (!merchant) return null;

    const updatedMerchant = { ...merchant, ...updates };
    this.merchants.set(merchantId, updatedMerchant);
    return updatedMerchant;
  }

  async getMerchant(merchantId: string): Promise<Merchant | null> {
    return this.merchants.get(merchantId) || null;
  }

  async getMerchantsByCategory(category: MerchantCategory): Promise<Merchant[]> {
    return Array.from(this.merchants.values()).filter(m => m.category === category);
  }

  async searchMerchants(query: string): Promise<Merchant[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.merchants.values()).filter(merchant => 
      merchant.name.toLowerCase().includes(searchTerm) ||
      merchant.category.toLowerCase().includes(searchTerm) ||
      merchant.address.toLowerCase().includes(searchTerm)
    );
  }

  // QR Code Payment Processing
  async generateQRCodePayment(merchantId: string, amount?: number, description?: string): Promise<QRCodePayment> {
    const merchant = this.merchants.get(merchantId);
    if (!merchant) throw new Error('Merchant not found');

    const qrPayment: QRCodePayment = {
      merchantId,
      amount,
      currency: 'CUSD',
      description,
      expiresAt: amount ? new Date(Date.now() + 30 * 60 * 1000) : undefined, // 30 minutes for fixed amounts
      isDynamic: !amount,
      qrCodeData: this.generateQRCodeData(merchant, amount, description),
      paymentUrl: `villagewallet://pay/${merchantId}${amount ? `?amount=${amount}` : ''}`
    };

    return qrPayment;
  }

  async processQRPayment(qrCodeData: string, payerId: string, amount?: number): Promise<MerchantTransaction> {
    const paymentData = this.parseQRCodeData(qrCodeData);
    const merchant = this.merchants.get(paymentData.merchantId);
    
    if (!merchant) throw new Error('Invalid merchant');
    if (!merchant.isVerified || merchant.status !== 'active') {
      throw new Error('Merchant is not accepting payments');
    }

    const finalAmount = amount || paymentData.amount;
    if (!finalAmount || finalAmount <= 0) throw new Error('Invalid payment amount');

    const transaction = await this.createTransaction({
      merchantId: paymentData.merchantId,
      customerId: payerId,
      amount: finalAmount,
      currency: 'CUSD',
      paymentMethod: 'qr_code',
      description: paymentData.description || 'QR Code Payment'
    });

    return transaction;
  }

  // Transaction Management
  async createTransaction(transactionData: {
    merchantId: string;
    customerId?: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    description: string;
  }): Promise<MerchantTransaction> {
    const merchant = this.merchants.get(transactionData.merchantId);
    if (!merchant) throw new Error('Merchant not found');

    const fees = this.calculateFees(transactionData.amount, merchant.feeStructure);
    
    const transaction: MerchantTransaction = {
      id: this.generateId(),
      ...transactionData,
      status: 'pending',
      timestamp: new Date(),
      receiptNumber: this.generateReceiptNumber(),
      fees,
      settlementDate: this.calculateSettlementDate(transactionData.paymentMethod)
    };

    this.transactions.set(transaction.id, transaction);

    // Update merchant statistics
    merchant.totalTransactions += 1;
    merchant.monthlyVolume += transactionData.amount;

    return transaction;
  }

  async processTransaction(transactionId: string): Promise<MerchantTransaction> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    // Simulate payment processing
    transaction.status = 'processing';
    
    // In a real implementation, this would interact with blockchain/payment processors
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    transaction.status = 'completed';
    return transaction;
  }

  async getMerchantTransactions(merchantId: string, limit: number = 50): Promise<MerchantTransaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.merchantId === merchantId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getDailyTransactionSummary(merchantId: string, date: Date): Promise<{
    totalAmount: number;
    transactionCount: number;
    totalFees: number;
    averageTransaction: number;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const dayTransactions = Array.from(this.transactions.values()).filter(t => 
      t.merchantId === merchantId &&
      t.timestamp >= startOfDay &&
      t.timestamp <= endOfDay &&
      t.status === 'completed'
    );

    const totalAmount = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalFees = dayTransactions.reduce((sum, t) => sum + t.fees.totalFee, 0);

    return {
      totalAmount,
      transactionCount: dayTransactions.length,
      totalFees,
      averageTransaction: dayTransactions.length > 0 ? totalAmount / dayTransactions.length : 0
    };
  }

  // Fee Calculation
  private calculateFees(amount: number, feeStructure: FeeStructure): {
    merchantFee: number;
    networkFee: number;
    totalFee: number;
  } {
    const merchantFee = (amount * feeStructure.transactionFee / 100) + feeStructure.fixedFee;
    const networkFee = amount * 0.001; // 0.1% network fee
    
    return {
      merchantFee,
      networkFee,
      totalFee: merchantFee + networkFee
    };
  }

  private calculateSettlementDate(paymentMethod: string): Date {
    const now = new Date();
    switch (paymentMethod) {
      case 'qr_code':
      case 'mobile_payment':
        return now; // Instant settlement
      case 'pos_terminal':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      default:
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    }
  }

  // Utility Methods
  private generateId(): string {
    return 'merchant_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateReceiptNumber(): string {
    return 'RCP' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  private generateQRCode(walletAddress: string): string {
    return `VW_${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`;
  }

  private generateQRCodeData(merchant: Merchant, amount?: number, description?: string): string {
    const data = {
      type: 'payment',
      merchant: merchant.id,
      wallet: merchant.walletAddress,
      amount,
      description,
      timestamp: Date.now()
    };
    return btoa(JSON.stringify(data));
  }

  private parseQRCodeData(qrCodeData: string): {
    merchantId: string;
    amount?: number;
    description?: string;
  } {
    try {
      const data = JSON.parse(atob(qrCodeData));
      return {
        merchantId: data.merchant,
        amount: data.amount,
        description: data.description
      };
    } catch {
      throw new Error('Invalid QR code data');
    }
  }

  private initializeDefaultMerchants(): void {
    const defaultMerchants: Omit<Merchant, 'id' | 'registrationDate' | 'qrCode' | 'monthlyVolume' | 'totalTransactions' | 'rating'>[] = [
      {
        name: 'Village Market',
        category: 'grocery',
        address: 'Main Street, Village Center',
        phone: '+256-700-123456',
        email: 'info@villagemarket.com',
        walletAddress: '0x1234567890123456789012345678901234567890',
        isVerified: true,
        businessLicense: 'BL-2024-001',
        description: 'Fresh produce and daily essentials',
        operatingHours: {
          monday: { open: '06:00', close: '20:00' },
          tuesday: { open: '06:00', close: '20:00' },
          wednesday: { open: '06:00', close: '20:00' },
          thursday: { open: '06:00', close: '20:00' },
          friday: { open: '06:00', close: '20:00' },
          saturday: { open: '06:00', close: '22:00' },
          sunday: { open: '08:00', close: '18:00' }
        },
        paymentMethods: [
          { id: 'qr1', type: 'qr_code', name: 'QR Code', isActive: true, processingFee: 1.5, settlementTime: 'instant' },
          { id: 'pos1', type: 'pos_terminal', name: 'POS Terminal', isActive: true, processingFee: 2.0, settlementTime: '24h' }
        ],
        feeStructure: {
          transactionFee: 1.5,
          fixedFee: 0.1,
          monthlyFee: 5.0,
          volumeDiscounts: [
            { minimumVolume: 1000, discountPercentage: 10, description: '10% off for $1000+ monthly volume' },
            { minimumVolume: 5000, discountPercentage: 20, description: '20% off for $5000+ monthly volume' }
          ]
        },
        status: 'active'
      },
      {
        name: 'Sunrise Clinic',
        category: 'healthcare',
        address: 'Health Avenue, Medical District',
        phone: '+256-700-654321',
        email: 'appointments@sunriseclinic.com',
        walletAddress: '0x0987654321098765432109876543210987654321',
        isVerified: true,
        businessLicense: 'HL-2024-002',
        description: 'Primary healthcare services for the community',
        operatingHours: {
          monday: { open: '08:00', close: '17:00' },
          tuesday: { open: '08:00', close: '17:00' },
          wednesday: { open: '08:00', close: '17:00' },
          thursday: { open: '08:00', close: '17:00' },
          friday: { open: '08:00', close: '17:00' },
          saturday: { open: '08:00', close: '12:00' },
          sunday: { closed: true, open: '', close: '' }
        },
        paymentMethods: [
          { id: 'qr2', type: 'qr_code', name: 'QR Code', isActive: true, processingFee: 1.0, settlementTime: 'instant' },
          { id: 'mobile1', type: 'mobile_payment', name: 'Mobile Payment', isActive: true, processingFee: 1.2, settlementTime: 'instant' }
        ],
        feeStructure: {
          transactionFee: 1.0,
          fixedFee: 0.05,
          monthlyFee: 10.0,
          volumeDiscounts: [
            { minimumVolume: 2000, discountPercentage: 15, description: '15% off for healthcare providers' }
          ]
        },
        status: 'active'
      },
      {
        name: 'Green Farm Supplies',
        category: 'agriculture',
        address: 'Agricultural Zone, Farm Road',
        phone: '+256-700-789012',
        walletAddress: '0x1122334455667788990011223344556677889900',
        isVerified: true,
        businessLicense: 'AG-2024-003',
        description: 'Seeds, fertilizers, and farming equipment',
        operatingHours: {
          monday: { open: '07:00', close: '18:00' },
          tuesday: { open: '07:00', close: '18:00' },
          wednesday: { open: '07:00', close: '18:00' },
          thursday: { open: '07:00', close: '18:00' },
          friday: { open: '07:00', close: '18:00' },
          saturday: { open: '07:00', close: '16:00' },
          sunday: { closed: true, open: '', close: '' }
        },
        paymentMethods: [
          { id: 'qr3', type: 'qr_code', name: 'QR Code', isActive: true, processingFee: 2.0, settlementTime: 'instant' }
        ],
        feeStructure: {
          transactionFee: 2.0,
          fixedFee: 0.2,
          monthlyFee: 8.0,
          volumeDiscounts: [
            { minimumVolume: 3000, discountPercentage: 25, description: '25% off for agricultural suppliers' }
          ]
        },
        status: 'active'
      }
    ];

    defaultMerchants.forEach(merchantData => {
      this.registerMerchant(merchantData);
    });
  }
}

// Export singleton instance
export const merchantServices = new MerchantServices();
