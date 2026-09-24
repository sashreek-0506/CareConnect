const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    icon: { type: String, default: 'wrench' },
    requiredSkills: [{ type: String, trim: true }],
    basePricingRule: {
      model: { type: String, enum: ['flat', 'hourly'], default: 'hourly' },
      minPrice: { type: Number, default: 0 },
      maxPrice: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
