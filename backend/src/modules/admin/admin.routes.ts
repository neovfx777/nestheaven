import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth';
import { requireRole, requireRoleCreationPermission } from '../../middleware/roles';
import { getCreatableRoles, ROLE_DESCRIPTIONS } from '../../utils/roles';

const router = Router();

// GET /api/admin/roles - Get role information (OWNER_ADMIN and MANAGER_ADMIN only)
router.get(
  '/roles',
  authenticate,
  requireRole(UserRole.MANAGER_ADMIN),
  (req, res) => {
    try {
      const userRole = req.user!.role;
      const creatableRoles = getCreatableRoles(userRole);
      
      res.json({
        success: true,
        data: {
          currentRole: userRole,
          creatableRoles,
          allRoles: Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => ({
            role,
            description,
            canCreate: creatableRoles.includes(role as UserRole)
          }))
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get role information'
      });
    }
  }
);

// GET /api/admin/permissions - Check permissions for current user
router.get(
  '/permissions',
  authenticate,
  (req, res) => {
    try {
      const userRole = req.user!.role;
      const creatableRoles = getCreatableRoles(userRole);
      
      res.json({
        success: true,
        data: {
          role: userRole,
          description: ROLE_DESCRIPTIONS[userRole],
          canCreateSeller: creatableRoles.includes(UserRole.SELLER),
          canCreateAdmin: creatableRoles.includes(UserRole.ADMIN),
          canCreateManagerAdmin: creatableRoles.includes(UserRole.MANAGER_ADMIN),
          canModerateListings: [UserRole.ADMIN, UserRole.MANAGER_ADMIN, UserRole.OWNER_ADMIN].includes(userRole),
          canManageUsers: [UserRole.MANAGER_ADMIN, UserRole.OWNER_ADMIN].includes(userRole)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get permission information'
      });
    }
  }
);

// POST /api/admin/create-role-demo - Demo endpoint for role creation (protected)
router.post(
  '/create-role-demo',
  authenticate,
  requireRoleCreationPermission(UserRole.ADMIN), // Example: requires permission to create ADMIN
  (req, res) => {
    // This is a demo endpoint - actual user creation will be in user management module
    res.json({
      success: true,
      message: 'Role creation permission verified',
      data: {
        creatorRole: req.user!.role,
        allowedToCreate: 'ADMIN',
        note: 'Actual user creation would happen here with proper validation'
      }
    });
  }
);

export default router;