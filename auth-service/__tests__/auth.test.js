const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app'); 
const User = require('../src/models/User');

describe('Auth Service', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test_auth_db');
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Close the test database connection
    await mongoose.connection.close();
    // Supertest handles closing its internal server.
    // No manual server.close() is needed here when using request(app).
  });

  // ... (existing test cases) ...

  describe('Tenant Isolation', () => {
    it('should isolate users by tenant', async () => {
      // Create users for two different tenants
      const user1 = new User({
        email: 'user1@tenant1.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'One',
        role: 'Admin',
        customerId: 'Tenant1'
      });

      const user2 = new User({
        email: 'user2@tenant2.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Two',
        role: 'Admin',
        customerId: 'Tenant2'
      });

      await user1.save();
      await user2.save();

     
      const loginResponse1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user1@tenant1.com',
          password: 'password123'
        })
        .expect(200);

      const token1 = loginResponse1.body.token;
    //   console.log("token 1 -->", token1); // Should now show a token

      const usersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      expect(usersResponse.body.users).toHaveLength(1);
      expect(usersResponse.body.users[0].customerId).toBe('Tenant1');

      const loginResponse2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user2@tenant2.com',
          password: 'password123'
        })
        .expect(200);

      const token2 = loginResponse2.body.token;
      const usersResponse2 = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);

      expect(usersResponse2.body.users).toHaveLength(1);
      expect(usersResponse2.body.users[0].customerId).toBe('Tenant2');
    });
  });
});