const { PrismaClient } = require('@prisma/client');
const env = require('./env');

const prismaLogLevels =
  env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'];

const prisma = new PrismaClient({
  log: prismaLogLevels,
});

module.exports = { prisma };
