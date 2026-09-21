const mongoose = require('mongoose');
const { APPLICATION_STATUS, APPLICATION_TYPES } = require('../config/constants');

const VerificationApplicationSchema = new mongoose.Schema(
  {
    applicationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    instrument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instrument',
      required: true,
      index: true
    },
    applicationType: {
      type: String,
      enum: Object.values(APPLICATION_TYPES),
      default: APPLICATION_TYPES.NEW_VERIFICATION
    },
    submissionDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.SUBMITTED,
      index: true
    },
    priority: {
      type: String,
      enum: ['NORMAL', 'URGENT', 'ROUTINE'],
      default: 'NORMAL'
    },
    preferredInspectionDate: {
      type: Date
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    assignedGATC: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule'
    },
    inspection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection'
    },
    certificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate'
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    approvalRemarks: {
      type: String,
      trim: true
    },
    officerNotes: {
      type: String,
      trim: true
    },
    applicantNotes: {
      type: String,
      trim: true
    },
    supportingDocuments: [
      {
        name: String,
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(APPLICATION_STATUS)
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        comment: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('VerificationApplication', VerificationApplicationSchema);
