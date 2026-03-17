const express = require('express');
const realtorsController = require('./realtors.controller');
const {
  validateListRange,
  validateCreateAvailability,
  validateAvailabilityId,
} = require('./realtors.validators');
const { authMiddleware } = require('../../middleware/auth');
const { requireRealtor } = require('../../middleware/roles');

const router = express.Router();

router.use(authMiddleware);
router.use(requireRealtor);

router.get('/me/availability', validateListRange, realtorsController.listAvailability);
router.post('/me/availability', validateCreateAvailability, realtorsController.createAvailability);
router.delete('/me/availability/:id', validateAvailabilityId, realtorsController.deleteAvailability);

router.get('/me/bookings', validateListRange, realtorsController.listBookings);

module.exports = router;

