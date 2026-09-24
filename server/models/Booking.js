const mongoose = require('mongoose');

const jobUpdateSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['scheduled', 'en_route', 'in_progress', 'completed', 'cancelled'],
      required: true,
    },
    note: { type: String, trim: true, default: '' },
    attachments: [{ type: String }],
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true, index: true },
    quote: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true, index: true },
    slot: {
      startTime: { type: Date, required: true },
      endTime: { type: Date, required: true },
    },
    availabilitySlot: { type: mongoose.Schema.Types.ObjectId, ref: 'AvailabilitySlot' },
    status: {
      type: String,
      enum: ['scheduled', 'en_route', 'in_progress', 'completed', 'closed', 'cancelled', 'disputed'],
      default: 'scheduled',
      index: true,
    },
    timeline: [jobUpdateSchema],
    beforeEvidence: [{ type: String }],
    afterEvidence: [{ type: String }],
    customerConfirmedAt: { type: Date, default: null },
    cancellation: {
      cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      reason: String,
      cancelledAt: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
