const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user.model');

const BorrowRequest = sequelize.define('BorrowRequest', {
  RequestID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  UserID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'UserID'
    }
  },
  BorrowDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  Status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Returned', 'Overdue'),
    allowNull: false,
    defaultValue: 'Pending'
  },
  ReturnDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  CollectionDateTime: { 
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: false
});

module.exports = BorrowRequest;
