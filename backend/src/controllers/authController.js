const { validationResult } = require('express-validator');
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ContractKit } = require('@celo/contractkit');
const logger = require('../utils/logger');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { email, phoneNumber, firstName, lastName, walletAddress } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: {
          [User.sequelize.Sequelize.Op.or]: [
            { email },
            { phoneNumber },
            { walletAddress },
          ],
        },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email, phone number, or wallet address',
        });
      }

      // Create new user
      const user = await User.create({
        email,
        phoneNumber,
        firstName,
        lastName,
        walletAddress: walletAddress.toLowerCase(),
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, walletAddress: user.walletAddress },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      logger.info('User registered successfully', { userId: user.id, email });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { identifier, walletAddress } = req.body; // identifier can be email or phone

      let user;
      if (walletAddress) {
        user = await User.findByWalletAddress(walletAddress.toLowerCase());
      } else {
        user = await User.findOne({
          where: {
            [User.sequelize.Sequelize.Op.or]: [
              { email: identifier },
              { phoneNumber: identifier },
            ],
          },
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      if (user.isSuspended) {
        return res.status(403).json({
          success: false,
          message: 'Account is suspended',
          reason: user.suspensionReason,
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, walletAddress: user.walletAddress },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last login and device info
      await user.update({
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
        deviceInfo: {
          ...user.deviceInfo,
          lastLoginIP: req.ip,
          lastLoginUserAgent: req.get('User-Agent'),
        },
      });

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      // In a real implementation, you might want to blacklist the token
      // For now, we'll just update the user's last active time
      const user = await User.findByPk(req.user.userId);
      if (user) {
        await user.update({ lastActiveAt: new Date() });
      }

      logger.info('User logged out successfully', { userId: req.user.userId });

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const user = await User.findByPk(req.user.userId);
      if (!user || user.isSuspended || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // Generate new JWT token
      const token = jwt.sign(
        { userId: user.id, walletAddress: user.walletAddress },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token },
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Token refresh failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: { exclude: ['transactionPin'] },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // Verify wallet signature (for Web3 login)
  async verifyWallet(req, res) {
    try {
      const { walletAddress, signature, message } = req.body;

      // Initialize Celo ContractKit
      const kit = ContractKit.newKit(process.env.CELO_RPC_URL);
      
      // Verify signature
      const accounts = await kit.contracts.getAccounts();
      const isValid = await accounts.verifySignature(message, signature, walletAddress);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid signature',
        });
      }

      // Find or create user
      let user = await User.findByWalletAddress(walletAddress.toLowerCase());
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found. Please register first.',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, walletAddress: user.walletAddress },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last login
      await user.update({
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
      });

      logger.info('Wallet verification successful', { userId: user.id, walletAddress });

      res.json({
        success: true,
        message: 'Wallet verified successfully',
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error) {
      logger.error('Wallet verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Wallet verification failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // Change password (for email-based accounts)
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Verify current password (if user has one)
      if (user.passwordHash && !await bcrypt.compare(currentPassword, user.passwordHash)) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ passwordHash: hashedPassword });

      logger.info('Password changed successfully', { userId: user.id });

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // Reset password request
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findByEmail(email);

      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'If the email exists, a reset link has been sent',
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // In a real implementation, send email with reset link
      // For now, we'll just log it
      logger.info('Password reset requested', { userId: user.id, email, resetToken });

      res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    } catch (error) {
      logger.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }
}

module.exports = new AuthController();
