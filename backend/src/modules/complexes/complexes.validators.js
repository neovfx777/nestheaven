const { z } = require('zod');

// Helper schema for optional i18n objects – we still store JSON in DB
const i18nSchema = z
  .object({
    uz: z.string().min(1),
    ru: z.string().min(1),
    en: z.string().min(1),
  })
  .partial()
  .refine((obj) => obj.uz || obj.ru || obj.en, { message: 'At least one language required' });

// === CREATE COMPLEX (ADMIN-ONLY) ===
// Backend-only API for creating a construction project container (NOT a listing)
const createComplexSchema = z.object({
  body: z.object({
    // Title of the complex (will be stored as JSON name field internally)
    title: z.union([i18nSchema, z.string()]).describe('Project title (e.g. "Sevgi Shaxr")'),

    // Long-form description of the project / developer vision
    description: z.string().min(1, 'Description is required'),

    // Human-readable address; we still support i18n JSON format under the hood
    address: z.union([i18nSchema, z.string()]).min(1, 'Address is required'),

    city: z.string().min(1, 'City is required'),

    // Location (lat / lng)
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),

    // Walkability rating 1–10
    walkabilityScore: z.number().int().min(1).max(10),

    // Air quality rating + optional note
    airQualityScore: z.number().int().min(1).max(500).optional(),
    airQualityNote: z.string().max(1000).optional(),

    // Nearby infrastructure free-text description
    nearbyInfrastructureText: z.string().min(1, 'Nearby infrastructure text is required'),
  }),
});

// === UPDATE COMPLEX (ADMIN-ONLY) ===
const updateComplexSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z
    .object({
      title: z.union([i18nSchema, z.string()]).optional(),
      description: z.string().min(1).optional(),
      address: z.union([i18nSchema, z.string()]).optional(),
      city: z.string().min(1).optional(),
      latitude: z.number().min(-90).max(90).optional().nullable(),
      longitude: z.number().min(-180).max(180).optional().nullable(),
      walkabilityScore: z.number().int().min(1).max(10).optional().nullable(),
      airQualityScore: z.number().int().min(1).max(500).optional().nullable(),
      airQualityNote: z.string().max(1000).optional().nullable(),
      nearbyInfrastructureText: z.string().min(1).optional(),
    })
    .refine((b) => Object.keys(b).length > 0, {
      message: 'At least one field to update',
    }),
});

const getByIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

function validateCreate(req, res, next) {
  const result = createComplexSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res
      .status(400)
      .json({ error: 'Validation failed', details: result.error.errors });
  }

  // Validate permission files: exactly 3 (permission_1..3)
  const files = req.files || {};
  const expected = ['permission_1', 'permission_2', 'permission_3'];
  const allPresent = expected.every(
    (field) => Array.isArray(files[field]) && files[field].length === 1
  );

  if (!allPresent) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [
        {
          path: ['permissions'],
          message:
            'Exactly 3 permission files are required: permission_1, permission_2, permission_3',
        },
      ],
    });
  }

  // Attach validated body + raw files to req.validated
  req.validated = {
    ...result.data,
    files,
  };
  next();
}

function validateUpdate(req, res, next) {
  const result = updateComplexSchema.safeParse({
    params: req.params,
    body: req.body,
  });
  if (!result.success) {
    return res
      .status(400)
      .json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateGetById(req, res, next) {
  const result = getByIdSchema.safeParse({ params: req.params });
  if (!result.success) {
    return res
      .status(400)
      .json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

module.exports = { validateCreate, validateUpdate, validateGetById };
