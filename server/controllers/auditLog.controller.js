const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const { getPagination } = require('../utils/pagination');

const listAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.resourceType) filter.resourceType = req.query.resourceType;
  if (req.query.actor) filter.actor = req.query.actor;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).populate('actor', 'name role').skip(skip).limit(limit).sort({ createdAt: -1 }),
    AuditLog.countDocuments(filter),
  ]);

  sendResponse(res, 200, { logs, page, limit, total }, 'Audit logs fetched.');
});

module.exports = { listAuditLogs };
