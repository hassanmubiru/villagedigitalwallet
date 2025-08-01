const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Loan = sequelize.define('Loan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    loanNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    borrowerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    lenderId: {
      type: DataTypes.INTEGER,
      allowNull: true, // System loans might not have a specific lender
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    contractAddress: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true, // Set when deployed to blockchain
    },
    amount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    currency: {
      type: DataTypes.ENUM('CUSD', 'CELO'),
      defaultValue: 'CUSD',
    },
    interestRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false, // Annual interest rate (e.g., 0.15 = 15%)
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false, // Duration in days
    },
    purpose: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    loanType: {
      type: DataTypes.ENUM('personal', 'business', 'emergency', 'agricultural', 'education', 'savings_group'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'applied',
        'under_review',
        'approved',
        'rejected',
        'disbursed',
        'active',
        'completed',
        'defaulted',
        'cancelled'
      ),
      defaultValue: 'applied',
    },
    creditScore: {
      type: DataTypes.INTEGER,
      allowNull: true, // Credit score at time of application
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'very_high'),
      allowNull: true,
    },
    collateralType: {
      type: DataTypes.ENUM('crypto', 'mobile_money', 'asset', 'guarantee', 'none'),
      defaultValue: 'none',
    },
    collateralValue: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    collateralDetails: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    guarantorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    guarantorApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    savingsGroupId: {
      type: DataTypes.INTEGER,
      allowNull: true, // For emergency loans from savings groups
      references: {
        model: 'SavingsGroups',
        key: 'id',
      },
    },
    totalInterest: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false, // Principal + Interest
    },
    amountPaid: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    remainingAmount: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
    },
    paymentSchedule: {
      type: DataTypes.JSONB,
      defaultValue: [], // Array of payment due dates and amounts
    },
    repaymentFrequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'lump_sum'),
      defaultValue: 'monthly',
    },
    nextPaymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextPaymentAmount: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    overdueAmount: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    penaltyAmount: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    penaltyRate: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 0.05, // 5% penalty rate for overdue payments
    },
    gracePeriod: {
      type: DataTypes.INTEGER,
      defaultValue: 7, // Days of grace period
    },
    applicationDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    disbursementDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completionDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    defaultDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'loans',
    timestamps: true,
    indexes: [
      { fields: ['loanNumber'] },
      { fields: ['borrowerId'] },
      { fields: ['lenderId'] },
      { fields: ['contractAddress'] },
      { fields: ['status'] },
      { fields: ['loanType'] },
      { fields: ['applicationDate'] },
      { fields: ['nextPaymentDate'] },
      { fields: ['savingsGroupId'] },
      { fields: ['guarantorId'] },
      { fields: ['riskLevel'] },
      { fields: ['creditScore'] },
      { fields: ['borrowerId', 'status'] },
    ],
    hooks: {
      beforeCreate: (loan) => {
        // Generate loan number
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        loan.loanNumber = `LN${timestamp}${random}`;

        // Calculate total amounts
        const principal = parseFloat(loan.amount);
        const annualRate = parseFloat(loan.interestRate);
        const days = loan.duration;
        
        // Simple interest calculation
        loan.totalInterest = principal * annualRate * (days / 365);
        loan.totalAmount = principal + loan.totalInterest;
        loan.remainingAmount = loan.totalAmount;
      },
    },
  });

  // Instance methods
  Loan.prototype.calculateInstallment = function() {
    const totalAmount = parseFloat(this.totalAmount);
    const frequency = this.repaymentFrequency;
    
    let installments;
    switch (frequency) {
      case 'daily':
        installments = this.duration;
        break;
      case 'weekly':
        installments = Math.ceil(this.duration / 7);
        break;
      case 'monthly':
        installments = Math.ceil(this.duration / 30);
        break;
      case 'lump_sum':
        installments = 1;
        break;
      default:
        installments = 1;
    }
    
    return totalAmount / installments;
  };

  Loan.prototype.isOverdue = function() {
    if (!this.nextPaymentDate) return false;
    const now = new Date();
    const dueDate = new Date(this.nextPaymentDate);
    dueDate.setDate(dueDate.getDate() + this.gracePeriod);
    return now > dueDate && this.remainingAmount > 0;
  };

  Loan.prototype.calculatePenalty = function() {
    if (!this.isOverdue()) return 0;
    
    const overdueDays = Math.floor((new Date() - new Date(this.nextPaymentDate)) / (1000 * 60 * 60 * 24));
    const penaltyRate = parseFloat(this.penaltyRate);
    const overdueAmount = parseFloat(this.overdueAmount) || parseFloat(this.nextPaymentAmount);
    
    return overdueAmount * penaltyRate * (overdueDays / 365);
  };

  Loan.prototype.canBeApproved = function() {
    return this.status === 'applied' || this.status === 'under_review';
  };

  Loan.prototype.canBeDisbursed = function() {
    return this.status === 'approved';
  };

  Loan.prototype.makePayment = function(amount) {
    const paymentAmount = parseFloat(amount);
    const remainingAmount = parseFloat(this.remainingAmount);
    
    if (paymentAmount > remainingAmount) {
      throw new Error('Payment amount exceeds remaining loan balance');
    }
    
    this.amountPaid = parseFloat(this.amountPaid) + paymentAmount;
    this.remainingAmount = remainingAmount - paymentAmount;
    
    if (this.remainingAmount <= 0) {
      this.status = 'completed';
      this.completionDate = new Date();
      this.nextPaymentDate = null;
      this.nextPaymentAmount = 0;
    } else {
      // Update next payment date and amount
      this.updateNextPayment();
    }
    
    return this.save();
  };

  Loan.prototype.updateNextPayment = function() {
    const installment = this.calculateInstallment();
    const remainingAmount = parseFloat(this.remainingAmount);
    
    this.nextPaymentAmount = Math.min(installment, remainingAmount);
    
    // Calculate next payment date based on frequency
    const current = this.nextPaymentDate ? new Date(this.nextPaymentDate) : new Date();
    switch (this.repaymentFrequency) {
      case 'daily':
        this.nextPaymentDate = new Date(current.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        this.nextPaymentDate = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        this.nextPaymentDate = new Date(current.getFullYear(), current.getMonth() + 1, current.getDate());
        break;
      case 'lump_sum':
        this.nextPaymentDate = new Date(this.disbursementDate);
        this.nextPaymentDate.setDate(this.nextPaymentDate.getDate() + this.duration);
        break;
    }
  };

  // Class methods
  Loan.findByLoanNumber = function(loanNumber) {
    return this.findOne({ where: { loanNumber } });
  };

  Loan.findBorrowerLoans = function(borrowerId, options = {}) {
    const { limit = 20, offset = 0, status } = options;
    const where = { borrowerId };
    if (status) where.status = status;

    return this.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: sequelize.models.User,
          as: 'borrower',
          attributes: ['id', 'firstName', 'lastName', 'creditScore'],
        },
      ],
    });
  };

  Loan.findOverdueLoans = function() {
    const now = new Date();
    return this.findAll({
      where: {
        status: ['active', 'disbursed'],
        nextPaymentDate: {
          [sequelize.Sequelize.Op.lt]: now,
        },
        remainingAmount: {
          [sequelize.Sequelize.Op.gt]: 0,
        },
      },
      include: [
        {
          model: sequelize.models.User,
          as: 'borrower',
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
        },
      ],
    });
  };

  return Loan;
};
