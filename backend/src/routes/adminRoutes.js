const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getAuditLogs,
  getVerificationRules,
  createVerificationRule,
  updateVerificationRule,
  exportReport
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

// Analytics & Reports (Super Admin + LMO)
router.get('/analytics', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.LMO), getAnalytics);
router.get('/export-report', authenticate, authorize(ROLES.SUPER_ADMIN, ROLES.LMO), exportReport);

// Audit Logs (Super Admin only)
router.get('/audit-logs', authenticate, authorize(ROLES.SUPER_ADMIN), getAuditLogs);

// Rules Management
router.get('/rules', authenticate, getVerificationRules);
router.post('/rules', authenticate, authorize(ROLES.SUPER_ADMIN), createVerificationRule);
router.put('/rules/:id', authenticate, authorize(ROLES.SUPER_ADMIN), updateVerificationRule);

module.exports = router;
