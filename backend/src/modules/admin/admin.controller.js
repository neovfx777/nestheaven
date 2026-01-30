const adminService = require('./admin.service');

async function createUser(req, res, next) {
  try {
    const result = await adminService.createUser(req.validated, req.user);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const roleFilter = req.query.role || null;
    const result = await adminService.listUsers(roleFilter, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { createUser, listUsers };
