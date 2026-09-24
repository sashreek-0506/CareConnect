const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/categories', require('./category.routes'));
router.use('/providers', require('./provider.routes'));
router.use('/availability', require('./availability.routes'));
router.use('/requests', require('./request.routes'));
router.use('/quotes', require('./quote.routes'));
router.use('/bookings', require('./booking.routes'));
router.use('/jobs', require('./job.routes'));
router.use('/invoices', require('./invoice.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/disputes', require('./dispute.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/ai', require('./ai.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/audit-logs', require('./auditLog.routes'));

router.get('/health', (req, res) => res.json({ success: true, message: 'CareConnect API is running.' }));

module.exports = router;
