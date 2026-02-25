const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { loadConfiguredAccounts } = require('../scripts/lib/account-config');

const prisma = new PrismaClient();

function assertSeedSafety() {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowProduction = process.env.ALLOW_PRODUCTION_SEED === 'true';
  if (isProduction && !allowProduction) {
    throw new Error('Refusing to run prisma seed in production without ALLOW_PRODUCTION_SEED=true');
  }
}

async function clearAllData() {
  await prisma.favorite.deleteMany({});
  await prisma.savedSearch.deleteMany({});
  await prisma.apartmentImage.deleteMany({});
  await prisma.apartment.deleteMany({});
  await prisma.complex.deleteMany({});
  await prisma.broadcast.deleteMany({});
  await prisma.user.deleteMany({});
}

async function createConfiguredUsers() {
  const accounts = loadConfiguredAccounts();
  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    await prisma.user.create({
      data: {
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
}

async function main() {
  assertSeedSafety();
  console.log('Starting clean configured seed...');
  await clearAllData();
  await createConfiguredUsers();
  console.log('Seed completed: users reset, apartment data is zero.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
