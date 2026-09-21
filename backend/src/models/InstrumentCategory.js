const mongoose = require('mongoose');

const InstrumentCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Category code is required'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    standardVerificationFrequencyMonths: {
      type: Number,
      default: 12,
      min: 1,
      max: 60
    },
    applicableClasses: [
      {
        type: String,
        trim: true
      }
    ],
    standardTestPoints: [
      {
        percentage: Number,
        description: String
      }
    ],
    icon: {
      type: String,
      default: 'Scale'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('InstrumentCategory', InstrumentCategorySchema);
