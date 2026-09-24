const AvailabilitySlot = require('../models/AvailabilitySlot');
const ProviderProfile = require('../models/ProviderProfile');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

async function getOwnProviderProfileOrThrow(userId) {
  const provider = await ProviderProfile.findOne({ user: userId });
  if (!provider) throw new ApiError(404, 'Provider profile not found.');
  return provider;
}

const listMyAvailability = asyncHandler(async (req, res) => {
  const provider = await getOwnProviderProfileOrThrow(req.user._id);
  const slots = await AvailabilitySlot.find({ provider: provider._id }).sort({ startTime: 1 });
  sendResponse(res, 200, { slots }, 'Availability fetched.');
});

const listProviderAvailability = asyncHandler(async (req, res) => {
  const slots = await AvailabilitySlot.find({
    provider: req.params.providerId,
    isBooked: false,
    endTime: { $gte: new Date() },
  }).sort({ startTime: 1 });
  sendResponse(res, 200, { slots }, 'Availability fetched.');
});

const addSlot = asyncHandler(async (req, res) => {
  const provider = await getOwnProviderProfileOrThrow(req.user._id);
  const { startTime, endTime } = req.body;

  const overlap = await AvailabilitySlot.findOne({
    provider: provider._id,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  });
  if (overlap) throw new ApiError(409, 'This slot overlaps an existing availability slot.');

  const slot = await AvailabilitySlot.create({ provider: provider._id, startTime, endTime });
  sendResponse(res, 201, { slot }, 'Availability slot added.');
});

const deleteSlot = asyncHandler(async (req, res) => {
  const provider = await getOwnProviderProfileOrThrow(req.user._id);
  const slot = await AvailabilitySlot.findOne({ _id: req.params.id, provider: provider._id });
  if (!slot) throw new ApiError(404, 'Slot not found.');
  if (slot.isBooked) throw new ApiError(409, 'Cannot delete a slot that is already booked.');

  await slot.deleteOne();
  sendResponse(res, 200, {}, 'Slot removed.');
});

module.exports = { listMyAvailability, listProviderAvailability, addSlot, deleteSlot };
