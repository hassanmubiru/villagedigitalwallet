const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const walletController = require('../controllers/walletController');

// Validation middleware
const validateTransfer = [
  body('to').notEmpty().withMessage('Recipient address is required'),
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Invalid transfer amount'),
  body('currency').isIn(['CUSD', 'CELO', 'VWT']).withMessage('Invalid currency'),
  body('note').optional().isLength({ max: 200 }),
];

const validateDeposit = [
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Invalid deposit amount'),
  body('currency').isIn(['CUSD', 'CELO']).withMessage('Invalid currency'),
  body('paymentMethod').isIn(['mobile_money', 'bank_transfer', 'agent', 'crypto']).withMessage('Invalid payment method'),
];

const validateWithdrawal = [
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Invalid withdrawal amount'),
  body('currency').isIn(['CUSD', 'CELO', 'VWT']).withMessage('Invalid currency'),
  body('method').isIn(['mobile_money', 'bank_transfer', 'agent', 'crypto']).withMessage('Invalid withdrawal method'),
  body('destination').notEmpty().withMessage('Destination is required'),
];

const validateAddressParam = [
  param('address').isEthereumAddress().withMessage('Invalid Ethereum address'),
];

const validateTransactionQuery = [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('type').optional().isIn(['deposit', 'withdrawal', 'transfer', 'loan', 'savings']),
  query('currency').optional().isIn(['CUSD', 'CELO', 'VWT']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
];

const validateLimits = [
  body('dailyLimit').optional().isNumeric().isFloat({ min: 0 }),
  body('monthlyLimit').optional().isNumeric().isFloat({ min: 0 }),
  body('transferLimit').optional().isNumeric().isFloat({ min: 0 }),
];

// Routes

// Wallet management
router.get('/balance', walletController.getBalance);
router.get('/balance/:address', validateAddressParam, walletController.getBalanceByAddress);
router.post('/create', walletController.createWallet);
router.get('/info', walletController.getWalletInfo);
router.post('/recover', walletController.recoverWallet);

// Transactions
router.post('/transfer', validateTransfer, walletController.transfer);
router.post('/deposit', validateDeposit, walletController.deposit);
router.post('/withdraw', validateWithdrawal, walletController.withdraw);
router.get('/transactions', validateTransactionQuery, walletController.getTransactions);
router.get('/transactions/:txHash', param('txHash').isHexadecimal(), walletController.getTransactionDetails);

// Limits and security
router.get('/limits', walletController.getLimits);
router.post('/limits', validateLimits, walletController.updateLimits);
router.post('/freeze', walletController.freezeWallet);
router.post('/unfreeze', walletController.unfreezeWallet);

// Token operations
router.get('/tokens', walletController.getTokenBalances);
router.post('/tokens/stake', body('amount').isNumeric(), walletController.stakeTokens);
router.post('/tokens/unstake', body('amount').isNumeric(), walletController.unstakeTokens);
router.get('/tokens/rewards', walletController.getRewards);
router.post('/tokens/claim', walletController.claimRewards);

// QR Code and payment requests
router.get('/qr-code', walletController.generateQRCode);
router.post('/payment-request', body('amount').isNumeric(), walletController.createPaymentRequest);
router.get('/payment-requests', walletController.getPaymentRequests);
router.post('/payment-requests/:requestId/pay', param('requestId').isInt(), walletController.payRequest);

// Analytics
router.get('/analytics/spending', walletController.getSpendingAnalytics);
router.get('/analytics/income', walletController.getIncomeAnalytics);
router.get('/analytics/monthly', walletController.getMonthlyAnalytics);

module.exports = router;
