const User = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists.');

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash, role, phone });

  if (role === 'provider') {
    await ProviderProfile.create({ user: user._id });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  sendResponse(res, 201, { user: user.toSafeObject(), accessToken, refreshToken }, 'Account created.');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw new ApiError(401, 'Invalid email or password.');

  const match = await user.comparePassword(password);
  if (!match) throw new ApiError(401, 'Invalid email or password.');

  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated.');

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  sendResponse(res, 200, { user: user.toSafeObject(), accessToken, refreshToken }, 'Logged in.');
});

const refresh = asyncHandler(async (req, res) => {
  const jwt = require('jsonwebtoken');
  const { jwtRefreshSecret } = require('../config/env');
  const { refreshToken } = req.body;

  if (!refreshToken) throw new ApiError(400, 'Refresh token is required.');

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, jwtRefreshSecret);
  } catch (err) {
    throw new ApiError(401, 'Refresh token invalid or expired. Please log in again.');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) throw new ApiError(401, 'Account not found or deactivated.');

  const accessToken = generateAccessToken(user);
  sendResponse(res, 200, { accessToken }, 'Token refreshed.');
});

const me = asyncHandler(async (req, res) => {
  sendResponse(res, 200, { user: req.user.toSafeObject() }, 'Current user.');
});

module.exports = { register, login, refresh, me };
