const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const agentController = require('../controllers/agentController');

// Validation middleware
const validateAgentApplication = [
  body('businessName').notEmpty().withMessage('Business name is required'),
  body('businessType').isIn(['shop', 'kiosk', 'mobile_money', 'pharmacy', 'general_store', 'other']).withMessage('Invalid business type'),
  body('location').notEmpty().withMessage('Location is required'),
  body('coordinates.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('coordinates.longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('servicesOffered').isArray().withMessage('Services offered must be an array'),
  body('operatingHours.open').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid opening time format'),
  body('operatingHours.close').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid closing time format'),
  body('bankAccount.bankName').notEmpty().withMessage('Bank name is required'),
  body('bankAccount.accountNumber').notEmpty().withMessage('Account number is required'),
  body('identityDocument').notEmpty().withMessage('Identity document is required'),
];

const validateCashOperation = [
  body('userId').isInt().withMessage('Invalid user ID'),
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Invalid amount'),
  body('currency').isIn(['CUSD', 'CELO']).withMessage('Invalid currency'),
  body('method').isIn(['mobile_money', 'cash', 'bank_transfer']).withMessage('Invalid method'),
];

const validateCommissionClaim = [
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Invalid amount'),
];

const validateLocationUpdate = [
  body('coordinates.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('coordinates.longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
];

const validateInventoryUpdate = [
  body('floatBalance.CUSD').optional().isNumeric(),
  body('floatBalance.CELO').optional().isNumeric(),
  body('cashBalance').optional().isNumeric(),
];

// Routes

// Agent registration and management
router.post('/apply', validateAgentApplication, agentController.applyAsAgent);
router.get('/my-application', agentController.getMyApplication);
router.get('/profile', agentController.getAgentProfile);
router.put('/profile', agentController.updateProfile);
router.post('/verify-documents', agentController.verifyDocuments);

// Agent operations
router.post('/cash-in', validateCashOperation, agentController.processCashIn);
router.post('/cash-out', validateCashOperation, agentController.processCashOut);
router.get('/transactions', query('limit').optional().isInt({ min: 1, max: 100 }), agentController.getTransactions);
router.get('/float-balance', agentController.getFloatBalance);
router.post('/update-inventory', validateInventoryUpdate, agentController.updateInventory);

// Commissions and earnings
router.get('/commissions', agentController.getCommissions);
router.post('/claim-commission', validateCommissionClaim, agentController.claimCommission);
router.get('/earnings/daily', agentController.getDailyEarnings);
router.get('/earnings/monthly', agentController.getMonthlyEarnings);

// Location and availability
router.post('/update-location', validateLocationUpdate, agentController.updateLocation);
router.post('/set-availability', body('isAvailable').isBoolean(), agentController.setAvailability);
router.get('/nearby', query('latitude').isFloat(), query('longitude').isFloat(), agentController.getNearbyAgents);

// Customer management
router.get('/customers', agentController.getCustomers);
router.get('/customers/:userId/history', param('userId').isInt(), agentController.getCustomerHistory);

// Reports and analytics
router.get('/reports/daily', agentController.getDailyReport);
router.get('/reports/weekly', agentController.getWeeklyReport);
router.get('/reports/monthly', agentController.getMonthlyReport);
router.get('/analytics/performance', agentController.getPerformanceAnalytics);

// Admin routes (for agent management)
router.get('/all', agentController.getAllAgents);
router.get('/applications', agentController.getPendingApplications);
router.post('/:agentId/approve', param('agentId').isInt(), agentController.approveAgent);
router.post('/:agentId/reject', param('agentId').isInt(), agentController.rejectAgent);
router.post('/:agentId/suspend', param('agentId').isInt(), agentController.suspendAgent);
router.post('/:agentId/reactivate', param('agentId').isInt(), agentController.reactivateAgent);
router.get('/:agentId/details', param('agentId').isInt(), agentController.getAgentDetails);

module.exports = router;
