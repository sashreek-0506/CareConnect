const express = require('express');
const router = express.Router();
const { register, login, refresh, me } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.get('/me', protect, me);

module.exports = router;
