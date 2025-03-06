const express = require('express');
const { connectDB } = require('./src/config/db');
const setupSwagger = require('./src/config/swagger'); // Import Swagger setup
const authRoutes = require('./src/routes/auth.routes'); // Import API routes

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Register API routes
app.use('/api/auth', authRoutes); // Ensure routes are registered

// Setup Swagger UI before starting the server
setupSwagger(app);

// Connect to Database and Start Server
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});


//fahlfsjafafd
// anfafjaf sa