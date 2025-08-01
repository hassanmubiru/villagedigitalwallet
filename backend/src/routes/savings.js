const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const savingsController = require('../controllers/savingsController');

// Validation middleware
const validateCreateGroup = [
  body('name').notEmpty().withMessage('Group name is required'),
  body('description').optional().isLength({ max: 500 }),
  body('contributionAmount').isNumeric().isFloat({ min: 0.01 }).withMessage('Invalid contribution amount'),
  body('maxMembers').isInt({ min: 3, max: 50 }).withMessage('Max members must be between 3 and 50'),
  body('frequency').isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid frequency'),
  body('emergencyFundEnabled').isBoolean(),
];

const validateJoinGroup = [
  param('groupId').isInt().withMessage('Invalid group ID'),
];

const validateContribution = [
  param('groupId').isInt().withMessage('Invalid group ID'),
];

const validateEmergencyLoan = [
  param('groupId').isInt().withMessage('Invalid group ID'),
  body('amount').isNumeric().isFloat({ min: 0.01 }).withMessage('Invalid loan amount'),
  body('reason').notEmpty().withMessage('Loan reason is required'),
];

// Routes
router.post('/groups', validateCreateGroup, savingsController.createGroup);
router.get('/groups', savingsController.getUserGroups);
router.get('/groups/available', savingsController.getAvailableGroups);
router.get('/groups/:groupId', param('groupId').isInt(), savingsController.getGroupDetails);
router.post('/groups/:groupId/join', validateJoinGroup, savingsController.joinGroup);
router.post('/groups/:groupId/contribute', validateContribution, savingsController.makeContribution);
router.get('/groups/:groupId/members', param('groupId').isInt(), savingsController.getGroupMembers);
router.get('/groups/:groupId/transactions', param('groupId').isInt(), savingsController.getGroupTransactions);
router.post('/groups/:groupId/emergency-loan', validateEmergencyLoan, savingsController.requestEmergencyLoan);
router.post('/emergency-loans/:loanId/approve', param('loanId').isInt(), savingsController.approveEmergencyLoan);
router.post('/emergency-loans/:loanId/repay', param('loanId').isInt(), savingsController.repayEmergencyLoan);
router.get('/emergency-loans', savingsController.getUserEmergencyLoans);

module.exports = router;
