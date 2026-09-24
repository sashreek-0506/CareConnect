const ServiceRequest = require('../models/ServiceRequest');
const Booking = require('../models/Booking');
const Dispute = require('../models/Dispute');
const ProviderProfile = require('../models/ProviderProfile');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');

const dashboardSummary = asyncHandler(async (req, res) => {
  const [
    activeBookings,
    completedBookings,
    cancelledBookings,
    openDisputes,
    pendingVerifications,
    categoryDemand,
  ] = await Promise.all([
    Booking.countDocuments({ status: { $in: ['scheduled', 'en_route', 'in_progress'] } }),
    Booking.countDocuments({ status: { $in: ['completed', 'closed'] } }),
    Booking.countDocuments({ status: 'cancelled' }),
    Dispute.countDocuments({ status: { $in: ['open', 'in_review'] } }),
    ProviderProfile.countDocuments({ verificationStatus: 'pending' }),
    ServiceRequest.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'servicecategories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$category.name', 'Uncategorized'] }, count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]),
  ]);

  const totalClosed = completedBookings + cancelledBookings;
  const completionRate = totalClosed > 0 ? Number(((completedBookings / totalClosed) * 100).toFixed(1)) : 0;

  sendResponse(
    res,
    200,
    {
      activeBookings,
      completedBookings,
      cancelledBookings,
      completionRate,
      openDisputes,
      pendingVerifications,
      categoryDemand,
    },
    'Analytics fetched.'
  );
});

module.exports = { dashboardSummary };
