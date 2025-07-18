const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['created', 'updated', 'deleted', 'assigned', 'commented']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  customerId: {
    type: String,
    required: true,
    index: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['ticket', 'user', 'comment']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient tenant-scoped queries
auditLogSchema.index({ customerId: 1, createdAt: -1 });
auditLogSchema.index({ customerId: 1, resourceId: 1, resourceType: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);