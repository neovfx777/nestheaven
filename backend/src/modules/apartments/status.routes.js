// /backend/src/modules/apartments/status.routes.js
const express = require('express');
const { authMiddleware } = require('../../middleware/auth');
const { requireRoles, requireSeller, requireAdmin } = require('../../middleware/roles');
const { ROLES } = require('../../utils/roles');
const statusController = require('./status.controller');

const router = express.Router();

// GET status history for an apartment
router.get(
  '/:apartmentId/history',
  authMiddleware,
  requireRoles(ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN, ROLES.SELLER),
  statusController.getStatusHistory
);

// Change status (admin only)
router.patch(
  '/:apartmentId/status',
  authMiddleware,
  requireAdmin,
  statusController.changeStatus
);

// Mark as sold (seller only)
router.post(
  '/:apartmentId/sold',
  authMiddleware,
  requireSeller,
  statusController.markSold
);

// Bulk status operations
router.post(
  '/bulk/status',
  authMiddleware,
  requireAdmin,
  statusController.bulkStatusChange
);

// Bulk mark as sold
router.post(
  '/bulk/sold',
  authMiddleware,
  requireSeller,
  statusController.bulkMarkSold
);

module.exports = router;