const express = require('express');
const router = express.Router();
const {
  conductInspection,
  getInspectionById,
  getInspectionByApplication,
  calculateLiveTolerance
} = require('../controllers/inspectionController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const upload = require('../middleware/upload');
const { ROLES } = require('../config/constants');

// Live calculation utility endpoint
router.post('/calculate-tolerance', authenticate, calculateLiveTolerance);

// Inspection submission & review
router.post(
  '/',
  authenticate,
  authorize(ROLES.LMO, ROLES.GATC, ROLES.SUPER_ADMIN),
  upload.fields([{ name: 'evidence', maxCount: 6 }]),
  conductInspection
);

router.get('/:id', authenticate, getInspectionById);
router.get('/application/:applicationId', authenticate, getInspectionByApplication);

module.exports = router;
