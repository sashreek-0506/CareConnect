const Notification = require('../models/Notification');

// Single entry point for creating notifications so every part of the app
// produces them the same way.
async function notify(userId, type, message, relatedEntityType = null, relatedEntityId = null) {
  return Notification.create({
    user: userId,
    type,
    message,
    relatedEntityType,
    relatedEntityId,
  });
}

module.exports = { notify };
