const express = require('express');
const analyticsController = require('./analytics.controller');
const { validateStats } = require('./analytics.validators');
const { authMiddleware } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/roles');

const router = express.Router();

router.get('/stats', authMiddleware, requireAdmin, validateStats, analyticsController.getStats);

module.exports = router;
