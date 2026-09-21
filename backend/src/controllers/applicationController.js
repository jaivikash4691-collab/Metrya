const VerificationApplication = require('../models/VerificationApplication');
const Instrument = require('../models/Instrument');
const Schedule = require('../models/Schedule');
const User = require('../models/User');
const { generateApplicationNumber } = require('../utils/idGenerator');
const { logAuditEvent } = require('../utils/auditLogger');
const { createNotification } = require('../utils/notificationHelper');
const { ROLES, APPLICATION_STATUS, INSTRUMENT_STATUS } = require('../config/constants');

// Allowed status transitions state machine validator
const VALID_TRANSITIONS = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['UNDER_REVIEW', 'ASSIGNED', 'REJECTED'],
  UNDER_REVIEW: ['ASSIGNED', 'SCHEDULED', 'REJECTED'],
  ASSIGNED: ['SCHEDULED', 'INSPECTION_IN_PROGRESS', 'UNDER_REVIEW'],
  SCHEDULED: ['INSPECTION_IN_PROGRESS', 'RESCHEDULED', 'CANCELLED'],
  INSPECTION_IN_PROGRESS: ['INSPECTION_COMPLETED', 'SCHEDULED'],
  INSPECTION_COMPLETED: ['APPROVED', 'REJECTED'],
  APPROVED: ['CERTIFICATE_GENERATED'],
  REJECTED: ['REVERIFICATION_REQUIRED', 'SUBMITTED'],
  CERTIFICATE_GENERATED: ['EXPIRED', 'REVERIFICATION_REQUIRED'],
  EXPIRED: ['REVERIFICATION_REQUIRED'],
  REVERIFICATION_REQUIRED: ['SUBMITTED']
};

// @desc    Get all verification applications (with filters)
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res, next) => {
  try {
    const { status, type, priority, search, page = 1, limit = 20 } = req.query;
    const query = {};

    // Role-based scoping
    if (req.user.role === ROLES.USER) {
      query.applicant = req.user._id;
    } else if (req.user.role === ROLES.LMO) {
      // LMO sees assigned applications or pending unassigned applications in their jurisdiction
      query.$or = [{ assignedOfficer: req.user._id }, { status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] } }];
    } else if (req.user.role === ROLES.GATC) {
      // GATC sees assigned to their centre
      query.assignedGATC = req.user._id;
    }

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (type) {
      query.applicationType = type;
    }
    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.applicationNumber = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await VerificationApplication.countDocuments(query);

    const applications = await VerificationApplication.find(query)
      .populate('applicant', 'name email organization phone address')
      .populate({
        path: 'instrument',
        populate: { path: 'category', select: 'name code icon' }
      })
      .populate('assignedOfficer', 'name email jurisdiction officerBadgeNumber')
      .populate('assignedGATC', 'name gatcCentreName')
      .populate('schedule')
      .populate('certificate', 'certificateNumber validFrom validUntil status qrCodeDataUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: applications.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID with full details
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res, next) => {
  try {
    const application = await VerificationApplication.findById(req.params.id)
      .populate('applicant', 'name email organization phone address businessRegistrationNumber')
      .populate({
        path: 'instrument',
        populate: { path: 'category' }
      })
      .populate('assignedOfficer', 'name email jurisdiction officerBadgeNumber phone')
      .populate('assignedGATC', 'name gatcCentreName email phone')
      .populate('schedule')
      .populate('inspection')
      .populate('certificate')
      .populate('statusHistory.changedBy', 'name role');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Verification application not found' });
    }

    // Role-based access check
    if (req.user.role === ROLES.USER && application.applicant._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this application.' });
    }

    res.json({
      success: true,
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new verification application
// @route   POST /api/applications
// @access  Private (USER, SUPER_ADMIN)
const createApplication = async (req, res, next) => {
  try {
    const { instrumentId, applicationType, priority, preferredInspectionDate, applicantNotes } = req.body;

    const instrument = await Instrument.findById(instrumentId);
    if (!instrument) {
      return res.status(404).json({ success: false, message: 'Instrument not found' });
    }

    // Check ownership
    if (req.user.role === ROLES.USER && instrument.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only apply for your own registered instruments.' });
    }

    // Check existing active application
    const activeApp = await VerificationApplication.findOne({
      instrument: instrument._id,
      status: {
        $in: [
          APPLICATION_STATUS.SUBMITTED,
          APPLICATION_STATUS.UNDER_REVIEW,
          APPLICATION_STATUS.ASSIGNED,
          APPLICATION_STATUS.SCHEDULED,
          APPLICATION_STATUS.INSPECTION_IN_PROGRESS
        ]
      }
    });

    if (activeApp) {
      return res.status(400).json({
        success: false,
        message: `An active verification application (${activeApp.applicationNumber}) is already in progress for this instrument.`
      });
    }

    const applicationNumber = generateApplicationNumber();

    const application = await VerificationApplication.create({
      applicationNumber,
      applicant: req.user._id,
      instrument: instrument._id,
      applicationType: applicationType || 'NEW_VERIFICATION',
      priority: priority || 'NORMAL',
      preferredInspectionDate: preferredInspectionDate ? new Date(preferredInspectionDate) : undefined,
      applicantNotes,
      status: APPLICATION_STATUS.SUBMITTED,
      statusHistory: [
        {
          status: APPLICATION_STATUS.SUBMITTED,
          changedBy: req.user._id,
          timestamp: new Date(),
          comment: 'Application submitted online by instrument owner.'
        }
      ]
    });

    // Update instrument status to pending verification
    instrument.status = INSTRUMENT_STATUS.PENDING_VERIFICATION;
    await instrument.save();

    await logAuditEvent({
      req,
      user: req.user,
      action: 'APPLICATION_SUBMITTED',
      entityType: 'APPLICATION',
      entityId: application._id,
      description: `Submitted application ${application.applicationNumber} for instrument ${instrument.instrumentId}`
    });

    // Notify applicant
    await createNotification({
      recipientId: req.user._id,
      title: 'Verification Application Submitted',
      message: `Your application ${application.applicationNumber} has been received and queued for review.`,
      type: 'INFO',
      category: 'APPLICATION',
      relatedEntityId: application._id,
      link: `/applications/${application._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Verification application submitted successfully',
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign LMO Officer or GATC Centre
// @route   POST /api/applications/:id/assign
// @access  Private (SUPER_ADMIN, LMO)
const assignOfficerOrGATC = async (req, res, next) => {
  try {
    const { officerId, gatcId, notes } = req.body;
    const application = await VerificationApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (officerId) application.assignedOfficer = officerId;
    if (gatcId) application.assignedGATC = gatcId;
    if (notes) application.officerNotes = notes;

    application.status = APPLICATION_STATUS.ASSIGNED;
    application.statusHistory.push({
      status: APPLICATION_STATUS.ASSIGNED,
      changedBy: req.user._id,
      timestamp: new Date(),
      comment: notes || 'Assigned to verification officer / testing centre.'
    });

    await application.save();

    await logAuditEvent({
      req,
      user: req.user,
      action: 'APPLICATION_ASSIGNED',
      entityType: 'APPLICATION',
      entityId: application._id,
      description: `Application ${application.applicationNumber} assigned to officer/centre`
    });

    // Notify assigned officer
    if (officerId) {
      await createNotification({
        recipientId: officerId,
        title: 'New Verification Assigned',
        message: `Application ${application.applicationNumber} has been assigned to you for inspection scheduling.`,
        type: 'INFO',
        category: 'APPLICATION',
        relatedEntityId: application._id,
        link: `/applications/${application._id}`
      });
    }

    res.json({
      success: true,
      message: 'Officer/Centre assigned successfully',
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule inspection for application
// @route   POST /api/applications/:id/schedule
// @access  Private (LMO, GATC, SUPER_ADMIN)
const scheduleInspection = async (req, res, next) => {
  try {
    const { date, startTime, endTime, location, notes } = req.body;
    const application = await VerificationApplication.findById(req.params.id).populate('instrument applicant');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const officerId = application.assignedOfficer || req.user._id;

    // Check for officer schedule overlap
    const existingConflict = await Schedule.findOne({
      officer: officerId,
      date: new Date(date),
      startTime,
      status: { $in: ['SCHEDULED', 'IN_PROGRESS'] }
    });

    if (existingConflict) {
      return res.status(400).json({
        success: false,
        message: `Officer already has an inspection scheduled on ${new Date(date).toLocaleDateString()} at ${startTime}. Please select a different time.`
      });
    }

    const schedule = await Schedule.create({
      application: application._id,
      officer: officerId,
      gatc: application.assignedGATC,
      date: new Date(date),
      startTime,
      endTime,
      location: location || {
        facilityName: application.instrument?.location?.facilityName,
        address: application.instrument?.location?.address,
        city: application.instrument?.location?.city
      },
      notes
    });

    application.schedule = schedule._id;
    application.status = APPLICATION_STATUS.SCHEDULED;
    application.statusHistory.push({
      status: APPLICATION_STATUS.SCHEDULED,
      changedBy: req.user._id,
      timestamp: new Date(),
      comment: `Inspection scheduled for ${new Date(date).toLocaleDateString()} at ${startTime} - ${endTime}`
    });

    await application.save();

    await logAuditEvent({
      req,
      user: req.user,
      action: 'INSPECTION_SCHEDULED',
      entityType: 'SCHEDULE',
      entityId: schedule._id,
      description: `Scheduled inspection for application ${application.applicationNumber}`
    });

    // Notify applicant
    await createNotification({
      recipientId: application.applicant._id,
      title: 'Inspection Scheduled',
      message: `Inspection for application ${application.applicationNumber} has been scheduled for ${new Date(date).toLocaleDateString()} at ${startTime}.`,
      type: 'INFO',
      category: 'INSPECTION',
      relatedEntityId: application._id,
      link: `/applications/${application._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Inspection scheduled successfully',
      schedule,
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit approval or rejection decision
// @route   POST /api/applications/:id/decision
// @access  Private (LMO, SUPER_ADMIN)
const submitDecision = async (req, res, next) => {
  try {
    const { decision, remarks, rejectionReason } = req.body;
    const application = await VerificationApplication.findById(req.params.id).populate('applicant instrument');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (decision === 'APPROVED') {
      application.status = APPLICATION_STATUS.APPROVED;
      application.approvalRemarks = remarks || 'Metrological verification criteria satisfied.';
      application.statusHistory.push({
        status: APPLICATION_STATUS.APPROVED,
        changedBy: req.user._id,
        timestamp: new Date(),
        comment: remarks || 'Verification approved by officer.'
      });

      await application.save();

      await logAuditEvent({
        req,
        user: req.user,
        action: 'APPLICATION_APPROVED',
        entityType: 'APPLICATION',
        entityId: application._id,
        description: `Application ${application.applicationNumber} approved by ${req.user.name}`
      });

      await createNotification({
        recipientId: application.applicant._id,
        title: '🎉 Application Approved',
        message: `Your verification application ${application.applicationNumber} has been approved. Digital certificate is ready for generation.`,
        type: 'SUCCESS',
        category: 'APPLICATION',
        relatedEntityId: application._id,
        link: `/applications/${application._id}`
      });
    } else if (decision === 'REJECTED') {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is mandatory when rejecting a verification application.'
        });
      }

      application.status = APPLICATION_STATUS.REJECTED;
      application.rejectionReason = rejectionReason;
      application.statusHistory.push({
        status: APPLICATION_STATUS.REJECTED,
        changedBy: req.user._id,
        timestamp: new Date(),
        comment: `Rejected: ${rejectionReason}`
      });

      await application.save();

      if (application.instrument) {
        await Instrument.findByIdAndUpdate(application.instrument._id, {
          status: INSTRUMENT_STATUS.REJECTED
        });
      }

      await logAuditEvent({
        req,
        user: req.user,
        action: 'APPLICATION_REJECTED',
        entityType: 'APPLICATION',
        entityId: application._id,
        description: `Application ${application.applicationNumber} rejected: ${rejectionReason}`
      });

      await createNotification({
        recipientId: application.applicant._id,
        title: '⚠️ Application Rejected',
        message: `Your verification application ${application.applicationNumber} was rejected. Reason: ${rejectionReason}`,
        type: 'ALERT',
        category: 'APPLICATION',
        relatedEntityId: application._id,
        link: `/applications/${application._id}`
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid decision. Must be APPROVED or REJECTED.' });
    }

    res.json({
      success: true,
      message: `Application marked as ${decision}`,
      application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status directly (Admin/Workflow engine)
// @route   PUT /api/applications/:id/status
// @access  Private (LMO, SUPER_ADMIN)
const updateStatus = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    const application = await VerificationApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedBy: req.user._id,
      timestamp: new Date(),
      comment: comment || `Status updated to ${status}`
    });

    await application.save();

    await logAuditEvent({
      req,
      user: req.user,
      action: 'APPLICATION_STATUS_UPDATED',
      entityType: 'APPLICATION',
      entityId: application._id,
      description: `Status changed to ${status} for application ${application.applicationNumber}`
    });

    res.json({
      success: true,
      message: 'Status updated successfully',
      application
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  assignOfficerOrGATC,
  scheduleInspection,
  submitDecision,
  updateStatus
};
