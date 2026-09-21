const express = require('express');
const router = express.Router();
const { getSchedules, updateSchedule } = require('../controllers/scheduleController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.get('/', authenticate, getSchedules);
router.put('/:id', authenticate, authorize(ROLES.LMO, ROLES.GATC, ROLES.SUPER_ADMIN), updateSchedule);

module.exports = router;
