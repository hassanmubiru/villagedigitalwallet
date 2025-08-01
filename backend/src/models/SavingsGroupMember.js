const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SavingsGroupMember = sequelize.define('SavingsGroupMember', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    savingsGroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'SavingsGroups',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'suspended', 'left'),
      defaultValue: 'pending',
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    leftAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    payoutRound: {
      type: DataTypes.INTEGER,
      allowNull: true, // Which round this member receives payout
    },
    totalContributions: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    missedContributions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    payoutReceived: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    payoutDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    votingPower: {
      type: DataTypes.DECIMAL(5, 4),
      defaultValue: 1, // 1 = full voting power
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'savings_group_members',
    timestamps: true,
    indexes: [
      { fields: ['savingsGroupId', 'userId'], unique: true },
      { fields: ['savingsGroupId'] },
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['payoutRound'] },
      { fields: ['joinedAt'] },
    ],
  });

  return SavingsGroupMember;
};
