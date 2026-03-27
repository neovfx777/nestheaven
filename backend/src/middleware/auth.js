const { prisma } = require('../config/db');
const env = require('../config/env');
const { verifyToken } = require('../utils/jwt');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { ROLES } = require('../utils/roles');

/**
 * Verify JWT and attach req.user
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }

  let user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
  });

  // Dev ergonomics: local DB reseeds can invalidate stored JWTs (userId changes).
  // When enabled, allow resolving the user by token email as a fallback.
  if (!user && env.ALLOW_JWT_EMAIL_FALLBACK && decoded.email) {
    user = await prisma.user.findUnique({
      where: { email: String(decoded.email).toLowerCase() },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    });
  }

  // If the token is valid but the DB has been wiped/reseeded, optionally recreate the user in dev.
  if (!user && env.NODE_ENV !== 'production' && env.ALLOW_JWT_EMAIL_FALLBACK && decoded.email) {
    const email = String(decoded.email).toLowerCase();
    const requestedRole = String(decoded.role || ROLES.USER);
    const role = Object.values(ROLES).includes(requestedRole) ? requestedRole : ROLES.USER;

    try {
      const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      const created = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role,
          isActive: true,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
        },
      });
      user = created;
    } catch (error) {
      // If another request created it concurrently, fetch it again.
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          firstName: true,
          lastName: true,
          phone: true,
          createdAt: true,
        },
      });
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', message: 'User not found' });
  }
  if (user.isActive === false) {
    return res.status(403).json({ error: 'Forbidden', message: 'Account is deactivated' });
  }

  req.user = user;
  next();
}

/**
 * Optional auth - attach user if token valid, but do not require it
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    req.user = null;
    return next();
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    req.user = null;
    return next();
  }

  let user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      emailVerified: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
  });

  if (!user && env.ALLOW_JWT_EMAIL_FALLBACK && decoded.email) {
    user = await prisma.user.findUnique({
      where: { email: String(decoded.email).toLowerCase() },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
      },
    });
  }
  if (user && user.isActive === false) {
    req.user = null;
    return next();
  }

  req.user = user || null;
  next();
}

module.exports = { authMiddleware, optionalAuth };
