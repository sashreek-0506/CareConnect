const ProviderProfile = require('../models/ProviderProfile');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { getPagination } = require('../utils/pagination');
const { logAction } = require('../services/auditLogger');
const { notify } = require('../services/notificationService');

// Public/customer-facing discovery: browse verified providers with filters.
const listProviders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { verificationStatus: 'approved' };

  if (req.query.category) filter.categories = req.query.category;
  if (req.query.area) filter.serviceAreas = req.query.area;
  if (req.query.skill) filter.skills = req.query.skill;
  if (req.query.minRating) filter.avgRating = { $gte: Number(req.query.minRating) };

  const [providers, total] = await Promise.all([
    ProviderProfile.find(filter)
      .populate('user', 'name email phone')
      .populate('categories', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ avgRating: -1 }),
    ProviderProfile.countDocuments(filter),
  ]);

  sendResponse(res, 200, { providers, page, limit, total }, 'Providers fetched.');
});

// Admin view: all providers regardless of verification status (for the verification queue).
const listAllProviders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.verificationStatus = req.query.status;

  const [providers, total] = await Promise.all([
    ProviderProfile.find(filter)
      .populate('user', 'name email phone isActive')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    ProviderProfile.countDocuments(filter),
  ]);

  sendResponse(res, 200, { providers, page, limit, total }, 'Providers fetched.');
});

const getProvider = asyncHandler(async (req, res) => {
  const provider = await ProviderProfile.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('categories', 'name');
  if (!provider) throw new ApiError(404, 'Provider not found.');
  sendResponse(res, 200, { provider }, 'Provider fetched.');
});

const getMyProviderProfile = asyncHandler(async (req, res) => {
  const provider = await ProviderProfile.findOne({ user: req.user._id }).populate('categories', 'name');
  if (!provider) throw new ApiError(404, 'Provider profile not found.');
  sendResponse(res, 200, { provider }, 'Provider profile fetched.');
});

const updateMyProviderProfile = asyncHandler(async (req, res) => {
  const provider = await ProviderProfile.findOneAndUpdate({ user: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!provider) throw new ApiError(404, 'Provider profile not found.');
  sendResponse(res, 200, { provider }, 'Profile updated.');
});

// Admin: approve/reject a provider's verification.
const setVerificationStatus = asyncHandler(async (req, res) => {
  const { verificationStatus, verificationNote } = req.body;

  const provider = await ProviderProfile.findByIdAndUpdate(
    req.params.id,
    { verificationStatus, verificationNote },
    { new: true }
  ).populate('user');
  if (!provider) throw new ApiError(404, 'Provider not found.');

  await User.findByIdAndUpdate(provider.user._id, { isVerified: verificationStatus === 'approved' });

  await notify(
    provider.user._id,
    'verification_result',
    `Your provider verification was ${verificationStatus}.${verificationNote ? ` Note: ${verificationNote}` : ''}`,
    'ProviderProfile',
    provider._id
  );

  await logAction(req.user._id, 'set_verification_status', 'ProviderProfile', provider._id, { verificationStatus });

  sendResponse(res, 200, { provider }, 'Verification status updated.');
});

module.exports = {
  listProviders,
  listAllProviders,
  getProvider,
  getMyProviderProfile,
  updateMyProviderProfile,
  setVerificationStatus,
};
