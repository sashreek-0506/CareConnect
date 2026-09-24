const { z } = require('zod');

const createDisputeSchema = z.object({
  booking: z.string(),
  reason: z.string().min(5),
  evidence: z.array(z.string()).optional().default([]),
});

const resolveDisputeSchema = z.object({
  action: z.enum(['refund', 'partial_refund', 're_service', 'dismissed']),
  amount: z.number().min(0).optional().default(0),
  note: z.string().optional().default(''),
  status: z.enum(['resolved', 'escalated', 'closed']).default('resolved'),
});

module.exports = { createDisputeSchema, resolveDisputeSchema };
