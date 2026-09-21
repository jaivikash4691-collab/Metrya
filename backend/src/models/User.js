const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ROLES } = require('../config/constants');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER
    },
    phone: {
      type: String,
      trim: true
    },
    organization: {
      type: String,
      trim: true
    },
    businessRegistrationNumber: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    },
    jurisdiction: {
      type: String,
      trim: true
    },
    gatcCentreName: {
      type: String,
      trim: true
    },
    officerBadgeNumber: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

// Password hash middleware
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
      organization: this.organization,
      jurisdiction: this.jurisdiction
    },
    process.env.JWT_SECRET || 'metrya_super_secret_jwt_key_2026_legal_metrology_secure_token',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

module.exports = mongoose.model('User', UserSchema);
