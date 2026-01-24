import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { UserRole } from '@prisma/client';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

// Favorites routes
router.post('/favorites', userController.addFavorite);
router.delete('/favorites/:apartmentId', userController.removeFavorite);
router.get('/favorites', userController.getFavorites);
router.get('/favorites/status/:apartmentId', userController.checkFavoriteStatus);
router.post('/favorites/batch-status', userController.batchCheckFavoriteStatus);

// Saved searches routes
router.post('/saved-searches', userController.saveSearch);
router.get('/saved-searches', userController.getSavedSearches);
router.put('/saved-searches/:id', userController.updateSavedSearch);
router.delete('/saved-searches/:id', userController.deleteSavedSearch);
router.put('/saved-searches/:id/last-used', userController.updateLastUsed);

export default router;