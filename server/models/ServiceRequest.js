const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    description: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory', default: null },
    aiSuggestedCategory: {
      categoryName: String,
      skills: [String],
      confidence: Number,
    },
    requiredSkills: [{ type: String, trim: true }],
    location: {
      area: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    preferredWindow: {
      start: Date,
      end: Date,
    },
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ['open', 'quoted', 'booked', 'in_progress', 'completed', 'cancelled', 'disputed'],
      default: 'open',
      index: true,
    },
  },
  { timestamps: true }
);

serviceRequestSchema.index({ description: 'text' });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
