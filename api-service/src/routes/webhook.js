const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Webhook = require('../model/WebhookConfig');
const auth = require('../middlewareservices/auth');
const { requireAdmin } = require('../middlewareservices/rbac');

// Validation schema
const webhookSchema = Joi.object({
  url: Joi.string().uri().required(),
  events: Joi.array().items(Joi.string().valid(
    'ticket.created', 'ticket.updated', 'ticket.deleted', 'comment.added', 'ticket.assigned'
  )).min(1).required()
});
// Get all webhooks for the current tenant
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const webhooks = await Webhook.find({ customerId: req.user.customerId });
    res.json({ webhooks });
  } catch (err) {
    console.error('Failed to fetch webhooks:', err);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

// Create a new webhook
router.post('/', auth, requireAdmin, async (req, res) => {
  const { error, value } = webhookSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const webhook = new Webhook({
      ...value,
      customerId: req.user.customerId,
      createdBy: req.user.userId
    });
    await webhook.save();
    res.status(201).json({ message: 'Webhook created', webhook });
  } catch (err) {
    console.error('Failed to create webhook:', err);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// Update webhook
router.put('/:id', auth, requireAdmin, async (req, res) => {
  const { error, value } = webhookSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    const webhook = await Webhook.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user.customerId },
      value,
      { new: true }
    );
    if (!webhook) return res.status(404).json({ error: 'Webhook not found' });

    res.json({ message: 'Webhook updated', webhook });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update webhook' });
  }
});

// Delete webhook
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const result = await Webhook.findOneAndDelete({
      _id: req.params.id,
      customerId: req.user.customerId
    });
    if (!result) return res.status(404).json({ error: 'Webhook not found' });

    res.json({ message: 'Webhook deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

module.exports = router;
