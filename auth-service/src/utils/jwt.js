const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  const payload = {
    userId: user._id,
    customerId: user.customerId,
    role: user.role,
    email: user.email
  };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};
// console.log("generated token --> ",generateToken());

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// console.log("verification token --> ",verifyToken())

module.exports = {
  generateToken,
  verifyToken
};