const express = require('express');
const { connectDB } = require('./src/config/db');
const setupSwagger = require('./src/config/swagger'); 
const models = require('./src/models'); // Import models to register relationships


// Import routes
const authRoutes = require('./src/routes/auth.routes');
//const userRoutes = require('./src/routes/user.routes');
//const borrowRequestRoutes = require('./src/routes/borrowRequest.routes');
//const equipmentRoutes = require('./src/routes/equipment.routes');

const app = express();
const port = 3000;

app.use(express.json());

// Register API routes
app.use('/api/auth', authRoutes);
//app.use('/api/users', userRoutes);
//app.use('/api/borrow-requests', borrowRequestRoutes);
//app.use('/api/equipment', equipmentRoutes);

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
