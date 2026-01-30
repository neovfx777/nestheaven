const express = require('express');
const adminController = require('./admin.controller');
const { validateCreateUser } = require('./admin.validators');
const { authMiddleware } = require('../../middleware/auth');
const { requireManagerAdmin, requireOwnerAdmin } = require('../../middleware/roles');

const router = express.Router();

router.use(authMiddleware);

router.post('/users', requireManagerAdmin, validateCreateUser, adminController.createUser);
router.get('/users', requireManagerAdmin, adminController.listUsers);

module.exports = router;
