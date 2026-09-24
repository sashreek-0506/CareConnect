const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema(
  {
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'ProviderProfile', required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isBooked: { type: Boolean, default: false },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  },
  { timestamps: true }
);

availabilitySlotSchema.index({ provider: 1, startTime: 1, endTime: 1 });

availabilitySlotSchema.pre('validate', function validateRange(next) {
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    return next(new Error('startTime must be before endTime'));
  }
  next();
});

module.exports = mongoose.model('AvailabilitySlot', availabilitySlotSchema);
