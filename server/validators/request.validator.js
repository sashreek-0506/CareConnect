const { z } = require('zod');

const createRequestSchema = z.object({
  description: z.string().min(10, 'Please describe the issue in a bit more detail'),
  category: z.string().optional(),
  location: z
    .object({
      area: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  preferredWindow: z
    .object({
      start: z.coerce.date().optional(),
      end: z.coerce.date().optional(),
    })
    .optional(),
  budgetRange: z
    .object({
      min: z.number().min(0).default(0),
      max: z.number().min(0).default(0),
    })
    .optional(),
  attachments: z.array(z.string()).optional(),
});

module.exports = { createRequestSchema };
