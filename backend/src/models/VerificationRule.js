const mongoose = require('mongoose');

const VerificationRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Rule name is required'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstrumentCategory',
      required: true
    },
    accuracyClass: {
      type: String,
      enum: ['CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IIII', 'GENERAL', 'ALL'],
      default: 'CLASS_III'
    },
    minCapacity: {
      type: Number,
      default: 0
    },
    maxCapacity: {
      type: Number,
      default: 1000000
    },
    unit: {
      type: String,
      default: 'kg'
    },
    maxPermissibleErrorPercentage: {
      type: Number,
      default: 0.1, // e.g. 0.1% or 0.2%
      required: true
    },
    maxPermissibleErrorAbsolute: {
      type: Number,
      default: 0.5 // e.g. 0.5g or 0.5kg
    },
    errorCalculationMethod: {
      type: String,
      enum: ['PERCENTAGE', 'ABSOLUTE', 'WHICHEVER_IS_STRICTER'],
      default: 'PERCENTAGE'
    },
    mandatoryPhysicalChecks: [
      {
        key: String,
        label: String,
        description: String,
        isCritical: {
          type: Boolean,
          default: true
        }
      }
    ],
    recommendedTestPoints: [
      {
        percentage: Number,
        name: String
      }
    ],
    description: String,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('VerificationRule', VerificationRuleSchema);
