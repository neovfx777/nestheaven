const authService = require('./auth.service');

async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const result = await authService.register(req.validated);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, register, me };
