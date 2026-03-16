const realtorsService = require('./realtors.service');

async function listAvailability(req, res, next) {
  try {
    const result = await realtorsService.listAvailability(req.user.id, req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function createAvailability(req, res, next) {
  try {
    const created = await realtorsService.createAvailability(req.user.id, req.validated.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
}

async function deleteAvailability(req, res, next) {
  try {
    const { id } = req.validated.params;
    const result = await realtorsService.deleteAvailability(req.user.id, id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function listBookings(req, res, next) {
  try {
    const result = await realtorsService.listBookings(req.user.id, req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAvailability,
  createAvailability,
  deleteAvailability,
  listBookings,
};

