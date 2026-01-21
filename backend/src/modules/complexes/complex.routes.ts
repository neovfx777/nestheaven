import { Router } from 'express';
import { ComplexController } from './complex.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
const complexController = new ComplexController();

// Public routes
router.get('/', complexController.listComplexes);
router.get('/search', complexController.searchComplexes);
router.get('/stats', complexController.getComplexesWithStats);
router.get('/:id', complexController.getComplex);
router.get('/:complexId/apartments', complexController.getApartmentsByComplex);
router.get('/:complexId/statistics', complexController.getComplexStatistics);

// Other apartments endpoint (public)
router.get('/apartments/:apartmentId/other', complexController.getOtherApartments);

// Protected routes (authenticated users can create/update/delete)
router.use(authenticate);

router.post('/', complexController.createComplex);
router.put('/:id', complexController.updateComplex);
router.delete('/:id', complexController.deleteComplex);

export default router;