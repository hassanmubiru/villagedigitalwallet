const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const loanController = require('../controllers/loanController');

// Validation middleware
const validateLoanApplication = [
  body('amount').isNumeric().isFloat({ min: 1 }).withMessage('Invalid loan amount'),
  body('purpose').notEmpty().withMessage('Loan purpose is required'),
  body('duration').isInt({ min: 1, max: 365 }).withMessage('Duration must be between 1-365 days'),
  body('collateralType').optional().isIn(['crypto', 'mobile_money', 'asset', 'guarantee']),
  body('collateralValue').optional().isNumeric(),
  body('guarantorId').optional().isInt(),
];

const validateRepayment = [
  param('loanId').isInt().withMessage('Invalid loan ID'),
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Invalid repayment amount'),
];

const validateLoanAction = [
  param('loanId').isInt().withMessage('Invalid loan ID'),
];

const validateCreditHistory = [
  query('userId').optional().isInt().withMessage('Invalid user ID'),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('offset').optional().isInt({ min: 0 }),
];

// Routes
router.post('/apply', validateLoanApplication, loanController.applyForLoan);
router.get('/my-loans', loanController.getUserLoans);
router.get('/applications', loanController.getLoanApplications);
router.get('/:loanId', validateLoanAction, loanController.getLoanDetails);
router.post('/:loanId/approve', validateLoanAction, loanController.approveLoan);
router.post('/:loanId/reject', validateLoanAction, loanController.rejectLoan);
router.post('/:loanId/disburse', validateLoanAction, loanController.disburseLoan);
router.post('/:loanId/repay', validateRepayment, loanController.makeRepayment);
router.get('/:loanId/schedule', validateLoanAction, loanController.getRepaymentSchedule);
router.get('/:loanId/history', validateLoanAction, loanController.getLoanHistory);
router.post('/:loanId/extend', validateLoanAction, loanController.extendLoan);
router.post('/:loanId/restructure', validateLoanAction, loanController.restructureLoan);

// Credit and risk management
router.get('/credit-score/:userId', param('userId').isInt(), loanController.getCreditScore);
router.get('/credit-history', validateCreditHistory, loanController.getCreditHistory);
router.post('/calculate-eligibility', loanController.calculateLoanEligibility);
router.get('/defaulted', loanController.getDefaultedLoans);
router.post('/:loanId/mark-default', validateLoanAction, loanController.markAsDefault);

// Analytics and reporting
router.get('/analytics/overview', loanController.getLoanAnalytics);
router.get('/analytics/performance', loanController.getLoanPerformance);

module.exports = router;
