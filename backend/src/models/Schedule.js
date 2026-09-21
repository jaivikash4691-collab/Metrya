const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VerificationApplication',
      required: true
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    gatc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    date: {
      type: Date,
      required: [true, 'Inspection date is required'],
      index: true
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      trim: true
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true
    },
    location: {
      facilityName: String,
      address: String,
      city: String,
      pincode: String
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'RESCHEDULED', 'CANCELLED'],
      default: 'SCHEDULED'
    },
    notes: {
      type: String,
      trim: true
    },
    rescheduledReason: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Schedule', ScheduleSchema);
