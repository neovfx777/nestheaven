const { z } = require('zod');

const isoDateTime = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Invalid datetime');

const listRangeSchema = z.object({
  query: z
    .object({
      from: isoDateTime.optional(),
      to: isoDateTime.optional(),
    })
    .optional(),
});

const createAvailabilitySchema = z.object({
  body: z
    .object({
      startAt: isoDateTime,
      endAt: isoDateTime,
    })
    .refine((b) => new Date(b.startAt).getTime() < new Date(b.endAt).getTime(), {
      message: 'endAt must be after startAt',
      path: ['endAt'],
    }),
});

const availabilityIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

function validateListRange(req, res, next) {
  const result = listRangeSchema.safeParse({ query: req.query });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = { ...(req.validated || {}), ...result.data };
  next();
}

function validateCreateAvailability(req, res, next) {
  const result = createAvailabilitySchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateAvailabilityId(req, res, next) {
  const result = availabilityIdSchema.safeParse({ params: req.params });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = { ...(req.validated || {}), ...result.data };
  next();
}

module.exports = {
  validateListRange,
  validateCreateAvailability,
  validateAvailabilityId,
};

