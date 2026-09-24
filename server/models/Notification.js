const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'quote_received', 'quote_accepted', 'booking_confirmed', 'status_change',
        'dispute_update', 'verification_result', 'review_received', 'general',
      ],
      required: true,
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
    relatedEntityType: { type: String, default: null },
    relatedEntityId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
