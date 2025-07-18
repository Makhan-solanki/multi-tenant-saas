const tenantFilter = (req, res, next) => {
    if (!req.user || !req.user.customerId) {
      return res.status(401).json({ error: 'Authentication required for tenant access.' });
    }
    
    // Add tenant filter to request for database queries
    req.tenantFilter = { customerId: req.user.customerId };
    next();
  };
  
  module.exports = tenantFilter;