// Phase 4: QR Code Payment Component
// Customer-facing component for scanning and paying via QR codes

'use client';

import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Scan, 
  DollarSign, 
  Store, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  Camera,
  Smartphone,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { 
  merchantServices, 
  Merchant, 
  MerchantTransaction,
  QRCodePayment
} from '../lib/merchantServices';
import { useLanguage } from '../providers/LanguageProvider';
import { translations } from '../utils/translations';

interface QRPaymentProps {
  onBack?: () => void;
}

export default function QRPayment({ onBack }: QRPaymentProps) {
  const { language } = useLanguage();
  const t = (key: string) => translations[language][key] || key;

  const [step, setStep] = useState<'scan' | 'amount' | 'confirm' | 'processing' | 'success' | 'error'>('scan');
  const [qrData, setQrData] = useState<string>('');
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [qrPayment, setQrPayment] = useState<QRCodePayment | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [transaction, setTransaction] = useState<MerchantTransaction | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Mock QR scanner function - in real implementation, this would use camera
  const simulateQRScan = (merchantId: string, paymentAmount?: number) => {
    const mockQRData = btoa(JSON.stringify({
      type: 'payment',
      merchant: merchantId,
      wallet: '0x1234567890123456789012345678901234567890',
      amount: paymentAmount,
      description: paymentAmount ? 'Fixed amount payment' : 'Dynamic amount payment',
      timestamp: Date.now()
    }));
    handleQRScanned(mockQRData);
  };

  const handleQRScanned = async (scannedData: string) => {
    setLoading(true);
    setError('');
    
    try {
      setQrData(scannedData);
      
      // Parse QR data
      const data = JSON.parse(atob(scannedData));
      if (data.type !== 'payment') {
        throw new Error('Invalid QR code type');
      }

      // Get merchant info
      const merchantData = await merchantServices.getMerchant(data.merchant);
      if (!merchantData) {
        throw new Error('Merchant not found');
      }

      setMerchant(merchantData);

      // Create QR payment object
      const payment: QRCodePayment = {
        merchantId: data.merchant,
        amount: data.amount,
        currency: 'CUSD',
        description: data.description,
        isDynamic: !data.amount,
        qrCodeData: scannedData,
        paymentUrl: `villagewallet://pay/${data.merchant}`
      };
      setQrPayment(payment);

      // Determine next step
      if (data.amount) {
        setAmount(data.amount.toString());
        setStep('confirm');
      } else {
        setStep('amount');
      }
    } catch (err) {
      console.error('QR scan error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process QR code');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setStep('confirm');
  };

  const handlePayment = async () => {
    if (!qrPayment || !merchant) return;

    setLoading(true);
    setStep('processing');
    
    try {
      const paymentAmount = parseFloat(amount);
      if (!paymentAmount || paymentAmount <= 0) {
        throw new Error('Invalid payment amount');
      }

      // Process payment
      const newTransaction = await merchantServices.processQRPayment(
        qrData, 
        'customer_' + Date.now(), // Mock customer ID
        paymentAmount
      );

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Complete transaction
      const completedTransaction = await merchantServices.processTransaction(newTransaction.id);
      setTransaction(completedTransaction);
      setStep('success');
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const resetPayment = () => {
    setStep('scan');
    setQrData('');
    setMerchant(null);
    setQrPayment(null);
    setAmount('');
    setTransaction(null);
    setError('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="bg-blue-100 p-3 rounded-lg">
              <QrCode className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">QR Payment</h1>
              <p className="text-gray-600">Scan QR code to pay merchant</p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center space-x-2">
            {['scan', 'amount', 'confirm', 'success'].map((stepName, index) => (
              <div
                key={stepName}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName
                    ? 'bg-blue-600 text-white'
                    : ['processing', 'success', 'error'].includes(step) && index < 3
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {step === 'scan' && (
          <ScanStep 
            onQRScanned={handleQRScanned}
            onMockScan={simulateQRScan}
            loading={loading}
          />
        )}

        {step === 'amount' && merchant && qrPayment && (
          <AmountStep
            merchant={merchant}
            amount={amount}
            onAmountChange={setAmount}
            onSubmit={handleAmountSubmit}
            error={error}
          />
        )}

        {step === 'confirm' && merchant && qrPayment && (
          <ConfirmStep
            merchant={merchant}
            qrPayment={qrPayment}
            amount={parseFloat(amount)}
            onConfirm={handlePayment}
            onBack={() => qrPayment.isDynamic ? setStep('amount') : setStep('scan')}
            loading={loading}
          />
        )}

        {step === 'processing' && (
          <ProcessingStep merchant={merchant} amount={parseFloat(amount)} />
        )}

        {step === 'success' && transaction && merchant && (
          <SuccessStep
            transaction={transaction}
            merchant={merchant}
            onNewPayment={resetPayment}
          />
        )}

        {step === 'error' && (
          <ErrorStep
            error={error}
            onRetry={resetPayment}
          />
        )}
      </div>
    </div>
  );
}

// Scan Step Component
function ScanStep({ 
  onQRScanned, 
  onMockScan, 
  loading 
}: {
  onQRScanned: (data: string) => void;
  onMockScan: (merchantId: string, amount?: number) => void;
  loading: boolean;
}) {
  return (
    <div className="text-center space-y-6">
      <div className="bg-gray-50 rounded-lg p-8">
        <div className="border-4 border-dashed border-gray-300 rounded-lg p-12">
          <Camera className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Scan QR Code</h3>
          <p className="text-gray-600 mb-6">
            Point your camera at the merchant's QR code to start payment
          </p>
          
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Processing...</span>
            </div>
          ) : (
            <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto">
              <Scan className="h-5 w-5" />
              <span>Open Camera</span>
            </button>
          )}
        </div>
      </div>

      {/* Demo Options */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Demo Options</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => onMockScan('merchant_1234_abc', 25.00)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Store className="h-6 w-6 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">Village Market</p>
            <p className="text-sm text-gray-600">Fixed: $25.00</p>
          </button>
          
          <button
            onClick={() => onMockScan('merchant_5678_def')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Store className="h-6 w-6 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">Sunrise Clinic</p>
            <p className="text-sm text-gray-600">Dynamic amount</p>
          </button>
          
          <button
            onClick={() => onMockScan('merchant_9012_ghi', 150.00)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Store className="h-6 w-6 text-orange-600 mb-2" />
            <p className="font-medium text-gray-900">Green Farm Supplies</p>
            <p className="text-sm text-gray-600">Fixed: $150.00</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// Amount Step Component
function AmountStep({ 
  merchant, 
  amount, 
  onAmountChange, 
  onSubmit, 
  error 
}: {
  merchant: Merchant;
  amount: string;
  onAmountChange: (amount: string) => void;
  onSubmit: () => void;
  error: string;
}) {
  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Merchant Info */}
      <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
        <div className="bg-blue-100 p-3 rounded-lg">
          <Store className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{merchant.name}</h3>
          <p className="text-sm text-gray-600">{merchant.address}</p>
        </div>
      </div>

      {/* Amount Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0.00"
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg"
              step="0.01"
              min="0"
              autoFocus
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </p>
          )}
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 20, 50].map(quickAmount => (
            <button
              key={quickAmount}
              onClick={() => onAmountChange(quickAmount.toString())}
              className="py-2 px-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              ${quickAmount}
            </button>
          ))}
        </div>

        <button
          onClick={onSubmit}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <ArrowRight className="h-5 w-5" />
          <span>Continue</span>
        </button>
      </div>
    </div>
  );
}

// Confirm Step Component
function ConfirmStep({ 
  merchant, 
  qrPayment, 
  amount, 
  onConfirm, 
  onBack, 
  loading 
}: {
  merchant: Merchant;
  qrPayment: QRCodePayment;
  amount: number;
  onConfirm: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const estimatedFees = amount * 0.015; // 1.5% estimated fee

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Payment Summary</h3>
        
        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Store className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{merchant.name}</p>
            <p className="text-sm text-gray-600">{merchant.category}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount</span>
            <span className="font-medium">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Fees</span>
            <span className="font-medium">${estimatedFees.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-200">
            <span className="text-lg font-medium">Total</span>
            <span className="text-lg font-bold text-blue-600">${(amount + estimatedFees).toFixed(2)}</span>
          </div>
        </div>

        {qrPayment.description && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Description:</strong> {qrPayment.description}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <CreditCard className="h-5 w-5" />
          )}
          <span>{loading ? 'Processing...' : 'Pay Now'}</span>
        </button>
      </div>
    </div>
  );
}

// Processing Step Component
function ProcessingStep({ 
  merchant, 
  amount 
}: {
  merchant: Merchant | null;
  amount: number;
}) {
  return (
    <div className="text-center space-y-6">
      <div className="bg-blue-50 rounded-lg p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Payment</h3>
        <p className="text-gray-600">
          Processing ${amount.toFixed(2)} payment to {merchant?.name}...
        </p>
      </div>
      
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
        <Clock className="h-4 w-4" />
        <span>This usually takes a few seconds</span>
      </div>
    </div>
  );
}

// Success Step Component
function SuccessStep({ 
  transaction, 
  merchant, 
  onNewPayment 
}: {
  transaction: MerchantTransaction;
  merchant: Merchant;
  onNewPayment: () => void;
}) {
  return (
    <div className="text-center space-y-6">
      <div className="bg-green-50 rounded-lg p-8">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">
          Your payment of ${transaction.amount.toFixed(2)} to {merchant.name} was successful.
        </p>
      </div>

      {/* Transaction Details */}
      <div className="bg-gray-50 rounded-lg p-6 text-left space-y-3">
        <h4 className="font-medium text-gray-900">Transaction Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Receipt Number</span>
            <span className="font-medium">{transaction.receiptNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount</span>
            <span className="font-medium">${transaction.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fees</span>
            <span className="font-medium">${transaction.fees.totalFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date</span>
            <span className="font-medium">{transaction.timestamp.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Merchant</span>
            <span className="font-medium">{merchant.name}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onNewPayment}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <QrCode className="h-5 w-5" />
          <span>New Payment</span>
        </button>
        <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50">
          View Receipt
        </button>
      </div>
    </div>
  );
}

// Error Step Component
function ErrorStep({ 
  error, 
  onRetry 
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="text-center space-y-6">
      <div className="bg-red-50 rounded-lg p-8">
        <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Failed</h3>
        <p className="text-gray-600">{error}</p>
      </div>

      <button
        onClick={onRetry}
        className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
