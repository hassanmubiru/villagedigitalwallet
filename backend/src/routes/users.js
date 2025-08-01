const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const userController = require('../controllers/userController');

// Validation middleware
const validateProfileUpdate = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('occupation').optional().isLength({ max: 100 }),
  body('address.street').optional().isLength({ max: 200 }),
  body('address.city').optional().isLength({ max: 100 }),
  body('address.state').optional().isLength({ max: 100 }),
  body('address.country').optional().isLength({ max: 100 }),
];

const validateKYCData = [
  body('idType').isIn(['national_id', 'passport', 'drivers_license', 'voters_card']).withMessage('Invalid ID type'),
  body('idNumber').notEmpty().withMessage('ID number is required'),
  body('documentImages').isArray().withMessage('Document images must be an array'),
  body('selfieImage').notEmpty().withMessage('Selfie image is required'),
];

const validateEmergencyContact = [
  body('name').notEmpty().withMessage('Emergency contact name is required'),
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
  body('relationship').notEmpty().withMessage('Relationship is required'),
];

const validateSecuritySettings = [
  body('twoFactorEnabled').optional().isBoolean(),
  body('biometricEnabled').optional().isBoolean(),
  body('transactionPin').optional().isLength({ min: 4, max: 6 }).isNumeric(),
];

const validateLanguagePreference = [
  body('language').isIn(['en', 'sw', 'fr', 'pt', 'ha']).withMessage('Invalid language'),
];

const validateNotificationSettings = [
  body('email').optional().isBoolean(),
  body('sms').optional().isBoolean(),
  body('push').optional().isBoolean(),
  body('transactionAlerts').optional().isBoolean(),
  body('savingsReminders').optional().isBoolean(),
  body('loanAlerts').optional().isBoolean(),
];

// Routes

// Profile management
router.get('/profile', userController.getProfile);
router.put('/profile', validateProfileUpdate, userController.updateProfile);
router.delete('/profile', userController.deleteProfile);
router.get('/profile/completion', userController.getProfileCompletion);

// KYC and verification
router.post('/kyc/submit', validateKYCData, userController.submitKYC);
router.get('/kyc/status', userController.getKYCStatus);
router.post('/kyc/resubmit', validateKYCData, userController.resubmitKYC);
router.get('/verification/status', userController.getVerificationStatus);

// Emergency contacts
router.get('/emergency-contacts', userController.getEmergencyContacts);
router.post('/emergency-contacts', validateEmergencyContact, userController.addEmergencyContact);
router.put('/emergency-contacts/:contactId', param('contactId').isInt(), validateEmergencyContact, userController.updateEmergencyContact);
router.delete('/emergency-contacts/:contactId', param('contactId').isInt(), userController.deleteEmergencyContact);

// Security settings
router.get('/security', userController.getSecuritySettings);
router.put('/security', validateSecuritySettings, userController.updateSecuritySettings);
router.post('/security/reset-pin', userController.resetTransactionPin);
router.post('/security/verify-pin', body('pin').isLength({ min: 4, max: 6 }), userController.verifyTransactionPin);

// Preferences
router.get('/preferences', userController.getPreferences);
router.put('/preferences/language', validateLanguagePreference, userController.updateLanguagePreference);
router.put('/preferences/notifications', validateNotificationSettings, userController.updateNotificationSettings);
router.put('/preferences/currency', body('currency').isIn(['CUSD', 'CELO']), userController.updateCurrencyPreference);

// Activity and history
router.get('/activity', query('limit').optional().isInt({ min: 1, max: 100 }), userController.getUserActivity);
router.get('/login-history', userController.getLoginHistory);
router.get('/device-history', userController.getDeviceHistory);

// Social features
router.get('/friends', userController.getFriends);
router.post('/friends/add', body('phoneNumber').isMobilePhone(), userController.addFriend);
router.delete('/friends/:friendId', param('friendId').isInt(), userController.removeFriend);
router.get('/friends/suggestions', userController.getFriendSuggestions);

// Privacy and data
router.get('/data-export', userController.exportUserData);
router.post('/data-deletion-request', userController.requestDataDeletion);
router.get('/privacy-settings', userController.getPrivacySettings);
router.put('/privacy-settings', userController.updatePrivacySettings);

// Referrals
router.get('/referrals', userController.getReferrals);
router.post('/referrals/invite', body('phoneNumbers').isArray(), userController.sendReferralInvites);
router.get('/referrals/code', userController.getReferralCode);
router.post('/referrals/redeem', body('code').notEmpty(), userController.redeemReferralCode);

// Support and feedback
router.post('/feedback', body('rating').isInt({ min: 1, max: 5 }), body('comment').optional(), userController.submitFeedback);
router.get('/support-tickets', userController.getSupportTickets);
router.post('/support-tickets', body('subject').notEmpty(), body('message').notEmpty(), userController.createSupportTicket);

// Admin routes
router.get('/all', userController.getAllUsers);
router.get('/:userId/details', param('userId').isInt(), userController.getUserDetails);
router.post('/:userId/suspend', param('userId').isInt(), userController.suspendUser);
router.post('/:userId/reactivate', param('userId').isInt(), userController.reactivateUser);
router.post('/:userId/verify', param('userId').isInt(), userController.verifyUser);

module.exports = router;
