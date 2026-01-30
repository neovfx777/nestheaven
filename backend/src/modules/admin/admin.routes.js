const express = require('express');
const adminController = require('./admin.controller');
const { 
  validateCreateUser, 
  validateUpdateUser, 
  validateGetUserById, 
  validateDeleteUser 
} = require('./admin.validators');
const { authMiddleware } = require('../../middleware/auth');
const { requireAdmin, requireManagerAdmin, requireOwnerAdmin } = require('../../middleware/roles');

const router = express.Router();

router.use(authMiddleware);

router.post('/users', requireAdmin, validateCreateUser, adminController.createUser);
router.get('/users', requireAdmin, adminController.listUsers);
router.get('/users/:id', requireAdmin, validateGetUserById, adminController.getUserById);
router.patch('/users/:id', requireAdmin, validateUpdateUser, adminController.updateUser);
router.delete('/users/:id', requireOwnerAdmin, validateDeleteUser, adminController.deleteUser);

module.exports = router;
