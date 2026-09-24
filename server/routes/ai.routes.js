const express = require('express');
const router = express.Router();
const { classify, rank } = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/classify', classify);
router.post('/rank-providers', rank);

module.exports = router;
