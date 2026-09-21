const mongoose = require('mongoose');
const { INSTRUMENT_STATUS } = require('../config/constants');

const InstrumentSchema = new mongoose.Schema(
  {
    instrumentId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstrumentCategory',
      required: true
    },
    instrumentType: {
      type: String,
      required: [true, 'Instrument type is required'],
      trim: true
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer name is required'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Model number/name is required'],
      trim: true
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      trim: true,
      index: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [0, 'Capacity must be positive']
    },
    accuracyClass: {
      type: String,
      enum: ['CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IIII', 'GENERAL'],
      default: 'CLASS_III'
    },
    unit: {
      type: String,
      required: true,
      default: 'kg',
      trim: true
    },
    leastCount: {
      type: Number,
      default: 1
    },
    location: {
      facilityName: { type: String, trim: true },
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      latitude: { type: Number },
      longitude: { type: Number }
    },
    purchaseDate: {
      type: Date
    },
    installationDate: {
      type: Date
    },
    lastVerificationDate: {
      type: Date
    },
    nextVerificationDate: {
      type: Date,
      index: true
    },
    verificationFrequencyMonths: {
      type: Number,
      default: 12
    },
    status: {
      type: String,
      enum: Object.values(INSTRUMENT_STATUS),
      default: INSTRUMENT_STATUS.REGISTERED,
      index: true
    },
    currentCertificate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Certificate'
    },
    documents: {
      instrumentPhoto: String,
      previousCertificate: String,
      invoiceDocument: String,
      specificationSheet: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Instrument', InstrumentSchema);
