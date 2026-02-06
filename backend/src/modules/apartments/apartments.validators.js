const { z } = require('zod');

const i18nSchema = z.object({
  uz: z.string().optional(),
  ru: z.string().optional(),
  en: z.string().optional(),
}).refine((obj) => (obj.uz || obj.ru || obj.en), { message: 'At least one language required' });

const createApartmentSchema = z.object({
  body: z.object({
    complexId: z.string().min(1, 'Complex ID required'),
    price: z.number().positive(),
    area: z.number().positive(),
    rooms: z.number().int().positive(),
    floor: z.number().int().min(0).optional(),
    totalFloors: z.number().int().positive().optional(),
    title: z.union([i18nSchema, z.string()]),
    description: z.union([i18nSchema, z.string()]).optional(),
    materials: z.union([i18nSchema, z.string()]).optional(),
    infrastructureNote: z.union([i18nSchema, z.string()]).optional(),
  }),
});

const updateApartmentSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    complexId: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    area: z.number().positive().optional(),
    rooms: z.number().int().positive().optional(),
    floor: z.number().int().min(0).optional().nullable(),
    totalFloors: z.number().int().positive().optional().nullable(),
    title: z.union([i18nSchema, z.string()]).optional(),
    description: z.union([i18nSchema, z.string()]).optional().nullable(),
    materials: z.union([i18nSchema, z.string()]).optional().nullable(),
    infrastructureNote: z.union([i18nSchema, z.string()]).optional().nullable(),
  }).refine((b) => Object.keys(b).length > 0, { message: 'At least one field to update' }),
});

// ADMIN DASHBOARD UCHUN MAX LIMIT QO'SHDIK
const listSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(1000).optional().default(20), // 1000 gacha ruxsat
    complexId: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    rooms: z.coerce.number().int().optional(),
    status: z.enum(['active', 'hidden', 'sold', 'ACTIVE', 'HIDDEN', 'SOLD']).optional(), // Ikkala formatni qabul qilish
    lang: z.enum(['uz', 'ru', 'en']).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['price', 'area', 'rooms', 'createdAt', 'updatedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

const getByIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  query: z.object({ lang: z.enum(['uz', 'ru', 'en']).optional() }).optional(),
});

const markSoldSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

const hideUnhideSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ status: z.enum(['active', 'hidden']) }),
});

function validateCreate(req, res, next) {
  const result = createApartmentSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateUpdate(req, res, next) {
  const result = updateApartmentSchema.safeParse({ params: req.params, body: req.body });
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

function validateGetById(req, res, next) {
  const result = getByIdSchema.safeParse({ params: req.params, query: req.query });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateMarkSold(req, res, next) {
  const result = markSoldSchema.safeParse({ params: req.params });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateHideUnhide(req, res, next) {
  const result = hideUnhideSchema.safeParse({ params: req.params, body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

module.exports = {
  validateCreate,
  validateUpdate,
  validateList,
  validateGetById,
  validateMarkSold,
  validateHideUnhide,
  listSchema, // Export qo'shdik
};