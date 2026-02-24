const { z } = require('zod');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter')
  .regex(/\d/, 'Password must include at least one number');

const loginSchema = z.object({
  body: z
    .object({
      email: z.string().email('Invalid email').optional(),
      password: z.string().min(1, 'Password required').optional(),
      idToken: z.string().min(1, 'idToken required').optional(),
    })
    .superRefine((value, ctx) => {
      const hasFirebaseToken = Boolean(value.idToken);
      const hasPasswordCredentials = Boolean(value.email && value.password);

      if (!hasFirebaseToken && !hasPasswordCredentials) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['idToken'],
          message: 'Either idToken or email/password is required',
        });
      }
    }),
});

const registerSchema = z.object({
  body: z
    .object({
      idToken: z.string().min(1, 'idToken required').optional(),
      email: z.string().email('Invalid email').optional(),
      password: passwordSchema.optional(),
      fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional(),
    })
    .superRefine((value, ctx) => {
      if (value.idToken) {
        return;
      }

      if (!value.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: 'Email required',
        });
      }

      if (!value.password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['password'],
          message: 'Password required',
        });
      }
    }),
});

const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token required'),
    password: passwordSchema,
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

function validateResendVerification(req, res, next) {
  const result = resendVerificationSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateForgotPassword(req, res, next) {
  const result = forgotPasswordSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateResetPassword(req, res, next) {
  const result = resetPasswordSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

module.exports = {
  validateLogin,
  validateRegister,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
};
