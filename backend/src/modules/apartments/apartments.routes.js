const express = require('express');
const apartmentsController = require('./apartments.controller');
const {
  validateCreate,
  validateUpdate,
  validateList,
  validateGetById,
  validateMarkSold,
  validateHideUnhide,
} = require('./apartments.validators');
const { authMiddleware, optionalAuth } = require('../../middleware/auth');
const { requireRoles, requireSeller, requireAdmin } = require('../../middleware/roles');
const { ROLES } = require('../../utils/roles');
const { upload } = require('../../middleware/upload');

const router = express.Router();

// Public endpoints
router.get('/', optionalAuth, validateList, apartmentsController.list);
router.get('/seller/my', authMiddleware, requireSeller, apartmentsController.getMyListings);
router.get('/:id', optionalAuth, validateGetById, apartmentsController.getById);

// Seller/Admin create endpoint
router.post(
  '/',
  authMiddleware,
  requireRoles(ROLES.SELLER, ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN),
  validateCreate,
  apartmentsController.create
);
router.post('/:id/sold', authMiddleware, requireSeller, validateMarkSold, apartmentsController.markSold);

// Seller can update own listing, owner admin can update all
router.patch(
  '/:id',
  authMiddleware,
  requireRoles(ROLES.SELLER, ROLES.OWNER_ADMIN),
  validateUpdate,
  apartmentsController.update
);

// Only owner admin can delete permanently
router.delete(
  '/:id',
  authMiddleware,
  requireRoles(ROLES.OWNER_ADMIN),
  validateGetById,
  apartmentsController.remove
);

// Admin visibility endpoint
router.patch(
  '/:id/visibility',
  authMiddleware,
  requireAdmin,
  validateHideUnhide,
  apartmentsController.hideUnhide
);

// Seller can upload images for own listing
router.post(
  '/:id/images',
  authMiddleware,
  requireRoles(ROLES.SELLER, ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN),
  upload.array('images', 10),
  apartmentsController.uploadImages
);

module.exports = router;
