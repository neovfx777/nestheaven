const chatService = require('./chat.service');

async function apartmentsAssistant(req, res, next) {
  try {
    const result = await chatService.apartmentsAssistant(req.validated.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  apartmentsAssistant,
};

