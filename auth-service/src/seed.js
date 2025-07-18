require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing users
    await User.deleteMany({});
    
    // Create test users for two tenants
    const users = [
      // Tenant 1 (LogisticsCo)
      {
        email: 'admin@logisticsco.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Admin',
        role: 'Admin',
        customerId: 'LogisticsCo'
      },
      {
        email: 'user@logisticsco.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'User',
        role: 'User',
        customerId: 'LogisticsCo'
      },
      // Tenant 2 (RetailGmbH)
      {
        email: 'admin@retailgmbh.com',
        password: 'password123',
        firstName: 'Bob',
        lastName: 'Manager',
        role: 'Admin',
        customerId: 'RetailGmbH'
      },
      {
        email: 'user@retailgmbh.com',
        password: 'password123',
        firstName: 'Alice',
        lastName: 'Employee',
        role: 'User',
        customerId: 'RetailGmbH'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.email} (${user.role}) - ${user.customerId}`);
    }

    console.log('Seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();