const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { getPagination } = require('../utils/pagination');
const { logAction } = require('../services/auditLogger');

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) filter.$or = [
    { name: new RegExp(req.query.search, 'i') },
    { email: new RegExp(req.query.search, 'i') },
  ];

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  sendResponse(res, 200, { users, page, limit, total }, 'Users fetched.');
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  sendResponse(res, 200, { user }, 'User fetched.');
});

const updateUser = asyncHandler(async (req, res) => {
  const isSelf = req.params.id === req.user._id.toString();
  if (!isSelf && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only edit your own profile.');
  }

  const allowedFields = ['name', 'phone'];
  if (req.user.role === 'admin') allowedFields.push('isActive', 'role', 'isVerified');

  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found.');

  await logAction(req.user._id, 'update_user', 'User', user._id, updates);
  sendResponse(res, 200, { user }, 'User updated.');
});

module.exports = { listUsers, getUser, updateUser };
