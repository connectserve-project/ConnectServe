const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const User = sequelize.define('User', {
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
  name: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'organization', 'admin'),
    defaultValue: 'user',
  },
  avatar: {
    type: DataTypes.JSON,
    defaultValue: { url: '', public_id: '' },
  },
  banner: {
    type: DataTypes.JSON,
    defaultValue: {
      url: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=1200&auto=format&fit=crop&q=80',
      public_id: '',
    },
  },
  bio: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  gender: {
    type: DataTypes.STRING(20),
    defaultValue: '',
  },
  institution: {
    type: DataTypes.STRING(255),
    defaultValue: '',
  },
  countryCode: {
    type: DataTypes.STRING(10),
    defaultValue: '+91',
  },
  mobileNumber: {
    type: DataTypes.STRING(20),
    defaultValue: '',
  },
  location: {
    type: DataTypes.STRING(255),
    defaultValue: '',
  },
  state: {
    type: DataTypes.STRING(255),
    defaultValue: '',
  },
  country: {
    type: DataTypes.STRING(255),
    defaultValue: '',
  },
  pincode: {
    type: DataTypes.STRING(20),
    defaultValue: '',
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  interests: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  socialLinks: {
    type: DataTypes.JSON,
    defaultValue: {
      website: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      github: '',
    },
  },
  orgDetails: {
    type: DataTypes.JSON,
    defaultValue: {
      mission: '',
      registrationNumber: '',
      isVerified: false,
      contactPerson: '',
      foundedYear: null,
      category: 'General Community',
      verificationDocument: { url: '', public_id: '', format: '', uploadedAt: null },
    },
  },
  volunteerHours: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  badges: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  followers: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  following: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  banReason: {
    type: DataTypes.STRING(500),
    defaultValue: '',
  },
  resetPasswordToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  qrToken: {
    type: DataTypes.STRING(64),
    unique: true,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (!user.qrToken) {
        user.qrToken = crypto.randomUUID();
      }
      if (user.password && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && !user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

User.prototype.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
