const authService = require('./auth.service');
const env = require('../../config/env');

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}

function getPublicBaseUrl(req) {
  if (env.PUBLIC_APP_URL) {
    return trimTrailingSlash(env.PUBLIC_APP_URL);
  }

  return trimTrailingSlash(`${req.protocol}://${req.get('host')}`);
}

async function login(req, res, next) {
  try {
    const { email, password, idToken } = req.validated.body;
    const result = idToken
      ? await authService.loginWithFirebase(idToken)
      : await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const result = req.validated.body.idToken
      ? await authService.registerWithFirebase(req.validated)
      : await authService.register(req.validated, getPublicBaseUrl(req));
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : '';
    const result = await authService.verifyEmail(token);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function resendVerification(req, res, next) {
  try {
    const { email } = req.validated.body;
    const result = await authService.resendVerificationEmail(email, getPublicBaseUrl(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.validated.body;
    const result = await authService.requestPasswordReset(email, getPublicBaseUrl(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.validated.body;
    const result = await authService.resetPassword(token, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  const fullName = [req.user.firstName, req.user.lastName].filter(Boolean).join(' ').trim();
  res.json({
    user: {
      ...req.user,
      fullName: fullName || req.user.email,
    },
  });
}

module.exports = {
  login,
  register,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  me,
};
