const express = require('express');
const crypto = require('crypto');
const complexesController = require('./complexes.controller');
const {
  validateCreate,
  validateUpdate,
  validateGetById,
  validateList,
} = require('./complexes.validators');
const { authMiddleware } = require('../../middleware/auth');
const { requireManagerAdmin, requireOwnerAdmin } = require('../../middleware/roles');
const { complexUpload } = require('../../middleware/upload');

const router = express.Router();

function assignComplexId(req, res, next) {
  req.complexId = crypto.randomUUID();
  next();
}

// Public read endpoints
router.get('/', validateList, complexesController.list);
router.get('/:id', validateGetById, complexesController.getById);

// Admin-only creator & editor
router.post(
  '/',
  authMiddleware,
  requireManagerAdmin,
  assignComplexId,
  complexUpload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'permission1', maxCount: 1 },
    { name: 'permission2', maxCount: 1 },
    { name: 'permission3', maxCount: 1 },
    { name: 'permission_1', maxCount: 1 },
    { name: 'permission_2', maxCount: 1 },
    { name: 'permission_3', maxCount: 1 },
  ]),
  validateCreate,
  complexesController.create
);

router.patch(
  '/:id',
  authMiddleware,
  requireManagerAdmin,
  complexUpload.fields([
    { name: 'banner', maxCount: 1 },
    { name: 'permission1', maxCount: 1 },
    { name: 'permission2', maxCount: 1 },
    { name: 'permission3', maxCount: 1 },
    { name: 'permission_1', maxCount: 1 },
    { name: 'permission_2', maxCount: 1 },
    { name: 'permission_3', maxCount: 1 },
  ]),
  validateUpdate,
  complexesController.update
);

router.delete(
  '/:id',
  authMiddleware,
  requireOwnerAdmin,
  validateGetById,
  complexesController.remove
);

// Get complexes for seller (only complexes where seller is in allowedSellers)
router.get(
  '/for-seller',
  authMiddleware,
  validateList,
  complexesController.getForSeller
);

module.exports = router;
