const express = require('express');
require('dotenv').config();
const cors = require('cors'); // <-- import cors
const { connectDB } = require('./src/config/db');
const setupSwagger = require('./src/config/swagger');
const models = require('./src/models'); // register relationships

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const equipmentRoutes = require('./src/routes/equipment.routes');
const borrowRoutes = require('./src/routes/borrow.routes');

const app = express();
const port = process.env.PORT || 3000;
app.use(cors({
  origin: 'https://fab-track-wtcn.vercel.app/'
}));
/*
app.use(cors(

));*/
app.use(express.json());

// Register API routes
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/borrow', borrowRoutes);

// Setup Swagger UI
setupSwagger(app);

// Connect to DB and Start Server
if (process.env.NODE_ENV !== 'test'){
connectDB()
  .then(() => models.sequelize.sync({ alter: true })) // Creates/updates tables
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });
}
// Export app for testing
module.exports = app;
