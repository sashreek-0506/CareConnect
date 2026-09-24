const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { classifyRequest } = require('../services/ai/classifyRequest');
const { rankProviders } = require('../services/ai/rankProviders');

// Generic AI utility endpoints (not tied to a saved ServiceRequest) --
// useful for admin tooling, testing the classifier, or a "preview" step
// in the request-creation UI before the request is actually saved.
const classify = asyncHandler(async (req, res) => {
  const { description } = req.body;
  if (!description) throw new ApiError(400, 'description is required.');
  const result = await classifyRequest(description);
  sendResponse(res, 200, { classification: result }, 'Classification complete.');
});

const rank = asyncHandler(async (req, res) => {
  const { categoryId, requiredSkills, area, windowStart, windowEnd } = req.body;
  const ranked = await rankProviders({ categoryId, requiredSkills, area, windowStart, windowEnd });
  sendResponse(res, 200, { providers: ranked }, 'Providers ranked.');
});

module.exports = { classify, rank };
