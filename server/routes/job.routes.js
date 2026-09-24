const express = require('express');
const router = express.Router();
const { addJobUpdate, addEvidence, confirmCompletion } = require('../controllers/job.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { jobUpdateSchema } = require('../validators/booking.validator');

router.use(protect);

router.post('/:bookingId/updates', requireRole('provider'), validate(jobUpdateSchema), addJobUpdate);
router.post('/:bookingId/evidence', requireRole('provider'), addEvidence);
router.post('/:bookingId/confirm', requireRole('customer'), confirmCompletion);

module.exports = router;
