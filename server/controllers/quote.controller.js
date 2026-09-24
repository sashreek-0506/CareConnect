const Quote = require('../models/Quote');
const ServiceRequest = require('../models/ServiceRequest');
const ProviderProfile = require('../models/ProviderProfile');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { notify } = require('../services/notificationService');

const createQuote = asyncHandler(async (req, res) => {
  const provider = await ProviderProfile.findOne({ user: req.user._id });
  if (!provider) throw new ApiError(404, 'Provider profile not found.');
  if (provider.verificationStatus !== 'approved') {
    throw new ApiError(403, 'Only verified providers can submit quotes.');
  }

  const request = await ServiceRequest.findById(req.body.request);
  if (!request) throw new ApiError(404, 'Service request not found.');
  if (request.status !== 'open' && request.status !== 'quoted') {
    throw new ApiError(409, 'This request is no longer accepting quotes.');
  }

  const quote = await Quote.create({ ...req.body, provider: provider._id });

  if (request.status === 'open') {
    request.status = 'quoted';
    await request.save();
  }

  await notify(request.customer, 'quote_received', 'You received a new quote on your service request.', 'ServiceRequest', request._id);

  sendResponse(res, 201, { quote }, 'Quote submitted.');
});

const listQuotesForRequest = asyncHandler(async (req, res) => {
  const request = await ServiceRequest.findById(req.params.requestId);
  if (!request) throw new ApiError(404, 'Request not found.');

  const isOwner = request.customer.toString() === req.user._id.toString();
  if (!isOwner && !['admin', 'ops'].includes(req.user.role)) {
    throw new ApiError(403, 'You do not have access to these quotes.');
  }

  const quotes = await Quote.find({ request: req.params.requestId })
    .populate({ path: 'provider', populate: { path: 'user', select: 'name' } })
    .sort({ price: 1 });

  sendResponse(res, 200, { quotes }, 'Quotes fetched.');
});

const listMyQuotes = asyncHandler(async (req, res) => {
  const provider = await ProviderProfile.findOne({ user: req.user._id });
  if (!provider) throw new ApiError(404, 'Provider profile not found.');

  const filter = { provider: provider._id };
  if (req.query.status) filter.status = req.query.status;

  const quotes = await Quote.find(filter).populate('request', 'description status').sort({ createdAt: -1 });
  sendResponse(res, 200, { quotes }, 'Quotes fetched.');
});

const withdrawQuote = asyncHandler(async (req, res) => {
  const provider = await ProviderProfile.findOne({ user: req.user._id });
  const quote = await Quote.findOne({ _id: req.params.id, provider: provider._id });
  if (!quote) throw new ApiError(404, 'Quote not found.');
  if (quote.status !== 'pending') throw new ApiError(409, 'Only pending quotes can be withdrawn.');

  quote.status = 'withdrawn';
  await quote.save();
  sendResponse(res, 200, { quote }, 'Quote withdrawn.');
});

module.exports = { createQuote, listQuotesForRequest, listMyQuotes, withdrawQuote };
