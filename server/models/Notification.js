const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
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
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    defaultValue: '',
  },
  message: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  entityId: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  entityType: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  link: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
});

module.exports = Notification;
