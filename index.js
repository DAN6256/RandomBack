const express = require('express');
const { connectDB } = require('./src/config/db');
const setupSwagger = require('./src/config/swagger'); 
const authRoutes = require('./src/routes/auth.routes'); 
//const userRoutes = require('./src/routes/user.routes');
//const borrowRequestRoutes = require('./src/routes/borrowRequest.routes');
//const equipmentRoutes = require('./src/routes/equipment.routes');

const app = express();
const port = 3000;

app.use(express.json());

// Register API routes
app.use('/api/auth', authRoutes); 
//app.use('/api/users',userRoutes);
//app.use('/api/borrowRequest',borrowRequestRoutes);
//app.use('/api/equipments',equipmentRoutes);

// Setup Swagger UI 
setupSwagger(app);

// Connect to Database and Start Server
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});
