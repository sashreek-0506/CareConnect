const mongoose = require('mongoose');

const activityEntrySchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const disputeSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, trim: true },
    evidence: [{ type: String }],
    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved', 'escalated', 'closed'],
      default: 'open',
      index: true,
    },
    resolution: {
      action: { type: String, enum: ['refund', 'partial_refund', 're_service', 'dismissed', null], default: null },
      amount: { type: Number, default: 0 },
      note: { type: String, default: '' },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      resolvedAt: Date,
    },
    activityLog: [activityEntrySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispute', disputeSchema);
