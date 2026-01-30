const usersService = require('./users.service');

async function getProfile(req, res, next) {
  try {
    const result = await usersService.getProfile(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const result = await usersService.updateProfile(req.user.id, req.validated);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getFavorites(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await usersService.getFavorites(req.user.id, page, limit);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function addFavorite(req, res, next) {
  try {
    const apartmentId = req.params.apartmentId || req.body.apartmentId;
    if (!apartmentId) {
      return res.status(400).json({ error: 'Apartment ID is required' });
    }
    const result = await usersService.addFavorite(req.user.id, apartmentId);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const apartmentId = req.params.apartmentId || req.params.id;
    await usersService.removeFavorite(req.user.id, apartmentId);
    res.json({ success: true, data: { success: true } });
  } catch (err) {
    next(err);
  }
}

async function checkFavoriteStatus(req, res, next) {
  try {
    const apartmentId = req.params.apartmentId;
    const result = await usersService.checkFavoriteStatus(req.user.id, apartmentId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getSavedSearches(req, res, next) {
  try {
    const result = await usersService.getSavedSearches(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createSavedSearch(req, res, next) {
  try {
    const result = await usersService.createSavedSearch(req.user.id, req.validated);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function deleteSavedSearch(req, res, next) {
  try {
    const { id } = req.validated.params;
    await usersService.deleteSavedSearch(req.user.id, id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavoriteStatus,
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
};
