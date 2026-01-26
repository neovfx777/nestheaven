import { Router } from 'express';
import { ComplexController } from './complex.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';

const router = Router();
const controller = new ComplexController();

// ===== Public routes =====
router.get('/', controller.getAll.bind(controller));
router.get('/search', controller.search.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.get('/:id/apartments', controller.getOtherApartments.bind(controller));
router.get('/:id/stats', controller.getComplexStats.bind(controller));

// Other apartments endpoint (public)
router.get('/apartments/:apartmentId/other', controller.getOtherApartments.bind(controller));

// ===== Protected admin routes =====
router.get(
  '/admin/filtered',
  authenticate,
  requireRole(['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']),
  controller.getComplexesWithFilters.bind(controller)
);

router.get(
  '/admin/stats',
  authenticate,
  requireRole(['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']),
  controller.getComplexStats.bind(controller)
);

router.post(
  '/',
  authenticate,
  requireRole(['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']),
  controller.create.bind(controller)
);

router.put(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']),
  controller.update.bind(controller)
);

router.delete(
  '/:id',
  authenticate,
  requireRole(['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN']),
  controller.delete.bind(controller)
);

export { router as complexRoutes };
