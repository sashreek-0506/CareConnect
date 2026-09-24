const Invoice = require('../models/Invoice');
const ProviderProfile = require('../models/ProviderProfile');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { generateInvoiceForBooking } = require('../services/invoiceGenerator');

const getInvoiceForBooking = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({ booking: req.params.bookingId })
    .populate('customer', 'name email')
    .populate({ path: 'provider', populate: { path: 'user', select: 'name' } });
  if (!invoice) throw new ApiError(404, 'Invoice not found for this booking.');
  sendResponse(res, 200, { invoice }, 'Invoice fetched.');
});

const generateInvoice = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found.');
  if (!['completed', 'closed'].includes(booking.status)) {
    throw new ApiError(409, 'Invoices can only be generated for completed bookings.');
  }
  const invoice = await generateInvoiceForBooking(booking);
  sendResponse(res, 201, { invoice }, 'Invoice generated.');
});

const listMyInvoices = asyncHandler(async (req, res) => {
  let filter = {};
  if (req.user.role === 'customer') filter.customer = req.user._id;
  if (req.user.role === 'provider') {
    const provider = await ProviderProfile.findOne({ user: req.user._id });
    filter.provider = provider ? provider._id : null;
  }
  const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
  sendResponse(res, 200, { invoices }, 'Invoices fetched.');
});

module.exports = { getInvoiceForBooking, generateInvoice, listMyInvoices };
