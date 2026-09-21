const express = require('express');
const router = express.Router();
const {
  getApplications,
  getApplicationById,
  createApplication,
  assignOfficerOrGATC,
  scheduleInspection,
  submitDecision,
  updateStatus
} = require('../controllers/applicationController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.get('/', authenticate, getApplications);
router.get('/:id', authenticate, getApplicationById);
router.post('/', authenticate, createApplication);

// Officer and scheduling workflows
router.post('/:id/assign', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.LMO), assignOfficerOrGATC);
router.post('/:id/schedule', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.LMO, ROLES.GATC), scheduleInspection);
router.post('/:id/decision', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.LMO), submitDecision);
router.put('/:id/status', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.LMO), updateStatus);

module.exports = router;
