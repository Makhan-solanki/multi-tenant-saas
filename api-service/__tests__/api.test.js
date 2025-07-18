// api-service/__tests__/api.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Ticket = require('../src/model/Ticket');
const AuditLog = require('../src/model/AuditLog'); 
const axios = require('axios'); 

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  customerId: String,
  firstName: String,
  lastName: String,
  isActive: Boolean,
});
const User = mongoose.model('User', UserSchema);


// Mock the axios post method used in api-service/src/middleware/auth.js
jest.mock('axios');

// Define test users and their tokens
let adminLogisticsCoToken, userLogisticsCoToken, adminRetailGmbHToken;
let adminLogisticsCoUser, userLogisticsCoUser, adminRetailGmbHUser;

describe('API Service', () => {

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/api_service_test_db';
    await mongoose.connect(mongoUri);
    console.log('Connected to API Service Test MongoDB');
  });

  beforeEach(async () => {
    await Ticket.deleteMany({});
    await AuditLog.deleteMany({});
    await User.deleteMany({}); // Clear test users

    adminLogisticsCoUser = await User.create({
      email: 'admin@logisticsco.com',
      password: 'hashedpassword', // Password doesn't matter for mock
      firstName: 'Admin',
      lastName: 'Logistics',
      role: 'Admin',
      customerId: 'LogisticsCo',
      isActive: true
    });

    userLogisticsCoUser = await User.create({
      email: 'user@logisticsco.com',
      password: 'hashedpassword',
      firstName: 'User',
      lastName: 'Logistics',
      role: 'User',
      customerId: 'LogisticsCo',
      isActive: true
    });

    adminRetailGmbHUser = await User.create({
      email: 'admin@retailgmbh.com',
      password: 'hashedpassword',
      firstName: 'Admin',
      lastName: 'Retail',
      role: 'Admin',
      customerId: 'RetailGmbH',
      isActive: true
    });

    // Generate mock tokens (these don't need to be real JWTs, just identifiers for the mock)
    adminLogisticsCoToken = 'mock-admin-logisticsco-token';
    userLogisticsCoToken = 'mock-user-logisticsco-token';
    adminRetailGmbHToken = 'mock-admin-retailgmbh-token';

    // Mock axios.post for the auth middleware verification
    axios.post.mockImplementation((url, data) => {
      if (url.includes('/api/auth/verify')) {
        if (data.token === adminLogisticsCoToken) {
          return Promise.resolve({
            data: {
              valid: true,
              user: {
                userId: adminLogisticsCoUser._id.toString(),
                customerId: adminLogisticsCoUser.customerId,
                role: adminLogisticsCoUser.role,
                email: adminLogisticsCoUser.email
              }
            }
          });
        } else if (data.token === userLogisticsCoToken) {
          return Promise.resolve({
            data: {
              valid: true,
              user: {
                userId: userLogisticsCoUser._id.toString(),
                customerId: userLogisticsCoUser.customerId,
                role: userLogisticsCoUser.role,
                email: userLogisticsCoUser.email
              }
            }
          });
        } else if (data.token === adminRetailGmbHToken) {
          return Promise.resolve({
            data: {
              valid: true,
              user: {
                userId: adminRetailGmbHUser._id.toString(),
                customerId: adminRetailGmbHUser.customerId,
                role: adminRetailGmbHUser.role,
                email: adminRetailGmbHUser.email
              }
            }
          });
        } else {
          return Promise.resolve({ data: { valid: false, error: 'Invalid token' } });
        }
      }
      return Promise.reject(new Error('Unknown axios call'));
    });
  });

  // After all tests, disconnect from the database
  afterAll(async () => {
    await mongoose.connection.close();
    console.log('Disconnected from API Service Test MongoDB');
  });

  // --- Health Check Endpoint ---
  describe('GET /health', () => {
    it('should return OK status', async () => {
      const response = await request(app).get('/health');
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('api-service');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  // --- Tickets Endpoints ---
  describe('Tickets API', () => {
    // POST /api/tickets
    describe('POST /api/tickets', () => {
      it('should create a new ticket for the authenticated user and tenant', async () => {
        const ticketData = {
          title: 'Issue with login',
          description: 'Cannot log in to the system since yesterday.',
          priority: 'high',
          tags: ['login', 'critical']
        };

        const response = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${userLogisticsCoToken}`)
          .send(ticketData)
          .expect(201);

        expect(response.body.message).toBe('Ticket created successfully');
        expect(response.body.ticket).toBeDefined();
        expect(response.body.ticket.title).toBe(ticketData.title);
        expect(response.body.ticket.customerId).toBe(userLogisticsCoUser.customerId);
        // Corrected assertion: Access _id from the populated user object
        expect(response.body.ticket.userId._id.toString()).toBe(userLogisticsCoUser._id.toString());

        // Verify audit log was created
        const auditLog = await AuditLog.findOne({ resourceId: response.body.ticket._id });
        expect(auditLog).toBeDefined();
        expect(auditLog.action).toBe('created');
        expect(auditLog.resourceType).toBe('ticket');
        expect(auditLog.customerId).toBe(userLogisticsCoUser.customerId);
      });

      it('should return 400 for invalid ticket data', async () => {
        const response = await request(app)
          .post('/api/tickets')
          .set('Authorization', `Bearer ${userLogisticsCoToken}`)
          .send({ title: '' }) // Missing description, invalid title
          .expect(400);

        expect(response.body.error).toBeDefined();
      });

      it('should return 401 if no token is provided', async () => {
        const response = await request(app)
          .post('/api/tickets')
          .send({ title: 'Test', description: 'Test' })
          .expect(401);

        expect(response.body.error).toBe('Access denied. No token provided.');
      });
    });

    // GET /api/tickets
    describe('GET /api/tickets', () => {
      beforeEach(async () => {
        // Create tickets for LogisticsCo (Tenant1) and RetailGmbH (Tenant2)
        await Ticket.create({
          title: 'LC Ticket 1', description: 'Desc', customerId: 'LogisticsCo', userId: userLogisticsCoUser._id, status: 'open'
        });
        await Ticket.create({
          title: 'LC Ticket 2', description: 'Desc', customerId: 'LogisticsCo', userId: userLogisticsCoUser._id, status: 'in-progress'
        });
        await Ticket.create({
          title: 'RG Ticket 1', description: 'Desc', customerId: 'RetailGmbH', userId: adminRetailGmbHUser._id, status: 'open'
        });
        await Ticket.create({
          title: 'LC Admin Ticket', description: 'Desc', customerId: 'LogisticsCo', userId: adminLogisticsCoUser._id, status: 'closed'
        });
      });

      it('should return all tickets for an admin within their tenant', async () => {
        const response = await request(app)
          .get('/api/tickets')
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(200);

        expect(response.body.tickets).toHaveLength(3); // LC Ticket 1, LC Ticket 2, LC Admin Ticket
        expect(response.body.tickets.every(t => t.customerId === 'LogisticsCo')).toBe(true);
      });

      it('should return only user-specific tickets for a non-admin user within their tenant', async () => {
        const response = await request(app)
          .get('/api/tickets')
          .set('Authorization', `Bearer ${userLogisticsCoToken}`)
          .expect(200);

        expect(response.body.tickets).toHaveLength(2); // LC Ticket 1, LC Ticket 2
        // Corrected assertion: Access _id from the populated user object
        expect(response.body.tickets.every(t => t.customerId === 'LogisticsCo' && t.userId._id.toString() === userLogisticsCoUser._id.toString())).toBe(true);
      });

      it('should not return tickets from other tenants', async () => {
        const response = await request(app)
          .get('/api/tickets')
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(200);

        // Ensure no RetailGmbH tickets are present
        expect(response.body.tickets.some(t => t.customerId === 'RetailGmbH')).toBe(false);
      });

      it('should filter tickets by status', async () => {
        const response = await request(app)
          .get('/api/tickets?status=open')
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(200);

        expect(response.body.tickets).toHaveLength(1); // LC Ticket 1
        expect(response.body.tickets[0].status).toBe('open');
      });

      it('should paginate tickets', async () => {
        const response = await request(app)
          .get('/api/tickets?page=1&limit=1')
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(200);

        expect(response.body.tickets).toHaveLength(1);
        expect(response.body.pagination.total).toBe(3);
        expect(response.body.pagination.pages).toBe(3);
      });
    });

    // GET /api/tickets/:id
    describe('GET /api/tickets/:id', () => {
      let ticketLogisticsCo, ticketRetailGmbH;

      beforeEach(async () => {
        ticketLogisticsCo = await Ticket.create({
          title: 'Specific LC Ticket', description: 'Desc', customerId: 'LogisticsCo', userId: userLogisticsCoUser._id, status: 'open'
        });
        ticketRetailGmbH = await Ticket.create({
          title: 'Specific RG Ticket', description: 'Desc', customerId: 'RetailGmbH', userId: adminRetailGmbHUser._id, status: 'open'
        });
      });

      it('should return a specific ticket for an admin within their tenant', async () => {
        const response = await request(app)
          .get(`/api/tickets/${ticketLogisticsCo._id}`)
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(200);

        expect(response.body.ticket._id).toBe(ticketLogisticsCo._id.toString());
        expect(response.body.ticket.customerId).toBe('LogisticsCo');
      });

      it('should return a specific ticket for a non-admin user if they own it', async () => {
        const response = await request(app)
          .get(`/api/tickets/${ticketLogisticsCo._id}`)
          .set('Authorization', `Bearer ${userLogisticsCoToken}`)
          .expect(200);

        expect(response.body.ticket._id).toBe(ticketLogisticsCo._id.toString());
        // Corrected assertion: Access _id from the populated user object
        expect(response.body.ticket.userId._id.toString()).toBe(userLogisticsCoUser._id.toString());
      });

      it('should return 404 if ticket not found in tenant', async () => {
        const response = await request(app)
          .get(`/api/tickets/${ticketRetailGmbH._id}`) // Try to get RG ticket with LC token
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(404);

        expect(response.body.error).toBe('Ticket not found.');
      });

      it('should return 404 if non-admin user tries to access another user\'s ticket', async () => {
        const anotherUserTicket = await Ticket.create({
          title: 'Another User Ticket', description: 'Desc', customerId: 'LogisticsCo', userId: adminLogisticsCoUser._id, status: 'open'
        });

        const response = await request(app)
          .get(`/api/tickets/${anotherUserTicket._id}`)
          .set('Authorization', `Bearer ${userLogisticsCoToken}`) // User trying to access Admin's ticket
          .expect(404);

        expect(response.body.error).toBe('Ticket not found.');
      });
    });

    // PUT /api/tickets/:id
    describe('PUT /api/tickets/:id', () => {
      let ticketToUpdate;

      beforeEach(async () => {
        ticketToUpdate = await Ticket.create({
          title: 'Update Me', description: 'Old Desc', customerId: 'LogisticsCo', userId: userLogisticsCoUser._id, status: 'open', priority: 'low'
        });
      });

      it('should update a ticket for an admin and create an audit log', async () => {
        const updatedData = {
          title: 'Updated Title',
          description: 'New Description',
          status: 'resolved',
          priority: 'high',
          assignedTo: adminLogisticsCoUser._id.toString()
        };

        const response = await request(app)
          .put(`/api/tickets/${ticketToUpdate._id}`)
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .send(updatedData)
          .expect(200);

        expect(response.body.message).toBe('Ticket updated successfully');
        expect(response.body.ticket.title).toBe(updatedData.title);
        expect(response.body.ticket.status).toBe(updatedData.status);
        expect(response.body.ticket.resolvedAt).toBeDefined(); // Check resolvedAt is set

        // Verify audit log
        const auditLog = await AuditLog.findOne({ resourceId: ticketToUpdate._id, action: 'updated' });
        expect(auditLog).toBeDefined();
        expect(auditLog.details.newStatus).toBe('resolved');
      });

      it('should allow non-admin user to update their own ticket (limited fields)', async () => {
        const updatedData = {
          title: 'User Updated Title',
          description: 'User New Description'
        };

        const response = await request(app)
          .put(`/api/tickets/${ticketToUpdate._id}`)
          .set('Authorization', `Bearer ${userLogisticsCoToken}`)
          .send(updatedData)
          .expect(200);

        expect(response.body.ticket.title).toBe(updatedData.title);
        expect(response.body.ticket.description).toBe(updatedData.description);
        expect(response.body.ticket.status).toBe('open'); // Status should not change for non-admin
      });

      it('should not allow non-admin user to update status or assignedTo', async () => {
        const updatedData = {
          status: 'closed',
          assignedTo: adminLogisticsCoUser._id.toString()
        };

        const response = await request(app)
          .put(`/api/tickets/${ticketToUpdate._id}`)
          .set('Authorization', `Bearer ${userLogisticsCoToken}`)
          .send(updatedData)
          .expect(200); // Still 200 because other fields might be valid, but status/assignedTo ignored

        expect(response.body.ticket.status).toBe('open'); // Should remain original status
        expect(response.body.ticket.assignedTo).toBeNull(); // Should remain null or original assignedTo
      });

      it('should return 404 if ticket not found in tenant for update', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .put(`/api/tickets/${nonExistentId}`)
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .send({ title: 'New Title' })
          .expect(404);

        expect(response.body.error).toBe('Ticket not found.');
      });
    });

    // DELETE /api/tickets/:id
    describe('DELETE /api/tickets/:id', () => {
      let ticketToDelete;

      beforeEach(async () => {
        ticketToDelete = await Ticket.create({
          title: 'Delete Me', description: 'Desc', customerId: 'LogisticsCo', userId: userLogisticsCoUser._id, status: 'open'
        });
      });

      it('should delete a ticket for an admin and create an audit log', async () => {
        const response = await request(app)
          .delete(`/api/tickets/${ticketToDelete._id}`)
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(200);

        expect(response.body.message).toBe('Ticket deleted successfully');
        const deletedTicket = await Ticket.findById(ticketToDelete._id);
        expect(deletedTicket).toBeNull();

        // Verify audit log
        const auditLog = await AuditLog.findOne({ resourceId: ticketToDelete._id, action: 'deleted' });
        expect(auditLog).toBeDefined();
        expect(auditLog.resourceType).toBe('ticket');
      });

      it('should return 403 if non-admin user tries to delete a ticket', async () => {
        const response = await request(app)
          .delete(`/api/tickets/${ticketToDelete._id}`)
          .set('Authorization', `Bearer ${userLogisticsCoToken}`)
          .expect(403);

        expect(response.body.error).toBe('Insufficient permissions.');
      });

      it('should return 404 if ticket not found in tenant for deletion', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app)
          .delete(`/api/tickets/${nonExistentId}`)
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(404);

        expect(response.body.error).toBe('Ticket not found.');
      });
    });

    // POST /api/tickets/:id/comments
    describe('POST /api/tickets/:id/comments', () => {
      let ticketToComment;

      beforeEach(async () => {
        ticketToComment = await Ticket.create({
          title: 'Comment Me', description: 'Desc', customerId: 'LogisticsCo', userId: userLogisticsCoUser._id, status: 'open'
        });
      });

      it('should add a comment to a ticket for the ticket owner', async () => {
        const commentData = { content: 'This is a test comment.' };
        const response = await request(app)
          .post(`/api/tickets/${ticketToComment._id}/comments`)
          .set('Authorization', `Bearer ${userLogisticsCoToken}`)
          .send(commentData)
          .expect(201);

        expect(response.body.message).toBe('Comment added successfully');
        expect(response.body.comment.content).toBe(commentData.content);
        // Corrected assertion: Access _id from the populated user object
        expect(response.body.comment.userId._id.toString()).toBe(userLogisticsCoUser._id.toString());

        const updatedTicket = await Ticket.findById(ticketToComment._id);
        expect(updatedTicket.comments).toHaveLength(1);
        expect(updatedTicket.comments[0].content).toBe(commentData.content);

        // Verify audit log
        const auditLog = await AuditLog.findOne({ resourceId: ticketToComment._id, action: 'commented' });
        expect(auditLog).toBeDefined();
      });

      it('should add a comment to any ticket for an admin', async () => {
        const commentData = { content: 'Admin comment.' };
        const response = await request(app)
          .post(`/api/tickets/${ticketToComment._id}/comments`)
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .send(commentData)
          .expect(201);

        expect(response.body.message).toBe('Comment added successfully');
        expect(response.body.comment.content).toBe(commentData.content);
        // Corrected assertion: Access _id from the populated user object
        expect(response.body.comment.userId._id.toString()).toBe(adminLogisticsCoUser._id.toString());
      });

      it('should return 404 if non-owner/non-admin user tries to comment on a ticket', async () => {
        const ticketFromOtherTenant = await Ticket.create({
          title: 'Other Tenant Ticket', description: 'Desc', customerId: 'RetailGmbH', userId: adminRetailGmbHUser._id, status: 'open'
        });
        const commentData = { content: 'Unauthorized comment.' };

        const response = await request(app)
          .post(`/api/tickets/${ticketFromOtherTenant._id}/comments`)
          .set('Authorization', `Bearer ${userLogisticsCoToken}`) // User trying to comment on RetailGmbH ticket
          .send(commentData)
          .expect(404);

        expect(response.body.error).toBe('Ticket not found.');
      });
    });

    // POST /api/tickets/:id/assign
    describe('POST /api/tickets/:id/assign', () => {
      let ticketToAssign;

      beforeEach(async () => {
        ticketToAssign = await Ticket.create({
          title: 'Assign Me', description: 'Desc', customerId: 'LogisticsCo', userId: userLogisticsCoUser._id, status: 'open'
        });
      });

      it('should assign a ticket to a user for an admin and create an audit log', async () => {
        const response = await request(app)
          .post(`/api/tickets/${ticketToAssign._id}/assign`)
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .send({ assignedTo: adminLogisticsCoUser._id.toString() })
          .expect(200);

        expect(response.body.message).toBe('Ticket assigned successfully');
        // Corrected assertion: Access _id from the populated user object
        expect(response.body.ticket.assignedTo._id.toString()).toBe(adminLogisticsCoUser._id.toString());

        // Verify audit log
        const auditLog = await AuditLog.findOne({ resourceId: ticketToAssign._id, action: 'assigned' });
        expect(auditLog).toBeDefined();
        // The audit log stores the string ID, so no ._id.toString() needed here
        expect(auditLog.details.assignedTo).toBe(adminLogisticsCoUser._id.toString());
      });

      it('should unassign a ticket if assignedTo is null', async () => {
        // First assign it
        await request(app)
          .post(`/api/tickets/${ticketToAssign._id}/assign`)
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .send({ assignedTo: adminLogisticsCoUser._id.toString() });

        const response = await request(app)
          .post(`/api/tickets/${ticketToAssign._id}/assign`)
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .send({ assignedTo: null })
          .expect(200);

        expect(response.body.message).toBe('Ticket assigned successfully');
        expect(response.body.ticket.assignedTo).toBeNull();
      });

      it('should return 403 if non-admin user tries to assign a ticket', async () => {
        const response = await request(app)
          .post(`/api/tickets/${ticketToAssign._id}/assign`)
          .set('Authorization', `Bearer ${userLogisticsCoToken}`)
          .send({ assignedTo: adminLogisticsCoUser._id.toString() })
          .expect(403);

        expect(response.body.error).toBe('Insufficient permissions.');
      });
    });

    // GET /api/tickets/stats/overview
    describe('GET /api/tickets/stats/overview', () => {
      beforeEach(async () => {
        // Create various tickets for LogisticsCo (Tenant1)
        await Ticket.create({ title: 'Open 1', description: 'd', customerId: 'LogisticsCo', userId: userLogisticsCoUser._id, status: 'open', priority: 'high' });
        await Ticket.create({ title: 'Open 2', description: 'd', customerId: 'LogisticsCo', userId: userLogisticsCoUser._id, status: 'open', priority: 'medium' });
        await Ticket.create({ title: 'In Progress 1', description: 'd', customerId: 'LogisticsCo', userId: userLogisticsCoUser._id, status: 'in-progress', priority: 'low' });
        await Ticket.create({ title: 'Resolved 1', description: 'd', customerId: 'LogisticsCo', userId: userLogisticsCoUser._id, status: 'resolved', priority: 'high' });
        await Ticket.create({ title: 'Closed 1', description: 'd', customerId: 'LogisticsCo', userId: userLogisticsCoUser._id, status: 'closed', priority: 'medium' });
        // Ticket for another tenant (RetailGmbH)
        await Ticket.create({ title: 'RG Open', description: 'd', customerId: 'RetailGmbH', userId: adminRetailGmbHUser._id, status: 'open', priority: 'high' });
      });

      it('should return ticket statistics for an admin within their tenant', async () => {
        const response = await request(app)
          .get('/api/tickets/stats/overview')
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(200);

        expect(response.body.totalTickets).toBe(5);
        expect(response.body.statusStats).toEqual({
          open: 2,
          'in-progress': 1,
          resolved: 1,
          closed: 1
        });
        expect(response.body.priorityStats).toEqual({
          high: 2,
          medium: 2,
          low: 1
        });
      });

      it('should return 403 if non-admin user tries to access statistics', async () => {
        const response = await request(app)
          .get('/api/tickets/stats/overview')
          .set('Authorization', `Bearer ${userLogisticsCoToken}`)
          .expect(403);

        expect(response.body.error).toBe('Insufficient permissions.');
      });
    });
  });

  // --- Audit Logs Endpoints ---
  describe('Audit Logs API', () => {
    beforeEach(async () => {
      // Create some audit logs for LogisticsCo (Tenant1) and RetailGmbH (Tenant2)
      await AuditLog.create({
        action: 'created', userId: userLogisticsCoUser._id, customerId: 'LogisticsCo', resourceId: new mongoose.Types.ObjectId(), resourceType: 'ticket'
      });
      await AuditLog.create({
        action: 'updated', userId: adminLogisticsCoUser._id, customerId: 'LogisticsCo', resourceId: new mongoose.Types.ObjectId(), resourceType: 'ticket'
      });
      await AuditLog.create({
        action: 'deleted', userId: adminLogisticsCoUser._id, customerId: 'LogisticsCo', resourceId: new mongoose.Types.ObjectId(), resourceType: 'user'
      });
      await AuditLog.create({
        action: 'created', userId: adminRetailGmbHUser._id, customerId: 'RetailGmbH', resourceId: new mongoose.Types.ObjectId(), resourceType: 'ticket'
      });
    });

    // GET /api/audit
    describe('GET /api/audit', () => {
      it('should return audit logs for an admin within their tenant', async () => {
        const response = await request(app)
          .get('/api/audit')
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(200);

        expect(response.body.logs).toHaveLength(3);
        expect(response.body.logs.every(log => log.customerId === 'LogisticsCo')).toBe(true);
      });

      it('should filter audit logs by action', async () => {
        const response = await request(app)
          .get('/api/audit?action=created')
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(200);

        expect(response.body.logs).toHaveLength(1);
        expect(response.body.logs[0].action).toBe('created');
      });

      it('should filter audit logs by resourceType', async () => {
        const response = await request(app)
          .get('/api/audit?resourceType=user')
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(200);

        expect(response.body.logs).toHaveLength(1);
        expect(response.body.logs[0].resourceType).toBe('user');
      });

      it('should return 403 if non-admin user tries to access audit logs', async () => {
        const response = await request(app)
          .get('/api/audit')
          .set('Authorization', `Bearer ${userLogisticsCoToken}`)
          .expect(403);

        expect(response.body.error).toBe('Insufficient permissions.');
      });

      it('should not return audit logs from other tenants', async () => {
        const response = await request(app)
          .get('/api/audit')
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(200);

        expect(response.body.logs.some(log => log.customerId === 'RetailGmbH')).toBe(false);
      });
    });
  });

  // --- Screens Endpoints ---
  describe('Screens API', () => {
    // GET /api/screens/me/screens
    describe('GET /api/screens/me/screens', () => {
      it('should return screens for LogisticsCo Admin', async () => {
        const response = await request(app)
          .get('/api/screens/me/screens')
          .set('Authorization', `Bearer ${adminLogisticsCoToken}`)
          .expect(200);

        expect(response.body.screens).toHaveLength(2); // support-tickets, admin-dashboard
        expect(response.body.screens.some(s => s.screenUrl === 'support-tickets')).toBe(true);
        expect(response.body.screens.some(s => s.screenUrl === 'admin-dashboard')).toBe(true);
      });

      it('should return screens for LogisticsCo User (filtered by role)', async () => {
        const response = await request(app)
          .get('/api/screens/me/screens')
          .set('Authorization', `Bearer ${userLogisticsCoToken}`)
          .expect(200);

        expect(response.body.screens).toHaveLength(1); // Only support-tickets
        expect(response.body.screens[0].screenUrl).toBe('support-tickets');
      });

      it('should return screens for RetailGmbH Admin', async () => {
        const response = await request(app)
          .get('/api/screens/me/screens')
          .set('Authorization', `Bearer ${adminRetailGmbHToken}`)
          .expect(200);

        expect(response.body.screens).toHaveLength(2); // support-tickets, user-management
        expect(response.body.screens.some(s => s.screenUrl === 'support-tickets')).toBe(true);
        expect(response.body.screens.some(s => s.screenUrl === 'user-management')).toBe(true);
      });

      it('should return 401 if no token is provided', async () => {
        const response = await request(app)
          .get('/api/screens/me/screens')
          .expect(401);

        expect(response.body.error).toBe('Access denied. No token provided.');
      });
    });
  });

  // --- Webhook Endpoints ---
  describe('Webhook API', () => {
    let ticketForWebhook;
    // Use the webhook secret from .env, or a default for testing
    const webhookSecret = process.env.WEBHOOK_SECRET || 'your-webhook-secret-key';

    beforeEach(async () => {
      ticketForWebhook = await Ticket.create({
        title: 'Webhook Test Ticket', description: 'Desc', customerId: 'LogisticsCo', userId: userLogisticsCoUser._id, status: 'open'
      });
    });

    // POST /api/webhook/ticket-processed
    describe('POST /api/webhook/ticket-processed', () => {
      it('should update ticket status and add comment if webhook secret is valid', async () => {
        const payload = {
          ticketId: ticketForWebhook._id.toString(),
          status: 'in-progress',
          processingResult: 'Ticket analyzed by AI.',
          customerId: 'LogisticsCo',
          secret: webhookSecret // Sent in body
        };

        const response = await request(app)
          .post('/api/webhook/ticket-processed')
          .send(payload)
          .expect(200);

        expect(response.body.message).toBe('Ticket processed successfully');
        expect(response.body.newStatus).toBe('in-progress');

        const updatedTicket = await Ticket.findById(ticketForWebhook._id);
        expect(updatedTicket.status).toBe('in-progress');
        expect(updatedTicket.comments).toHaveLength(1);
        expect(updatedTicket.comments[0].content).toContain('Processing completed: Ticket analyzed by AI.');

        // Verify audit log
        const auditLog = await AuditLog.findOne({ resourceId: ticketForWebhook._id, action: 'updated', 'details.webhookProcessing': true });
        expect(auditLog).toBeDefined();
      });

      it('should return 401 if webhook secret is invalid', async () => {
        const payload = {
          ticketId: ticketForWebhook._id.toString(),
          status: 'resolved',
          customerId: 'LogisticsCo',
          secret: 'wrong-secret'
        };

        const response = await request(app)
          .post('/api/webhook/ticket-processed')
          .send(payload)
          .expect(401);

        expect(response.body.error).toBe('Invalid webhook secret');
      });

      it('should return 400 if missing required fields', async () => {
        const payload = {
          ticketId: ticketForWebhook._id.toString(),
          customerId: 'LogisticsCo',
          secret: webhookSecret // Missing status
        };

        const response = await request(app)
          .post('/api/webhook/ticket-processed')
          .send(payload)
          .expect(400);

        expect(response.body.error).toBe('Missing required fields: ticketId, status');
      });

      it('should return 404 if ticket not found for webhook processing', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const payload = {
          ticketId: nonExistentId.toString(),
          status: 'resolved',
          customerId: 'LogisticsCo',
          secret: webhookSecret
        };

        const response = await request(app)
          .post('/api/webhook/ticket-processed')
          .send(payload)
          .expect(404);

        expect(response.body.error).toBe('Ticket not found');
      });
    });

    // POST /api/webhook/event
    describe('POST /api/webhook/event', () => {
      it('should process ticket.auto_assignment event', async () => {
        const payload = {
          event: 'ticket.auto_assignment',
          data: {
            ticketId: ticketForWebhook._id.toString(),
            assignedTo: adminLogisticsCoUser._id.toString()
          },
          secret: webhookSecret
        };

        const response = await request(app)
          .post('/api/webhook/event')
          .send(payload)
          .expect(200);

        expect(response.body.message).toBe('Event processed successfully');
        const updatedTicket = await Ticket.findById(ticketForWebhook._id);
        // Corrected assertion: Convert ObjectId to string for comparison
        expect(updatedTicket.assignedTo.toString()).toBe(adminLogisticsCoUser._id.toString());
      });

      it('should process ticket.priority_update event', async () => {
        const payload = {
          event: 'ticket.priority_update',
          data: {
            ticketId: ticketForWebhook._id.toString(),
            priority: 'high'
          },
          secret: webhookSecret
        };

        const response = await request(app)
          .post('/api/webhook/event')
          .send(payload)
          .expect(200);

        expect(response.body.message).toBe('Event processed successfully');
        const updatedTicket = await Ticket.findById(ticketForWebhook._id);
        expect(updatedTicket.priority).toBe('high');
      });

      it('should return 401 for invalid webhook secret for general event', async () => {
        const payload = {
          event: 'ticket.auto_assignment',
          data: { ticketId: ticketForWebhook._id.toString(), assignedTo: adminLogisticsCoUser._id.toString() },
          secret: 'wrong-secret'
        };

        const response = await request(app)
          .post('/api/webhook/event')
          .send(payload)
          .expect(401);

        expect(response.body.error).toBe('Invalid webhook secret');
      });
    });
  });
});
