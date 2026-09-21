const express = require('express');
const router = express.Router();
const { publicVerifyCertificate } = require('../controllers/publicController');

// Public QR / Certificate ID validation endpoint
router.get('/verify/:identifier', publicVerifyCertificate);

module.exports = router;
