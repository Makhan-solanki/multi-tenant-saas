const requireRole = (roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required.' });
      }
  
      const userRole = req.user.role;
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions.',
          required: allowedRoles,
          current: userRole
        });
      }
  
      next();
    };
  };
  
  const requireAdmin = requireRole(['Admin']);
  
  module.exports = {
    requireRole,
    requireAdmin
  };