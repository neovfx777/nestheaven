const { z } = require('zod');

const numberFromString = (schema) =>
  z.preprocess((val) => {
    if (val === '' || val === null || val === undefined) return undefined;
    if (typeof val === 'string') {
      const num = Number(val);
      return Number.isNaN(num) ? val : num;
    }
    return val;
  }, schema);

const jsonFromString = (schema) =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  }, schema);

// Multi-language object schema
const multiLangSchema = z.object({
  uz: z.string().min(1),
  ru: z.string().min(1),
  en: z.string().min(1),
});

// Nearby place schema with type
const nearbyPlaceSchema = z.object({
  type: z.string().min(1),
  name: z.string().min(1).max(120),
  distanceMeters: numberFromString(z.number().int().positive()),
  note: z.string().max(500).optional(),
});

// Location schema
const locationSchema = z.object({
  lat: numberFromString(z.number().min(-90).max(90)),
  lng: numberFromString(z.number().min(-180).max(180)),
  address: multiLangSchema,
});

// Permissions schema
const permissionsSchema = z.object({
  permission1: z.string().url().optional(),
  permission2: z.string().url().optional(),
  permission3: z.string().url().optional(),
});

const amenitiesSchema = jsonFromString(z.array(z.string().min(1).max(50)));
const nearbyPlacesSchema = jsonFromString(z.array(nearbyPlaceSchema));
const locationSchemaParsed = jsonFromString(locationSchema);
const titleSchemaParsed = jsonFromString(multiLangSchema);
const descriptionSchemaParsed = jsonFromString(multiLangSchema);
const allowedSellersSchema = jsonFromString(z.array(z.string().min(1)));

const createComplexSchema = z.object({
  body: z.object({
    title: titleSchemaParsed,
    description: descriptionSchemaParsed,
    developer: z.string().min(1).max(200),
    city: z.string().min(1).max(100),
    blockCount: numberFromString(z.number().int().min(1).max(100)),
    amenities: amenitiesSchema.optional(),
    nearby: nearbyPlacesSchema.optional(),
    location: locationSchemaParsed,
    walkability: numberFromString(z.number().int().min(0).max(10)).optional(),
    airQuality: numberFromString(z.number().int().min(0).max(10)).optional(),
    allowedSellers: allowedSellersSchema.optional(),
  }),
});

const updateComplexSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z
    .object({
      title: titleSchemaParsed.optional(),
      description: descriptionSchemaParsed.optional(),
      developer: z.string().min(1).max(200).optional(),
      city: z.string().min(1).max(100).optional(),
      blockCount: numberFromString(z.number().int().min(1).max(100)).optional(),
      amenities: amenitiesSchema.optional(),
      nearby: nearbyPlacesSchema.optional(),
      location: locationSchemaParsed.optional(),
      walkability: numberFromString(z.number().int().min(0).max(10)).optional(),
      airQuality: numberFromString(z.number().int().min(0).max(10)).optional(),
      allowedSellers: allowedSellersSchema.optional(),
    })
    .refine((b) => Object.keys(b).length > 0, {
      message: 'At least one field to update',
    }),
});

const getByIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

const listSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    search: z.string().min(1).optional(),
    city: z.string().min(1).optional(),
  }),
});

function validateCreate(req, res, next) {
  const result = createComplexSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res
      .status(400)
      .json({ error: 'Validation failed', details: result.error.errors });
  }

  const files = req.files || {};
  const permission1 = files.permission1?.[0] || files.permission_1?.[0] || null;
  const permission2 = files.permission2?.[0] || files.permission_2?.[0] || null;
  const permission3 = files.permission3?.[0] || files.permission_3?.[0] || null;
  const provided = [permission1, permission2, permission3].filter(Boolean).length;

  // All 3 permissions required for new complexes
  if (provided !== 3) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [
        {
          path: ['permissions'],
          message: 'All three permission files (permission1, permission2, permission3) are required',
        },
      ],
    });
  }

  req.validated = {
    ...result.data,
    files,
    meta: { complexId: req.complexId },
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
  req.validated = {
    ...result.data,
    files: req.files || {},
  };
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

function validateList(req, res, next) {
  const result = listSchema.safeParse({ query: req.query });
  if (!result.success) {
    return res
      .status(400)
      .json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

module.exports = {
  validateCreate,
  validateUpdate,
  validateGetById,
  validateList,
};
