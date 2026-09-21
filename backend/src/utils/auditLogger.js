const AuditLog = require('../models/AuditLog');

const logAuditEvent = async ({
  req,
  user,
  action,
  entityType,
  entityId,
  description,
  metadata = {}
}) => {
  try {
    const actorUser = user || (req && req.user);
    const ip = req ? req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress : 'system';
    const userAgent = req ? req.headers['user-agent'] : 'system';

    await AuditLog.create({
      user: actorUser ? actorUser._id : null,
      userName: actorUser ? actorUser.name : 'System',
      userEmail: actorUser ? actorUser.email : 'system@metrya.gov.in',
      role: actorUser ? actorUser.role : 'SYSTEM',
      action,
      entityType,
      entityId: entityId ? entityId.toString() : null,
      description,
      ipAddress: ip,
      userAgent,
      metadata,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
};

module.exports = { logAuditEvent };
