const { z } = require('zod');

const createBookingSchema = z.object({
  quote: z.string(),
});

const jobUpdateSchema = z.object({
  status: z.enum(['scheduled', 'en_route', 'in_progress', 'completed', 'cancelled']),
  note: z.string().optional().default(''),
  attachments: z.array(z.string()).optional().default([]),
});

const rescheduleSchema = z.object({
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

module.exports = { createBookingSchema, jobUpdateSchema, rescheduleSchema };
