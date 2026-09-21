const mongoose = require('mongoose');
const { CERTIFICATE_STATUS } = require('../config/constants');

const CertificateSchema = new mongoose.Schema(
  {
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VerificationApplication',
      required: true,
      index: true
    },
    instrument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instrument',
      required: true,
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    gatc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    inspection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inspection'
    },
    issueDate: {
      type: Date,
      default: Date.now
    },
    validFrom: {
      type: Date,
      required: true
    },
    validUntil: {
      type: Date,
      required: true,
      index: true
    },
    verificationDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(CERTIFICATE_STATUS),
      default: CERTIFICATE_STATUS.VALID,
      index: true
    },
    instrumentSnapshot: {
      instrumentId: String,
      categoryName: String,
      instrumentType: String,
      manufacturer: String,
      model: String,
      serialNumber: String,
      capacity: Number,
      unit: String,
      accuracyClass: String,
      location: Object
    },
    verificationSummary: {
      maxObservedError: Number,
      maxPermissibleError: Number,
      sealNumber: String,
      stampingQuarter: String,
      stampingYear: Number
    },
    qrCodeDataUrl: {
      type: String
    },
    qrVerificationUrl: {
      type: String
    },
    pdfPath: {
      type: String
    },
    remarks: {
      type: String,
      trim: true
    },
    revocationReason: String,
    revokedAt: Date,
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Certificate', CertificateSchema);
