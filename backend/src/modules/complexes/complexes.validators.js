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
    if (val === '' || val === null || val === undefined) return undefined;
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return parsed;
      } catch (e) {
        // If parsing fails, return the original string so the .or() fallback can handle it
        return val;
      }
    }
    // If already an object, return as-is
    if (typeof val === 'object' && val !== null) {
      return val;
    }
    return undefined;
  }, schema);

// Multi-language schema for validation
const multiLanguageSchema = z.object({
  uz: z.string().min(1, 'Uzbek text is required'),
  ru: z.string().min(1, 'Russian text is required'),
  en: z.string().min(1, 'English text is required'),
});

const nearbyPlaceSchema = z
  .object({
    name: z.string().min(1).max(120),
    type: z.string().min(1).optional().default('other'),
    distanceMeters: numberFromString(z.number().int().nonnegative()).optional(),
    distanceKm: numberFromString(z.number().nonnegative()).optional(),
    note: z.string().max(500).optional(),
  })
  .refine((obj) => obj.distanceMeters != null || obj.distanceKm != null, {
    message: 'distanceMeters or distanceKm is required',
  });

const amenitiesSchema = jsonFromString(z.array(z.string().min(1).max(50)));
const nearbyPlacesSchema = jsonFromString(z.array(nearbyPlaceSchema));

// Enhanced create schema to handle both object and JSON string formats
const createComplexSchema = z.object({
  body: z.object({
    // Handle both object and JSON string for title
    title: jsonFromString(multiLanguageSchema).or(
      z.string().min(1)
    ).or(
      z.object({
        uz: z.string().min(1).optional(),
        ru: z.string().min(1).optional(),
        en: z.string().min(1).optional(),
      }).transform(val => ({
        uz: val.uz || '',
        ru: val.ru || '',
        en: val.en || '',
      }))
    ),
    // Handle both object and JSON string for description
    description: jsonFromString(multiLanguageSchema).optional().or(
      z.string().optional()
    ).or(
      z.object({
        uz: z.string().optional(),
        ru: z.string().optional(),
        en: z.string().optional(),
      }).optional()
    ),
    developer: z.string().min(1).optional(),
    city: z.string().min(1).optional().default('Unknown'),
    blockCount: numberFromString(z.number().int().min(1).max(100)).optional(),
    // Handle both object and JSON string for location
    location: jsonFromString(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        address: z.object({
          uz: z.string().min(1),
          ru: z.string().min(1),
          en: z.string().min(1),
        }),
      })
    ).or(
      z.object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        address: z.object({
          uz: z.string().min(1).optional(),
          ru: z.string().min(1).optional(),
          en: z.string().min(1).optional(),
        }).transform(addr => ({
          uz: addr.uz || '',
          ru: addr.ru || '',
          en: addr.en || '',
        })),
      })
    ).optional(),
    // Old format fallback
    locationText: z.string().min(1).optional(),
    locationLat: numberFromString(z.number().min(-90).max(90)).optional(),
    locationLng: numberFromString(z.number().min(-180).max(180)).optional(),
    walkabilityRating: numberFromString(z.number().int().min(0).max(10)).optional(),
    walkability: numberFromString(z.number().int().min(0).max(10)).optional(),
    airQualityRating: numberFromString(z.number().int().min(0).max(10)).optional(),
    airQuality: numberFromString(z.number().int().min(0).max(10)).optional(),
    nearbyNote: z.string().max(2000).optional(),
    nearbyPlaces: nearbyPlacesSchema.optional(),
    nearby: nearbyPlacesSchema.optional(),
    amenities: amenitiesSchema.optional(),
    allowedSellers: jsonFromString(z.array(z.string())).optional(),
  }),
});

const updateComplexSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z
    .object({
      title: z.string().min(1).max(120).optional(),
      description: z.string().min(1).optional(),
      locationText: z.string().min(1).optional(),
      locationLat: numberFromString(z.number().min(-90).max(90)).optional(),
      locationLng: numberFromString(z.number().min(-180).max(180)).optional(),
      walkabilityRating: numberFromString(z.number().int().min(0).max(10)).optional(),
      airQualityRating: numberFromString(z.number().int().min(0).max(10)).optional(),
      nearbyNote: z.string().max(2000).optional().nullable(),
      nearbyPlaces: nearbyPlacesSchema.optional(),
      amenities: amenitiesSchema.optional(),
      city: z.string().min(1).optional(),
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
    title: z.string().min(1).optional(),
    search: z.string().optional(),
    city: z.string().optional(),
  }),
});

function validateCreate(req, res, next) {
  try {
    console.log('=== Validator: validateCreate ===');
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request body sample:', JSON.stringify(req.body, null, 2).substring(0, 1000));
    
    // Ensure req.body exists
    if (!req.body) {
      req.body = {};
    }
    
    // Ensure city has a default value if missing
    if (!req.body.city || (typeof req.body.city === 'string' && !req.body.city.trim())) {
      req.body.city = 'Unknown';
    }
    
    // Ensure title exists - it's required
    if (!req.body.title) {
      return res.status(400).json({
        error: 'Validation failed',
        details: [{ path: ['title'], message: 'Title is required' }],
      });
    }
    
    const result = createComplexSchema.safeParse({ body: req.body });
    if (!result.success) {
      console.error('Validation failed:', JSON.stringify(result.error.errors, null, 2));
      return res
        .status(400)
        .json({ error: 'Validation failed', details: result.error.errors });
    }

    const files = req.files || {};
    const permission1 = files.permission1?.[0] || files.permission_1?.[0] || null;
    const permission2 = files.permission2?.[0] || files.permission_2?.[0] || null;
    const permission3 = files.permission3?.[0] || files.permission_3?.[0] || null;
    const provided = [permission1, permission2, permission3].filter(Boolean).length;

    if (provided > 0 && provided < 3) {
      return res.status(400).json({
        error: 'Validation failed',
        details: [
          {
            path: ['permissions'],
            message:
              'Provide all three permission files (permission1, permission2, permission3) or none',
          },
        ],
      });
    }

    req.validated = {
      ...result.data,
      files,
      meta: { complexId: req.complexId },
    };
    
    console.log('Validation passed. Validated data keys:', Object.keys(req.validated.body || {}));
    next();
  } catch (err) {
    console.error('Error in validateCreate:', err);
    return res.status(500).json({
      error: 'Validation error',
      message: err.message,
    });
  }
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

module.exports = { validateCreate, validateUpdate, validateGetById, validateList };