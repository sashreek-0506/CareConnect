const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// Verifies the JWT and attaches the authenticated user to req.user
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Not authenticated. Please log in.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (err) {
    throw new ApiError(401, 'Session expired or invalid. Please log in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Account not found or deactivated.');
  }

  req.user = user;
  next();
});

module.exports = { protect };
