const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    txHash: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true, // Some transactions might not be on blockchain yet
    },
    fromUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    toUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    fromAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    toAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.ENUM('CUSD', 'CELO', 'VWT'),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        'deposit',
        'withdrawal',
        'transfer',
        'loan_disbursement',
        'loan_repayment',
        'savings_contribution',
        'savings_payout',
        'commission',
        'fee',
        'reward',
        'refund'
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending',
    },
    method: {
      type: DataTypes.ENUM('blockchain', 'mobile_money', 'bank_transfer', 'agent', 'internal'),
      defaultValue: 'blockchain',
    },
    reference: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    externalReference: {
      type: DataTypes.STRING,
      allowNull: true, // For mobile money or bank references
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fee: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    feeBreakdown: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    blockNumber: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    gasUsed: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    gasPrice: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    agentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    savingsGroupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'SavingsGroups',
        key: 'id',
      },
    },
    loanId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Loans',
        key: 'id',
      },
    },
    parentTransactionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Transactions',
        key: 'id',
      },
    },
    batchId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isDisputed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    disputeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Disputes',
        key: 'id',
      },
    },
    isFlagged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    flagReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    processingStartedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    failedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    retryCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    maxRetries: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'transactions',
    timestamps: true,
    indexes: [
      { fields: ['txHash'] },
      { fields: ['reference'] },
      { fields: ['fromUserId'] },
      { fields: ['toUserId'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['currency'] },
      { fields: ['createdAt'] },
      { fields: ['agentId'] },
      { fields: ['savingsGroupId'] },
      { fields: ['loanId'] },
      { fields: ['batchId'] },
      { fields: ['isDisputed'] },
      { fields: ['isFlagged'] },
      { fields: ['method'] },
      { fields: ['fromUserId', 'createdAt'] },
      { fields: ['toUserId', 'createdAt'] },
      { fields: ['type', 'status'] },
    ],
    hooks: {
      beforeCreate: (transaction) => {
        if (!transaction.reference) {
          transaction.reference = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        }
      },
    },
  });

  // Instance methods
  Transaction.prototype.canRetry = function() {
    return this.status === 'failed' && this.retryCount < this.maxRetries;
  };

  Transaction.prototype.markAsProcessing = function() {
    this.status = 'processing';
    this.processingStartedAt = new Date();
    return this.save();
  };

  Transaction.prototype.markAsCompleted = function(txHash = null) {
    this.status = 'completed';
    this.completedAt = new Date();
    if (txHash) this.txHash = txHash;
    return this.save();
  };

  Transaction.prototype.markAsFailed = function(errorMessage) {
    this.status = 'failed';
    this.failedAt = new Date();
    this.errorMessage = errorMessage;
    this.retryCount += 1;
    return this.save();
  };

  Transaction.prototype.calculateFinalAmount = function() {
    return parseFloat(this.amount) + parseFloat(this.fee);
  };

  // Class methods
  Transaction.findByReference = function(reference) {
    return this.findOne({ where: { reference } });
  };

  Transaction.findByTxHash = function(txHash) {
    return this.findOne({ where: { txHash } });
  };

  Transaction.findPendingTransactions = function() {
    return this.findAll({
      where: { status: 'pending' },
      order: [['createdAt', 'ASC']],
    });
  };

  Transaction.findUserTransactions = function(userId, options = {}) {
    const { limit = 50, offset = 0, type, status } = options;
    const where = {
      [sequelize.Sequelize.Op.or]: [
        { fromUserId: userId },
        { toUserId: userId },
      ],
    };

    if (type) where.type = type;
    if (status) where.status = status;

    return this.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: sequelize.models.User, as: 'fromUser', attributes: ['id', 'firstName', 'lastName', 'walletAddress'] },
        { model: sequelize.models.User, as: 'toUser', attributes: ['id', 'firstName', 'lastName', 'walletAddress'] },
      ],
    });
  };

  return Transaction;
};
