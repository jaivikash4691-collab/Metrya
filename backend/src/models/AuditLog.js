const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    userName: String,
    userEmail: String,
    role: String,
    action: {
      type: String,
      required: true,
      index: true
    },
    entityType: {
      type: String,
      required: true,
      enum: ['USER', 'INSTRUMENT', 'APPLICATION', 'SCHEDULE', 'INSPECTION', 'CERTIFICATE', 'RULE', 'SYSTEM'],
      index: true
    },
    entityId: {
      type: String,
      index: true
    },
    description: {
      type: String,
      required: true
    },
    ipAddress: String,
    userAgent: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
