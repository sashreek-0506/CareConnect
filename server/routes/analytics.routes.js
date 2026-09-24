const express = require('express');
const router = express.Router();
const { dashboardSummary } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.get('/summary', protect, requireRole('admin', 'ops'), dashboardSummary);

module.exports = router;
