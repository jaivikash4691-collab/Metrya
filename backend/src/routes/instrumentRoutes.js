const express = require('express');
const router = express.Router();
const {
  getInstruments,
  getInstrumentById,
  createInstrument,
  updateInstrument,
  deleteInstrument,
  getCategories,
  createCategory
} = require('../controllers/instrumentController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const upload = require('../middleware/upload');
const { ROLES } = require('../config/constants');

// Categories
router.get('/categories', getCategories);
router.post('/categories', authenticate, authorize(ROLES.SUPER_ADMIN), createCategory);

// Instruments
router.get('/', authenticate, getInstruments);
router.get('/:id', authenticate, getInstrumentById);
router.post(
  '/',
  authenticate,
  upload.fields([
    { name: 'instrumentPhoto', maxCount: 1 },
    { name: 'previousCertificate', maxCount: 1 },
    { name: 'invoiceDocument', maxCount: 1 }
  ]),
  createInstrument
);
router.put('/:id', authenticate, updateInstrument);
router.delete('/:id', authenticate, deleteInstrument);

module.exports = router;
