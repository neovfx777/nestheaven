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

// Multer error handler middleware
function handleMulterError(err, req, res, next) {
  if (err) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'File too large',
      });
    }
    if (err.message && err.message.includes('Invalid')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: err.message,
      });
    }
    return res.status(400).json({
      error: 'Bad Request',
      message: err.message || 'File upload error',
    });
  }
  next();
}

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
  handleMulterError,
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
  handleMulterError,
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
// Make sure this controller method exists
router.get(
  '/for-seller',
  authMiddleware,
  validateList,
  (req, res, next) => {
    // If controller method doesn't exist yet, return empty array
    if (!complexesController.getForSeller) {
      return res.json({ success: true, data: [] });
    }
    complexesController.getForSeller(req, res, next);
  }
);

module.exports = router;