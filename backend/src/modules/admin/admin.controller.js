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
    const searchTerm = req.query.searchTerm || null;
    const searchBy = req.query.searchBy || 'all'; // Default to searching all fields
    
    const result = await adminService.listUsers({
      roleFilter,
      searchTerm,
      searchBy
    }, req.user);
    
    res.json({
      ...result,
      search: {
        term: searchTerm,
        by: searchBy,
        performed: !!searchTerm
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const { id } = req.validated.params;
    const result = await adminService.getUserById(id, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.validated.params;
    const result = await adminService.updateUser(id, req.validated, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.validated.params;
    await adminService.deleteUser(id, req.user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  createUser, 
  listUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
};