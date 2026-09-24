const Invoice = require('../models/Invoice');
const Quote = require('../models/Quote');

// Builds (or returns the existing) Invoice for a completed Booking, from its
// accepted Quote. Kept isolated so pricing/tax rules can evolve independently
// of the booking controller.
async function generateInvoiceForBooking(booking) {
  const existing = await Invoice.findOne({ booking: booking._id });
  if (existing) return existing;

  const quote = await Quote.findById(booking.quote);
  if (!quote) throw new Error('Cannot generate invoice: quote not found for booking.');

  const lineItems = [{ label: 'Service charge', amount: quote.price }];
  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const invoice = await Invoice.create({
    booking: booking._id,
    customer: booking.customer,
    provider: booking.provider,
    lineItems,
    total,
    paymentStatus: 'pending',
  });

  return invoice;
}

module.exports = { generateInvoiceForBooking };
