const analyticsService = require('./analytics.service');

async function getStats(req, res, next) {
  try {
    const result = await analyticsService.getStats(req.validated, req.user);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats };
