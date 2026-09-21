const Notification = require('../models/Notification');
const { NOTIFICATION_TYPES } = require('../config/constants');

const createNotification = async ({
  recipientId,
  title,
  message,
  type = NOTIFICATION_TYPES.INFO,
  link = '',
  category = 'SYSTEM',
  relatedEntityId = ''
}) => {
  try {
    if (!recipientId) return null;
    return await Notification.create({
      recipient: recipientId,
      title,
      message,
      type,
      link,
      category,
      relatedEntityId: relatedEntityId ? relatedEntityId.toString() : ''
    });
  } catch (error) {
    console.error('[Notification Creation Error]', error.message);
    return null;
  }
};

module.exports = { createNotification };
