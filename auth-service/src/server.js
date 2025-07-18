require('dotenv').config(); // Ensure dotenv is loaded here too for the main app
const mongoose = require('mongoose');
const app = require('./app'); // Import the configured app instance

const PORT = process.env.AUTH_SERVICE_PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

// Function to start the server and connect to DB
const startApplication = async () => {
  try {
    if (!MONGO_URI) {
      console.error('MONGO_URI is not defined in environment variables.');
      process.exit(1); // Exit if DB URI is missing
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const server = app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`);
    });

    // You might want to export the server instance here too if needed for graceful shutdown
    // module.exports = server; // Optional, if you need to access server from outside this file
    
  } catch (err) {
    console.error('Failed to connect to MongoDB or start server:', err);
    process.exit(1); // Exit on critical error
  }
};

// Call the function to start the application
startApplication();