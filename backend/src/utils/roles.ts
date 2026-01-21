import { UserRole } from '@prisma/client';

// Define role hierarchy (higher index = higher privileges)
export const ROLE_HIERARCHY: UserRole[] = [
  UserRole.USER,        // 0 - Lowest
  UserRole.SELLER,      // 1
  UserRole.ADMIN,       // 2
  UserRole.MANAGER_ADMIN, // 3
  UserRole.OWNER_ADMIN  // 4 - Highest
];

// Check if a role has at least the required privilege level
export const hasMinimumRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const userLevel = ROLE_HIERARCHY.indexOf(userRole);
  const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole);
  
  return userLevel >= requiredLevel;
};

// Check if a role can create another role (based on SERVICE_DOC.md rules)
export const canCreateRole = (creatorRole: UserRole, targetRole: UserRole): boolean => {
  // USER can only self-register (handled separately in auth)
  if (targetRole === UserRole.USER) {
    return false; // USER self-registers, no one creates USER
  }

  // OWNER_ADMIN can create SELLER and MANAGER_ADMIN
  if (creatorRole === UserRole.OWNER_ADMIN) {
    return targetRole === UserRole.SELLER || 
           targetRole === UserRole.MANAGER_ADMIN || 
           targetRole === UserRole.ADMIN;
  }

  // MANAGER_ADMIN can create ADMIN only
  if (creatorRole === UserRole.MANAGER_ADMIN) {
    return targetRole === UserRole.ADMIN;
  }

  // ADMIN and below cannot create any roles
  return false;
};

// Check if a role can manage (edit/delete) another user
export const canManageUser = (managerRole: UserRole, targetRole: UserRole): boolean => {
  // Higher or equal roles in hierarchy can manage lower roles
  const managerLevel = ROLE_HIERARCHY.indexOf(managerRole);
  const targetLevel = ROLE_HIERARCHY.indexOf(targetRole);
  
  return managerLevel > targetLevel;
};

// Get all roles that a given role can create
export const getCreatableRoles = (role: UserRole): UserRole[] => {
  switch (role) {
    case UserRole.OWNER_ADMIN:
      return [UserRole.SELLER, UserRole.MANAGER_ADMIN, UserRole.ADMIN];
    case UserRole.MANAGER_ADMIN:
      return [UserRole.ADMIN];
    default:
      return [];
  }
};

// Role descriptions for UI/API responses
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.USER]: 'Regular user - can browse and purchase apartments',
  [UserRole.SELLER]: 'Seller - can create and manage their own apartment listings',
  [UserRole.ADMIN]: 'Admin - can moderate listings and manage content',
  [UserRole.MANAGER_ADMIN]: 'Manager Admin - can create and manage regular admins',
  [UserRole.OWNER_ADMIN]: 'Owner Admin - full system access, can create managers and sellers'
};