const express = require('express');
const authController = require('./auth.controller');
const {
  validateLogin,
  validateRegister,
  validateResendVerification,
  validateForgotPassword,
  validateResetPassword,
} = require('./auth.validators');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

router.post('/login', validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', validateResendVerification, authController.resendVerification);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
