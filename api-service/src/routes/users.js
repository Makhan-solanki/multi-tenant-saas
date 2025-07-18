const express = require('express');
const router = express.Router();
const User = require('../model/User');
const auth = require('../middlewareservices/auth');
const { requireAdmin } = require('../middlewareservices/rbac');

// ✅ Get all users (Admin only)
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'email role customerId firstName lastName');
    res.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ✅ Create new user
router.post('/', auth, requireAdmin, async (req, res) => {
  try {
    const { email, role, customerId, firstName, lastName } = req.body;
    const user = new User({ email, role, customerId, firstName, lastName });
    await user.save();
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(400).json({ error: 'Failed to create user' });
  }
});

// ✅ Update user
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'User updated', user: updated });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(400).json({ error: 'Failed to update user' });
  }
});

// ✅ Delete user
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(400).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
