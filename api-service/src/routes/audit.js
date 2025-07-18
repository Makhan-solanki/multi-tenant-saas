// routes/auditLogs.js
const express = require('express');
const router = express.Router();
const AuditLog = require('../model/AuditLog');
const auth = require('../middlewareservices/auth');
const { requireAdmin } = require('../middlewareservices/rbac');

// GET /api/audit-logs
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const { action, resourceType } = req.query;
    const filter = { customerId: req.user.customerId };

    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;

    const logs = await AuditLog.find(filter)
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ logs });
  } catch (err) {
    console.error('Audit log fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
