require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-change-me',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10,
  CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:5173,http://45.92.173.175:5173,http://45.92.173.175:3000',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
  OPENROUTER_SITE_URL: process.env.OPENROUTER_SITE_URL || 'http://localhost:5173',
  OPENROUTER_APP_NAME: process.env.OPENROUTER_APP_NAME || 'NestHeaven Apartment Assistant',
};
