const Review = require('../models/Review');
const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { notify } = require('../services/notificationService');

const createReview = asyncHandler(async (req, res) => {
  const { booking: bookingId, rating, comment } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found.');
  if (booking.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only review your own bookings.');
  }
  if (!['completed', 'closed'].includes(booking.status)) {
    throw new ApiError(409, 'You can only review a completed booking.');
  }

  const existing = await Review.findOne({ booking: bookingId });
  if (existing) throw new ApiError(409, 'You already reviewed this booking.');

  const review = await Review.create({
    booking: bookingId,
    customer: req.user._id,
    provider: booking.provider,
    rating,
    comment,
  });

  const providerReviews = await Review.find({ provider: booking.provider });
  const avgRating = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
  await ProviderProfile.findByIdAndUpdate(booking.provider, {
    avgRating: Number(avgRating.toFixed(2)),
    ratingCount: providerReviews.length,
  });

  const providerProfile = await ProviderProfile.findById(booking.provider);
  await notify(providerProfile.user, 'review_received', `You received a new ${rating}-star review.`, 'Review', review._id);

  sendResponse(res, 201, { review }, 'Review submitted.');
});

const listProviderReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ provider: req.params.providerId })
    .populate('customer', 'name')
    .sort({ createdAt: -1 });
  sendResponse(res, 200, { reviews }, 'Reviews fetched.');
});

const respondToReview = asyncHandler(async (req, res) => {
  const provider = await ProviderProfile.findOne({ user: req.user._id });
  const review = await Review.findOne({ _id: req.params.id, provider: provider._id });
  if (!review) throw new ApiError(404, 'Review not found.');

  review.providerResponse = req.body.response || '';
  await review.save();
  sendResponse(res, 200, { review }, 'Response added.');
});

module.exports = { createReview, listProviderReviews, respondToReview };
