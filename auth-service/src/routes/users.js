const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

const router = express.Router();

// Get all users (Admin only, tenant-scoped)
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({ 
      customerId: req.user.customerId,
      isActive: true 
    }).select('-password');

    res.json({ users });
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// Get user by ID (Admin only, tenant-scoped)
router.get('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      customerId: req.user.customerId,
      isActive: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user });
  } catch (error) {
    console.error('User fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// Update user (Admin only, tenant-scoped)
router.put('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const { firstName, lastName, role, isActive } = req.body;
    
    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        customerId: req.user.customerId
      },
      {
        firstName,
        lastName,
        role,
        isActive
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('User update error:', error);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

module.exports = router;