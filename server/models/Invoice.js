const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true },
    lineItems: [lineItemSchema],
    total: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);
