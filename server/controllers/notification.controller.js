const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const listMyNotifications = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.unreadOnly === 'true') filter.isRead = false;

  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(100);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  sendResponse(res, 200, { notifications, unreadCount }, 'Notifications fetched.');
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, 'Notification not found.');
  sendResponse(res, 200, { notification }, 'Marked as read.');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  sendResponse(res, 200, {}, 'All notifications marked as read.');
});

module.exports = { listMyNotifications, markAsRead, markAllAsRead };
