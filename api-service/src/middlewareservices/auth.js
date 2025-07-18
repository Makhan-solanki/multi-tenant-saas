const jwt = require('jsonwebtoken');
const axios = require('axios');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // ✅ Define this BEFORE using it!
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

    try {
      // Primary token verification through auth service
      const response = await axios.post(`${authServiceUrl}/api/auth/verify`, { token });

      if (response.data.valid) {
        req.user = response.data.user;
        return next();
      } else {
        return res.status(401).json({ error: 'Invalid token.' });
      }
    } catch (err) {
      // ✅ Fallback to local JWT decode
      console.warn('⚠️ Auth service fallback to local JWT decode');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        userId: decoded.userId,
        customerId: decoded.customerId,
        role: decoded.role,
        email: decoded.email,
      };
      return next();
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;
