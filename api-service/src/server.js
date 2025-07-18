// api-service/src/server.js
require('dotenv').config(); 
const mongoose = require('mongoose');
const app = require('./app'); 
require('./model/User');
require('./model/Ticket');

const PORT = process.env.API_SERVICE_PORT || 3002; 
const MONGO_URI = process.env.MONGO_URI;

const startApplication = async () => {
  try {
    if (!MONGO_URI) {
      console.error('MONGO_URI is not defined in environment variables.');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log('API Service Connected to MongoDB');

    const server = app.listen(PORT, () => {
      console.log(`API Service running on port ${PORT}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed.');
          process.exit(0);
        });
      });
    });

  } catch (err) {
    console.error('API Service: Failed to connect to MongoDB or start server:', err);
    process.exit(1);
  }
};


if (process.env.NODE_ENV !== 'test') { 
  startApplication();
}

module.exports = app; // Export app for testing purposes