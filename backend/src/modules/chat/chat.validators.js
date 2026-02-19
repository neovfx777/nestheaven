const { z } = require('zod');

const apartmentsAssistantSchema = z.object({
  body: z.object({
    message: z.string().min(1).max(1500),
    history: z
      .array(
        z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string().min(1).max(1500),
        })
      )
      .max(20)
      .optional()
      .default([]),
    language: z.enum(['uz', 'ru', 'en']).optional().default('uz'),
    limit: z.coerce.number().int().min(1).max(10).optional().default(5),
  }),
});

function validateApartmentsAssistant(req, res, next) {
  const result = apartmentsAssistantSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

module.exports = {
  validateApartmentsAssistant,
};

