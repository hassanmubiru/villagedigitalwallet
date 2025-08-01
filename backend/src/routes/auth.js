const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Validation middleware
const validateRegistration = [
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
  body('country').isLength({ min: 2, max: 3 }).withMessage('Invalid country code'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
];

const validateLogin = [
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateVerification = [
  body('phoneNumber').isMobilePhone().withMessage('Invalid phone number'),
  body('verificationCode').isLength({ min: 6, max: 6 }).withMessage('Invalid verification code'),
];

// Routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/verify-phone', validateVerification, authController.verifyPhone);
router.post('/resend-code', body('phoneNumber').isMobilePhone(), authController.resendVerificationCode);
router.post('/forgot-password', body('phoneNumber').isMobilePhone(), authController.forgotPassword);
router.post('/reset-password', [
  body('phoneNumber').isMobilePhone(),
  body('resetCode').isLength({ min: 6, max: 6 }),
  body('newPassword').isLength({ min: 6 })
], authController.resetPassword);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('email').optional().isEmail(),
], authController.updateProfile);

module.exports = router;
