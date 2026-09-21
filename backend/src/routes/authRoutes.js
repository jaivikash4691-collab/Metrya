const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, getUsers, createUser } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { ROLES } = require('../config/constants');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

// Admin user management
router.get('/users', authenticate, authorize(ROLES.SUPER_ADMIN), getUsers);
router.post('/users', authenticate, authorize(ROLES.SUPER_ADMIN), createUser);

module.exports = router;
