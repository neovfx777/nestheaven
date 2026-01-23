import { Router } from 'express';
import { ApartmentController } from './apartment.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { upload } from '../../middleware/upload';
import { UserRole } from '@prisma/client';
import statusRoutes from './status.routes';

const router = Router();
const apartmentController = new ApartmentController();

// Public routes
router.get('/', apartmentController.listApartments);
router.get('/:id', apartmentController.getApartment);

// Protected routes (authenticated users)
router.use(authenticate);

// Seller-only routes
router.post(
  '/',
  requireRole([UserRole.SELLER]),
  upload.array('images', 10), // Max 10 images
  apartmentController.createApartment
);

router.get(
  '/seller/my',
  requireRole([UserRole.SELLER]),
  apartmentController.getMyApartments
);

router.put(
  '/:id',
  apartmentController.updateApartment
);

router.delete(
  '/:id',
  apartmentController.deleteApartment
);

// Status management routes
router.use('/:id/status', statusRoutes);

export default router;