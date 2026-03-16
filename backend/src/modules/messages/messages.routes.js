const express = require('express');
const messagesController = require('./messages.controller');
const {
  validateSendMessage,
  validateConversationId,
  validateSendToConversation,
} = require('./messages.validators');
const { authMiddleware } = require('../../middleware/auth');
const { requireUser } = require('../../middleware/roles');

const router = express.Router();

router.use(authMiddleware);
router.use(requireUser);

router.get('/conversations', messagesController.listConversations);
router.get('/conversations/:id', validateConversationId, messagesController.getConversation);
router.post('/send', validateSendMessage, messagesController.sendMessage);
router.post('/conversations/:id/messages', validateSendToConversation, messagesController.sendToConversation);

module.exports = router;

