const complexesService = require('./complexes.service');

async function list(req, res, next) {
  try {
    const result = await complexesService.list(req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.validated.params;
    const result = await complexesService.getById(id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const result = await complexesService.create(req.validated, req.user);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.validated.params;
    const result = await complexesService.update(id, req.validated, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.validated.params;
    await complexesService.remove(id, req.user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
