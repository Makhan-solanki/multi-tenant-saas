require('dotenv').config(); 
const mongoose = require('mongoose');
const Ticket = require('./model/Ticket');
const AuditLog = require('./model/AuditLog');

const tenant1AdminUserId = new mongoose.Types.ObjectId(); // Corresponds to admin@logisticsco.com
const tenant1UserUserId = new mongoose.Types.ObjectId();  // Corresponds to user@logisticsco.com
const tenant2AdminUserId = new mongoose.Types.ObjectId(); // Corresponds to admin@retailgmbh.com

const tenant1Id = 'LogisticsCo';
const tenant2Id = 'RetailGmbH';

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/supportapp';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding API Service data.');

    // Clear existing data
    await Ticket.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('Cleared existing Ticket and AuditLog data.');

    
    const tickets = [
      {
        title: 'Printer not working in warehouse A',
        description: 'The label printer in warehouse A has stopped responding. Tried restarting, no luck.',
        status: 'open',
        priority: 'high',
        customerId: tenant1Id,
        userId: tenant1UserUserId,
        tags: ['hardware', 'urgent']
      },
      {
        title: 'Software bug in inventory system',
        description: 'When trying to update stock for item XYZ, the system throws an error.',
        status: 'in-progress',
        priority: 'medium',
        customerId: tenant1Id,
        userId: tenant1UserUserId,
        assignedTo: tenant1AdminUserId,
        tags: ['software', 'inventory']
      },
      {
        title: 'New user onboarding request',
        description: 'Please create an account for new employee John Doe.',
        status: 'resolved',
        priority: 'low',
        customerId: tenant1Id,
        userId: tenant1AdminUserId,
        resolvedAt: new Date(),
        tags: ['onboarding']
      },
      {
        title: 'Network issue in office building',
        description: 'Intermittent internet connectivity issues reported by multiple users.',
        status: 'open',
        priority: 'high',
        customerId: tenant1Id,
        userId: tenant1AdminUserId, 
        tags: ['network']
      },

      // Tickets for RetailGmbH (Tenant2)
      {
        title: 'POS system crash in Store #123',
        description: 'Point of Sale system crashed during peak hours. Needs immediate attention.',
        status: 'open',
        priority: 'high',
        customerId: tenant2Id,
        userId: tenant2AdminUserId,
        tags: ['pos', 'critical']
      },
      {
        title: 'Website image upload failing',
        description: 'Users unable to upload product images to the e-commerce website.',
        status: 'in-progress',
        priority: 'medium',
        customerId: tenant2Id,
        userId: tenant2AdminUserId,
        tags: ['website', 'bug']
      }
    ];

    const createdTickets = await Ticket.insertMany(tickets);
    console.log(`Created ${createdTickets.length} sample tickets.`);

    // --- Create Sample Audit Logs ---
    const auditLogs = [
      {
        action: 'created',
        userId: tenant1UserUserId,
        customerId: tenant1Id,
        resourceId: createdTickets[0]._id, // First ticket
        resourceType: 'ticket',
        details: { title: createdTickets[0].title, status: createdTickets[0].status }
      },
      {
        action: 'updated',
        userId: tenant1AdminUserId,
        customerId: tenant1Id,
        resourceId: createdTickets[1]._id, // Second ticket
        resourceType: 'ticket',
        details: { oldStatus: 'open', newStatus: 'in-progress', assignedTo: tenant1AdminUserId }
      },
      {
        action: 'commented',
        userId: tenant1UserUserId,
        customerId: tenant1Id,
        resourceId: createdTickets[0]._id,
        resourceType: 'ticket',
        details: { comment: 'Initial diagnosis complete.' }
      },
      {
        action: 'created',
        userId: tenant2AdminUserId,
        customerId: tenant2Id,
        resourceId: createdTickets[4]._id, // Fifth ticket (first for Tenant2)
        resourceType: 'ticket',
        details: { title: createdTickets[4].title, status: createdTickets[4].status }
      }
    ];

    const createdAuditLogs = await AuditLog.insertMany(auditLogs);
    console.log(`Created ${createdAuditLogs.length} sample audit logs.`);

    console.log('API Service seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('API Service Seed error:', error);
    process.exit(1);
  }
};

seedData();
