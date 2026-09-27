const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Event = sequelize.define('Event', {
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
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING(50),
    defaultValue: 'Community Development',
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  time: {
    type: DataTypes.STRING(50),
    defaultValue: '09:00 AM - 01:00 PM',
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  locationType: {
    type: DataTypes.ENUM('in-person', 'virtual', 'hybrid'),
    defaultValue: 'in-person',
  },
  volunteerSlots: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
  },
  registeredCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  hoursGranted: {
    type: DataTypes.FLOAT,
    defaultValue: 4,
  },
  banner: {
    type: DataTypes.JSON,
    defaultValue: {
      url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&auto=format&fit=crop&q=80',
      public_id: '',
    },
  },
  requirements: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  skillsNeeded: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
    defaultValue: 'upcoming',
  },
  averageRating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'events',
  timestamps: true,
  getterMethods: {
    slotsRemaining() {
      return Math.max(0, this.volunteerSlots - this.registeredCount);
    },
  },
});

module.exports = Event;
