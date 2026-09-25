const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Post = sequelize.define('Post', {
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
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  media: {
    type: DataTypes.JSON,
    defaultValue: { url: '', public_id: '', mediaType: 'none' },
  },
  likes: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  sharesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  eventTagId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  location: {
    type: DataTypes.STRING(255),
    defaultValue: '',
  },
  isReported: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  reportsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'posts',
  timestamps: true,
  getterMethods: {
    likesCount() {
      return Array.isArray(this.likes) ? this.likes.length : 0;
    },
  },
});

module.exports = Post;
