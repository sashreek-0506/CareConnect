const express = require('express');
const router = express.Router();
const {
  createDispute, listDisputes, getDispute, addDisputeNote, resolveDispute,
} = require('../controllers/dispute.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const validate = require('../middleware/validate.middleware');
const { createDisputeSchema, resolveDisputeSchema } = require('../validators/dispute.validator');

router.use(protect);

router.post('/', requireRole('customer', 'provider'), validate(createDisputeSchema), createDispute);
router.get('/', requireRole('admin', 'ops', 'support'), listDisputes);
router.get('/:id', getDispute);
router.post('/:id/notes', requireRole('admin', 'support'), addDisputeNote);
router.post('/:id/resolve', requireRole('admin', 'support'), validate(resolveDisputeSchema), resolveDispute);

module.exports = router;
