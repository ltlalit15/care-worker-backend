const express = require('express');
const router = express.Router();
const { getCareWorkerDashboard } = require('../controllers/careWorkerDashboardController');
const { authenticate, requireCareWorker } = require('../middleware/auth');

// All routes require care worker authentication
router.use(authenticate);
router.use(requireCareWorker);

router.get('/dashboard', getCareWorkerDashboard);

module.exports = router;

