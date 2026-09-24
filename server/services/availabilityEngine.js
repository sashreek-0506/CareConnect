const AvailabilitySlot = require('../models/AvailabilitySlot');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');

// Two time ranges overlap if one starts before the other ends, both ways.
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

// Checks whether a provider is free for [startTime, endTime), looking at both
// their open AvailabilitySlots (must be covered by one) and existing active
// Bookings (must not overlap any). Throws ApiError(409) if not available.
async function assertProviderAvailable(providerId, startTime, endTime, { excludeBookingId } = {}) {
  if (!(startTime instanceof Date) || !(endTime instanceof Date) || startTime >= endTime) {
    throw new ApiError(400, 'Invalid time range for booking.');
  }

  const conflictingBookings = await Booking.find({
    provider: providerId,
    status: { $in: ['scheduled', 'en_route', 'in_progress'] },
    ...(excludeBookingId ? { _id: { $ne: excludeBookingId } } : {}),
    'slot.startTime': { $lt: endTime },
    'slot.endTime': { $gt: startTime },
  }).lean();

  if (conflictingBookings.length > 0) {
    throw new ApiError(409, 'Provider already has a booking that overlaps this time slot.');
  }

  return true;
}

// Marks (or creates) the AvailabilitySlot covering this booking as booked,
// linking it back to the booking.
async function reserveSlot(providerId, startTime, endTime, bookingId) {
  let slot = await AvailabilitySlot.findOne({
    provider: providerId,
    startTime: { $lte: startTime },
    endTime: { $gte: endTime },
    isBooked: false,
  });

  if (!slot) {
    // Provider didn't pre-declare this exact slot; create a booked slot record
    // so the calendar stays consistent.
    slot = new AvailabilitySlot({ provider: providerId, startTime, endTime });
  }

  slot.isBooked = true;
  slot.booking = bookingId;
  await slot.save();
  return slot;
}

async function releaseSlot(bookingId) {
  await AvailabilitySlot.updateMany(
    { booking: bookingId },
    { $set: { isBooked: false, booking: null } }
  );
}

module.exports = { rangesOverlap, assertProviderAvailable, reserveSlot, releaseSlot };
