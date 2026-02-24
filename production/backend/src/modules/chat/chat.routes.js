const express = require('express');
const { optionalAuth } = require('../../middleware/auth');
const chatController = require('./chat.controller');
const { validateApartmentsAssistant } = require('./chat.validators');

const router = express.Router();

router.post('/apartments-assistant', optionalAuth, validateApartmentsAssistant, chatController.apartmentsAssistant);

module.exports = router;

