import { Router } from 'express';
import { StatusController } from './status.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { UserRole } from '@prisma/client';

const router = Router();
const statusController = new StatusController();

// All status routes require authentication
router.use(authenticate);

// Individual apartment status management
router.put('/:id/status', statusController.changeStatus);
router.get('/:id/status/history', statusController.getStatusHistory);
router.get('/:id/status/transitions', statusController.getAvailableTransitions);

// Seller-specific sold endpoint
router.post(
  '/:id/mark-sold',
  requireRole(UserRole.SELLER),
  statusController.markAsSold
);

// Admin bulk operations
router.post(
  '/bulk/status',
  requireRole(UserRole.ADMIN),
  statusController.bulkChangeStatus
);

export default router;