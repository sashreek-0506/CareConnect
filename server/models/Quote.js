const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true, index: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    estimatedDurationMinutes: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true, default: '' },
    validUntil: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'expired'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

quoteSchema.index({ request: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Quote', quoteSchema);
