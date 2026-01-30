const express = require('express');
const analyticsController = require('./analytics.controller');
const { validateStats } = require('./analytics.validators');
const { authMiddleware } = require('../../middleware/auth');
const { requireAdmin } = require('../../middleware/roles');

const router = express.Router();

// Public stats endpoint (for Overview page - all authenticated users)
router.get('/stats', authMiddleware, validateStats, analyticsController.getStats);

// Admin-only detailed analytics (if needed in future)
// router.get('/admin/stats', authMiddleware, requireAdmin, validateStats, analyticsController.getStats);

module.exports = router;
