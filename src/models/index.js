const { sequelize } = require('../config/db'); // Import Sequelize instance
const User = require('./user.model');
const Equipment = require('./equipment.model');
const BorrowRequest = require('./borrowRequest.model');
const BorrowedItem = require('./borrowedItem.model');
const Reminder = require('./reminder.model');
const AuditLog = require('./auditLog.model');

// Define model relationships
User.hasMany(BorrowRequest, { foreignKey: 'UserID' });
BorrowRequest.belongsTo(User, { foreignKey: 'UserID' });

BorrowRequest.hasMany(BorrowedItem, { foreignKey: 'RequestID' });
BorrowedItem.belongsTo(BorrowRequest, { foreignKey: 'RequestID' });

Equipment.hasMany(BorrowedItem, { foreignKey: 'EquipmentID' });
BorrowedItem.belongsTo(Equipment, { foreignKey: 'EquipmentID' });

BorrowRequest.hasMany(Reminder, { foreignKey: 'RequestID' });
Reminder.belongsTo(BorrowRequest, { foreignKey: 'RequestID' });

User.hasMany(AuditLog, { foreignKey: 'UserID' });
AuditLog.belongsTo(User, { foreignKey: 'UserID' });

BorrowRequest.hasMany(AuditLog, { foreignKey: 'RequestID' });
AuditLog.belongsTo(BorrowRequest, { foreignKey: 'RequestID' });

// Export all models and Sequelize instance
module.exports = {
    sequelize, 
    User,
    Equipment,
    BorrowRequest,
    BorrowedItem,
    Reminder,
    AuditLog
};
