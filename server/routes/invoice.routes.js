const express = require('express');
const router = express.Router();
const { getInvoiceForBooking, generateInvoice, listMyInvoices } = require('../controllers/invoice.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(protect);

router.get('/mine', requireRole('customer', 'provider'), listMyInvoices);
router.get('/booking/:bookingId', getInvoiceForBooking);
router.post('/booking/:bookingId/generate', requireRole('admin', 'ops'), generateInvoice);

module.exports = router;
