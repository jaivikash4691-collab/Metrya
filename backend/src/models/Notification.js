const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../config/constants');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      default: NOTIFICATION_TYPES.INFO
    },
    link: {
      type: String,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    category: {
      type: String,
      enum: ['APPLICATION', 'INSPECTION', 'CERTIFICATE', 'EXPIRY', 'SYSTEM'],
      default: 'SYSTEM'
    },
    relatedEntityId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);
