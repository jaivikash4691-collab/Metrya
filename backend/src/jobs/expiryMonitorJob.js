const Certificate = require('../models/Certificate');
const Instrument = require('../models/Instrument');
const Notification = require('../models/Notification');
const { NOTIFICATION_TYPES, CERTIFICATE_STATUS, INSTRUMENT_STATUS } = require('../config/constants');
const { logAuditEvent } = require('../utils/auditLogger');

const runExpiryMonitorJob = async () => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Mark expired certificates
    const expiredCertificates = await Certificate.find({
      status: CERTIFICATE_STATUS.VALID,
      validUntil: { $lt: now }
    }).populate('owner instrument');

    for (const cert of expiredCertificates) {
      cert.status = CERTIFICATE_STATUS.EXPIRED;
      await cert.save();

      if (cert.instrument) {
        await Instrument.findByIdAndUpdate(cert.instrument._id, {
          status: INSTRUMENT_STATUS.EXPIRED
        });
      }

      // Check if notification already sent
      const existingNotification = await Notification.findOne({
        recipient: cert.owner._id,
        category: 'EXPIRY',
        relatedEntityId: cert.certificateNumber,
        title: { $regex: /Certificate Expired/i }
      });

      if (!existingNotification) {
        await Notification.create({
          recipient: cert.owner._id,
          title: `⚠️ Certificate Expired: ${cert.certificateNumber}`,
          message: `Your verification certificate for instrument ${cert.instrumentSnapshot?.instrumentType || 'Scale'} (${cert.instrumentSnapshot?.serialNumber}) has expired on ${new Date(cert.validUntil).toLocaleDateString()}. Please submit a re-verification application immediately.`,
          type: NOTIFICATION_TYPES.ALERT,
          category: 'EXPIRY',
          relatedEntityId: cert.certificateNumber,
          link: `/instruments/${cert.instrument?._id || ''}`
        });

        await logAuditEvent({
          action: 'CERTIFICATE_EXPIRED_AUTO',
          entityType: 'CERTIFICATE',
          entityId: cert._id,
          description: `Certificate ${cert.certificateNumber} transitioned to EXPIRED automatically by system daemon.`
        });
      }
    }

    // 2. Check approaching expiry thresholds (30, 15, 7, 1 days)
    const activeCertificates = await Certificate.find({
      status: CERTIFICATE_STATUS.VALID,
      validUntil: { $gte: now }
    }).populate('owner instrument');

    for (const cert of activeCertificates) {
      const diffTime = new Date(cert.validUntil).getTime() - now.getTime();
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const thresholds = [30, 15, 7, 1];
      for (const threshold of thresholds) {
        if (daysRemaining <= threshold && daysRemaining > threshold - 1) {
          const alertTag = `EXPIRY_ALERT_${threshold}D`;
          const alreadyNotified = await Notification.findOne({
            recipient: cert.owner._id,
            category: 'EXPIRY',
            relatedEntityId: cert.certificateNumber,
            title: { $regex: new RegExp(`${threshold} Days`, 'i') }
          });

          if (!alreadyNotified) {
            await Notification.create({
              recipient: cert.owner._id,
              title: `⏳ Verification Expiring in ${daysRemaining} Day${daysRemaining > 1 ? 's' : ''}`,
              message: `Certificate ${cert.certificateNumber} for ${cert.instrumentSnapshot?.instrumentType} (${cert.instrumentSnapshot?.serialNumber}) will expire on ${new Date(cert.validUntil).toLocaleDateString()}. Apply for renewal to avoid non-compliance.`,
              type: threshold <= 7 ? NOTIFICATION_TYPES.WARNING : NOTIFICATION_TYPES.INFO,
              category: 'EXPIRY',
              relatedEntityId: cert.certificateNumber,
              link: `/certificates`
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('[Expiry Monitor Job Error]', error.message);
  }
};

module.exports = { runExpiryMonitorJob };
