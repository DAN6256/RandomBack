const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Equipment = sequelize.define('Equipment', {
    EquipmentID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    Description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    SerialNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false
    }
}, {
    timestamps: false
});

module.exports = Equipment;
