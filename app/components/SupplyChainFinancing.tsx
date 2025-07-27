// Phase 4: Supply Chain Financing
// Comprehensive financing solutions for supply chain participants

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Package, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Users,
  Factory,
  ShoppingCart,
  ArrowRight,
  Calendar,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../providers/LanguageProvider';
import { translations } from '../utils/translations';

export interface SupplyChainParticipant {
  id: string;
  name: string;
  type: 'supplier' | 'manufacturer' | 'distributor' | 'retailer';
  verificationStatus: 'verified' | 'pending' | 'unverified';
  creditRating: number; // 1-10
  businessLicense: string;
  address: string;
  phone: string;
  email: string;
  registrationDate: Date;
  monthlyVolume: number;
  paymentTerms: number; // days
  onTimePaymentRate: number; // percentage
}

export interface Invoice {
  id: string;
  number: string;
  supplierId: string;
  buyerId: string;
  amount: number;
  currency: string;
  issueDate: Date;
  dueDate: Date;
  status: 'pending' | 'approved' | 'factored' | 'paid' | 'overdue';
  items: InvoiceItem[];
  termsAndConditions: string;
  factoringOffered: boolean;
  factoringRate?: number;
  factoringAmount?: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  buyerId: string;
  supplierId: string;
  amount: number;
  currency: string;
  issueDate: Date;
  expectedDeliveryDate: Date;
  status: 'draft' | 'sent' | 'confirmed' | 'financed' | 'delivered' | 'completed';
  items: PurchaseOrderItem[];
  financingRequested: boolean;
  financingApproved?: boolean;
  financingAmount?: number;
  financingRate?: number;
}

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: string;
  deliveryDate?: Date;
}

export interface InventoryFinancing {
  id: string;
  participantId: string;
  inventoryValue: number;
  financingAmount: number;
  interestRate: number;
  term: number; // months
  collateralItems: InventoryItem[];
  status: 'applied' | 'approved' | 'active' | 'repaid' | 'defaulted';
  applicationDate: Date;
  approvalDate?: Date;
  repaymentSchedule: RepaymentSchedule[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  location: string;
  condition: 'new' | 'good' | 'fair' | 'damaged';
}

export interface RepaymentSchedule {
  id: string;
  dueDate: Date;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  status: 'pending' | 'paid' | 'overdue';
}

export interface SupplyChainMetrics {
  totalParticipants: number;
  totalFinancingVolume: number;
  averageFinancingRate: number;
  onTimePaymentRate: number;
  defaultRate: number;
  averagePaymentTerms: number;
  topCategories: { category: string; volume: number }[];
  monthlyGrowth: number;
}

// Supply Chain Financing Service
class SupplyChainFinancingService {
  private participants: Map<string, SupplyChainParticipant> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private purchaseOrders: Map<string, PurchaseOrder> = new Map();
  private inventoryFinancing: Map<string, InventoryFinancing> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  // Initialize with sample data
  private initializeDefaultData(): void {
    // Sample participants
    const sampleParticipants: SupplyChainParticipant[] = [
      {
        id: 'participant_1',
        name: 'Green Valley Farm Supplies',
        type: 'supplier',
        verificationStatus: 'verified',
        creditRating: 8,
        businessLicense: 'BL-2024-001',
        address: 'Agricultural Zone, Kampala',
        phone: '+256-700-123456',
        email: 'info@greenvalley.com',
        registrationDate: new Date('2024-01-15'),
        monthlyVolume: 250000,
        paymentTerms: 30,
        onTimePaymentRate: 95
      },
      {
        id: 'participant_2',
        name: 'East Africa Processors Ltd',
        type: 'manufacturer',
        verificationStatus: 'verified',
        creditRating: 9,
        businessLicense: 'BL-2024-002',
        address: 'Industrial Area, Nairobi',
        phone: '+254-700-789012',
        email: 'procurement@eaprocessors.com',
        registrationDate: new Date('2024-02-01'),
        monthlyVolume: 500000,
        paymentTerms: 45,
        onTimePaymentRate: 98
      },
      {
        id: 'participant_3',
        name: 'Rural Markets Distribution',
        type: 'distributor',
        verificationStatus: 'verified',
        creditRating: 7,
        businessLicense: 'BL-2024-003',
        address: 'Transport Hub, Dar es Salaam',
        phone: '+255-700-345678',
        email: 'orders@ruralmarkets.com',
        registrationDate: new Date('2024-03-01'),
        monthlyVolume: 180000,
        paymentTerms: 21,
        onTimePaymentRate: 92
      }
    ];

    sampleParticipants.forEach(participant => {
      this.participants.set(participant.id, participant);
    });

    // Sample invoices
    this.generateSampleInvoices();
    this.generateSamplePurchaseOrders();
    this.generateSampleInventoryFinancing();
  }

  private generateSampleInvoices(): void {
    const sampleInvoices: Invoice[] = [
      {
        id: 'inv_001',
        number: 'INV-2024-001',
        supplierId: 'participant_1',
        buyerId: 'participant_2',
        amount: 25000,
        currency: 'USD',
        issueDate: new Date('2024-07-01'),
        dueDate: new Date('2024-07-31'),
        status: 'pending',
        factoringOffered: true,
        factoringRate: 3.5,
        factoringAmount: 24125,
        items: [
          {
            id: 'item_1',
            description: 'Premium Coffee Beans',
            quantity: 1000,
            unitPrice: 15,
            totalPrice: 15000,
            category: 'Agricultural Products'
          },
          {
            id: 'item_2',
            description: 'Organic Fertilizer',
            quantity: 200,
            unitPrice: 50,
            totalPrice: 10000,
            category: 'Farm Supplies'
          }
        ],
        termsAndConditions: 'Net 30 days payment terms'
      }
    ];

    sampleInvoices.forEach(invoice => {
      this.invoices.set(invoice.id, invoice);
    });
  }

  private generateSamplePurchaseOrders(): void {
    const samplePOs: PurchaseOrder[] = [
      {
        id: 'po_001',
        number: 'PO-2024-001',
        buyerId: 'participant_2',
        supplierId: 'participant_1',
        amount: 35000,
        currency: 'USD',
        issueDate: new Date('2024-07-15'),
        expectedDeliveryDate: new Date('2024-08-15'),
        status: 'confirmed',
        financingRequested: true,
        financingApproved: true,
        financingAmount: 28000,
        financingRate: 4.2,
        items: [
          {
            id: 'po_item_1',
            description: 'Maize Seeds - Hybrid Variety',
            quantity: 500,
            unitPrice: 25,
            totalPrice: 12500,
            category: 'Seeds',
            deliveryDate: new Date('2024-08-01')
          },
          {
            id: 'po_item_2',
            description: 'Irrigation Equipment',
            quantity: 50,
            unitPrice: 450,
            totalPrice: 22500,
            category: 'Equipment'
          }
        ]
      }
    ];

    samplePOs.forEach(po => {
      this.purchaseOrders.set(po.id, po);
    });
  }

  private generateSampleInventoryFinancing(): void {
    const sampleFinancing: InventoryFinancing[] = [
      {
        id: 'inv_fin_001',
        participantId: 'participant_1',
        inventoryValue: 150000,
        financingAmount: 120000,
        interestRate: 8.5,
        term: 6,
        status: 'active',
        applicationDate: new Date('2024-06-01'),
        approvalDate: new Date('2024-06-05'),
        collateralItems: [
          {
            id: 'inv_item_1',
            name: 'Coffee Processing Equipment',
            category: 'Machinery',
            quantity: 5,
            unitValue: 15000,
            totalValue: 75000,
            location: 'Warehouse A',
            condition: 'good'
          },
          {
            id: 'inv_item_2',
            name: 'Raw Coffee Beans Stock',
            category: 'Raw Materials',
            quantity: 2500,
            unitValue: 30,
            totalValue: 75000,
            location: 'Storage Facility B',
            condition: 'new'
          }
        ],
        repaymentSchedule: [
          {
            id: 'rep_1',
            dueDate: new Date('2024-07-01'),
            amount: 20850,
            principalAmount: 20000,
            interestAmount: 850,
            status: 'paid'
          },
          {
            id: 'rep_2',
            dueDate: new Date('2024-08-01'),
            amount: 20850,
            principalAmount: 20000,
            interestAmount: 850,
            status: 'pending'
          }
        ]
      }
    ];

    sampleFinancing.forEach(financing => {
      this.inventoryFinancing.set(financing.id, financing);
    });
  }

  // Invoice Factoring
  async factorInvoice(invoiceId: string): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) throw new Error('Invoice not found');
    if (!invoice.factoringOffered) throw new Error('Factoring not available for this invoice');

    invoice.status = 'factored';
    return invoice;
  }

  // Purchase Order Financing
  async financePurchaseOrder(poId: string, financingAmount: number): Promise<PurchaseOrder> {
    const po = this.purchaseOrders.get(poId);
    if (!po) throw new Error('Purchase order not found');

    po.financingRequested = true;
    po.financingAmount = financingAmount;
    po.financingApproved = true;
    po.status = 'financed';
    po.financingRate = this.calculateFinancingRate(po.buyerId);

    return po;
  }

  // Apply for Inventory Financing
  async applyForInventoryFinancing(
    participantId: string,
    inventoryValue: number,
    requestedAmount: number,
    collateralItems: InventoryItem[]
  ): Promise<InventoryFinancing> {
    const participant = this.participants.get(participantId);
    if (!participant) throw new Error('Participant not found');

    const financing: InventoryFinancing = {
      id: `inv_fin_${Date.now()}`,
      participantId,
      inventoryValue,
      financingAmount: requestedAmount,
      interestRate: this.calculateInventoryFinancingRate(participant.creditRating),
      term: 6,
      collateralItems,
      status: 'applied',
      applicationDate: new Date(),
      repaymentSchedule: []
    };

    // Auto-approve for demo (in real system, would require approval process)
    financing.status = 'approved';
    financing.approvalDate = new Date();
    financing.repaymentSchedule = this.generateRepaymentSchedule(financing);

    this.inventoryFinancing.set(financing.id, financing);
    return financing;
  }

  // Calculate financing rates based on credit rating
  private calculateFinancingRate(participantId: string): number {
    const participant = this.participants.get(participantId);
    if (!participant) return 10.0;

    const baseRate = 5.0;
    const creditAdjustment = (10 - participant.creditRating) * 0.5;
    return baseRate + creditAdjustment;
  }

  private calculateInventoryFinancingRate(creditRating: number): number {
    const baseRate = 8.0;
    const creditAdjustment = (10 - creditRating) * 0.3;
    return baseRate + creditAdjustment;
  }

  private generateRepaymentSchedule(financing: InventoryFinancing): RepaymentSchedule[] {
    const schedule: RepaymentSchedule[] = [];
    const monthlyPayment = financing.financingAmount / financing.term;
    const monthlyInterest = (financing.financingAmount * financing.interestRate / 100) / 12;

    for (let i = 0; i < financing.term; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i + 1);

      schedule.push({
        id: `rep_${i + 1}`,
        dueDate,
        amount: monthlyPayment + monthlyInterest,
        principalAmount: monthlyPayment,
        interestAmount: monthlyInterest,
        status: 'pending'
      });
    }

    return schedule;
  }

  // Get all participants
  getAllParticipants(): SupplyChainParticipant[] {
    return Array.from(this.participants.values());
  }

  // Get participant by ID
  getParticipant(id: string): SupplyChainParticipant | undefined {
    return this.participants.get(id);
  }

  // Get all invoices
  getAllInvoices(): Invoice[] {
    return Array.from(this.invoices.values());
  }

  // Get all purchase orders
  getAllPurchaseOrders(): PurchaseOrder[] {
    return Array.from(this.purchaseOrders.values());
  }

  // Get all inventory financing
  getAllInventoryFinancing(): InventoryFinancing[] {
    return Array.from(this.inventoryFinancing.values());
  }

  // Get supply chain metrics
  getSupplyChainMetrics(): SupplyChainMetrics {
    const participants = this.getAllParticipants();
    const invoices = this.getAllInvoices();
    const financing = this.getAllInventoryFinancing();

    const totalFinancingVolume = financing.reduce((sum, f) => sum + f.financingAmount, 0);
    const averageFinancingRate = financing.reduce((sum, f) => sum + f.interestRate, 0) / financing.length;
    const onTimePaymentRate = participants.reduce((sum, p) => sum + p.onTimePaymentRate, 0) / participants.length;

    return {
      totalParticipants: participants.length,
      totalFinancingVolume,
      averageFinancingRate,
      onTimePaymentRate,
      defaultRate: 2.1, // Mock data
      averagePaymentTerms: participants.reduce((sum, p) => sum + p.paymentTerms, 0) / participants.length,
      topCategories: [
        { category: 'Agricultural Products', volume: 150000 },
        { category: 'Farm Supplies', volume: 120000 },
        { category: 'Equipment', volume: 85000 }
      ],
      monthlyGrowth: 12.5
    };
  }
}

// Export singleton instance
export const supplyChainFinancingService = new SupplyChainFinancingService();

// Main Supply Chain Financing Component
export default function SupplyChainFinancing() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'purchase-orders' | 'inventory' | 'participants'>('overview');
  const [participants, setParticipants] = useState<SupplyChainParticipant[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [inventoryFinancing, setInventoryFinancing] = useState<InventoryFinancing[]>([]);
  const [metrics, setMetrics] = useState<SupplyChainMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setParticipants(supplyChainFinancingService.getAllParticipants());
      setInvoices(supplyChainFinancingService.getAllInvoices());
      setPurchaseOrders(supplyChainFinancingService.getAllPurchaseOrders());
      setInventoryFinancing(supplyChainFinancingService.getAllInventoryFinancing());
      setMetrics(supplyChainFinancingService.getSupplyChainMetrics());
    } catch (error) {
      console.error('Error loading supply chain data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supply Chain Financing</h1>
              <p className="text-gray-600">Comprehensive financing solutions for supply chain participants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'invoices', label: 'Invoice Factoring', icon: FileText },
            { id: 'purchase-orders', label: 'PO Financing', icon: ShoppingCart },
            { id: 'inventory', label: 'Inventory Financing', icon: Package },
            { id: 'participants', label: 'Participants', icon: Users }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && metrics && (
              <SupplyChainOverview metrics={metrics} />
            )}
            
            {activeTab === 'invoices' && (
              <InvoiceFactoring invoices={invoices} onFactorInvoice={loadData} />
            )}
            
            {activeTab === 'purchase-orders' && (
              <PurchaseOrderFinancing purchaseOrders={purchaseOrders} onFinancePO={loadData} />
            )}
            
            {activeTab === 'inventory' && (
              <InventoryFinancingTab 
                inventoryFinancing={inventoryFinancing} 
                participants={participants}
                onApplyFinancing={loadData}
              />
            )}
            
            {activeTab === 'participants' && (
              <ParticipantsTab participants={participants} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Supply Chain Overview Component
function SupplyChainOverview({ metrics }: { metrics: SupplyChainMetrics }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Financing Volume</p>
              <p className="text-2xl font-bold">${metrics.totalFinancingVolume.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Participants</p>
              <p className="text-2xl font-bold">{metrics.totalParticipants}</p>
            </div>
            <Users className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Avg. Financing Rate</p>
              <p className="text-2xl font-bold">{metrics.averageFinancingRate.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">On-Time Payment Rate</p>
              <p className="text-2xl font-bold">{metrics.onTimePaymentRate.toFixed(1)}%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Financing Categories</h3>
        <div className="space-y-4">
          {metrics.topCategories.map((category, index) => (
            <div key={category.category} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                </div>
                <span className="font-medium text-gray-900">{category.category}</span>
              </div>
              <span className="text-gray-600">${category.volume.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Invoice Factoring Component
function InvoiceFactoring({ 
  invoices, 
  onFactorInvoice 
}: {
  invoices: Invoice[];
  onFactorInvoice: () => void;
}) {
  const handleFactorInvoice = async (invoiceId: string) => {
    try {
      await supplyChainFinancingService.factorInvoice(invoiceId);
      onFactorInvoice();
    } catch (error) {
      console.error('Error factoring invoice:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-100';
      case 'factored':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Invoice Factoring</h3>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Factoring
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{invoice.number}</div>
                    <div className="text-sm text-gray-500">Issued: {invoice.issueDate.toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${invoice.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{invoice.dueDate.toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {invoice.factoringOffered ? (
                      <div className="text-sm">
                        <div className="text-gray-900">${invoice.factoringAmount?.toLocaleString()}</div>
                        <div className="text-gray-500">{invoice.factoringRate}% fee</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not available</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {invoice.factoringOffered && invoice.status === 'pending' && (
                      <button
                        onClick={() => handleFactorInvoice(invoice.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Factor Invoice
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Purchase Order Financing Component  
function PurchaseOrderFinancing({ 
  purchaseOrders, 
  onFinancePO 
}: {
  purchaseOrders: PurchaseOrder[];
  onFinancePO: () => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Purchase Order Financing</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {purchaseOrders.map(po => (
          <div key={po.id} className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">{po.number}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                po.status === 'financed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${po.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Delivery:</span>
                <span>{po.expectedDeliveryDate.toLocaleDateString()}</span>
              </div>
              {po.financingApproved && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Financing Amount:</span>
                    <span className="font-medium text-green-600">${po.financingAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Financing Rate:</span>
                    <span>{po.financingRate}%</span>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Items:</h5>
              <div className="space-y-1">
                {po.items.slice(0, 2).map(item => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-600">
                    <span>{item.description}</span>
                    <span>${item.totalPrice.toLocaleString()}</span>
                  </div>
                ))}
                {po.items.length > 2 && (
                  <div className="text-xs text-gray-500">+{po.items.length - 2} more items</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Inventory Financing Tab Component
function InventoryFinancingTab({ 
  inventoryFinancing, 
  participants,
  onApplyFinancing 
}: {
  inventoryFinancing: InventoryFinancing[];
  participants: SupplyChainParticipant[];
  onApplyFinancing: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Inventory Financing</h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Apply for Financing
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {inventoryFinancing.map(financing => (
          <div key={financing.id} className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">
                {participants.find(p => p.id === financing.participantId)?.name || 'Unknown Participant'}
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                financing.status === 'active' ? 'bg-green-100 text-green-800' : 
                financing.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {financing.status.charAt(0).toUpperCase() + financing.status.slice(1)}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Inventory Value:</span>
                <span className="font-medium">${financing.inventoryValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Financing Amount:</span>
                <span className="font-medium text-green-600">${financing.financingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Interest Rate:</span>
                <span>{financing.interestRate}% annual</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Term:</span>
                <span>{financing.term} months</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Collateral Items:</h5>
              <div className="space-y-1">
                {financing.collateralItems.slice(0, 2).map(item => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-600">
                    <span>{item.name}</span>
                    <span>${item.totalValue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Participants Tab Component
function ParticipantsTab({ participants }: { participants: SupplyChainParticipant[] }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'supplier':
        return <Factory className="h-5 w-5 text-green-600" />;
      case 'manufacturer':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'distributor':
        return <Truck className="h-5 w-5 text-purple-600" />;
      case 'retailer':
        return <ShoppingCart className="h-5 w-5 text-orange-600" />;
      default:
        return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Supply Chain Participants</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {participants.map(participant => (
          <div key={participant.id} className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              {getTypeIcon(participant.type)}
              <div>
                <h4 className="font-medium text-gray-900">{participant.name}</h4>
                <p className="text-sm text-gray-600 capitalize">{participant.type}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Credit Rating:</span>
                <span className="font-medium">{participant.creditRating}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Volume:</span>
                <span>${participant.monthlyVolume.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Terms:</span>
                <span>{participant.paymentTerms} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">On-Time Rate:</span>
                <span className="text-green-600">{participant.onTimePaymentRate}%</span>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                participant.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                participant.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {participant.verificationStatus.charAt(0).toUpperCase() + participant.verificationStatus.slice(1)}
              </span>
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
