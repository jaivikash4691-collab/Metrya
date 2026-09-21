const User = require('../models/User');
const Instrument = require('../models/Instrument');
const InstrumentCategory = require('../models/InstrumentCategory');
const VerificationApplication = require('../models/VerificationApplication');
const Certificate = require('../models/Certificate');
const AuditLog = require('../models/AuditLog');
const VerificationRule = require('../models/VerificationRule');
const Schedule = require('../models/Schedule');
const { ROLES, APPLICATION_STATUS, CERTIFICATE_STATUS } = require('../config/constants');
const { logAuditEvent } = require('../utils/auditLogger');

// @desc    Get comprehensive system & department analytics
// @route   GET /api/admin/analytics
// @access  Private (SUPER_ADMIN, LMO)
const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInstruments = await Instrument.countDocuments();
    const totalApplications = await VerificationApplication.countDocuments();
    const activeCertificates = await Certificate.countDocuments({ status: CERTIFICATE_STATUS.VALID });
    const expiredCertificates = await Certificate.countDocuments({ status: CERTIFICATE_STATUS.EXPIRED });

    const pendingApplications = await VerificationApplication.countDocuments({
      status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'SCHEDULED'] }
    });

    const approvedApplications = await VerificationApplication.countDocuments({
      status: { $in: ['APPROVED', 'CERTIFICATE_GENERATED'] }
    });

    const rejectedApplications = await VerificationApplication.countDocuments({
      status: 'REJECTED'
    });

    // Today's scheduled inspections
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayInspectionsCount = await Schedule.countDocuments({
      date: { $gte: startOfToday, $lte: endOfToday }
    });

    // Status distribution
    const statusDistributionRaw = await VerificationApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusDistribution = statusDistributionRaw.map((s) => ({
      status: s._id,
      count: s.count
    }));

    // Category distribution
    const categoryDistribution = await Instrument.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'instrumentcategories',
          localField: '_id',
          foreignField: '_id',
          as: 'cat'
        }
      },
      { $unwind: '$cat' },
      { $project: { name: '$cat.name', code: '$cat.code', count: 1 } }
    ]);

    // Monthly verification application trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyTrends = await VerificationApplication.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: {
              $cond: [{ $in: ['$status', ['APPROVED', 'CERTIFICATE_GENERATED']] }, 1, 0]
            }
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0]
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedTrends = monthlyTrends.map((t) => ({
      month: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      applications: t.total,
      approved: t.approved,
      rejected: t.rejected
    }));

    // Officer Workload
    const officerWorkload = await VerificationApplication.aggregate([
      { $match: { assignedOfficer: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$assignedOfficer',
          assigned: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $in: ['$status', ['INSPECTION_COMPLETED', 'APPROVED', 'CERTIFICATE_GENERATED']] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $in: ['$status', ['ASSIGNED', 'SCHEDULED', 'INSPECTION_IN_PROGRESS']] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'officer'
        }
      },
      { $unwind: '$officer' },
      {
        $project: {
          officerName: '$officer.name',
          jurisdiction: '$officer.jurisdiction',
          assigned: 1,
          completed: 1,
          pending: 1
        }
      },
      { $sort: { assigned: -1 } }
    ]);

    res.json({
      success: true,
      summary: {
        totalUsers,
        totalInstruments,
        totalApplications,
        activeCertificates,
        expiredCertificates,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        todayInspectionsCount
      },
      statusDistribution,
      categoryDistribution,
      monthlyTrends: formattedTrends,
      officerWorkload
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (SUPER_ADMIN)
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, entityType, search, page = 1, limit = 30 } = req.query;
    const query = {};

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);

    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: logs.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      logs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get verification tolerance rules
// @route   GET /api/admin/rules
// @access  Private
const getVerificationRules = async (req, res, next) => {
  try {
    const rules = await VerificationRule.find().populate('category', 'name code').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: rules.length,
      rules
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create verification rule
// @route   POST /api/admin/rules
// @access  Private (SUPER_ADMIN)
const createVerificationRule = async (req, res, next) => {
  try {
    const rule = await VerificationRule.create(req.body);

    await logAuditEvent({
      req,
      user: req.user,
      action: 'VERIFICATION_RULE_CREATED',
      entityType: 'RULE',
      entityId: rule._id,
      description: `Created verification rule: ${rule.name}`
    });

    res.status(201).json({
      success: true,
      message: 'Verification rule created successfully',
      rule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update verification rule
// @route   PUT /api/admin/rules/:id
// @access  Private (SUPER_ADMIN)
const updateVerificationRule = async (req, res, next) => {
  try {
    const rule = await VerificationRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    res.json({
      success: true,
      message: 'Verification rule updated successfully',
      rule
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export system report in CSV format
// @route   GET /api/admin/export-report
// @access  Private (SUPER_ADMIN, LMO)
const exportReport = async (req, res, next) => {
  try {
    const { type = 'applications' } = req.query;

    if (type === 'applications') {
      const apps = await VerificationApplication.find()
        .populate('applicant', 'name email organization')
        .populate('instrument', 'instrumentId instrumentType manufacturer serialNumber')
        .populate('assignedOfficer', 'name jurisdiction')
        .sort({ createdAt: -1 });

      let csv = 'Application No,Submission Date,Applicant,Organization,Instrument ID,Type,Serial No,Status,Assigned Officer,Priority\n';
      apps.forEach((a) => {
        csv += `"${a.applicationNumber}","${new Date(a.submissionDate).toLocaleDateString()}","${a.applicant?.name || ''}","${a.applicant?.organization || ''}","${a.instrument?.instrumentId || ''}","${a.instrument?.instrumentType || ''}","${a.instrument?.serialNumber || ''}","${a.status}","${a.assignedOfficer?.name || 'Unassigned'}","${a.priority}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="Metrya-Applications-Report.csv"');
      return res.send(csv);
    }

    if (type === 'certificates') {
      const certs = await Certificate.find()
        .populate('owner', 'name organization')
        .populate('officer', 'name jurisdiction')
        .sort({ issueDate: -1 });

      let csv = 'Certificate No,Issue Date,Valid From,Valid Until,Status,Owner,Organization,Instrument ID,Serial No,Manufacturer,Seal No,Officer\n';
      certs.forEach((c) => {
        csv += `"${c.certificateNumber}","${new Date(c.issueDate).toLocaleDateString()}","${new Date(c.validFrom).toLocaleDateString()}","${new Date(c.validUntil).toLocaleDateString()}","${c.status}","${c.owner?.name || ''}","${c.owner?.organization || ''}","${c.instrumentSnapshot?.instrumentId || ''}","${c.instrumentSnapshot?.serialNumber || ''}","${c.instrumentSnapshot?.manufacturer || ''}","${c.verificationSummary?.sealNumber || ''}","${c.officer?.name || ''}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="Metrya-Certificates-Report.csv"');
      return res.send(csv);
    }

    if (type === 'instruments') {
      const insts = await Instrument.find()
        .populate('owner', 'name organization')
        .populate('category', 'name code')
        .sort({ createdAt: -1 });

      let csv = 'Instrument ID,Type,Category,Manufacturer,Model,Serial No,Capacity,Unit,Class,Status,Owner,City,State\n';
      insts.forEach((i) => {
        csv += `"${i.instrumentId}","${i.instrumentType}","${i.category?.name || ''}","${i.manufacturer}","${i.model}","${i.serialNumber}","${i.capacity}","${i.unit}","${i.accuracyClass}","${i.status}","${i.owner?.name || ''}","${i.location?.city || ''}","${i.location?.state || ''}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="Metrya-Instruments-Registry.csv"');
      return res.send(csv);
    }

    res.status(400).json({ success: false, message: 'Invalid export type. Supported: applications, certificates, instruments' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getAuditLogs,
  getVerificationRules,
  createVerificationRule,
  updateVerificationRule,
  exportReport
};
