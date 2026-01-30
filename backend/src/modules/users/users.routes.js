const express = require('express');
const usersController = require('./users.controller');
const {
  validateUpdateProfile,
  validateFavorite,
  validateSavedSearch,
  validateSavedSearchId,
} = require('./users.validators');
const { authMiddleware } = require('../../middleware/auth');
const { requireUser } = require('../../middleware/roles');

const router = express.Router();

router.use(authMiddleware);
router.use(requireUser);

router.get('/me', usersController.getProfile);
router.patch('/me', validateUpdateProfile, usersController.updateProfile);

router.get('/favorites', usersController.getFavorites);
router.post('/favorites/:apartmentId', validateFavorite, usersController.addFavorite);
router.delete('/favorites/:apartmentId', validateFavorite, usersController.removeFavorite);
router.get('/favorites/status/:apartmentId', usersController.checkFavoriteStatus);

router.get('/saved-searches', usersController.getSavedSearches);
router.post('/saved-searches', validateSavedSearch, usersController.createSavedSearch);
router.delete('/saved-searches/:id', validateSavedSearchId, usersController.deleteSavedSearch);

module.exports = router;
