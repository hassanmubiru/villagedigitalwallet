const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    walletAddress: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEthereumAddress(value) {
          if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
            throw new Error('Invalid Ethereum address');
          }
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isMobilePhone: true,
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePicture: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    kycStatus: {
      type: DataTypes.ENUM('not_started', 'pending', 'approved', 'rejected', 'expired'),
      defaultValue: 'not_started',
    },
    kycData: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    verificationLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // 0: unverified, 1: basic, 2: enhanced, 3: premium
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isSuspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    suspensionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('user', 'agent', 'admin', 'super_admin'),
      defaultValue: 'user',
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en',
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC',
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        currency: 'CUSD',
        notifications: {
          email: true,
          sms: true,
          push: true,
          transactionAlerts: true,
          savingsReminders: true,
          loanAlerts: true,
        },
        privacy: {
          profileVisible: true,
          transactionHistoryVisible: false,
        },
      },
    },
    securitySettings: {
      type: DataTypes.JSONB,
      defaultValue: {
        twoFactorEnabled: false,
        biometricEnabled: false,
        transactionPinSet: false,
      },
    },
    transactionPin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionLimits: {
      type: DataTypes.JSONB,
      defaultValue: {
        dailyLimit: 1000,
        monthlyLimit: 10000,
        transferLimit: 500,
      },
    },
    creditScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    referralCode: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },
    referredBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastActiveAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deviceInfo: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['walletAddress'] },
      { fields: ['email'] },
      { fields: ['phoneNumber'] },
      { fields: ['kycStatus'] },
      { fields: ['role'] },
      { fields: ['referralCode'] },
      { fields: ['createdAt'] },
      { fields: ['isActive', 'isSuspended'] },
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.transactionPin) {
          user.transactionPin = await bcrypt.hash(user.transactionPin, 10);
        }
        // Generate referral code
        if (!user.referralCode) {
          user.referralCode = 'VDW' + Math.random().toString(36).substr(2, 9).toUpperCase();
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('transactionPin') && user.transactionPin) {
          user.transactionPin = await bcrypt.hash(user.transactionPin, 10);
        }
      },
    },
  });

  // Instance methods
  User.prototype.validateTransactionPin = async function(pin) {
    return bcrypt.compare(pin, this.transactionPin);
  };

  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  User.prototype.canPerformTransaction = function(amount, type = 'transfer') {
    if (this.isSuspended || !this.isActive) return false;
    
    const limits = this.transactionLimits;
    switch (type) {
      case 'transfer':
        return amount <= limits.transferLimit;
      case 'daily':
        return amount <= limits.dailyLimit;
      case 'monthly':
        return amount <= limits.monthlyLimit;
      default:
        return true;
    }
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.transactionPin;
    return values;
  };

  // Class methods
  User.findByWalletAddress = function(address) {
    return this.findOne({ where: { walletAddress: address } });
  };

  User.findByPhoneNumber = function(phoneNumber) {
    return this.findOne({ where: { phoneNumber } });
  };

  User.findByEmail = function(email) {
    return this.findOne({ where: { email } });
  };

  return User;
};
