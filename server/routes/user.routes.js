const express = require('express');
const router = express.Router();
const { listUsers, getUser, updateUser } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');

router.use(protect);
router.get('/', requireRole('admin', 'ops'), listUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);

module.exports = router;
