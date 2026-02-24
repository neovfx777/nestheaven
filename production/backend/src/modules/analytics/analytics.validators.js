const { z } = require('zod');

const statsSchema = z.object({
  query: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }),
});

function validateStats(req, res, next) {
  const result = statsSchema.safeParse({ query: req.query });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

module.exports = { validateStats };
