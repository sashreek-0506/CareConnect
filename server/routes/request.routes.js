const express = require('express');
const router = express.Router();
const {
  createRequest, listMyRequests, listMatchingRequests, listAllRequests,
  getRequest, updateRequest, cancelRequest, classify, rankProvidersForRequest,
} = require('../controllers/request.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createRequestSchema } = require('../validators/request.validator');

router.use(protect);

router.post('/', requireRole('customer'), validate(createRequestSchema), createRequest);
router.get('/mine', requireRole('customer'), listMyRequests);
router.get('/matching', requireRole('provider'), listMatchingRequests);
router.get('/', requireRole('admin', 'ops'), listAllRequests);
router.post('/classify-preview', classify);
router.get('/:id', getRequest);
router.patch('/:id', requireRole('customer'), updateRequest);
router.post('/:id/cancel', requireRole('customer'), cancelRequest);
router.get('/:id/ranked-providers', rankProvidersForRequest);

module.exports = router;
