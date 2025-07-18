// routes/tickets.js
const express = require('express');
const Joi = require('joi');
const Ticket = require('../model/Ticket');
const auth = require('../middlewareservices/auth');
const tenantFilter = require('../middlewareservices/tenantFilter');
const { createAuditLog } = require('../services/auditServices');
const { sendWebhookNotification } = require('../services/notificationService');
require('../model/User');
const { requireAdmin} = require('../middlewareservices/rbac')
const router = express.Router();

// Validation schema
const ticketSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(2000).required(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  tags: Joi.array().items(Joi.string().trim()).max(10).default([]),
  assignedTo: Joi.string().optional(),
  status: Joi.string().valid('open', 'in-progress', 'resolved', 'closed').default('open')
});

// GET all tickets
// GET /api/tickets
router.get('/', auth, tenantFilter, async (req, res) => {
  try {
    const { status, priority, tag, search } = req.query;

    const filter = { ...req.tenantFilter };

    // Optional filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (tag) filter.tags = tag;

    // Full-text search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tickets = await Ticket.find(filter)
      .populate('userId', 'email')
      .populate('assignedTo', 'email')
      .sort({ createdAt: -1 });

    res.json({ tickets });
  } catch (err) {
    console.error('Ticket fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.get('/:id', auth, tenantFilter, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, ...req.tenantFilter })
      .populate('userId', 'email firstName lastName')
      .populate('assignedTo', 'email firstName lastName')
      .populate('comments.userId', 'email firstName lastName');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (err) {
    console.error('Fetch ticket by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch ticket by ID' });
  }
});


// POST create new ticket
router.post('/', auth, tenantFilter, async (req, res) => {
  try {
    const { error, value } = ticketSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const ticket = new Ticket({
      ...value,
      customerId: req.user.customerId,
      userId: req.user.userId
    });
    if (req.user.role !== 'Admin') delete ticket.assignedTo;
    await ticket.save();
    await ticket.populate('userId', 'email firstName lastName');

    await createAuditLog('created', req.user.userId, req.user.customerId, ticket._id, 'ticket', {
      title: ticket.title
    }, req);

    await sendWebhookNotification('ticket.created', {
      ticketId: ticket._id,
      title: ticket.title,
      customerId: ticket.customerId,
      userId: ticket.userId
    });

    res.status(201).json({ message: 'Ticket created', ticket });
  } catch (err) {
    console.error('Create error:', err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

const commentSchema = Joi.object({
  content: Joi.string().trim().max(1000).required()
});

router.post('/:id/comments', auth, tenantFilter, async (req, res) => {
  try {
    const { error, value } = commentSchema.validate(req.body);
    if (error) {
      console.log('❌ Joi Validation Error:', error.details);
      return res.status(400).json({ error: error.details[0].message });
    }

    const filter = { _id: req.params.id, ...req.tenantFilter };
    if (req.user.role !== 'Admin') {
      filter.userId = req.user.userId;
    }

    console.log('🔍 Looking for ticket with filter:', filter);

    const ticket = await Ticket.findOne(filter);
    if (!ticket) {
      console.log('❌ Ticket not found for comment');
      return res.status(404).json({ error: 'Ticket not found.' });
    }

    const comment = {
      userId: req.user.userId,
      content: value.content,
      createdAt: new Date()
    };

    ticket.comments.push(comment);
    await ticket.save();

    await ticket.populate('comments.userId', 'email firstName lastName');

    console.log('✅ Comment saved:', comment);

    res.status(201).json({
      message: 'Comment added successfully',
      ticket
    });
  } catch (error) {
    console.error('❌ Comment creation error:', error);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
});


// PUT update ticket
router.put('/:id', auth, tenantFilter, async (req, res) => {
  const updateSchema = Joi.object({
    title: Joi.string().trim().max(200),
    description: Joi.string().trim().max(2000),
    status: Joi.string().valid('open', 'in-progress', 'resolved', 'closed'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    tags: Joi.array().items(Joi.string().trim()).max(10),
    assignedTo: Joi.string().allow(null)
  });

  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const filter = { _id: req.params.id, ...req.tenantFilter };
    if (req.user.role !== 'Admin') {
      filter.userId = req.user.userId;
      delete value.status;
      delete value.assignedTo;
    }

    const oldTicket = await Ticket.findOne(filter);
    if (!oldTicket) return res.status(404).json({ error: 'Ticket not found' });

    const ticket = await Ticket.findOneAndUpdate(filter, value, { new: true, runValidators: true })
      .populate('userId', 'email firstName lastName')
      .populate('assignedTo', 'email firstName lastName');

    await createAuditLog('updated', req.user.userId, req.user.customerId, ticket._id, 'ticket', {
      changes: value
    }, req);

    res.json({ message: 'Ticket updated', ticket });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});
// PATCH /api/tickets/:id/status — update ticket status only
router.patch('/:id/status', auth, tenantFilter, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { status } = req.body;

    if (!['open', 'in-progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const filter = { _id: ticketId, ...req.tenantFilter };

    // Non-admins can only update their own ticket status
    if (req.user.role !== 'Admin') {
      filter.userId = req.user.userId;
    }

    const ticket = await Ticket.findOneAndUpdate(filter, { status }, { new: true });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found or access denied' });
    }

    res.json({ message: 'Ticket status updated', ticket });
  } catch (err) {
    console.error('Failed to update ticket status:', err);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});
// PATCH /api/tickets/:id/assign
router.patch('/:id/assign', auth, requireAdmin, async (req, res) => {
  try {
    const { assignedTo } = req.body;
    if (!assignedTo) {
      return res.status(400).json({ error: 'assignedTo user ID is required' });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    ).populate('assignedTo', 'email firstName lastName');

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ message: 'Ticket assigned successfully', ticket });
  } catch (err) {
    console.error('Assign error:', err);
    res.status(500).json({ error: 'Failed to assign ticket' });
  }
});


// DELETE ticket (admin only)
router.delete('/:id', auth, tenantFilter, async (req, res) => {
  if (req.user.role !== 'Admin') return res.status(403).json({ error: 'Forbidden' });

  try {
    const ticket = await Ticket.findOneAndDelete({ _id: req.params.id, ...req.tenantFilter });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    await createAuditLog('deleted', req.user.userId, req.user.customerId, ticket._id, 'ticket', {
      title: ticket.title
    }, req);

    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

//comment


module.exports = router;
