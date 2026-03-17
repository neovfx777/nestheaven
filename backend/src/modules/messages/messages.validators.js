const { z } = require('zod');

const sendMessageSchema = z.object({
  body: z.object({
    apartmentId: z.string().min(1, 'Apartment ID is required'),
    text: z.string().min(1, 'Message text is required').max(2000, 'Message is too long'),
  }),
});

const conversationIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Conversation ID is required'),
  }),
});

const sendToConversationSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Conversation ID is required'),
  }),
  body: z.object({
    text: z.string().min(1, 'Message text is required').max(2000, 'Message is too long'),
  }),
});

function validateSendMessage(req, res, next) {
  const result = sendMessageSchema.safeParse({ body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

function validateConversationId(req, res, next) {
  const result = conversationIdSchema.safeParse({ params: req.params });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = { ...(req.validated || {}), ...result.data };
  next();
}

function validateSendToConversation(req, res, next) {
  const result = sendToConversationSchema.safeParse({ params: req.params, body: req.body });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors });
  }
  req.validated = result.data;
  next();
}

module.exports = {
  validateSendMessage,
  validateConversationId,
  validateSendToConversation,
};

