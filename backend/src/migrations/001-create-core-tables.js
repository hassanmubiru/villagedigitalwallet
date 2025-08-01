module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      walletAddress: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dateOfBirth: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true,
      },
      occupation: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      profilePicture: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      address: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      kycStatus: {
        type: Sequelize.ENUM('not_started', 'pending', 'approved', 'rejected', 'expired'),
        defaultValue: 'not_started',
      },
      kycData: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      verificationLevel: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      isSuspended: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      suspensionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM('user', 'agent', 'admin', 'super_admin'),
        defaultValue: 'user',
      },
      language: {
        type: Sequelize.STRING,
        defaultValue: 'en',
      },
      timezone: {
        type: Sequelize.STRING,
        defaultValue: 'UTC',
      },
      preferences: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      securitySettings: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      transactionPin: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      transactionLimits: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      creditScore: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      referralCode: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      referredBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      lastLoginAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastActiveAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deviceInfo: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes for Users table
    await queryInterface.addIndex('users', ['walletAddress']);
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['phoneNumber']);
    await queryInterface.addIndex('users', ['kycStatus']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['referralCode']);
    await queryInterface.addIndex('users', ['createdAt']);
    await queryInterface.addIndex('users', ['isActive', 'isSuspended']);

    // Create SavingsGroups table
    await queryInterface.createTable('savings_groups', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      contractAddress: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      contributionAmount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
      },
      currency: {
        type: Sequelize.ENUM('CUSD', 'CELO'),
        defaultValue: 'CUSD',
      },
      maxMembers: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      currentMembers: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      frequency: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly'),
        allowNull: false,
      },
      nextContributionDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      lastPayoutDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      currentRound: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      totalRounds: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('forming', 'active', 'completed', 'cancelled', 'paused'),
        defaultValue: 'forming',
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      requiresApproval: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      emergencyFundEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      emergencyFundBalance: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      emergencyFundRate: {
        type: Sequelize.DECIMAL(5, 4),
        defaultValue: 0.1,
      },
      totalContributions: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      totalPayouts: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      interestRate: {
        type: Sequelize.DECIMAL(5, 4),
        defaultValue: 0,
      },
      penaltyRate: {
        type: Sequelize.DECIMAL(5, 4),
        defaultValue: 0.05,
      },
      gracePeriod: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
      },
      rules: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes for SavingsGroups table
    await queryInterface.addIndex('savings_groups', ['contractAddress']);
    await queryInterface.addIndex('savings_groups', ['createdBy']);
    await queryInterface.addIndex('savings_groups', ['status']);
    await queryInterface.addIndex('savings_groups', ['isPublic']);
    await queryInterface.addIndex('savings_groups', ['frequency']);
    await queryInterface.addIndex('savings_groups', ['nextContributionDate']);

    // Create Loans table
    await queryInterface.createTable('loans', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      loanNumber: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      borrowerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      lenderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      contractAddress: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
      },
      currency: {
        type: Sequelize.ENUM('CUSD', 'CELO'),
        defaultValue: 'CUSD',
      },
      interestRate: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      purpose: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      loanType: {
        type: Sequelize.ENUM('personal', 'business', 'emergency', 'agricultural', 'education', 'savings_group'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('applied', 'under_review', 'approved', 'rejected', 'disbursed', 'active', 'completed', 'defaulted', 'cancelled'),
        defaultValue: 'applied',
      },
      creditScore: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      riskLevel: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'very_high'),
        allowNull: true,
      },
      collateralType: {
        type: Sequelize.ENUM('crypto', 'mobile_money', 'asset', 'guarantee', 'none'),
        defaultValue: 'none',
      },
      collateralValue: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      collateralDetails: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      guarantorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      guarantorApproved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      savingsGroupId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'savings_groups',
          key: 'id',
        },
      },
      totalInterest: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
      },
      amountPaid: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      remainingAmount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
      },
      paymentSchedule: {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      repaymentFrequency: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'lump_sum'),
        defaultValue: 'monthly',
      },
      nextPaymentDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      nextPaymentAmount: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      overdueAmount: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      penaltyAmount: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      penaltyRate: {
        type: Sequelize.DECIMAL(5, 4),
        defaultValue: 0.05,
      },
      gracePeriod: {
        type: Sequelize.INTEGER,
        defaultValue: 7,
      },
      applicationDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      approvalDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      disbursementDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completionDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      defaultDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      approvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes for Loans table
    await queryInterface.addIndex('loans', ['loanNumber']);
    await queryInterface.addIndex('loans', ['borrowerId']);
    await queryInterface.addIndex('loans', ['lenderId']);
    await queryInterface.addIndex('loans', ['contractAddress']);
    await queryInterface.addIndex('loans', ['status']);
    await queryInterface.addIndex('loans', ['loanType']);
    await queryInterface.addIndex('loans', ['applicationDate']);
    await queryInterface.addIndex('loans', ['nextPaymentDate']);
    await queryInterface.addIndex('loans', ['savingsGroupId']);
    await queryInterface.addIndex('loans', ['guarantorId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('loans');
    await queryInterface.dropTable('savings_groups');
    await queryInterface.dropTable('users');
  },
};
