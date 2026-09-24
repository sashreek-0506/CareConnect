const express = require('express');
const router = express.Router();
const {
  listMyAvailability, listProviderAvailability, addSlot, deleteSlot,
} = require('../controllers/availability.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { availabilitySlotSchema } = require('../validators/provider.validator');

router.get('/me', protect, requireRole('provider'), listMyAvailability);
router.post('/me', protect, requireRole('provider'), validate(availabilitySlotSchema), addSlot);
router.delete('/me/:id', protect, requireRole('provider'), deleteSlot);
router.get('/provider/:providerId', listProviderAvailability);

module.exports = router;
