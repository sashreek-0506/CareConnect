const { z } = require('zod');

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(''),
  icon: z.string().optional(),
  requiredSkills: z.array(z.string()).optional().default([]),
  basePricingRule: z
    .object({
      model: z.enum(['flat', 'hourly']).default('hourly'),
      minPrice: z.number().min(0).default(0),
      maxPrice: z.number().min(0).default(0),
    })
    .optional(),
  isActive: z.boolean().optional(),
});

module.exports = { categorySchema };
