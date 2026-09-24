const express = require('express');
const router = express.Router();
const { createReview, listProviderReviews, respondToReview } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createReviewSchema } = require('../validators/review.validator');

router.get('/provider/:providerId', listProviderReviews);
router.post('/', protect, requireRole('customer'), validate(createReviewSchema), createReview);
router.patch('/:id/response', protect, requireRole('provider'), respondToReview);

module.exports = router;
