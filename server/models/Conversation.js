const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Conversation = sequelize.define('Conversation', {
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
  participants: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  lastMessageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  lastMessageText: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  unreadCounts: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  // IDs of participants who blocked the other person in this conversation
  blockedBy: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  // { [userId]: ISO date } - when each participant deleted the chat (hidden for them only)
  deletedBy: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  tableName: 'conversations',
  timestamps: true,
});

module.exports = Conversation;
