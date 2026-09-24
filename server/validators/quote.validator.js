const { z } = require('zod');

const createQuoteSchema = z.object({
  request: z.string(),
  price: z.number().positive('Price must be greater than 0'),
  estimatedDurationMinutes: z.number().positive('Duration must be greater than 0'),
  notes: z.string().optional().default(''),
  validUntil: z.coerce.date().optional(),
});

module.exports = { createQuoteSchema };
