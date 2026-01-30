const { z } = require('zod');

const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
  }).refine((b) => Object.keys(b).length > 0, { message: 'At least one field to update' }),
});

const favoriteSchema = z.object({
  params: z.object({ apartmentId: z.string().min(1).optional() }),
  body: z.object({ apartmentId: z.string().min(1).optional() }),
}).refine((data) => data.params.apartmentId || data.body.apartmentId, {
  message: 'Apartment ID is required in params or body',
});

const savedSearchSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    filters: z.record(z.any()),
  }),
});

const savedSearchIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
});

function validateUpdateProfile(req, res, next) {
  const result = updateProfileSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateFavorite(req, res, next) {
  const result = favoriteSchema.safeParse({ 
    params: { apartmentId: req.params.apartmentId || req.params.id },
    body: req.body
  });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateSavedSearch(req, res, next) {
  const result = savedSearchSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateSavedSearchId(req, res, next) {
  const result = savedSearchIdSchema.safeParse({ params: req.params });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

module.exports = {
  validateUpdateProfile,
  validateFavorite,
  validateSavedSearch,
  validateSavedSearchId,
};
