const { ROLES, hasRoleOrAbove } = require('../utils/roles');

/**
 * Require at least one of the given roles
 * @param {...string} allowedRoles
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
    }
    next();
  };
}

function requireUser(req, res, next) {
  return requireRoles(ROLES.USER, ROLES.SELLER, ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN)(req, res, next);
}

function requireSeller(req, res, next) {
  return requireRoles(ROLES.SELLER, ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN)(req, res, next);
}

function requireAdmin(req, res, next) {
  return requireRoles(ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN)(req, res, next);
}

function requireManagerAdmin(req, res, next) {
  return requireRoles(ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN)(req, res, next);
}

function requireOwnerAdmin(req, res, next) {
  return requireRoles(ROLES.OWNER_ADMIN)(req, res, next);
}

module.exports = {
  requireRoles,
  requireUser,
  requireSeller,
  requireAdmin,
  requireManagerAdmin,
  requireOwnerAdmin,
};
