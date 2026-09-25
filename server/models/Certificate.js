const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Certificate = sequelize.define('Certificate', {
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
  certificateCode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  organizationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  volunteerName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  eventTitle: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  organizationName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  hours: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  issueDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  badgeAwarded: {
    type: DataTypes.STRING(255),
    defaultValue: 'Community Service Certificate',
  },
  pdfUrl: {
    type: DataTypes.JSON,
    defaultValue: { url: '', public_id: '' },
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'certificates',
  timestamps: true,
});

module.exports = Certificate;
