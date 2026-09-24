const express = require('express');
const router = express.Router();
const {
  createQuote, listQuotesForRequest, listMyQuotes, withdrawQuote,
} = require('../controllers/quote.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createQuoteSchema } = require('../validators/quote.validator');

router.use(protect);

router.post('/', requireRole('provider'), validate(createQuoteSchema), createQuote);
router.get('/mine', requireRole('provider'), listMyQuotes);
router.get('/request/:requestId', listQuotesForRequest);
router.post('/:id/withdraw', requireRole('provider'), withdrawQuote);

module.exports = router;
