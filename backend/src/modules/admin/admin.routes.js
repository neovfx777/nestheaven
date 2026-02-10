const express = require('express');
const adminController = require('./admin.controller');
const { 
  validateCreateUser, 
  validateUpdateUser, 
  validateGetUserById, 
  validateDeleteUser,
  validateListUsersQuery
} = require('./admin.validators');
const { authMiddleware } = require('../../middleware/auth');
const { requireManagerAdmin, requireOwnerAdmin } = require('../../middleware/roles');

const router = express.Router();

router.use(authMiddleware);

router.post('/users', requireManagerAdmin, validateCreateUser, adminController.createUser);
router.get('/users', requireManagerAdmin, validateListUsersQuery, adminController.listUsers);
router.get('/users/:id', requireManagerAdmin, validateGetUserById, adminController.getUserById);
router.patch('/users/:id', requireManagerAdmin, validateUpdateUser, adminController.updateUser);
router.delete('/users/:id', requireOwnerAdmin, validateDeleteUser, adminController.deleteUser);

module.exports = router;
