const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password required'),
  }),
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
  }),
});

function validateLogin(req, res, next) {
  const result = loginSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateRegister(req, res, next) {
  const result = registerSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

module.exports = { validateLogin, validateRegister };
