const Booking = require('../models/Booking');
const Quote = require('../models/Quote');
const ServiceRequest = require('../models/ServiceRequest');
const ProviderProfile = require('../models/ProviderProfile');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { getPagination } = require('../utils/pagination');
const { assertProviderAvailable, reserveSlot, releaseSlot } = require('../services/availabilityEngine');
const { notify } = require('../services/notificationService');
const { logAction } = require('../services/auditLogger');

// Customer accepts a quote and books a specific time slot for it.
// This is the moment a ServiceRequest becomes a Booking (PRD 4.1 steps 5-6).
const createBooking = asyncHandler(async (req, res) => {
  const { quoteId, startTime, endTime } = req.body;
  if (!quoteId || !startTime || !endTime) {
    throw new ApiError(400, 'quoteId, startTime and endTime are required.');
  }

  const quote = await Quote.findById(quoteId);
  if (!quote || quote.status !== 'pending') throw new ApiError(404, 'Quote not found or no longer available.');

  const request = await ServiceRequest.findById(quote.request);
  if (!request || request.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only book quotes on your own requests.');
  }
  if (!['open', 'quoted'].includes(request.status)) {
    throw new ApiError(409, 'This request is no longer open for booking.');
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  await assertProviderAvailable(quote.provider, start, end);

  const booking = await Booking.create({
    request: request._id,
    quote: quote._id,
    customer: req.user._id,
    provider: quote.provider,
    slot: { startTime: start, endTime: end },
    timeline: [{ status: 'scheduled', note: 'Booking confirmed.', actor: req.user._id }],
  });

  const slot = await reserveSlot(quote.provider, start, end, booking._id);
  booking.availabilitySlot = slot._id;
  await booking.save();

  quote.status = 'accepted';
  await quote.save();
  await Quote.updateMany(
    { request: request._id, _id: { $ne: quote._id }, status: 'pending' },
    { $set: { status: 'rejected' } }
  );

  request.status = 'booked';
  await request.save();

  const providerProfile = await ProviderProfile.findById(quote.provider);
  await notify(providerProfile.user, 'quote_accepted', 'Your quote was accepted and a booking was created.', 'Booking', booking._id);
  await notify(req.user._id, 'booking_confirmed', 'Your booking is confirmed.', 'Booking', booking._id);
  await logAction(req.user._id, 'create_booking', 'Booking', booking._id, { quoteId });

  sendResponse(res, 201, { booking }, 'Booking confirmed.');
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'name email phone')
    .populate({ path: 'provider', populate: { path: 'user', select: 'name email phone' } })
    .populate('request', 'description location')
    .populate('quote');
  if (!booking) throw new ApiError(404, 'Booking not found.');
  sendResponse(res, 200, { booking }, 'Booking fetched.');
});

const listMyBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  let filter = {};

  if (req.user.role === 'customer') {
    filter.customer = req.user._id;
  } else if (req.user.role === 'provider') {
    const provider = await ProviderProfile.findOne({ user: req.user._id });
    if (!provider) throw new ApiError(404, 'Provider profile not found.');
    filter.provider = provider._id;
  }
  if (req.query.status) filter.status = req.query.status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('customer', 'name')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name' } })
      .populate('request', 'description')
      .skip(skip)
      .limit(limit)
      .sort({ 'slot.startTime': -1 }),
    Booking.countDocuments(filter),
  ]);

  sendResponse(res, 200, { bookings, page, limit, total }, 'Bookings fetched.');
});

const listAllBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate('customer', 'name email')
      .populate({ path: 'provider', populate: { path: 'user', select: 'name email' } })
      .populate('request', 'description')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Booking.countDocuments(filter),
  ]);

  sendResponse(res, 200, { bookings, page, limit, total }, 'Bookings fetched.');
});

const rescheduleBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found.');

  const isParty =
    booking.customer.toString() === req.user._id.toString() ||
    (await ProviderProfile.exists({ _id: booking.provider, user: req.user._id }));
  if (!isParty && !['admin', 'ops'].includes(req.user.role)) {
    throw new ApiError(403, 'You are not part of this booking.');
  }
  if (!['scheduled'].includes(booking.status)) {
    throw new ApiError(409, 'Only scheduled bookings can be rescheduled.');
  }

  const start = new Date(req.body.startTime);
  const end = new Date(req.body.endTime);
  await assertProviderAvailable(booking.provider, start, end, { excludeBookingId: booking._id });

  await releaseSlot(booking._id);
  booking.slot = { startTime: start, endTime: end };
  const slot = await reserveSlot(booking.provider, start, end, booking._id);
  booking.availabilitySlot = slot._id;
  await booking.save();

  sendResponse(res, 200, { booking }, 'Booking rescheduled.');
});

const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found.');

  const isCustomer = booking.customer.toString() === req.user._id.toString();
  const isProvider = await ProviderProfile.exists({ _id: booking.provider, user: req.user._id });
  const isStaff = ['admin', 'ops', 'support'].includes(req.user.role);
  if (!isCustomer && !isProvider && !isStaff) throw new ApiError(403, 'You are not part of this booking.');

  if (['completed', 'closed', 'cancelled'].includes(booking.status)) {
    throw new ApiError(409, 'This booking can no longer be cancelled.');
  }

  booking.status = 'cancelled';
  booking.cancellation = { cancelledBy: req.user._id, reason: req.body.reason || '', cancelledAt: new Date() };
  booking.timeline.push({ status: 'cancelled', note: req.body.reason || 'Booking cancelled.', actor: req.user._id });
  await booking.save();
  await releaseSlot(booking._id);

  const request = await ServiceRequest.findById(booking.request);
  if (request) {
    request.status = 'cancelled';
    await request.save();
  }

  sendResponse(res, 200, { booking }, 'Booking cancelled.');
});

module.exports = { createBooking, getBooking, listMyBookings, listAllBookings, rescheduleBooking, cancelBooking };
