const mongoose = require('mongoose');

const providerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bio: { type: String, trim: true, default: '' },
    skills: [{ type: String, trim: true, index: true }],
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' }],
    serviceAreas: [{ type: String, trim: true, index: true }],
    experienceYears: { type: Number, default: 0, min: 0 },
    pricing: {
      model: { type: String, enum: ['flat', 'hourly'], default: 'hourly' },
      rate: { type: Number, default: 0, min: 0 },
    },
    documents: [
      {
        label: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    portfolioImages: [{ type: String }],
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    verificationNote: { type: String, default: '' },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    completedJobsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

providerProfileSchema.index({ skills: 1, serviceAreas: 1, verificationStatus: 1 });

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
