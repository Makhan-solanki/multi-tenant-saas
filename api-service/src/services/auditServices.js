const AuditLog = require('../model/AuditLog');

const createAuditLog = async (action, userId, customerId, resourceId, resourceType, details = {}, req = null) => {
  try {
    const auditLog = new AuditLog({
      action,
      userId,
      customerId,
      resourceId,
      resourceType,
      details,
      ipAddress: req?.ip || req?.connection?.remoteAddress,
      userAgent: req?.get('User-Agent')
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Audit log creation failed:', error);
    // Don't throw error - audit logging shouldn't break main functionality
  }
};

const getAuditLogs = async (customerId, filters = {}, page = 1, limit = 50) => {
  try {
    const query = { customerId, ...filters };
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(query)
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Audit logs fetch failed:', error);
    throw new Error('Failed to fetch audit logs');
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs
};