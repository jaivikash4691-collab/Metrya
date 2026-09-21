const mongoose = require('mongoose');

const InspectionSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VerificationApplication',
      required: true,
      index: true
    },
    instrument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instrument',
      required: true
    },
    inspector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    inspectionDate: {
      type: Date,
      default: Date.now
    },
    verificationRule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VerificationRule'
    },
    environmentalConditions: {
      temperatureCelsius: { type: Number, default: 22.5 },
      relativeHumidityPercentage: { type: Number, default: 55 },
      atmosphericPressureHpa: { type: Number, default: 1013.25 }
    },
    measurements: [
      {
        testPointName: { type: String, required: true },
        referenceValue: { type: Number, required: true },
        observedValue: { type: Number, required: true },
        unit: { type: String, required: true },
        error: { type: Number, required: true },
        percentageError: { type: Number, required: true },
        tolerance: { type: Number, required: true },
        pass: { type: Boolean, required: true },
        remarks: String
      }
    ],
    physicalInspection: {
      displayCondition: {
        status: { type: String, enum: ['PASS', 'FAIL', 'NA'], default: 'PASS' },
        remarks: String
      },
      sealCondition: {
        status: { type: String, enum: ['INTACT', 'BROKEN', 'ABSENT', 'NEW_APPLIED'], default: 'INTACT' },
        remarks: String
      },
      calibrationCondition: {
        status: { type: String, enum: ['PASS', 'FAIL'], default: 'PASS' },
        remarks: String
      },
      manufacturerMarking: {
        status: { type: String, enum: ['LEGIBLE', 'DEFACED', 'MISSING'], default: 'LEGIBLE' },
        remarks: String
      },
      serialNumberVisibility: {
        status: { type: String, enum: ['VERIFIED', 'MISMATCH', 'ILLEGIBLE'], default: 'VERIFIED' },
        remarks: String
      },
      safetyCondition: {
        status: { type: String, enum: ['SAFE', 'UNSAFE'], default: 'SAFE' },
        remarks: String
      },
      levelIndicator: {
        status: { type: String, enum: ['CENTRED', 'OFF_CENTRE', 'NA'], default: 'CENTRED' },
        remarks: String
      }
    },
    evidence: [
      {
        fileUrl: String,
        fileType: { type: String, default: 'PHOTO' },
        caption: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    overallCompliance: {
      type: Boolean,
      required: true
    },
    recommendation: {
      type: String,
      enum: ['APPROVED', 'REJECTED'],
      required: true
    },
    officerRemarks: {
      type: String,
      trim: true
    },
    sealingDetails: {
      newSealNumber: String,
      stampingYear: { type: Number, default: new Date().getFullYear() },
      stampingQuarter: { type: String, enum: ['Q1', 'Q2', 'Q3', 'Q4'], default: 'Q1' }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Inspection', InspectionSchema);
