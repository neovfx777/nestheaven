import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AuthRequest } from './auth';
import { hasMinimumRole, canCreateRole } from '../utils/roles';

// Middleware to require a minimum role
export const requireRole = (requiredRole: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const userRole = req.user.role as UserRole;
      
      if (!hasMinimumRole(userRole, requiredRole)) {
        res.status(403).json({ 
          error: 'Insufficient permissions',
          message: `Requires role: ${requiredRole}, but user has: ${userRole}`
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

// Middleware to check if user can create a specific role
export const requireRoleCreationPermission = (targetRole: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const creatorRole = req.user.role as UserRole;
      
      if (!canCreateRole(creatorRole, targetRole)) {
        res.status(403).json({ 
          error: 'Cannot create this role',
          message: `Role ${creatorRole} cannot create role ${targetRole}`
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role creation middleware error:', error);
      res.status(500).json({ error: 'Role creation check failed' });
    }
  };
};

// Middleware to check if user can manage another user (by ID or role)
export const requireUserManagementPermission = (targetUserId?: string, targetUserRole?: UserRole) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const managerRole = req.user.role as UserRole;
      const managerId = req.user.id;

      // If checking against a specific user ID, fetch their role
      let targetRole = targetUserRole;
      
      if (targetUserId && !targetRole) {
        // In a real implementation, you would fetch the target user from DB
        // For now, we'll handle this in the actual endpoint
        // This middleware just sets up the check
      }

      // Users cannot manage themselves (except for their own profile updates)
      if (targetUserId && targetUserId === managerId) {
        // Allow self-profile updates, but not role changes
        if (req.method === 'PUT' || req.method === 'PATCH') {
          // Check if they're trying to change role
          if (req.body.role && req.body.role !== managerRole) {
            res.status(403).json({ 
              error: 'Cannot change your own role' 
            });
            return;
          }
        }
      }

      next();
    } catch (error) {
      console.error('User management middleware error:', error);
      res.status(500).json({ error: 'User management check failed' });
    }
  };
};