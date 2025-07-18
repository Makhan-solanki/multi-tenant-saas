const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  role: { type: String, enum: ['User', 'Admin', 'Agent'], default: 'User' },
  customerId: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
