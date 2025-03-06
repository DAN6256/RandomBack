// src/config/db.js

const { Sequelize } = require('sequelize');
require('dotenv').config(); // Load environment variables

// Initialize Sequelize instance
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306, // Default MySQL port
    logging: false, // Disable logging for cleaner output
    pool: {
        max: 5, // Max number of connections
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true, // Enable createdAt and updatedAt timestamps
    }
});

// Function to authenticate and sync the database
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1); // Exit process with failure
    }
};

// Export sequelize instance and connectDB function
module.exports = { sequelize, connectDB };
