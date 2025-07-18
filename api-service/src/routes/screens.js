const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const auth = require('../middlewareservices/auth');

const router = express.Router();

// Get user's available screens
router.get('/me/screens', auth, async (req, res) => {
  try {
    const registryPath = path.join(__dirname, '../data/registry.json');
    const registryData = await fs.readFile(registryPath, 'utf8');
    const registry = JSON.parse(registryData);

    const userScreens = registry[req.user.customerId] || [];
    
    // Filter screens based on user role if needed
    const filteredScreens = userScreens.filter(screen => {
      if (screen.roleRequired && screen.roleRequired.length > 0) {
        return screen.roleRequired.includes(req.user.role);
      }
      return true;
    });

    res.json({ screens: filteredScreens });
  } catch (error) {
    console.error('Screens fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch screens.' });
  }
});

module.exports = router;