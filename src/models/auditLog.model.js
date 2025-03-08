const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user.model');

const AuditLog = sequelize.define('AuditLog', {
  LogID: {
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
  RequestID: {
    type: DataTypes.INTEGER,
    allowNull: true // Some logs might not be tied to a borrow request
  },
  Action: {
    type: DataTypes.ENUM('Create', 'Update', 'Delete', 'Borrow', 'Return', 'Notify', 'Approve'),
    allowNull: false
  },
  Details: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  Timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

module.exports = AuditLog;
