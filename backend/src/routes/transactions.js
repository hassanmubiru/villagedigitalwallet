const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const transactionController = require('../controllers/transactionController');

// Validation middleware
const validateTransactionQuery = [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
  query('type').optional().isIn(['deposit', 'withdrawal', 'transfer', 'loan_disbursement', 'loan_repayment', 'savings_contribution', 'savings_payout', 'commission', 'fee']),
  query('status').optional().isIn(['pending', 'completed', 'failed', 'cancelled']),
  query('currency').optional().isIn(['CUSD', 'CELO', 'VWT']),
  query('minAmount').optional().isNumeric(),
  query('maxAmount').optional().isNumeric(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('userId').optional().isInt(),
  query('agentId').optional().isInt(),
];

const validateTransactionUpdate = [
  param('transactionId').isInt().withMessage('Invalid transaction ID'),
  body('status').optional().isIn(['completed', 'failed', 'cancelled']),
  body('notes').optional().isLength({ max: 500 }),
];

const validateDispute = [
  param('transactionId').isInt().withMessage('Invalid transaction ID'),
  body('reason').isIn(['unauthorized', 'amount_incorrect', 'not_received', 'duplicate', 'fraud', 'other']).withMessage('Invalid dispute reason'),
  body('description').notEmpty().withMessage('Dispute description is required'),
  body('evidence').optional().isArray(),
];

const validateBatchTransactions = [
  body('transactions').isArray({ min: 1, max: 100 }).withMessage('Transactions array required (1-100 items)'),
  body('transactions.*.to').notEmpty().withMessage('Recipient required for each transaction'),
  body('transactions.*.amount').isNumeric().withMessage('Amount required for each transaction'),
  body('transactions.*.currency').isIn(['CUSD', 'CELO', 'VWT']).withMessage('Valid currency required'),
];

// Routes

// Transaction history and details
router.get('/', validateTransactionQuery, transactionController.getTransactions);
router.get('/user/:userId', param('userId').isInt(), validateTransactionQuery, transactionController.getUserTransactions);
router.get('/:transactionId', param('transactionId').isInt(), transactionController.getTransactionDetails);
router.get('/:transactionId/receipt', param('transactionId').isInt(), transactionController.getTransactionReceipt);

// Transaction status and updates
router.put('/:transactionId/status', validateTransactionUpdate, transactionController.updateTransactionStatus);
router.post('/:transactionId/retry', param('transactionId').isInt(), transactionController.retryTransaction);
router.post('/:transactionId/cancel', param('transactionId').isInt(), transactionController.cancelTransaction);

// Bulk operations
router.post('/batch', validateBatchTransactions, transactionController.processBatchTransactions);
router.get('/batch/:batchId', param('batchId').isInt(), transactionController.getBatchTransactionStatus);

// Transaction verification
router.post('/:transactionId/verify', param('transactionId').isInt(), transactionController.verifyTransaction);
router.get('/pending/verification', transactionController.getPendingVerifications);
router.post('/verify-batch', body('transactionIds').isArray(), transactionController.verifyBatchTransactions);

// Disputes and issues
router.post('/:transactionId/dispute', validateDispute, transactionController.createDispute);
router.get('/disputes', transactionController.getDisputes);
router.get('/disputes/:disputeId', param('disputeId').isInt(), transactionController.getDisputeDetails);
router.post('/disputes/:disputeId/resolve', param('disputeId').isInt(), transactionController.resolveDispute);
router.post('/disputes/:disputeId/escalate', param('disputeId').isInt(), transactionController.escalateDispute);

// Analytics and reporting
router.get('/analytics/summary', transactionController.getTransactionSummary);
router.get('/analytics/volume', query('period').optional().isIn(['day', 'week', 'month', 'year']), transactionController.getTransactionVolume);
router.get('/analytics/trends', transactionController.getTransactionTrends);
router.get('/analytics/fees', transactionController.getFeeAnalytics);
router.get('/analytics/failed', transactionController.getFailedTransactions);

// Admin and monitoring
router.get('/admin/pending', transactionController.getPendingTransactions);
router.get('/admin/failed', transactionController.getFailedTransactionsAdmin);
router.get('/admin/high-value', transactionController.getHighValueTransactions);
router.get('/admin/suspicious', transactionController.getSuspiciousTransactions);
router.post('/admin/:transactionId/flag', param('transactionId').isInt(), transactionController.flagTransaction);
router.post('/admin/:transactionId/investigate', param('transactionId').isInt(), transactionController.investigateTransaction);

// Export and reports
router.get('/export/csv', validateTransactionQuery, transactionController.exportTransactionsCSV);
router.get('/export/pdf', validateTransactionQuery, transactionController.exportTransactionsPDF);
router.get('/reports/daily', query('date').optional().isISO8601(), transactionController.getDailyReport);
router.get('/reports/monthly', query('year').optional().isInt(), query('month').optional().isInt(), transactionController.getMonthlyReport);

// Blockchain integration
router.get('/:transactionId/blockchain', param('transactionId').isInt(), transactionController.getBlockchainDetails);
router.post('/sync-blockchain', transactionController.syncBlockchainTransactions);
router.get('/blockchain/status', transactionController.getBlockchainSyncStatus);

module.exports = router;
