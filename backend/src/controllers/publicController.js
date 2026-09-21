const Certificate = require('../models/Certificate');

// @desc    Public verification of certificate authenticity via QR or Search
// @route   GET /api/public/verify/:identifier
// @access  Public
const publicVerifyCertificate = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const query = {
      $or: [
        { certificateNumber: identifier.toUpperCase().trim() },
        { 'instrumentSnapshot.instrumentId': identifier.toUpperCase().trim() },
        { 'instrumentSnapshot.serialNumber': identifier.trim() }
      ]
    };

    // If identifier is a valid 24-char hex mongo ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      query.$or.push({ _id: identifier });
    }

    const cert = await Certificate.findOne(query)
      .populate('officer', 'jurisdiction officerBadgeNumber')
      .populate('gatc', 'gatcCentreName');

    if (!cert) {
      return res.status(404).json({
        success: false,
        status: 'NOT_FOUND',
        message: 'No active legal metrology verification certificate found for this identifier.'
      });
    }

    // Determine real-time validity status
    let currentStatus = cert.status;
    const now = new Date();
    if (currentStatus === 'VALID' && new Date(cert.validUntil) < now) {
      currentStatus = 'EXPIRED';
    }

    const daysRemaining = Math.max(0, Math.ceil((new Date(cert.validUntil) - now) / (1000 * 60 * 60 * 24)));

    // Return sanitized public compliance response
    const publicData = {
      certificateNumber: cert.certificateNumber,
      status: currentStatus,
      isValid: currentStatus === 'VALID',
      isExpired: currentStatus === 'EXPIRED',
      isRevoked: currentStatus === 'REVOKED',
      issueDate: cert.issueDate,
      verificationDate: cert.verificationDate,
      validFrom: cert.validFrom,
      validUntil: cert.validUntil,
      daysRemaining: currentStatus === 'VALID' ? daysRemaining : 0,
      instrument: {
        instrumentId: cert.instrumentSnapshot?.instrumentId,
        category: cert.instrumentSnapshot?.categoryName,
        instrumentType: cert.instrumentSnapshot?.instrumentType,
        manufacturer: cert.instrumentSnapshot?.manufacturer,
        model: cert.instrumentSnapshot?.model,
        serialNumber: cert.instrumentSnapshot?.serialNumber,
        capacity: cert.instrumentSnapshot?.capacity,
        unit: cert.instrumentSnapshot?.unit,
        accuracyClass: cert.instrumentSnapshot?.accuracyClass,
        city: cert.instrumentSnapshot?.location?.city,
        state: cert.instrumentSnapshot?.location?.state
      },
      verificationSeal: {
        sealNumber: cert.verificationSummary?.sealNumber,
        stampingQuarter: cert.verificationSummary?.stampingQuarter,
        stampingYear: cert.verificationSummary?.stampingYear
      },
      authority: {
        officerBadge: cert.officer?.officerBadgeNumber,
        jurisdiction: cert.officer?.jurisdiction || 'Department of Legal Metrology',
        verificationCentre: cert.gatc?.gatcCentreName || 'Govt. Approved Testing Centre (GATC)'
      },
      verifiedAt: now
    };

    res.json({
      success: true,
      data: publicData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  publicVerifyCertificate
};
