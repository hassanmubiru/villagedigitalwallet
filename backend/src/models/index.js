const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

// Database configuration
const config = {
  development: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'villagedigitalwallet_dev',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  test: {
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'villagedigitalwallet_test',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000,
    },
  },
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const db = {};

// Import all models dynamically
const basename = path.basename(__filename);
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Define associations here since we need all models to be loaded
const { User, Transaction, SavingsGroup, Loan } = db;

// User associations
User.hasMany(Transaction, { foreignKey: 'fromUserId', as: 'sentTransactions' });
User.hasMany(Transaction, { foreignKey: 'toUserId', as: 'receivedTransactions' });
User.hasMany(Transaction, { foreignKey: 'agentId', as: 'agentTransactions' });
User.hasMany(SavingsGroup, { foreignKey: 'createdBy', as: 'createdSavingsGroups' });
User.hasMany(Loan, { foreignKey: 'borrowerId', as: 'borrowedLoans' });
User.hasMany(Loan, { foreignKey: 'lenderId', as: 'lentLoans' });
User.hasMany(Loan, { foreignKey: 'guarantorId', as: 'guaranteedLoans' });
User.hasMany(Loan, { foreignKey: 'approvedBy', as: 'approvedLoans' });
User.belongsTo(User, { foreignKey: 'referredBy', as: 'referrer' });
User.hasMany(User, { foreignKey: 'referredBy', as: 'referrals' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'fromUserId', as: 'fromUser' });
Transaction.belongsTo(User, { foreignKey: 'toUserId', as: 'toUser' });
Transaction.belongsTo(User, { foreignKey: 'agentId', as: 'agent' });
Transaction.belongsTo(SavingsGroup, { foreignKey: 'savingsGroupId', as: 'savingsGroup' });
Transaction.belongsTo(Loan, { foreignKey: 'loanId', as: 'loan' });
Transaction.belongsTo(Transaction, { foreignKey: 'parentTransactionId', as: 'parentTransaction' });
Transaction.hasMany(Transaction, { foreignKey: 'parentTransactionId', as: 'childTransactions' });

// SavingsGroup associations
SavingsGroup.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
SavingsGroup.hasMany(Transaction, { foreignKey: 'savingsGroupId', as: 'transactions' });
SavingsGroup.hasMany(Loan, { foreignKey: 'savingsGroupId', as: 'emergencyLoans' });

// Loan associations
Loan.belongsTo(User, { foreignKey: 'borrowerId', as: 'borrower' });
Loan.belongsTo(User, { foreignKey: 'lenderId', as: 'lender' });
Loan.belongsTo(User, { foreignKey: 'guarantorId', as: 'guarantor' });
Loan.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
Loan.belongsTo(SavingsGroup, { foreignKey: 'savingsGroupId', as: 'savingsGroup' });
Loan.hasMany(Transaction, { foreignKey: 'loanId', as: 'transactions' });

// Additional models that would be imported
// These would be separate files in the models directory
const additionalModels = [
  'SavingsGroupMember',
  'Agent',
  'MobileMoneyAccount',
  'Notification',
  'Dispute',
  'KYCDocument',
  'EmergencyContact',
  'DeviceToken',
  'AuditLog',
  'SystemConfig',
  'FeeStructure',
  'ExchangeRate',
  'Referral',
  'SupportTicket',
  'Campaign',
  'Analytics',
];

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Helper functions
db.sync = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

db.authenticate = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

db.close = async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
    throw error;
  }
};

// Transaction helper
db.transaction = async (callback) => {
  const t = await sequelize.transaction();
  try {
    const result = await callback(t);
    await t.commit();
    return result;
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

module.exports = db;
