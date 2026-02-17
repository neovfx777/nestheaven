const broadcastsService = require('./broadcasts.service');

async function listPublic(req, res, next) {
  try {
    const result = await broadcastsService.listPublic(req.validated);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error in broadcastsController.listPublic:', err);
    // If it's a table not found error, return empty array
    if (err.message && (err.message.includes('does not exist') || err.message.includes('no such table'))) {
      return res.json({ success: true, data: [] });
    }
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const result = await broadcastsService.create(req.validated, req.user);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.validated.params;
    const result = await broadcastsService.update(id, req.validated, req.user);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await broadcastsService.remove(id, req.user);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listPublic, create, update, remove };
