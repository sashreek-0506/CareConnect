const ServiceRequest = require('../models/ServiceRequest');
const ServiceCategory = require('../models/ServiceCategory');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { getPagination } = require('../utils/pagination');
const { classifyRequest } = require('../services/ai/classifyRequest');
const { rankProviders } = require('../services/ai/rankProviders');

const createRequest = asyncHandler(async (req, res) => {
  const payload = { ...req.body, customer: req.user._id };

  // Auto-classify with AI if the customer didn't pick a category themselves.
  if (!payload.category) {
    const classification = await classifyRequest(payload.description);
    payload.aiSuggestedCategory = {
      categoryName: classification.categoryName,
      skills: classification.skills,
      confidence: classification.confidence,
    };
    if (classification.categoryId) {
      payload.category = classification.categoryId;
      payload.requiredSkills = classification.skills;
    }
  } else {
    const category = await ServiceCategory.findById(payload.category);
    if (category) payload.requiredSkills = category.requiredSkills;
  }

  const request = await ServiceRequest.create(payload);
  sendResponse(res, 201, { request }, 'Service request created.');
});

const listMyRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { customer: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [requests, total] = await Promise.all([
    ServiceRequest.find(filter).populate('category', 'name').skip(skip).limit(limit).sort({ createdAt: -1 }),
    ServiceRequest.countDocuments(filter),
  ]);

  sendResponse(res, 200, { requests, page, limit, total }, 'Requests fetched.');
});

// Providers browse open requests that match their skills/area, so they know what to quote on.
const listMatchingRequests = asyncHandler(async (req, res) => {
  const ProviderProfile = require('../models/ProviderProfile');
  const provider = await ProviderProfile.findOne({ user: req.user._id });
  if (!provider) throw new ApiError(404, 'Provider profile not found.');

  const { page, limit, skip } = getPagination(req.query);
  const filter = { status: 'open' };
  if (provider.categories && provider.categories.length) {
    filter.category = { $in: provider.categories };
  }

  const [requests, total] = await Promise.all([
    ServiceRequest.find(filter).populate('category', 'name').skip(skip).limit(limit).sort({ createdAt: -1 }),
    ServiceRequest.countDocuments(filter),
  ]);

  sendResponse(res, 200, { requests, page, limit, total }, 'Matching requests fetched.');
});

// Ops/Admin: all requests, with filters.
const listAllRequests = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;

  const [requests, total] = await Promise.all([
    ServiceRequest.find(filter)
      .populate('category', 'name')
      .populate('customer', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    ServiceRequest.countDocuments(filter),
  ]);

  sendResponse(res, 200, { requests, page, limit, total }, 'Requests fetched.');
});

const getRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id)
    .populate('category', 'name requiredSkills')
    .populate('customer', 'name email phone');
  if (!request) throw new ApiError(404, 'Request not found.');
  sendResponse(res, 200, { request }, 'Request fetched.');
});

const updateRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findOne({ _id: req.params.id, customer: req.user._id });
  if (!request) throw new ApiError(404, 'Request not found.');
  if (request.status !== 'open') throw new ApiError(409, 'Only open requests can be edited.');

  Object.assign(request, req.body);
  await request.save();
  sendResponse(res, 200, { request }, 'Request updated.');
});

const cancelRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findOne({ _id: req.params.id, customer: req.user._id });
  if (!request) throw new ApiError(404, 'Request not found.');
  if (!['open', 'quoted'].includes(request.status)) {
    throw new ApiError(409, 'This request can no longer be cancelled directly; cancel the booking instead.');
  }

  request.status = 'cancelled';
  await request.save();
  sendResponse(res, 200, { request }, 'Request cancelled.');
});

// AI endpoint: re-run classification on demand (e.g. after editing the description).
const classify = asyncHandler(async (req, res) => {
  const { description } = req.body;
  if (!description) throw new ApiError(400, 'description is required.');
  const result = await classifyRequest(description);
  sendResponse(res, 200, { classification: result }, 'Classification complete.');
});

// AI endpoint: ranked provider list for a given request.
const rankProvidersForRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, 'Request not found.');

  const ranked = await rankProviders({
    categoryId: request.category,
    requiredSkills: request.requiredSkills,
    area: request.location && request.location.area,
    windowStart: request.preferredWindow && request.preferredWindow.start,
    windowEnd: request.preferredWindow && request.preferredWindow.end,
  });

  sendResponse(res, 200, { providers: ranked }, 'Providers ranked.');
});

module.exports = {
  createRequest,
  listMyRequests,
  listMatchingRequests,
  listAllRequests,
  getRequest,
  updateRequest,
  cancelRequest,
  classify,
  rankProvidersForRequest,
};
