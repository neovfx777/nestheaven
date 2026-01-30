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

router.get('/', optionalAuth, validateList, apartmentsController.list);
router.get('/:id', optionalAuth, validateGetById, apartmentsController.getById);

router.post('/', authMiddleware, requireSeller, validateCreate, apartmentsController.create);
router.patch('/:id', authMiddleware, requireRoles(ROLES.SELLER, ROLES.OWNER_ADMIN), validateUpdate, apartmentsController.update);
router.delete('/:id', authMiddleware, requireRoles(ROLES.SELLER, ROLES.OWNER_ADMIN), validateGetById, apartmentsController.remove);
router.post('/:id/sold', authMiddleware, requireSeller, validateMarkSold, apartmentsController.markSold);
router.patch('/:id/visibility', authMiddleware, requireAdmin, validateHideUnhide, apartmentsController.hideUnhide);
router.post('/:id/images', authMiddleware, requireSeller, upload.array('images', 10), apartmentsController.uploadImages);

module.exports = router;
