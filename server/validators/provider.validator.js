const { z } = require('zod');

const providerProfileSchema = z.object({
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  serviceAreas: z.array(z.string()).optional(),
  experienceYears: z.number().min(0).optional(),
  pricing: z
    .object({
      model: z.enum(['flat', 'hourly']),
      rate: z.number().min(0),
    })
    .optional(),
});

const verificationSchema = z.object({
  verificationStatus: z.enum(['pending', 'approved', 'rejected']),
  verificationNote: z.string().optional().default(''),
});

const availabilitySlotSchema = z.object({
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

module.exports = { providerProfileSchema, verificationSchema, availabilitySlotSchema };
