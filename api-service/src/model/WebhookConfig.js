const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  customerId: { type: String, required: true, index: true },
  url: { type: String, required: true },
  events: [{ 
    type: String, 
    enum: ['ticket.created', 'ticket.assigned', 'ticket.updated', 'comment.added'] 
  }]
}, {
  timestamps: true
});

// ❌ Removed this line to allow multiple webhooks per customer
// webhookSchema.index({ customerId: 1 }, { unique: true });

module.exports = mongoose.model('WebhookConfig', webhookSchema);
