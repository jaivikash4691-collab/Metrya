const User = require('../models/User');
const { ROLES } = require('../config/constants');
const { logAuditEvent } = require('../utils/auditLogger');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Register a new user (Business / Owner)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, organization, businessRegistrationNumber, address } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: ROLES.USER,
      phone,
      organization,
      businessRegistrationNumber,
      address
    });

    const token = user.generateAuthToken();

    await logAuditEvent({
      req,
      user,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: user._id,
      description: `New user registered: ${user.name} (${user.email})`
    });

    await createNotification({
      recipientId: user._id,
      title: 'Welcome to Metrya',
      message: 'Your account has been registered successfully. You can now register weighing & measuring instruments and submit verification applications.',
      type: 'SUCCESS',
      category: 'SYSTEM',
      link: '/instruments'
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Account is currently inactive or suspended.'
      });
    }

    const token = user.generateAuthToken();

    await logAuditEvent({
      req,
      user,
      action: 'USER_LOGGED_IN',
      entityType: 'USER',
      entityId: user._id,
      description: `User login: ${user.name} [${user.role}]`
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        jurisdiction: user.jurisdiction,
        gatcCentreName: user.gatcCentreName,
        officerBadgeNumber: user.officerBadgeNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, organization, address, businessRegistrationNumber } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        organization,
        address,
        businessRegistrationNumber
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private (SUPER_ADMIN)
const getUsers = async (req, res, next) => {
  try {
    const { role, search, status } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Officer or GATC Centre account (Admin)
// @route   POST /api/users
// @access  Private (SUPER_ADMIN)
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, organization, jurisdiction, gatcCentreName, officerBadgeNumber } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email.'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || ROLES.LMO,
      phone,
      organization,
      jurisdiction,
      gatcCentreName,
      officerBadgeNumber
    });

    await logAuditEvent({
      req,
      user: req.user,
      action: 'ADMIN_CREATED_USER',
      entityType: 'USER',
      entityId: user._id,
      description: `Admin created ${user.role} user: ${user.name} (${user.email})`
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  getUsers,
  createUser
};
