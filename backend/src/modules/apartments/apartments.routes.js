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

// Ochiq route'lar
router.get('/', optionalAuth, validateList, apartmentsController.list);
router.get('/:id', optionalAuth, validateGetById, apartmentsController.getById);

// Seller uchun maxsus route'lar
router.get('/seller/my', authMiddleware, requireSeller, apartmentsController.getMyListings); // YANGI ENDPOINT
router.post('/', authMiddleware, requireSeller, validateCreate, apartmentsController.create);
router.post('/:id/sold', authMiddleware, requireSeller, validateMarkSold, apartmentsController.markSold);

// Yangilash/O'chirish (seller o'z listlarini, owner_admin hammasini)
router.patch('/:id', authMiddleware, requireRoles(ROLES.SELLER, ROLES.OWNER_ADMIN), validateUpdate, apartmentsController.update);
router.delete('/:id', authMiddleware, requireRoles(ROLES.SELLER, ROLES.OWNER_ADMIN), validateGetById, apartmentsController.remove);

// Admin uchun route'lar
router.patch('/:id/visibility', authMiddleware, requireAdmin, validateHideUnhide, apartmentsController.hideUnhide);

// Rasm yuklash (seller o'z listlariga rasm yuklay oladi)
router.post('/:id/images', authMiddleware, requireSeller, upload.array('images', 10), apartmentsController.uploadImages);

module.exports = router;