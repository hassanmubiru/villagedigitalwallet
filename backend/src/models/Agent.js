const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Agent = sequelize.define('Agent', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    agentCode: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    businessName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessType: {
      type: DataTypes.ENUM('shop', 'kiosk', 'mobile_money', 'pharmacy', 'general_store', 'other'),
      allowNull: false,
    },
    businessLicense: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coordinates: {
      type: DataTypes.JSONB,
      allowNull: false,
      validate: {
        hasLatLng(value) {
          if (!value.latitude || !value.longitude) {
            throw new Error('Coordinates must include latitude and longitude');
          }
        },
      },
    },
    address: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    servicesOffered: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['cash_in', 'cash_out'],
    },
    operatingHours: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'active', 'suspended', 'rejected', 'deactivated'),
      defaultValue: 'pending',
    },
    approvalDate: {
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
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastActiveAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    floatBalance: {
      type: DataTypes.JSONB,
      defaultValue: {
        CUSD: 0,
        CELO: 0,
      },
    },
    cashBalance: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    commissionRate: {
      type: DataTypes.JSONB,
      defaultValue: {
        cash_in: 0.02, // 2%
        cash_out: 0.02, // 2%
        transfer: 0.01, // 1%
      },
    },
    totalCommissions: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    unclaimedCommissions: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 0,
    },
    transactionVolume: {
      type: DataTypes.JSONB,
      defaultValue: {
        daily: 0,
        weekly: 0,
        monthly: 0,
        total: 0,
      },
    },
    limits: {
      type: DataTypes.JSONB,
      defaultValue: {
        dailyLimit: 10000,
        transactionLimit: 1000,
        floatLimit: 50000,
      },
    },
    bankAccount: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    identityDocument: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    totalRatings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
  }, {
    tableName: 'agents',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['agentCode'] },
      { fields: ['status'] },
      { fields: ['isAvailable'] },
      { fields: ['location'] },
      { fields: ['businessType'] },
      { fields: ['coordinates'], type: 'GIN' },
      { fields: ['rating'] },
      { fields: ['approvalDate'] },
    ],
    hooks: {
      beforeCreate: (agent) => {
        // Generate agent code
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        agent.agentCode = `AG${timestamp}${random}`;
      },
    },
  });

  // Instance methods
  Agent.prototype.canProcessTransaction = function(amount, type) {
    if (!this.isAvailable || this.status !== 'active') return false;
    
    const limits = this.limits;
    if (amount > limits.transactionLimit) return false;
    
    // Check if agent has sufficient float for cash out
    if (type === 'cash_out') {
      const floatBalance = this.floatBalance.CUSD || 0;
      return floatBalance >= amount;
    }
    
    return true;
  };

  Agent.prototype.updateRating = function(newRating) {
    const currentTotal = parseFloat(this.rating) * this.totalRatings;
    this.totalRatings += 1;
    this.rating = (currentTotal + newRating) / this.totalRatings;
    return this.save();
  };

  Agent.prototype.calculateDistance = function(lat, lng) {
    const agentLat = this.coordinates.latitude;
    const agentLng = this.coordinates.longitude;
    
    const R = 6371; // Earth's radius in km
    const dLat = (lat - agentLat) * Math.PI / 180;
    const dLng = (lng - agentLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(agentLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // Distance in km
  };

  // Class methods
  Agent.findNearby = function(lat, lng, radius = 10, options = {}) {
    const { limit = 10, servicesOffered } = options;
    
    return this.findAll({
      where: {
        status: 'active',
        isAvailable: true,
        ...(servicesOffered && {
          servicesOffered: {
            [sequelize.Sequelize.Op.overlap]: servicesOffered,
          },
        }),
      },
      limit,
      include: [
        {
          model: sequelize.models.User,
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber'],
        },
      ],
    }).then(agents => {
      return agents
        .map(agent => ({
          ...agent.toJSON(),
          distance: agent.calculateDistance(lat, lng),
        }))
        .filter(agent => agent.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    });
  };

  Agent.findByAgentCode = function(agentCode) {
    return this.findOne({
      where: { agentCode },
      include: [
        {
          model: sequelize.models.User,
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'email'],
        },
      ],
    });
  };

  return Agent;
};
