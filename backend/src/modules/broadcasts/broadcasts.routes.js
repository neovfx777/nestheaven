const express = require('express');
const broadcastsController = require('./broadcasts.controller');
const { validateCreate, validateUpdate, validateList } = require('./broadcasts.validators');
const { authMiddleware } = require('../../middleware/auth');
const { requireOwnerAdmin } = require('../../middleware/roles');

const router = express.Router();

// Public list
router.get('/', validateList, broadcastsController.listPublic);

// Owner admin management
router.post('/', authMiddleware, requireOwnerAdmin, validateCreate, broadcastsController.create);
router.patch('/:id', authMiddleware, requireOwnerAdmin, validateUpdate, broadcastsController.update);
router.delete('/:id', authMiddleware, requireOwnerAdmin, broadcastsController.remove);

module.exports = router;
