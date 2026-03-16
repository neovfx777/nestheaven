const { z } = require('zod');

const isoDateTime = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Invalid datetime');

const getTourSlotsSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  query: z
    .object({
      from: isoDateTime,
      to: isoDateTime,
    })
    .refine((q) => new Date(q.from).getTime() < new Date(q.to).getTime(), {
      message: '"from" must be before "to"',
      path: ['from'],
    }),
});

const bookTourSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    startAt: isoDateTime,
  }),
});

function validateGetTourSlots(req, res, next) {
  const result = getTourSlotsSchema.safeParse({ params: req.params, query: req.query });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateBookTour(req, res, next) {
  const result = bookTourSchema.safeParse({ params: req.params, body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

module.exports = {
  validateGetTourSlots,
  validateBookTour,
};

