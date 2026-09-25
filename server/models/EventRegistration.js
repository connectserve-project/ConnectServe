const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const EventRegistration = sequelize.define('EventRegistration', {
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
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'attended', 'cancelled'),
    defaultValue: 'pending',
  },
  attended: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  hoursLogged: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  notes: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  statusUpdatedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  attendanceMarkedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  certificateIssued: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  reviewGiven: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'event_registrations',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['eventId', 'userId'],
    },
  ],
});

module.exports = EventRegistration;
