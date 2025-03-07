const express = require('express');
const { connectDB } = require('./src/config/db');
const setupSwagger = require('./src/config/swagger'); 
const models = require('./src/models'); // Import models to register relationships


// Import routes
const equipmentRoutes = require('./src/routes/equipment.routes');
const authRoutes = require('./src/routes/auth.routes');
const borrowRoutes = require('./src/routes/borrow.routes');

const app = express();
const port = 3000;

app.use(express.json());

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/borrow', borrowRoutes);


// Setup Swagger UI
setupSwagger(app);

// Connect to Database and Start Server
connectDB()
    .then(() => models.sequelize.sync({ alter: true })) // Sync tables
    .then(() => {
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('Error connecting to the database:', err);
    });
