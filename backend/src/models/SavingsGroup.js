const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SavingsGroup = sequelize.define('SavingsGroup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contractAddress: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true, // Set when deployed to blockchain
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    contributionAmount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    currency: {
      type: DataTypes.ENUM('CUSD', 'CELO'),
      defaultValue: 'CUSD',
    },
    maxMembers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 3,
        max: 50,
      },
    },
    currentMembers: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // Creator is automatically a member
    },
    frequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
      allowNull: false,
    },
    nextContributionDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    lastPayoutDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    currentRound: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    totalRounds: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('forming', 'active', 'completed', 'cancelled', 'paused'),
      defaultValue: 'forming',
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    requiresApproval: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emergencyFundEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    emergencyFundBalance: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    emergencyFundRate: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0.1, // 10% of contributions go to emergency fund
    },
    totalContributions: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    totalPayouts: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    interestRate: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0, // Annual interest rate for emergency loans
    },
    penaltyRate: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0.05, // 5% penalty for late contributions
    },
    gracePeriod: {
      type: DataTypes.INTEGER,
      defaultValue: 3, // Days of grace period for contributions
    },
    rules: {
      type: DataTypes.JSONB,
      defaultValue: {
        autoDeductContributions: false,
        allowEarlyWithdrawal: false,
        requireUnanimousExit: true,
        minimumParticipation: 0.8, // 80% participation required
      },
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'savings_groups',
    timestamps: true,
    paranoid: true, // Enables soft deletes
    indexes: [
      { fields: ['contractAddress'] },
      { fields: ['createdBy'] },
      { fields: ['status'] },
      { fields: ['isPublic'] },
      { fields: ['frequency'] },
      { fields: ['nextContributionDate'] },
      { fields: ['createdAt'] },
      { fields: ['currentMembers'] },
      { fields: ['maxMembers'] },
    ],
    hooks: {
      beforeCreate: (group) => {
        // Calculate total rounds based on max members
        group.totalRounds = group.maxMembers;
        
        // Set next contribution date based on frequency
        const now = new Date();
        switch (group.frequency) {
          case 'daily':
            group.nextContributionDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            break;
          case 'weekly':
            group.nextContributionDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
          case 'monthly':
            group.nextContributionDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
            break;
        }
      },
    },
  });

  // Instance methods
  SavingsGroup.prototype.canAcceptNewMembers = function() {
    return this.status === 'forming' && this.currentMembers < this.maxMembers;
  };

  SavingsGroup.prototype.isReady = function() {
    return this.currentMembers >= 3; // Minimum members to start
  };

  SavingsGroup.prototype.calculateNextContributionDate = function() {
    const current = this.nextContributionDate;
    switch (this.frequency) {
      case 'daily':
        return new Date(current.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(current.getFullYear(), current.getMonth() + 1, current.getDate());
      default:
        return current;
    }
  };

  SavingsGroup.prototype.calculateTotalPayout = function() {
    const baseAmount = parseFloat(this.contributionAmount) * this.currentMembers;
    const emergencyFundContribution = baseAmount * parseFloat(this.emergencyFundRate);
    return baseAmount - emergencyFundContribution;
  };

  SavingsGroup.prototype.canStartNextRound = function() {
    return this.status === 'active' && this.currentRound < this.totalRounds;
  };

  SavingsGroup.prototype.getProgress = function() {
    return {
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      percentage: (this.currentRound / this.totalRounds) * 100,
      completedRounds: this.currentRound - 1,
      remainingRounds: this.totalRounds - this.currentRound + 1,
    };
  };

  // Class methods
  SavingsGroup.findByContractAddress = function(contractAddress) {
    return this.findOne({ where: { contractAddress } });
  };

  SavingsGroup.findPublicGroups = function(options = {}) {
    const { limit = 20, offset = 0 } = options;
    return this.findAndCountAll({
      where: {
        isPublic: true,
        status: 'forming',
      },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: sequelize.models.User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });
  };

  SavingsGroup.findUserGroups = function(userId, options = {}) {
    const { limit = 20, offset = 0, status } = options;
    const where = {};
    if (status) where.status = status;

    return this.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: sequelize.models.SavingsGroupMember,
          where: { userId },
          attributes: ['joinedAt', 'status', 'totalContributions'],
        },
        {
          model: sequelize.models.User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
    });
  };

  return SavingsGroup;
};
