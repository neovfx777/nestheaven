const messagesService = require('./messages.service');

async function listConversations(req, res, next) {
  try {
    const items = await messagesService.listConversations(req.user.id);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

async function getConversation(req, res, next) {
  try {
    const { id } = req.validated.params;
    const conversation = await messagesService.getConversation(req.user.id, id);
    res.json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
}

async function sendMessage(req, res, next) {
  try {
    const { apartmentId, text } = req.validated.body;
    const result = await messagesService.sendMessageForApartment(req.user.id, apartmentId, text);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function sendToConversation(req, res, next) {
  try {
    const { id } = req.validated.params;
    const { text } = req.validated.body;
    const message = await messagesService.sendMessageToConversation(req.user.id, id, text);
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listConversations,
  getConversation,
  sendMessage,
  sendToConversation,
};

