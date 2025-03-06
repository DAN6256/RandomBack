const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const BorrowRequest = require('./borrowRequest.model');
const Equipment = require('./equipment.model');

const BorrowedItem = sequelize.define('BorrowedItem', {
    BorrowedItemID: {
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
    EquipmentID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Equipment,
            key: 'EquipmentID'
        }
    },
    Quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = BorrowedItem;
