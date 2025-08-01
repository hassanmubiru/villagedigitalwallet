module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create Transactions table
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      txHash: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: true,
      },
      fromUserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      toUserId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      fromAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      toAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(20, 8),
        allowNull: false,
      },
      currency: {
        type: Sequelize.ENUM('CUSD', 'CELO', 'VWT'),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(
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
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
        defaultValue: 'pending',
      },
      method: {
        type: Sequelize.ENUM('blockchain', 'mobile_money', 'bank_transfer', 'agent', 'internal'),
        defaultValue: 'blockchain',
      },
      reference: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      externalReference: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      fee: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      feeBreakdown: {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      blockNumber: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      gasUsed: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      gasPrice: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      agentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      savingsGroupId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'savings_groups',
          key: 'id',
        },
      },
      loanId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'loans',
          key: 'id',
        },
      },
      parentTransactionId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'transactions',
          key: 'id',
        },
      },
      batchId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      isDisputed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      disputeId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      isFlagged: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      flagReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      processingStartedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      failedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      retryCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      maxRetries: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
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

    // Add indexes for Transactions table
    await queryInterface.addIndex('transactions', ['txHash']);
    await queryInterface.addIndex('transactions', ['reference']);
    await queryInterface.addIndex('transactions', ['fromUserId']);
    await queryInterface.addIndex('transactions', ['toUserId']);
    await queryInterface.addIndex('transactions', ['type']);
    await queryInterface.addIndex('transactions', ['status']);
    await queryInterface.addIndex('transactions', ['currency']);
    await queryInterface.addIndex('transactions', ['createdAt']);
    await queryInterface.addIndex('transactions', ['agentId']);
    await queryInterface.addIndex('transactions', ['savingsGroupId']);
    await queryInterface.addIndex('transactions', ['loanId']);
    await queryInterface.addIndex('transactions', ['batchId']);
    await queryInterface.addIndex('transactions', ['isDisputed']);
    await queryInterface.addIndex('transactions', ['isFlagged']);
    await queryInterface.addIndex('transactions', ['method']);
    await queryInterface.addIndex('transactions', ['fromUserId', 'createdAt']);
    await queryInterface.addIndex('transactions', ['toUserId', 'createdAt']);
    await queryInterface.addIndex('transactions', ['type', 'status']);

    // Create SavingsGroupMembers table
    await queryInterface.createTable('savings_group_members', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      savingsGroupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'savings_groups',
          key: 'id',
        },
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      status: {
        type: Sequelize.ENUM('pending', 'active', 'suspended', 'left'),
        defaultValue: 'pending',
      },
      joinedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      leftAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      payoutRound: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      totalContributions: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      missedContributions: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      payoutReceived: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      payoutDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      votingPower: {
        type: Sequelize.DECIMAL(5, 4),
        defaultValue: 1,
      },
      notes: {
        type: Sequelize.TEXT,
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

    // Add unique constraint and indexes for SavingsGroupMembers table
    await queryInterface.addConstraint('savings_group_members', {
      fields: ['savingsGroupId', 'userId'],
      type: 'unique',
      name: 'unique_savings_group_user',
    });
    await queryInterface.addIndex('savings_group_members', ['savingsGroupId']);
    await queryInterface.addIndex('savings_group_members', ['userId']);
    await queryInterface.addIndex('savings_group_members', ['status']);
    await queryInterface.addIndex('savings_group_members', ['payoutRound']);
    await queryInterface.addIndex('savings_group_members', ['joinedAt']);

    // Create Agents table
    await queryInterface.createTable('agents', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      agentCode: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      businessName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      businessType: {
        type: Sequelize.ENUM('shop', 'kiosk', 'mobile_money', 'pharmacy', 'general_store', 'other'),
        allowNull: false,
      },
      businessLicense: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      coordinates: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      address: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      servicesOffered: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: ['cash_in', 'cash_out'],
      },
      operatingHours: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'active', 'suspended', 'rejected', 'deactivated'),
        defaultValue: 'pending',
      },
      approvalDate: {
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
      isAvailable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      lastActiveAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      floatBalance: {
        type: Sequelize.JSONB,
        defaultValue: {
          CUSD: 0,
          CELO: 0,
        },
      },
      cashBalance: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      commissionRate: {
        type: Sequelize.JSONB,
        defaultValue: {
          cash_in: 0.02,
          cash_out: 0.02,
          transfer: 0.01,
        },
      },
      totalCommissions: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      unclaimedCommissions: {
        type: Sequelize.DECIMAL(20, 8),
        defaultValue: 0,
      },
      transactionVolume: {
        type: Sequelize.JSONB,
        defaultValue: {
          daily: 0,
          weekly: 0,
          monthly: 0,
          total: 0,
        },
      },
      limits: {
        type: Sequelize.JSONB,
        defaultValue: {
          dailyLimit: 10000,
          transactionLimit: 1000,
          floatLimit: 50000,
        },
      },
      bankAccount: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      identityDocument: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0,
      },
      totalRatings: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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

    // Add indexes for Agents table
    await queryInterface.addIndex('agents', ['userId']);
    await queryInterface.addIndex('agents', ['agentCode']);
    await queryInterface.addIndex('agents', ['status']);
    await queryInterface.addIndex('agents', ['isAvailable']);
    await queryInterface.addIndex('agents', ['location']);
    await queryInterface.addIndex('agents', ['businessType']);
    await queryInterface.addIndex('agents', ['coordinates'], { using: 'gin' });
    await queryInterface.addIndex('agents', ['rating']);
    await queryInterface.addIndex('agents', ['approvalDate']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('agents');
    await queryInterface.dropTable('savings_group_members');
    await queryInterface.dropTable('transactions');
  },
};
