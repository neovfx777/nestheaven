require('dotenv').config();

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

function parseIntEnv(name, fallback) {
  const raw = process.env[name];
  if (raw == null || raw === '') return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function parseBoolEnv(name, fallback = false) {
  const raw = process.env[name];
  if (raw == null || raw === '') return fallback;
  return TRUE_VALUES.has(raw.toLowerCase());
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || '0.0.0.0',
  PORT: parseIntEnv('PORT', 3000),
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-me',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE_MB: parseIntEnv('MAX_FILE_SIZE_MB', 10),
  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:5173',
  ALLOWED_HOSTS: process.env.ALLOWED_HOSTS || '',
  TRUST_PROXY: parseBoolEnv('TRUST_PROXY', false),
  BODY_LIMIT: process.env.BODY_LIMIT || '1mb',
  RATE_LIMIT_WINDOW_MS: parseIntEnv('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  RATE_LIMIT_MAX: parseIntEnv('RATE_LIMIT_MAX', 400),
  MUTATION_RATE_LIMIT_WINDOW_MS: parseIntEnv('MUTATION_RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  MUTATION_RATE_LIMIT_MAX: parseIntEnv('MUTATION_RATE_LIMIT_MAX', 180),
  AUTH_RATE_LIMIT_WINDOW_MS: parseIntEnv('AUTH_RATE_LIMIT_WINDOW_MS', 10 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: parseIntEnv('AUTH_RATE_LIMIT_MAX', 20),
  ADMIN_RATE_LIMIT_WINDOW_MS: parseIntEnv('ADMIN_RATE_LIMIT_WINDOW_MS', 10 * 60 * 1000),
  ADMIN_RATE_LIMIT_MAX: parseIntEnv('ADMIN_RATE_LIMIT_MAX', 80),
  CHAT_RATE_LIMIT_WINDOW_MS: parseIntEnv('CHAT_RATE_LIMIT_WINDOW_MS', 60 * 1000),
  CHAT_RATE_LIMIT_MAX: parseIntEnv('CHAT_RATE_LIMIT_MAX', 30),
  PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || '',
  EMAIL_REQUIRE_VERIFICATION: parseBoolEnv('EMAIL_REQUIRE_VERIFICATION', false),
  EMAIL_VERIFY_TOKEN_TTL_MIN: parseIntEnv('EMAIL_VERIFY_TOKEN_TTL_MIN', 60 * 24),
  PASSWORD_RESET_TOKEN_TTL_MIN: parseIntEnv('PASSWORD_RESET_TOKEN_TTL_MIN', 60),
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseIntEnv('SMTP_PORT', 587),
  SMTP_SECURE: parseBoolEnv('SMTP_SECURE', false),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
  OPENROUTER_SITE_URL: process.env.OPENROUTER_SITE_URL || 'http://localhost:5173',
  OPENROUTER_APP_NAME: process.env.OPENROUTER_APP_NAME || 'NestHeaven Apartment Assistant',
};

if (env.NODE_ENV === 'production') {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production');
  }
  if (!env.JWT_SECRET || env.JWT_SECRET === 'default-secret-change-me' || env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be a strong secret (32+ chars) in production');
  }
  if (env.EMAIL_REQUIRE_VERIFICATION) {
    const missingMailer =
      !env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM;
    if (missingMailer) {
      throw new Error('SMTP_HOST, SMTP_USER, SMTP_PASS and SMTP_FROM are required when EMAIL_REQUIRE_VERIFICATION=true');
    }
  }
}

module.exports = env;
