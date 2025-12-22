const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All routes require admin authentication
router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard', getDashboard);

module.exports = router;

