const express = require('express');
const authController = require('./auth.controller');
const { validateLogin, validateRegister } = require('./auth.validators');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

router.post('/login', validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
