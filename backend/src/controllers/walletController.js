const { validationResult } = require('express-validator');
const { Transaction, User, SavingsGroup, Loan } = require('../models');
const { ContractKit } = require('@celo/contractkit');
const logger = require('../utils/logger');
const QRCode = require('qrcode');

class WalletController {
  // Get wallet balance
  async getBalance(req, res) {
    try {
      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Initialize Celo ContractKit
      const kit = ContractKit.newKit(process.env.CELO_RPC_URL);
      kit.defaultAccount = user.walletAddress;

      // Get token contracts
      const stableToken = await kit.contracts.getStableToken();
      const goldToken = await kit.contracts.getGoldToken();

      // Get balances
      const cusdBalance = await stableToken.balanceOf(user.walletAddress);
      const celoBalance = await goldToken.balanceOf(user.walletAddress);

      // Convert from wei to readable format
      const balances = {
        CUSD: kit.web3.utils.fromWei(cusdBalance.toString(), 'ether'),
        CELO: kit.web3.utils.fromWei(celoBalance.toString(), 'ether'),
      };

      logger.info('Balance retrieved', { userId: user.id, balances });

      res.json({
        success: true,
        data: {
          walletAddress: user.walletAddress,
          balances,
        },
      });
    } catch (error) {
      logger.error('Get balance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get balance',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // Transfer funds
  async transfer(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { to, amount, currency, note } = req.body;
      const fromUser = await User.findByPk(req.user.userId);

      if (!fromUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user can perform this transaction
      if (!fromUser.canPerformTransaction(amount, 'transfer')) {
        return res.status(403).json({
          success: false,
          message: 'Transaction exceeds limits or account is restricted',
        });
      }

      // Find recipient
      const toUser = await User.findOne({
        where: {
          [User.sequelize.Sequelize.Op.or]: [
            { walletAddress: to.toLowerCase() },
            { phoneNumber: to },
            { email: to },
          ],
        },
      });

      // Create transaction record
      const transaction = await Transaction.create({
        fromUserId: fromUser.id,
        toUserId: toUser?.id || null,
        fromAddress: fromUser.walletAddress,
        toAddress: toUser?.walletAddress || to,
        amount,
        currency,
        type: 'transfer',
        method: 'blockchain',
        description: note || 'Wallet transfer',
        status: 'pending',
      });

      // Initialize Celo ContractKit
      const kit = ContractKit.newKit(process.env.CELO_RPC_URL);
      kit.defaultAccount = fromUser.walletAddress;

      try {
        let txHash;
        const amountWei = kit.web3.utils.toWei(amount.toString(), 'ether');

        if (currency === 'CUSD') {
          const stableToken = await kit.contracts.getStableToken();
          const tx = await stableToken.transfer(toUser?.walletAddress || to, amountWei);
          txHash = tx.transactionHash;
        } else if (currency === 'CELO') {
          const goldToken = await kit.contracts.getGoldToken();
          const tx = await goldToken.transfer(toUser?.walletAddress || to, amountWei);
          txHash = tx.transactionHash;
        }

        // Update transaction with blockchain details
        await transaction.update({
          txHash,
          status: 'completed',
          completedAt: new Date(),
        });

        logger.info('Transfer completed', {
          userId: fromUser.id,
          transactionId: transaction.id,
          txHash,
          amount,
          currency,
        });

        res.json({
          success: true,
          message: 'Transfer completed successfully',
          data: {
            transaction: transaction.toJSON(),
            txHash,
          },
        });
      } catch (blockchainError) {
        // Update transaction as failed
        await transaction.markAsFailed(blockchainError.message);

        logger.error('Transfer failed on blockchain', {
          userId: fromUser.id,
          transactionId: transaction.id,
          error: blockchainError.message,
        });

        res.status(500).json({
          success: false,
          message: 'Transfer failed on blockchain',
          error: blockchainError.message,
        });
      }
    } catch (error) {
      logger.error('Transfer error:', error);
      res.status(500).json({
        success: false,
        message: 'Transfer failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // Deposit funds
  async deposit(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { amount, currency, paymentMethod } = req.body;
      const user = await User.findByPk(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Create transaction record
      const transaction = await Transaction.create({
        toUserId: user.id,
        toAddress: user.walletAddress,
        amount,
        currency,
        type: 'deposit',
        method: paymentMethod,
        description: `Deposit via ${paymentMethod}`,
        status: 'pending',
      });

      // For mobile money deposits, integrate with mobile money APIs
      if (paymentMethod === 'mobile_money') {
        // This would integrate with mobile money providers
        // For now, we'll simulate success
        await transaction.update({
          status: 'completed',
          completedAt: new Date(),
          externalReference: `MM_${Date.now()}`,
        });
      }

      logger.info('Deposit initiated', {
        userId: user.id,
        transactionId: transaction.id,
        amount,
        currency,
        paymentMethod,
      });

      res.json({
        success: true,
        message: 'Deposit initiated successfully',
        data: {
          transaction: transaction.toJSON(),
        },
      });
    } catch (error) {
      logger.error('Deposit error:', error);
      res.status(500).json({
        success: false,
        message: 'Deposit failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // Withdraw funds
  async withdraw(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { amount, currency, method, destination } = req.body;
      const user = await User.findByPk(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user can perform this transaction
      if (!user.canPerformTransaction(amount, 'transfer')) {
        return res.status(403).json({
          success: false,
          message: 'Transaction exceeds limits or account is restricted',
        });
      }

      // Create transaction record
      const transaction = await Transaction.create({
        fromUserId: user.id,
        fromAddress: user.walletAddress,
        amount,
        currency,
        type: 'withdrawal',
        method,
        description: `Withdrawal to ${destination}`,
        status: 'pending',
      });

      // Process withdrawal based on method
      if (method === 'mobile_money') {
        // This would integrate with mobile money providers
        // For now, we'll simulate processing
        await transaction.update({
          status: 'processing',
          processingStartedAt: new Date(),
          externalReference: `MM_OUT_${Date.now()}`,
        });
      }

      logger.info('Withdrawal initiated', {
        userId: user.id,
        transactionId: transaction.id,
        amount,
        currency,
        method,
      });

      res.json({
        success: true,
        message: 'Withdrawal initiated successfully',
        data: {
          transaction: transaction.toJSON(),
        },
      });
    } catch (error) {
      logger.error('Withdrawal error:', error);
      res.status(500).json({
        success: false,
        message: 'Withdrawal failed',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // Get transaction history
  async getTransactions(req, res) {
    try {
      const { limit = 20, offset = 0, type, currency, startDate, endDate } = req.query;
      
      const where = {
        [Transaction.sequelize.Sequelize.Op.or]: [
          { fromUserId: req.user.userId },
          { toUserId: req.user.userId },
        ],
      };

      if (type) where.type = type;
      if (currency) where.currency = currency;
      if (startDate && endDate) {
        where.createdAt = {
          [Transaction.sequelize.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const { rows: transactions, count } = await Transaction.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'fromUser',
            attributes: ['id', 'firstName', 'lastName', 'walletAddress'],
          },
          {
            model: User,
            as: 'toUser',
            attributes: ['id', 'firstName', 'lastName', 'walletAddress'],
          },
        ],
      });

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: count > parseInt(offset) + parseInt(limit),
          },
        },
      });
    } catch (error) {
      logger.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // Generate QR code for receiving payments
  async generateQRCode(req, res) {
    try {
      const { amount, currency = 'CUSD', note } = req.query;
      const user = await User.findByPk(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const paymentData = {
        walletAddress: user.walletAddress,
        amount: amount || null,
        currency,
        note: note || null,
        timestamp: Date.now(),
      };

      const qrData = JSON.stringify(paymentData);
      const qrCodeUrl = await QRCode.toDataURL(qrData);

      res.json({
        success: true,
        data: {
          qrCode: qrCodeUrl,
          paymentData,
        },
      });
    } catch (error) {
      logger.error('Generate QR code error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate QR code',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // Get wallet info and limits
  async getWalletInfo(req, res) {
    try {
      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.json({
        success: true,
        data: {
          walletAddress: user.walletAddress,
          limits: user.transactionLimits,
          verificationLevel: user.verificationLevel,
          kycStatus: user.kycStatus,
          isActive: user.isActive,
          isSuspended: user.isSuspended,
        },
      });
    } catch (error) {
      logger.error('Get wallet info error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get wallet info',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }
}

module.exports = new WalletController();
