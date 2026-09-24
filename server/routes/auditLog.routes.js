const express = require('express');
const router = express.Router();
const { listAuditLogs } = require('../controllers/auditLog.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/', protect, requireRole('admin'), listAuditLogs);

module.exports = router;
