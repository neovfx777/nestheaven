const { z } = require('zod');

const i18nSchema = z.object({
  uz: z.string().min(1),
  ru: z.string().min(1),
  en: z.string().min(1),
}).partial().refine((obj) => obj.uz || obj.ru || obj.en, { message: 'At least one language required' });

const createComplexSchema = z.object({
  body: z.object({
    name: z.union([i18nSchema, z.string()]),
    address: z.union([i18nSchema, z.string()]).optional(),
    city: z.string().min(1, 'City required'),
  }),
});

const updateComplexSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.union([i18nSchema, z.string()]).optional(),
    address: z.union([i18nSchema, z.string()]).optional().nullable(),
    city: z.string().min(1).optional(),
  }).refine((b) => Object.keys(b).length > 0, { message: 'At least one field to update' }),
});

const getByIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

function validateCreate(req, res, next) {
  const result = createComplexSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateUpdate(req, res, next) {
  const result = updateComplexSchema.safeParse({ params: req.params, body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateGetById(req, res, next) {
  const result = getByIdSchema.safeParse({ params: req.params });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

module.exports = { validateCreate, validateUpdate, validateGetById };
