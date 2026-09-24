const Dispute = require('../models/Dispute');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const ProviderProfile = require('../models/ProviderProfile');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { getPagination } = require('../utils/pagination');
const { notify } = require('../services/notificationService');
const { logAction } = require('../services/auditLogger');

const createDispute = asyncHandler(async (req, res) => {
  const { booking: bookingId, reason, evidence } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found.');

  const isCustomer = booking.customer.toString() === req.user._id.toString();
  const isProvider = await ProviderProfile.exists({ _id: booking.provider, user: req.user._id });
  if (!isCustomer && !isProvider) throw new ApiError(403, 'You are not part of this booking.');

  const dispute = await Dispute.create({
    booking: bookingId,
    raisedBy: req.user._id,
    reason,
    evidence,
    activityLog: [{ actor: req.user._id, action: 'opened', note: reason }],
  });

  booking.status = 'disputed';
  await booking.save();

  await logAction(req.user._id, 'create_dispute', 'Dispute', dispute._id, { bookingId });
  sendResponse(res, 201, { dispute }, 'Dispute raised.');
});

const listDisputes = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [disputes, total] = await Promise.all([
    Dispute.find(filter)
      .populate('raisedBy', 'name role')
      .populate('booking')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    Dispute.countDocuments(filter),
  ]);

  sendResponse(res, 200, { disputes, page, limit, total }, 'Disputes fetched.');
});

const getDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id)
    .populate('raisedBy', 'name role')
    .populate({
      path: 'booking',
      populate: [
        { path: 'customer', select: 'name email' },
        { path: 'provider', populate: { path: 'user', select: 'name email' } },
      ],
    });
  if (!dispute) throw new ApiError(404, 'Dispute not found.');
  sendResponse(res, 200, { dispute }, 'Dispute fetched.');
});

// Support/Admin adds a note to the dispute thread and optionally moves it to "in_review".
const addDisputeNote = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw new ApiError(404, 'Dispute not found.');

  dispute.activityLog.push({ actor: req.user._id, action: 'note', note: req.body.note });
  if (dispute.status === 'open') dispute.status = 'in_review';
  await dispute.save();

  sendResponse(res, 200, { dispute }, 'Note added.');
});

// Support (first line) or Admin (final say) resolves a dispute.
const resolveDispute = asyncHandler(async (req, res) => {
  const { action, amount, note, status } = req.body;

  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw new ApiError(404, 'Dispute not found.');

  dispute.resolution = { action, amount, note, resolvedBy: req.user._id, resolvedAt: new Date() };
  dispute.status = status;
  dispute.activityLog.push({ actor: req.user._id, action: `resolution:${action}`, note });
  await dispute.save();

  if (status === 'resolved' || status === 'closed') {
    const booking = await Booking.findById(dispute.booking);
    if (booking) {
      booking.status = 'closed';
      await booking.save();
    }
    if (action === 'refund' || action === 'partial_refund') {
      await Invoice.findOneAndUpdate(
        { booking: dispute.booking },
        { paymentStatus: action === 'refund' ? 'refunded' : 'partially_refunded' }
      );
    }
  }

  const booking = await Booking.findById(dispute.booking);
  if (booking) {
    await notify(booking.customer, 'dispute_update', `Your dispute was ${status}: ${action.replace('_', ' ')}.`, 'Dispute', dispute._id);
    const providerProfile = await ProviderProfile.findById(booking.provider);
    if (providerProfile) {
      await notify(providerProfile.user, 'dispute_update', `Dispute on your booking was ${status}: ${action.replace('_', ' ')}.`, 'Dispute', dispute._id);
    }
  }

  await logAction(req.user._id, 'resolve_dispute', 'Dispute', dispute._id, { action, status });
  sendResponse(res, 200, { dispute }, 'Dispute resolved.');
});

module.exports = { createDispute, listDisputes, getDispute, addDisputeNote, resolveDispute };
