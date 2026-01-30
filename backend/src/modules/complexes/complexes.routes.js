const express = require('express');
const complexesController = require('./complexes.controller');
const { validateCreate, validateUpdate, validateGetById } = require('./complexes.validators');
const { authMiddleware } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/roles');

const router = express.Router();

router.get('/', complexesController.list);
router.get('/:id', validateGetById, complexesController.getById);

router.post('/', authMiddleware, requireAdmin, validateCreate, complexesController.create);
router.patch('/:id', authMiddleware, requireAdmin, validateUpdate, complexesController.update);
router.delete('/:id', authMiddleware, requireAdmin, validateGetById, complexesController.remove);

module.exports = router;
