const express = require('express');
const router = express.Router();
const {
  generateCertificate,
  getCertificates,
  getCertificateById,
  downloadCertificatePDF,
  revokeCertificate
} = require('../controllers/certificateController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.get('/', authenticate, getCertificates);
router.get('/:id', authenticate, getCertificateById);
router.get('/:id/download', downloadCertificatePDF); // Allow download with direct link

router.post('/generate/:applicationId', authenticate, authorize(ROLES.LMO, ROLES.SUPER_ADMIN), generateCertificate);
router.post('/:id/revoke', authenticate, authorize(ROLES.LMO, ROLES.SUPER_ADMIN), revokeCertificate);

module.exports = router;
