const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { prisma } = require('../../config/db');
const { signToken } = require('../../utils/jwt');
const { ROLES } = require('../../utils/roles');
const env = require('../../config/env');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../../utils/mailer');
const { verifyFirebaseIdToken, getFirebaseAuth } = require('../../utils/firebaseAdmin');

function makeToken(ttlMinutes) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  return { rawToken, tokenHash, expiresAt };
}

function buildFullName(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.email;
}

function buildUserPayload(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: buildFullName(user),
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

function splitFullName(fullName) {
  const cleaned = String(fullName || '').trim();
  if (!cleaned) {
    return { firstName: null, lastName: null };
  }

  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: null };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function issueLocalToken(user) {
  return signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
}

async function upsertFirebaseUser(decodedToken, extras = {}) {
  const email = normalizeEmail(decodedToken.email);
  if (!email) {
    const err = new Error('Firebase token does not contain a valid email');
    err.statusCode = 400;
    throw err;
  }

  const firebaseVerified = Boolean(decodedToken.email_verified);
  const fullNameParts = splitFullName(extras.fullName || decodedToken.name || '');
  const firstName = extras.firstName || fullNameParts.firstName;
  const lastName = extras.lastName || fullNameParts.lastName;
  const phone = typeof extras.phone === 'string' ? extras.phone.trim() : '';

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: ROLES.USER,
        emailVerified: firebaseVerified,
        emailVerifiedAt: firebaseVerified ? new Date() : null,
        firstName,
        lastName,
        phone: phone || null,
      },
    });

    return user;
  }

  const updates = {};

  if (user.emailVerified !== firebaseVerified) {
    updates.emailVerified = firebaseVerified;
    updates.emailVerifiedAt = firebaseVerified ? new Date() : null;
  }

  if (!user.firstName && firstName) {
    updates.firstName = firstName;
  }

  if (!user.lastName && lastName) {
    updates.lastName = lastName;
  }

  if ((!user.phone || user.phone.trim() === '') && phone) {
    updates.phone = phone;
  }

  if (Object.keys(updates).length > 0) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: updates,
    });
  }

  return user;
}

async function ensureFirebaseUserFromLocalLogin(user, plainPassword) {
  try {
    const auth = getFirebaseAuth();
    const displayName = buildFullName(user);
    const emailVerified = user.emailVerified !== false;

    let firebaseUser = null;
    try {
      firebaseUser = await auth.getUserByEmail(user.email);
    } catch (error) {
      if (error?.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    if (!firebaseUser) {
      await auth.createUser({
        email: user.email,
        password: plainPassword,
        emailVerified,
        displayName,
      });
      return;
    }

    const updates = {
      password: plainPassword,
    };

    if (!firebaseUser.displayName && displayName) {
      updates.displayName = displayName;
    }

    if (emailVerified && !firebaseUser.emailVerified) {
      updates.emailVerified = true;
    }

    await auth.updateUser(firebaseUser.uid, updates);
  } catch (error) {
    console.warn('[firebase] Failed to sync local login to Firebase:', {
      email: user.email,
      code: error?.code,
      message: error?.message,
    });
  }
}

async function loginWithFirebase(idToken) {
  const decodedToken = await verifyFirebaseIdToken(idToken);
  const user = await upsertFirebaseUser(decodedToken);

  if (user.isActive === false) {
    const err = new Error('Account is deactivated');
    err.statusCode = 403;
    throw err;
  }

  if (!decodedToken.email_verified) {
    const err = new Error('Please verify your email before logging in');
    err.statusCode = 403;
    err.errorCode = 'EMAIL_NOT_VERIFIED';
    throw err;
  }

  return {
    token: issueLocalToken(user),
    user: buildUserPayload(user),
  };
}

async function registerWithFirebase(data) {
  const decodedToken = await verifyFirebaseIdToken(data.body.idToken);
  const user = await upsertFirebaseUser(decodedToken, data.body);

  if (user.isActive === false) {
    const err = new Error('Account is deactivated');
    err.statusCode = 403;
    throw err;
  }

  if (!decodedToken.email_verified) {
    return {
      success: true,
      requiresEmailVerification: true,
      message: 'Verification email sent. Please check your inbox.',
      email: user.email,
    };
  }

  return {
    token: issueLocalToken(user),
    user: buildUserPayload(user),
  };
}

async function login(email, password) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  if (user.isActive === false) {
    const err = new Error('Account is deactivated');
    err.statusCode = 403;
    throw err;
  }

  if (env.EMAIL_REQUIRE_VERIFICATION && user.emailVerified === false) {
    const err = new Error('Please verify your email before logging in');
    err.statusCode = 403;
    err.errorCode = 'EMAIL_NOT_VERIFIED';
    throw err;
  }

  return {
    token: issueLocalToken(user),
    user: buildUserPayload(user),
  };
}

async function register(data, requestBaseUrl) {
  const existing = await prisma.user.findUnique({
    where: { email: data.body.email.toLowerCase() },
  });

  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(data.body.password, 10);
  const fullNameParts = splitFullName(data.body.fullName);
  const firstName = data.body.firstName || fullNameParts.firstName;
  const lastName = data.body.lastName || fullNameParts.lastName;

  const verificationToken = env.EMAIL_REQUIRE_VERIFICATION
    ? makeToken(env.EMAIL_VERIFY_TOKEN_TTL_MIN)
    : null;

  const user = await prisma.user.create({
    data: {
      email: data.body.email.toLowerCase(),
      passwordHash,
      role: ROLES.USER,
      emailVerified: !env.EMAIL_REQUIRE_VERIFICATION,
      ...(env.EMAIL_REQUIRE_VERIFICATION && {
        emailVerificationToken: verificationToken.tokenHash,
        emailVerificationExpiresAt: verificationToken.expiresAt,
      }),
      firstName,
      lastName,
      phone: data.body.phone,
    },
  });

  if (env.EMAIL_REQUIRE_VERIFICATION) {
    const verifyUrl = `${requestBaseUrl}/verify-email?token=${verificationToken.rawToken}`;
    await sendVerificationEmail({ to: user.email, verifyUrl });

    return {
      success: true,
      requiresEmailVerification: true,
      message: 'Verification email sent. Please check your inbox.',
      email: user.email,
    };
  }

  await ensureFirebaseUserFromLocalLogin(user, password);

  return {
    token: issueLocalToken(user),
    user: buildUserPayload(user),
  };
}

async function verifyEmail(token) {
  if (!token) {
    const err = new Error('Verification token is required');
    err.statusCode = 400;
    throw err;
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: tokenHash,
      emailVerificationExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    const err = new Error('Verification link is invalid or expired');
    err.statusCode = 400;
    throw err;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
    },
  });

  return {
    success: true,
    message: 'Email verified successfully',
  };
}

async function resendVerificationEmail(email, requestBaseUrl) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || user.isActive === false || user.emailVerified === true) {
    return {
      success: true,
      message: 'If an account exists, a verification email has been sent.',
    };
  }

  const verificationToken = makeToken(env.EMAIL_VERIFY_TOKEN_TTL_MIN);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken.tokenHash,
      emailVerificationExpiresAt: verificationToken.expiresAt,
    },
  });

  const verifyUrl = `${requestBaseUrl}/verify-email?token=${verificationToken.rawToken}`;
  await sendVerificationEmail({ to: user.email, verifyUrl });

  return {
    success: true,
    message: 'If an account exists, a verification email has been sent.',
  };
}

async function requestPasswordReset(email, requestBaseUrl) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || user.isActive === false) {
    return {
      success: true,
      message: 'If an account exists, password reset instructions were sent.',
    };
  }

  const resetToken = makeToken(env.PASSWORD_RESET_TOKEN_TTL_MIN);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken.tokenHash,
      passwordResetExpiresAt: resetToken.expiresAt,
    },
  });

  const resetUrl = `${requestBaseUrl}/reset-password?token=${resetToken.rawToken}`;
  await sendPasswordResetEmail({ to: user.email, resetUrl });

  return {
    success: true,
    message: 'If an account exists, password reset instructions were sent.',
  };
}

async function resetPassword(token, newPassword) {
  if (!token) {
    const err = new Error('Reset token is required');
    err.statusCode = 400;
    throw err;
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: tokenHash,
      passwordResetExpiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    const err = new Error('Reset link is invalid or expired');
    err.statusCode = 400;
    throw err;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    },
  });

  return {
    success: true,
    message: 'Password updated successfully',
  };
}

module.exports = {
  loginWithFirebase,
  registerWithFirebase,
  login,
  register,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
};
