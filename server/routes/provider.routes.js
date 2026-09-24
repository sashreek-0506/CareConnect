const express = require('express');
const router = express.Router();
const {
  listProviders, listAllProviders, getProvider, getMyProviderProfile,
  updateMyProviderProfile, setVerificationStatus,
} = require('../controllers/provider.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { providerProfileSchema, verificationSchema } = require('../validators/provider.validator');

router.get('/', listProviders);
router.get('/admin/all', protect, requireRole('admin', 'ops'), listAllProviders);
router.get('/me', protect, requireRole('provider'), getMyProviderProfile);
router.patch('/me', protect, requireRole('provider'), validate(providerProfileSchema), updateMyProviderProfile);
router.get('/:id', getProvider);
router.patch('/:id/verify', protect, requireRole('admin'), validate(verificationSchema), setVerificationStatus);

module.exports = router;
