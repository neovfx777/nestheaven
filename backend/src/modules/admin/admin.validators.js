const { z } = require('zod');
const { ROLES } = require('../../utils/roles');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Za-z]/, 'Password must include at least one letter')
  .regex(/\d/, 'Password must include at least one number');

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: passwordSchema,
    role: z.enum([ROLES.USER, ROLES.SELLER, ROLES.ADMIN, ROLES.MANAGER_ADMIN]),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
  }),
});

const updateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    role: z.enum([ROLES.USER, ROLES.SELLER, ROLES.ADMIN, ROLES.MANAGER_ADMIN]).optional(),
    isActive: z.boolean().optional(),
  }),
});

const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User ID is required'),
  }),
});

// Add search query validation schema
const listUsersQuerySchema = z.object({
  query: z.object({
    role: z.enum([ROLES.USER, ROLES.SELLER, ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN]).optional(),
    searchTerm: z.string().min(1).max(100).optional(),
    searchBy: z.enum(['name', 'email', 'phone', 'all']).default('all').optional(),
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

function validateUpdateUser(req, res, next) {
  const result = updateUserSchema.safeParse({ params: req.params, body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateGetUserById(req, res, next) {
  const result = getUserByIdSchema.safeParse({ params: req.params });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateDeleteUser(req, res, next) {
  const result = deleteUserSchema.safeParse({ params: req.params });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

// Add this validation function
function validateListUsersQuery(req, res, next) {
  const result = listUsersQuerySchema.safeParse({ query: req.query });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  // Merge validated query params
  req.query = { ...req.query, ...result.data.query };
  next();
}

module.exports = { 
  validateCreateUser, 
  validateUpdateUser, 
  validateGetUserById, 
  validateDeleteUser,
  validateListUsersQuery
};
