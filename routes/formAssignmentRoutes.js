const express = require('express');
const router = express.Router();
const {
  assignForms,
  getCareWorkerAssignments,
  updateFormAssignment
} = require('../controllers/formAssignmentController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Assign forms (Admin only)
router.post('/', requireAdmin, assignForms);

// Get assignments for care worker
router.get('/care-worker/:id', getCareWorkerAssignments);

// Update assignment (Care worker or Admin)
router.put('/:id', updateFormAssignment);

module.exports = router;

