const rateLimit = require('express-rate-limit');
const env = require('../config/env');

function parseAllowedOrigins() {
  if (env.CORS_ORIGINS === '*') return '*';

  const values = String(env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set(values);
}

function buildCorsOptions() {
  const allowedOrigins = parseAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins === '*' || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: allowedOrigins !== '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  };
}

function createLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many requests',
      message,
    },
  });
}

const apiLimiter = createLimiter({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: 'Request limit exceeded, try again later.',
});

const authLimiter = createLimiter({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  message: 'Too many auth attempts, try again later.',
});

const chatLimiter = createLimiter({
  windowMs: env.CHAT_RATE_LIMIT_WINDOW_MS,
  max: env.CHAT_RATE_LIMIT_MAX,
  message: 'Too many chat requests, please slow down.',
});

module.exports = {
  buildCorsOptions,
  apiLimiter,
  authLimiter,
  chatLimiter,
};
