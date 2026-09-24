const Booking = require('../models/Booking');
const ProviderProfile = require('../models/ProviderProfile');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { notify } = require('../services/notificationService');
const { generateInvoiceForBooking } = require('../services/invoiceGenerator');

// Provider posts a status update on a booking's job timeline (PRD 4.4).
// "completed" requires at least one after-evidence attachment.
const addJobUpdate = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found.');

  const providerOwns = await ProviderProfile.exists({ _id: booking.provider, user: req.user._id });
  if (!providerOwns) throw new ApiError(403, 'Only the assigned provider can update this job.');

  if (['completed', 'closed', 'cancelled'].includes(booking.status)) {
    throw new ApiError(409, 'This booking is already closed out.');
  }

  const { status, note, attachments = [] } = req.body;

  if (status === 'completed' && attachments.length === 0 && booking.afterEvidence.length === 0) {
    throw new ApiError(400, 'At least one after-service photo is required to mark the job completed.');
  }

  booking.status = status;
  booking.timeline.push({ status, note, attachments, actor: req.user._id });
  if (status === 'completed') booking.afterEvidence.push(...attachments);
  await booking.save();

  await notify(booking.customer, 'status_change', `Your booking status changed to "${status.replace('_', ' ')}".`, 'Booking', booking._id);

  sendResponse(res, 200, { booking }, 'Job status updated.');
});

// Provider attaches before/after evidence photos independent of a status change.
const addEvidence = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found.');

  const providerOwns = await ProviderProfile.exists({ _id: booking.provider, user: req.user._id });
  if (!providerOwns) throw new ApiError(403, 'Only the assigned provider can add evidence.');

  const { stage, urls = [] } = req.body; // stage: 'before' | 'after'
  if (!['before', 'after'].includes(stage)) throw new ApiError(400, 'stage must be "before" or "after".');

  if (stage === 'before') booking.beforeEvidence.push(...urls);
  else booking.afterEvidence.push(...urls);
  await booking.save();

  sendResponse(res, 200, { booking }, 'Evidence added.');
});

// Customer confirms the job is done -> closes the booking and generates the invoice.
const confirmCompletion = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found.');
  if (booking.customer.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only the customer can confirm completion.');
  }
  if (booking.status !== 'completed') {
    throw new ApiError(409, 'The provider must mark the job completed before you can confirm it.');
  }

  booking.customerConfirmedAt = new Date();
  booking.status = 'closed';
  await booking.save();

  const invoice = await generateInvoiceForBooking(booking);

  const ProviderProfileModel = require('../models/ProviderProfile');
  await ProviderProfileModel.findByIdAndUpdate(booking.provider, { $inc: { completedJobsCount: 1 } });

  const ServiceRequest = require('../models/ServiceRequest');
  await ServiceRequest.findByIdAndUpdate(booking.request, { status: 'completed' });

  sendResponse(res, 200, { booking, invoice }, 'Job confirmed complete.');
});

module.exports = { addJobUpdate, addEvidence, confirmCompletion };
