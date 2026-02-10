const { prisma } = require('../config/db');
const { verifyToken } = require('../utils/jwt');

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

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
  });

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

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
  });
  if (user && user.isActive === false) {
    req.user = null;
    return next();
  }

  req.user = user || null;
  next();
}

module.exports = { authMiddleware, optionalAuth };
