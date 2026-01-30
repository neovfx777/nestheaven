const apartmentsService = require('./apartments.service');

async function list(req, res, next) {
  try {
    const result = await apartmentsService.list(req.validated, req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const { id } = req.validated.params;
    const result = await apartmentsService.getById(id, req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const result = await apartmentsService.create(req.validated, req.user);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.validated.params;
    const result = await apartmentsService.update(id, req.validated, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.validated.params;
    await apartmentsService.remove(id, req.user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function markSold(req, res, next) {
  try {
    const { id } = req.validated.params;
    const result = await apartmentsService.markSold(id, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function hideUnhide(req, res, next) {
  try {
    const { id } = req.validated.params;
    const result = await apartmentsService.hideUnhide(id, req.validated, req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function uploadImages(req, res, next) {
  try {
    const apartmentId = req.params.id;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const urls = req.files.map((f) => `${baseUrl}/uploads/${f.filename}`);
    const result = await apartmentsService.addImages(apartmentId, urls, req.user);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  markSold,
  hideUnhide,
  uploadImages,
};
