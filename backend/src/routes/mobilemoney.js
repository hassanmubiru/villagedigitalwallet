const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const mobileMoneyController = require('../controllers/mobileMoneyController');

// Validation middleware
const validateMobileMoneyAccount = [
  body('provider').isIn(['mtn', 'airtel', 'vodafone', 'orange', 'tigo', 'safaricom']).withMessage('Invalid mobile money provider'),
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
  body('accountName').notEmpty().withMessage('Account name is required'),
  body('isPrimary').optional().isBoolean(),
];

const validateDeposit = [
  body('accountId').isInt().withMessage('Invalid account ID'),
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Invalid deposit amount'),
  body('pin').optional().isLength({ min: 4, max: 6 }).isNumeric(),
];

const validateWithdrawal = [
  body('accountId').isInt().withMessage('Invalid account ID'),
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Invalid withdrawal amount'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('Transaction PIN required'),
];

const validateTransfer = [
  body('fromAccountId').isInt().withMessage('Invalid source account ID'),
  body('toPhoneNumber').isMobilePhone().withMessage('Invalid recipient phone number'),
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Invalid transfer amount'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('Transaction PIN required'),
  body('note').optional().isLength({ max: 200 }),
];

const validateBillPayment = [
  body('accountId').isInt().withMessage('Invalid account ID'),
  body('billerCode').notEmpty().withMessage('Biller code is required'),
  body('billNumber').notEmpty().withMessage('Bill number is required'),
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Invalid payment amount'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('Transaction PIN required'),
];

const validateAirtimePurchase = [
  body('accountId').isInt().withMessage('Invalid account ID'),
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Invalid airtime amount'),
  body('provider').isIn(['mtn', 'airtel', 'vodafone', 'orange', 'tigo', 'safaricom']).withMessage('Invalid provider'),
  body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('Transaction PIN required'),
];

// Routes

// Account management
router.get('/accounts', mobileMoneyController.getAccounts);
router.post('/accounts', validateMobileMoneyAccount, mobileMoneyController.addAccount);
router.get('/accounts/:accountId', param('accountId').isInt(), mobileMoneyController.getAccountDetails);
router.put('/accounts/:accountId', param('accountId').isInt(), validateMobileMoneyAccount, mobileMoneyController.updateAccount);
router.delete('/accounts/:accountId', param('accountId').isInt(), mobileMoneyController.removeAccount);
router.post('/accounts/:accountId/verify', param('accountId').isInt(), mobileMoneyController.verifyAccount);
router.post('/accounts/:accountId/set-primary', param('accountId').isInt(), mobileMoneyController.setPrimaryAccount);

// Balance and limits
router.get('/accounts/:accountId/balance', param('accountId').isInt(), mobileMoneyController.getBalance);
router.get('/accounts/:accountId/limits', param('accountId').isInt(), mobileMoneyController.getLimits);
router.get('/providers', mobileMoneyController.getSupportedProviders);
router.get('/providers/:provider/fees', param('provider').isIn(['mtn', 'airtel', 'vodafone', 'orange', 'tigo', 'safaricom']), mobileMoneyController.getProviderFees);

// Transactions
router.post('/deposit', validateDeposit, mobileMoneyController.depositFromMobileMoney);
router.post('/withdraw', validateWithdrawal, mobileMoneyController.withdrawToMobileMoney);
router.post('/transfer', validateTransfer, mobileMoneyController.transferToMobileMoney);
router.get('/transactions', query('limit').optional().isInt({ min: 1, max: 100 }), mobileMoneyController.getTransactions);
router.get('/transactions/:transactionId', param('transactionId').isInt(), mobileMoneyController.getTransactionDetails);

// Bill payments and services
router.get('/billers', mobileMoneyController.getBillers);
router.get('/billers/:billerCode', param('billerCode').notEmpty(), mobileMoneyController.getBillerDetails);
router.post('/pay-bill', validateBillPayment, mobileMoneyController.payBill);
router.get('/bill-payments', mobileMoneyController.getBillPayments);

// Airtime and data
router.post('/buy-airtime', validateAirtimePurchase, mobileMoneyController.buyAirtime);
router.get('/data-plans/:provider', param('provider').isIn(['mtn', 'airtel', 'vodafone', 'orange', 'tigo', 'safaricom']), mobileMoneyController.getDataPlans);
router.post('/buy-data', body('accountId').isInt(), body('phoneNumber').isMobilePhone(), body('planId').notEmpty(), mobileMoneyController.buyDataPlan);

// Transaction status and webhooks
router.post('/transactions/:transactionId/status', param('transactionId').isInt(), mobileMoneyController.checkTransactionStatus);
router.post('/webhooks/callback', mobileMoneyController.handleProviderCallback);
router.post('/webhooks/status-update', mobileMoneyController.handleStatusUpdate);

// KYC and compliance
router.get('/kyc-requirements/:provider', param('provider').isIn(['mtn', 'airtel', 'vodafone', 'orange', 'tigo', 'safaricom']), mobileMoneyController.getKYCRequirements);
router.post('/accounts/:accountId/upgrade-kyc', param('accountId').isInt(), mobileMoneyController.upgradeKYC);

// Exchange rates and conversion
router.get('/exchange-rates', mobileMoneyController.getExchangeRates);
router.post('/convert-estimate', body('fromCurrency').notEmpty(), body('toCurrency').notEmpty(), body('amount').isNumeric(), mobileMoneyController.getConversionEstimate);

// Analytics and reporting
router.get('/analytics/usage', mobileMoneyController.getUsageAnalytics);
router.get('/analytics/provider-performance', mobileMoneyController.getProviderPerformance);
router.get('/reports/monthly', query('year').optional().isInt(), query('month').optional().isInt(), mobileMoneyController.getMonthlyReport);

// Admin and monitoring
router.get('/admin/failed-transactions', mobileMoneyController.getFailedTransactions);
router.post('/admin/reconcile', mobileMoneyController.reconcileTransactions);
router.get('/admin/provider-status', mobileMoneyController.getProviderStatus);
router.post('/admin/provider/:provider/toggle', param('provider').isIn(['mtn', 'airtel', 'vodafone', 'orange', 'tigo', 'safaricom']), mobileMoneyController.toggleProvider);

module.exports = router;
