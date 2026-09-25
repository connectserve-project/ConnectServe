const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  mongoId: {
    type: DataTypes.STRING(36),
    unique: true,
    allowNull: true,
  },
  reporterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  targetType: {
    type: DataTypes.ENUM('post', 'comment', 'user', 'event'),
    allowNull: false,
  },
  targetId: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  reason: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  details: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  status: {
    type: DataTypes.ENUM('pending', 'resolved', 'dismissed'),
    defaultValue: 'pending',
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  resolvedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'reports',
  timestamps: true,
});

module.exports = Report;
