const ROLES = {
  USER: 'USER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
  MANAGER_ADMIN: 'MANAGER_ADMIN',
  OWNER_ADMIN: 'OWNER_ADMIN',
};

const ROLE_HIERARCHY = {
  [ROLES.USER]: 0,
  [ROLES.SELLER]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.MANAGER_ADMIN]: 3,
  [ROLES.OWNER_ADMIN]: 4,
};

/**
 * Check if role A has at least the level of role B
 */
function hasRoleOrAbove(roleA, roleB) {
  return (ROLE_HIERARCHY[roleA] || 0) >= (ROLE_HIERARCHY[roleB] || 0);
}

/**
 * Check if user can create a given role
 */
function canCreateRole(creatorRole, targetRole) {
  if (creatorRole === ROLES.OWNER_ADMIN) {
    return [ROLES.USER, ROLES.SELLER, ROLES.ADMIN, ROLES.MANAGER_ADMIN].includes(targetRole);
  }
  if (creatorRole === ROLES.MANAGER_ADMIN) {
    return [ROLES.USER, ROLES.SELLER].includes(targetRole);
  }
  return false;
}

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  hasRoleOrAbove,
  canCreateRole,
};
