const { z } = require('zod');

const createReviewSchema = z.object({
  booking: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional().default(''),
});

module.exports = { createReviewSchema };
