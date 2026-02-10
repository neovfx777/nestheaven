const { z } = require('zod');

const createSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(120),
    message: z.string().min(1).max(2000),
    isActive: z.boolean().optional(),
  }),
});

const updateSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z
    .object({
      title: z.string().min(1).max(120).optional(),
      message: z.string().min(1).max(2000).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((b) => Object.keys(b).length > 0, {
      message: 'At least one field to update',
    }),
});

const listSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(20).optional().default(5),
  }),
});

function validateCreate(req, res, next) {
  const result = createSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateUpdate(req, res, next) {
  const result = updateSchema.safeParse({ params: req.params, body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateList(req, res, next) {
  const result = listSchema.safeParse({ query: req.query });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

module.exports = { validateCreate, validateUpdate, validateList };
