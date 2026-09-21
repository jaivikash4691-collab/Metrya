const Inspection = require('../models/Inspection');
const VerificationApplication = require('../models/VerificationApplication');
const Instrument = require('../models/Instrument');
const { evaluateInspection, calculateMeasurement } = require('../services/toleranceCalculator');
const { generateSealNumber } = require('../utils/idGenerator');
const { logAuditEvent } = require('../utils/auditLogger');
const { createNotification } = require('../utils/notificationHelper');
const { APPLICATION_STATUS } = require('../config/constants');

// @desc    Live tolerance evaluation helper for frontend inspection form
// @route   POST /api/inspections/calculate-tolerance
// @access  Private
const calculateLiveTolerance = async (req, res, next) => {
  try {
    const { categoryId, accuracyClass, capacity, measurements, physicalInspection } = req.body;

    const evaluation = await evaluateInspection({
      categoryId,
      accuracyClass,
      capacity: Number(capacity),
      measurements: measurements || [],
      physicalInspection
    });

    res.json({
      success: true,
      evaluation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Conduct and submit digital inspection
// @route   POST /api/inspections
// @access  Private (LMO, GATC, SUPER_ADMIN)
const conductInspection = async (req, res, next) => {
  try {
    const {
      applicationId,
      environmentalConditions,
      measurements,
      physicalInspection,
      officerRemarks,
      recommendation,
      stampingQuarter,
      stampingYear
    } = req.body;

    const application = await VerificationApplication.findById(applicationId).populate('instrument applicant');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const instrument = application.instrument;

    // Evaluate compliance using metrology engine
    const evaluation = await evaluateInspection({
      categoryId: instrument.category,
      accuracyClass: instrument.accuracyClass,
      capacity: instrument.capacity,
      measurements: measurements || [],
      physicalInspection
    });

    const isOverallPass = evaluation.overallCompliance && recommendation === 'APPROVED';

    // Handle evidence photos from multer
    const evidence = [];
    if (req.files && req.files.evidence) {
      req.files.evidence.forEach((f) => {
        evidence.push({
          fileUrl: `/uploads/${f.filename}`,
          fileType: f.mimetype.includes('image') ? 'PHOTO' : 'DOCUMENT',
          caption: f.originalname
        });
      });
    }

    const sealNumber = isOverallPass ? generateSealNumber(stampingQuarter || 'Q1') : undefined;

    const inspection = await Inspection.create({
      application: application._id,
      instrument: instrument._id,
      inspector: req.user._id,
      inspectionDate: new Date(),
      environmentalConditions,
      measurements: evaluation.evaluatedMeasurements,
      physicalInspection,
      evidence,
      overallCompliance: evaluation.overallCompliance,
      recommendation: recommendation || (evaluation.overallCompliance ? 'APPROVED' : 'REJECTED'),
      officerRemarks,
      sealingDetails: {
        newSealNumber: sealNumber,
        stampingYear: stampingYear || new Date().getFullYear(),
        stampingQuarter: stampingQuarter || 'Q1'
      }
    });

    // Update application
    application.inspection = inspection._id;
    application.status = APPLICATION_STATUS.INSPECTION_COMPLETED;
    application.statusHistory.push({
      status: APPLICATION_STATUS.INSPECTION_COMPLETED,
      changedBy: req.user._id,
      timestamp: new Date(),
      comment: `Inspection completed. Determination: ${inspection.overallCompliance ? 'COMPLIANT' : 'NON-COMPLIANT'}. Recommended: ${recommendation}`
    });

    await application.save();

    await logAuditEvent({
      req,
      user: req.user,
      action: 'INSPECTION_CONDUCTED',
      entityType: 'INSPECTION',
      entityId: inspection._id,
      description: `Conducted inspection for application ${application.applicationNumber} - Result: ${recommendation}`
    });

    // Notify applicant
    await createNotification({
      recipientId: application.applicant._id,
      title: 'Inspection Completed',
      message: `The digital inspection for application ${application.applicationNumber} has been completed with outcome: ${inspection.recommendation}.`,
      type: isOverallPass ? 'SUCCESS' : 'WARNING',
      category: 'INSPECTION',
      relatedEntityId: application._id,
      link: `/applications/${application._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Inspection recorded successfully',
      inspection,
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inspection by ID
// @route   GET /api/inspections/:id
// @access  Private
const getInspectionById = async (req, res, next) => {
  try {
    const inspection = await Inspection.findById(req.params.id)
      .populate('application')
      .populate({
        path: 'instrument',
        populate: { path: 'category' }
      })
      .populate('inspector', 'name email jurisdiction officerBadgeNumber gatcCentreName');

    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }

    res.json({
      success: true,
      inspection
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inspection for a given application
// @route   GET /api/inspections/application/:applicationId
// @access  Private
const getInspectionByApplication = async (req, res, next) => {
  try {
    const inspection = await Inspection.findOne({ application: req.params.applicationId })
      .populate('inspector', 'name email jurisdiction officerBadgeNumber gatcCentreName')
      .populate({
        path: 'instrument',
        populate: { path: 'category' }
      });

    if (!inspection) {
      return res.status(404).json({ success: false, message: 'No inspection record found for this application.' });
    }

    res.json({
      success: true,
      inspection
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateLiveTolerance,
  conductInspection,
  getInspectionById,
  getInspectionByApplication
};
