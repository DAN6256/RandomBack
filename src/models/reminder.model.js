const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const BorrowRequest = require('./borrowRequest.model');

const Reminder = sequelize.define('Reminder', {
  ReminderID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  RequestID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BorrowRequest,
      key: 'RequestID'
    }
  },
  ReminderDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: false
});

module.exports = Reminder;
