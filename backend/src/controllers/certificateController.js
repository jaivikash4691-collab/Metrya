const path = require('path');
const fs = require('fs');
const Certificate = require('../models/Certificate');
const VerificationApplication = require('../models/VerificationApplication');
const Instrument = require('../models/Instrument');
const Inspection = require('../models/Inspection');
const { generateCertificateNumber } = require('../utils/idGenerator');
const { generateCertificateQRCode } = require('../services/qrService');
const { generateCertificatePDF } = require('../services/pdfGenerator');
const { logAuditEvent } = require('../utils/auditLogger');
const { createNotification } = require('../utils/notificationHelper');
const { ROLES, CERTIFICATE_STATUS, INSTRUMENT_STATUS, APPLICATION_STATUS } = require('../config/constants');

// @desc    Generate digital certificate for approved application
// @route   POST /api/certificates/generate/:applicationId
// @access  Private (LMO, SUPER_ADMIN)
const generateCertificate = async (req, res, next) => {
  try {
    const application = await VerificationApplication.findById(req.params.applicationId)
      .populate('applicant')
      .populate({
        path: 'instrument',
        populate: { path: 'category' }
      })
      .populate('inspection')
      .populate('assignedOfficer')
      .populate('assignedGATC');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.status !== APPLICATION_STATUS.APPROVED && application.status !== APPLICATION_STATUS.INSPECTION_COMPLETED) {
      return res.status(400).json({
        success: false,
        message: `Cannot generate certificate for application in status "${application.status}". Must be APPROVED or INSPECTION_COMPLETED.`
      });
    }

    // Check if certificate already exists
    let existingCert = await Certificate.findOne({ application: application._id });
    if (existingCert) {
      return res.json({
        success: true,
        message: 'Certificate already exists for this application',
        certificate: existingCert
      });
    }

    const instrument = application.instrument;
    const inspection = application.inspection;

    const certificateNumber = generateCertificateNumber();
    const { qrDataUrl, verifyUrl } = await generateCertificateQRCode(certificateNumber);

    const issueDate = new Date();
    const validFrom = new Date();
    const frequencyMonths = instrument.verificationFrequencyMonths || 12;
    const validUntil = new Date(validFrom);
    validUntil.setMonth(validUntil.getMonth() + frequencyMonths);

    const maxObservedError = inspection?.measurements?.length
      ? Math.max(...inspection.measurements.map((m) => Math.abs(m.error)))
      : 0;

    const certData = {
      certificateNumber,
      application: application._id,
      instrument: instrument._id,
      owner: application.applicant._id,
      officer: application.assignedOfficer?._id || req.user._id,
      gatc: application.assignedGATC?._id,
      inspection: inspection?._id,
      issueDate,
      validFrom,
      validUntil,
      verificationDate: inspection?.inspectionDate || issueDate,
      status: CERTIFICATE_STATUS.VALID,
      instrumentSnapshot: {
        instrumentId: instrument.instrumentId,
        categoryName: instrument.category?.name || 'Weighing Instrument',
        instrumentType: instrument.instrumentType,
        manufacturer: instrument.manufacturer,
        model: instrument.model,
        serialNumber: instrument.serialNumber,
        capacity: instrument.capacity,
        unit: instrument.unit,
        accuracyClass: instrument.accuracyClass,
        location: instrument.location
      },
      verificationSummary: {
        maxObservedError,
        maxPermissibleError: 0.1,
        sealNumber: inspection?.sealingDetails?.newSealNumber || 'LM-SEAL-VERIFIED',
        stampingQuarter: inspection?.sealingDetails?.stampingQuarter || 'Q1',
        stampingYear: inspection?.sealingDetails?.stampingYear || new Date().getFullYear()
      },
      qrCodeDataUrl: qrDataUrl,
      qrVerificationUrl: verifyUrl,
      remarks: application.approvalRemarks || 'Complies with Legal Metrology Verification Standards.'
    };

    const certificate = await Certificate.create(certData);

    // Generate physical PDF document
    const pdfDir = path.join(__dirname, '../../uploads/certificates');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    const pdfFilePath = path.join(pdfDir, `${certificateNumber}.pdf`);

    // Populate for PDF rendering
    const populatedForPdf = await Certificate.findById(certificate._id)
      .populate('owner', 'name organization phone')
      .populate('officer', 'name officerBadgeNumber jurisdiction')
      .populate('gatc', 'name gatcCentreName')
      .populate('application', 'applicationNumber');

    await generateCertificatePDF(populatedForPdf, pdfFilePath);

    certificate.pdfPath = `/uploads/certificates/${certificateNumber}.pdf`;
    await certificate.save();

    // Update Application and Instrument
    application.certificate = certificate._id;
    application.status = APPLICATION_STATUS.CERTIFICATE_GENERATED;
    application.statusHistory.push({
      status: APPLICATION_STATUS.CERTIFICATE_GENERATED,
      changedBy: req.user._id,
      timestamp: new Date(),
      comment: `Digital certificate generated: ${certificateNumber}`
    });
    await application.save();

    instrument.status = INSTRUMENT_STATUS.VERIFIED;
    instrument.lastVerificationDate = validFrom;
    instrument.nextVerificationDate = validUntil;
    instrument.currentCertificate = certificate._id;
    await instrument.save();

    await logAuditEvent({
      req,
      user: req.user,
      action: 'CERTIFICATE_GENERATED',
      entityType: 'CERTIFICATE',
      entityId: certificate._id,
      description: `Generated certificate ${certificateNumber} for instrument ${instrument.instrumentId}`
    });

    // Notify Owner
    await createNotification({
      recipientId: application.applicant._id,
      title: '📜 Digital Certificate Issued',
      message: `Your certificate ${certificateNumber} has been issued and is now active. Valid until ${validUntil.toLocaleDateString()}.`,
      type: 'SUCCESS',
      category: 'CERTIFICATE',
      relatedEntityId: certificate._id,
      link: `/certificates`
    });

    res.status(201).json({
      success: true,
      message: 'Certificate generated successfully',
      certificate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all certificates (with filters)
// @route   GET /api/certificates
// @access  Private
const getCertificates = async (req, res, next) => {
  try {
    const { status, expiringWithinDays, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (req.user.role === ROLES.USER) {
      query.owner = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    if (expiringWithinDays) {
      const days = parseInt(expiringWithinDays);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      query.validUntil = { $gte: new Date(), $lte: targetDate };
      query.status = CERTIFICATE_STATUS.VALID;
    }

    if (search) {
      query.$or = [
        { certificateNumber: { $regex: search, $options: 'i' } },
        { 'instrumentSnapshot.instrumentId': { $regex: search, $options: 'i' } },
        { 'instrumentSnapshot.serialNumber': { $regex: search, $options: 'i' } },
        { 'instrumentSnapshot.manufacturer': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Certificate.countDocuments(query);

    const certificates = await Certificate.find(query)
      .populate('owner', 'name email organization phone')
      .populate('officer', 'name email jurisdiction officerBadgeNumber')
      .populate('gatc', 'name gatcCentreName')
      .populate('instrument')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: certificates.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      certificates
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single certificate by ID
// @route   GET /api/certificates/:id
// @access  Private
const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('owner', 'name email organization phone address businessRegistrationNumber')
      .populate('officer', 'name email jurisdiction officerBadgeNumber')
      .populate('gatc', 'name gatcCentreName email phone')
      .populate({
        path: 'instrument',
        populate: { path: 'category' }
      })
      .populate('application')
      .populate('inspection');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    if (req.user.role === ROLES.USER && certificate.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this certificate.' });
    }

    res.json({
      success: true,
      certificate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download Certificate PDF
// @route   GET /api/certificates/:id/download
// @access  Public / Private
const downloadCertificatePDF = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('owner', 'name organization phone')
      .populate('officer', 'name officerBadgeNumber jurisdiction')
      .populate('gatc', 'name gatcCentreName')
      .populate('application', 'applicationNumber');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Metrya-Certificate-${certificate.certificateNumber}.pdf"`
    );

    await generateCertificatePDF(certificate, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke certificate (Admin/LMO)
// @route   POST /api/certificates/:id/revoke
// @access  Private (SUPER_ADMIN, LMO)
const revokeCertificate = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Revocation reason is required.' });
    }

    const certificate = await Certificate.findById(req.params.id).populate('instrument owner');
    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    certificate.status = CERTIFICATE_STATUS.REVOKED;
    certificate.revocationReason = reason;
    certificate.revokedAt = new Date();
    certificate.revokedBy = req.user._id;
    await certificate.save();

    if (certificate.instrument) {
      await Instrument.findByIdAndUpdate(certificate.instrument._id, {
        status: INSTRUMENT_STATUS.REJECTED
      });
    }

    await logAuditEvent({
      req,
      user: req.user,
      action: 'CERTIFICATE_REVOKED',
      entityType: 'CERTIFICATE',
      entityId: certificate._id,
      description: `Revoked certificate ${certificate.certificateNumber}. Reason: ${reason}`
    });

    await createNotification({
      recipientId: certificate.owner._id,
      title: '🚨 Certificate Revoked',
      message: `Certificate ${certificate.certificateNumber} has been revoked by authorities. Reason: ${reason}`,
      type: 'ALERT',
      category: 'CERTIFICATE',
      relatedEntityId: certificate._id,
      link: `/certificates`
    });

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      certificate
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateCertificate,
  getCertificates,
  getCertificateById,
  downloadCertificatePDF,
  revokeCertificate
};
