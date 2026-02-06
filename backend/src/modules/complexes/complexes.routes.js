const express = require('express');
const complexesController = require('./complexes.controller');
const {
  validateCreate,
  validateUpdate,
  validateGetById,
} = require('./complexes.validators');
const { authMiddleware } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/roles');
const { upload } = require('../../middleware/upload');

const router = express.Router();

// Debug log
router.use((req, res, next) => {
  console.log(' Complexes route hit:', req.method, req.url);
  next();
});

// Public read endpoints
router.get('/', complexesController.list);
router.get('/:id', validateGetById, complexesController.getById);

// Admin-only creator & editor
router.post(
  '/',
  authMiddleware,
  requireAdmin,
  upload.fields([
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
  requireAdmin,
  validateUpdate,
  complexesController.update
);

router.delete(
  '/:id',
  authMiddleware,
  requireAdmin,
  validateGetById,
  complexesController.remove
);

module.exports = router;
