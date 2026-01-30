const { z } = require('zod');
const { ROLES } = require('../../utils/roles');

const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
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

module.exports = { 
  validateCreateUser, 
  validateUpdateUser, 
  validateGetUserById, 
  validateDeleteUser 
};
