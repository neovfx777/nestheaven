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

function normalizeHost(value) {
  if (!value) return null;

  let normalized = String(value).trim().toLowerCase();
  if (!normalized) return null;

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    try {
      return new URL(normalized).hostname.toLowerCase();
    } catch {
      return null;
    }
  }

  normalized = normalized.split('/')[0];
  normalized = normalized.replace(/:\d+$/, '');

  return normalized || null;
}

function parseAllowedHosts() {
  if (env.ALLOWED_HOSTS === '*') return '*';

  const explicitHosts = String(env.ALLOWED_HOSTS || '')
    .split(',')
    .map((host) => normalizeHost(host))
    .filter(Boolean);

  if (explicitHosts.length === 0) {
    return null;
  }

  const hosts = new Set(['localhost', '127.0.0.1', '::1']);

  for (const host of explicitHosts) {
    hosts.add(host);
  }

  return hosts;
}

const allowedHosts = parseAllowedHosts();

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

function hostGuard(req, res, next) {
  if (env.NODE_ENV !== 'production') {
    next();
    return;
  }

  if (allowedHosts == null || allowedHosts === '*') {
    next();
    return;
  }

  const incomingHost = normalizeHost(req.headers.host);
  if (!incomingHost || !allowedHosts.has(incomingHost)) {
    res.status(421).json({
      success: false,
      error: 'Misdirected Request',
      message: 'Host is not allowed',
    });
    return;
  }

  next();
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

const mutationWriteLimiter = createLimiter({
  windowMs: env.MUTATION_RATE_LIMIT_WINDOW_MS,
  max: env.MUTATION_RATE_LIMIT_MAX,
  message: 'Too many write requests, try again later.',
});

function mutationLimiter(req, res, next) {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    next();
    return;
  }

  mutationWriteLimiter(req, res, next);
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

const adminLimiter = createLimiter({
  windowMs: env.ADMIN_RATE_LIMIT_WINDOW_MS,
  max: env.ADMIN_RATE_LIMIT_MAX,
  message: 'Too many admin requests, try again later.',
});

const chatLimiter = createLimiter({
  windowMs: env.CHAT_RATE_LIMIT_WINDOW_MS,
  max: env.CHAT_RATE_LIMIT_MAX,
  message: 'Too many chat requests, please slow down.',
});

module.exports = {
  buildCorsOptions,
  hostGuard,
  mutationLimiter,
  apiLimiter,
  authLimiter,
  adminLimiter,
  chatLimiter,
};
