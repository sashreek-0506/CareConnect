const express = require('express');
const router = express.Router();
const { listMyNotifications, markAsRead, markAllAsRead } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', listMyNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

module.exports = router;
