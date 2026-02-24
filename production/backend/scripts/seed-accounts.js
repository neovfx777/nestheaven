const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { loadConfiguredAccounts } = require('./lib/account-config');

const prisma = new PrismaClient();

function assertSeedSafety() {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowProduction = process.env.ALLOW_PRODUCTION_SEED === 'true';

  if (isProduction && !allowProduction) {
    throw new Error('Refusing to seed accounts in production without ALLOW_PRODUCTION_SEED=true');
  }
}

async function upsertAccount(account) {
  const passwordHash = await bcrypt.hash(account.password, 10);

  return prisma.user.upsert({
    where: { email: account.email },
    update: {
      passwordHash,
      role: account.role,
      firstName: account.firstName,
      lastName: account.lastName,
      phone: account.phone,
      isActive: true,
      deactivatedAt: null,
      deactivatedById: null,
    },
    create: {
      email: account.email,
      passwordHash,
      role: account.role,
      firstName: account.firstName,
      lastName: account.lastName,
      phone: account.phone,
      isActive: true,
    },
  });
}

async function seedAccounts() {
  assertSeedSafety();

  const accounts = loadConfiguredAccounts();
  console.log('Seeding configured accounts...');
  for (const account of accounts) {
    const user = await upsertAccount(account);
    console.log(`- ${user.email} (${user.role})`);
  }
}

seedAccounts()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Seed failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
