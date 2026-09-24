const AuditLog = require('../models/AuditLog');

async function logAction(actorId, action, resourceType, resourceId, meta = {}) {
  try {
    await AuditLog.create({ actor: actorId, action, resourceType, resourceId, meta });
  } catch (err) {
    // Audit logging must never break the primary request flow.
    console.error('[audit] failed to write audit log:', err.message);
  }
}

module.exports = { logAction };
