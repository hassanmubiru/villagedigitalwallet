// Phase 4: Merchant Dashboard Component
// Comprehensive dashboard for merchant payment management

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Store, 
  QrCode, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Eye,
  Filter
} from 'lucide-react';
import { 
  merchantServices, 
  Merchant, 
  MerchantTransaction, 
  QRCodePayment 
} from '../lib/merchantServices';
import { useLanguage } from '../providers/LanguageProvider';
import { translations } from '../utils/translations';

interface MerchantDashboardProps {
  merchantId?: string;
}

export default function MerchantDashboard({ merchantId }: MerchantDashboardProps) {
  const { language } = useLanguage();
  const t = (key: string) => translations[language][key] || key;

  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'qr-codes' | 'analytics' | 'settings'>('overview');
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [transactions, setTransactions] = useState<MerchantTransaction[]>([]);
  const [dailySummary, setDailySummary] = useState({
    totalAmount: 0,
    transactionCount: 0,
    totalFees: 0,
    averageTransaction: 0
  });
  const [qrPayment, setQrPayment] = useState<QRCodePayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<string>('');

  useEffect(() => {
    loadMerchantData();
  }, [merchantId, selectedMerchant]);

  const loadMerchantData = async () => {
    setLoading(true);
    try {
      const currentMerchantId = merchantId || selectedMerchant;
      if (!currentMerchantId) {
        setLoading(false);
        return;
      }

      const merchantData = await merchantServices.getMerchant(currentMerchantId);
      setMerchant(merchantData);

      if (merchantData) {
        const transactionData = await merchantServices.getMerchantTransactions(currentMerchantId);
        setTransactions(transactionData);

        const summary = await merchantServices.getDailyTransactionSummary(currentMerchantId, new Date());
        setDailySummary(summary);
      }
    } catch (error) {
      console.error('Error loading merchant data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (amount?: number, description?: string) => {
    if (!merchant) return;
    
    try {
      setLoading(true);
      const qr = await merchantServices.generateQRCodePayment(merchant.id, amount, description);
      setQrPayment(qr);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (!merchantId && !selectedMerchant) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Merchant</h3>
          <p className="text-gray-600 mb-4">Choose a merchant to view their dashboard</p>
          <MerchantSelector onSelect={setSelectedMerchant} />
        </div>
      </div>
    );
  }

  if (loading && !merchant) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Merchant Not Found</h3>
          <p className="text-gray-600">The selected merchant could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Store className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{merchant.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {merchant.address}
                </span>
                <span className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {merchant.phone}
                </span>
                {merchant.email && (
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {merchant.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              merchant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {merchant.status.charAt(0).toUpperCase() + merchant.status.slice(1)}
            </span>
            {merchant.isVerified && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'transactions', label: 'Transactions', icon: CreditCard },
            { id: 'qr-codes', label: 'QR Codes', icon: QrCode },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings }
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
        {activeTab === 'overview' && (
          <OverviewTab 
            merchant={merchant} 
            dailySummary={dailySummary} 
            transactions={transactions.slice(0, 5)} 
          />
        )}
        
        {activeTab === 'transactions' && (
          <TransactionsTab 
            transactions={transactions} 
            onRefresh={loadMerchantData}
            loading={loading}
          />
        )}
        
        {activeTab === 'qr-codes' && (
          <QRCodesTab 
            merchant={merchant}
            qrPayment={qrPayment}
            onGenerateQR={generateQRCode}
            loading={loading}
          />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsTab merchant={merchant} transactions={transactions} />
        )}
        
        {activeTab === 'settings' && (
          <SettingsTab merchant={merchant} onUpdate={loadMerchantData} />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ 
  merchant, 
  dailySummary, 
  transactions 
}: {
  merchant: Merchant;
  dailySummary: any;
  transactions: MerchantTransaction[];
}) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Today's Revenue</p>
              <p className="text-2xl font-bold">${dailySummary.totalAmount.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Today's Transactions</p>
              <p className="text-2xl font-bold">{dailySummary.transactionCount}</p>
            </div>
            <CreditCard className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Average Transaction</p>
              <p className="text-2xl font-bold">${dailySummary.averageTransaction.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Monthly Volume</p>
              <p className="text-2xl font-bold">${merchant.monthlyVolume.toFixed(2)}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Transactions</h3>
        <div className="bg-gray-50 rounded-lg overflow-hidden">
          {transactions.length > 0 ? (
            <div className="space-y-2 p-4">
              {transactions.map(transaction => (
                <div key={transaction.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getStatusColor(transaction.status)}`}>
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {transaction.timestamp.toLocaleDateString()} at {transaction.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${transaction.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{transaction.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Transactions Tab Component
function TransactionsTab({ 
  transactions, 
  onRefresh, 
  loading 
}: {
  transactions: MerchantTransaction[];
  onRefresh: () => void;
  loading: boolean;
}) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.status === filter
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">All Transactions</h3>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.receiptNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${transaction.amount.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">
                      Fee: ${transaction.fees.totalFee.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 capitalize">
                      {transaction.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1 capitalize">{transaction.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{transaction.timestamp.toLocaleDateString()}</div>
                    <div>{transaction.timestamp.toLocaleTimeString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <Download className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// QR Codes Tab Component
function QRCodesTab({ 
  merchant, 
  qrPayment, 
  onGenerateQR, 
  loading 
}: {
  merchant: Merchant;
  qrPayment: QRCodePayment | null;
  onGenerateQR: (amount?: number, description?: string) => void;
  loading: boolean;
}) {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [qrType, setQrType] = useState<'dynamic' | 'fixed'>('dynamic');

  const handleGenerateQR = () => {
    const numAmount = qrType === 'fixed' && amount ? parseFloat(amount) : undefined;
    onGenerateQR(numAmount, description || undefined);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* QR Generator */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Generate QR Code</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              QR Code Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="dynamic"
                  checked={qrType === 'dynamic'}
                  onChange={(e) => setQrType(e.target.value as 'dynamic')}
                  className="mr-2"
                />
                <span className="text-sm">Dynamic (Customer enters amount)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="fixed"
                  checked={qrType === 'fixed'}
                  onChange={(e) => setQrType(e.target.value as 'fixed')}
                  className="mr-2"
                />
                <span className="text-sm">Fixed Amount</span>
              </label>
            </div>
          </div>

          {qrType === 'fixed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                step="0.01"
                min="0"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Payment description"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <button
            onClick={handleGenerateQR}
            disabled={loading || (qrType === 'fixed' && !amount)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <QrCode className="h-4 w-4" />
            )}
            <span>Generate QR Code</span>
          </button>
        </div>
      </div>

      {/* QR Display */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">QR Code</h3>
        
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          {qrPayment ? (
            <div className="space-y-4">
              <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 inline-block">
                <QrCode className="h-32 w-32 text-gray-400 mx-auto" />
                <p className="text-xs text-gray-500 mt-2">QR Code Display</p>
              </div>
              
              <div className="text-left space-y-2">
                <p className="text-sm"><strong>Type:</strong> {qrPayment.isDynamic ? 'Dynamic' : 'Fixed Amount'}</p>
                {qrPayment.amount && (
                  <p className="text-sm"><strong>Amount:</strong> ${qrPayment.amount.toFixed(2)}</p>
                )}
                {qrPayment.description && (
                  <p className="text-sm"><strong>Description:</strong> {qrPayment.description}</p>
                )}
                {qrPayment.expiresAt && (
                  <p className="text-sm"><strong>Expires:</strong> {qrPayment.expiresAt.toLocaleString()}</p>
                )}
                <p className="text-sm"><strong>Payment URL:</strong></p>
                <p className="text-xs text-gray-600 break-all bg-gray-100 p-2 rounded">
                  {qrPayment.paymentUrl}
                </p>
              </div>
              
              <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center justify-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download QR Code</span>
              </button>
            </div>
          ) : (
            <div className="text-gray-500">
              <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Generate a QR code to display here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ 
  merchant, 
  transactions 
}: {
  merchant: Merchant;
  transactions: MerchantTransaction[];
}) {
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalFees = completedTransactions.reduce((sum, t) => sum + t.fees.totalFee, 0);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Analytics & Insights</h3>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h4 className="text-sm font-medium text-blue-900">Total Revenue</h4>
          <p className="text-2xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-blue-700">From {completedTransactions.length} transactions</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-6">
          <h4 className="text-sm font-medium text-green-900">Total Fees Paid</h4>
          <p className="text-2xl font-bold text-green-600">${totalFees.toFixed(2)}</p>
          <p className="text-sm text-green-700">{((totalFees / totalRevenue) * 100).toFixed(1)}% of revenue</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-6">
          <h4 className="text-sm font-medium text-purple-900">Customer Rating</h4>
          <div className="flex items-center space-x-1">
            <p className="text-2xl font-bold text-purple-600">{merchant.rating.toFixed(1)}</p>
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
          </div>
          <p className="text-sm text-purple-700">Based on customer feedback</p>
        </div>
      </div>

      {/* Payment Methods Performance */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Methods Performance</h4>
        <div className="space-y-4">
          {merchant.paymentMethods.map(method => {
            const methodTransactions = completedTransactions.filter(t => t.paymentMethod === method.type);
            const methodRevenue = methodTransactions.reduce((sum, t) => sum + t.amount, 0);
            const percentage = totalRevenue > 0 ? (methodRevenue / totalRevenue) * 100 : 0;
            
            return (
              <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{method.name}</p>
                  <p className="text-sm text-gray-600">{methodTransactions.length} transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${methodRevenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Settings Tab Component
function SettingsTab({ 
  merchant, 
  onUpdate 
}: {
  merchant: Merchant;
  onUpdate: () => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Merchant Settings</h3>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-gray-600">
          Settings functionality would include merchant profile updates, 
          payment method configuration, fee structure adjustments, and 
          notification preferences.
        </p>
        <button 
          onClick={onUpdate}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Update Settings
        </button>
      </div>
    </div>
  );
}

// Merchant Selector Component
function MerchantSelector({ onSelect }: { onSelect: (merchantId: string) => void }) {
  const [merchants, setMerchants] = useState<Merchant[]>([]);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    // Get all merchants for selection
    const allMerchants: Merchant[] = [];
    for (const category of ['retail', 'healthcare', 'agriculture', 'grocery', 'restaurant'] as const) {
      const categoryMerchants = await merchantServices.getMerchantsByCategory(category);
      allMerchants.push(...categoryMerchants);
    }
    setMerchants(allMerchants);
  };

  return (
    <select
      onChange={(e) => onSelect(e.target.value)}
      className="border border-gray-300 rounded-md px-4 py-2 w-64"
      defaultValue=""
    >
      <option value="" disabled>Choose a merchant...</option>
      {merchants.map(merchant => (
        <option key={merchant.id} value={merchant.id}>
          {merchant.name} ({merchant.category})
        </option>
      ))}
    </select>
  );
}

// Helper function (defined outside component)
function getStatusColor(status: string) {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'processing':
      return 'text-blue-600 bg-blue-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Helper function (defined outside component)
function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'failed':
      return <XCircle className="h-4 w-4" />;
    case 'processing':
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
}
