const express = require('express');
const router = express.Router();
const {
  createBooking, getBooking, listMyBookings, listAllBookings, rescheduleBooking, cancelBooking,
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { rescheduleSchema } = require('../validators/booking.validator');

router.use(protect);

router.post('/', requireRole('customer'), createBooking);
router.get('/mine', requireRole('customer', 'provider'), listMyBookings);
router.get('/', requireRole('admin', 'ops'), listAllBookings);
router.get('/:id', getBooking);
router.patch('/:id/reschedule', validate(rescheduleSchema), rescheduleBooking);
router.post('/:id/cancel', cancelBooking);

module.exports = router;
