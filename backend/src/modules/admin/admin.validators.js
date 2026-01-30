const { z } = require('zod');
const { ROLES } = require('../../utils/roles');

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum([ROLES.SELLER, ROLES.ADMIN, ROLES.MANAGER_ADMIN]),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
  }),
});

function validateCreateUser(req, res, next) {
  const result = createUserSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

module.exports = { validateCreateUser };
