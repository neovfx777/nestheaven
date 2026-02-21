const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { loadConfiguredAccounts } = require('./lib/account-config');

const prisma = new PrismaClient();
const configuredAccounts = loadConfiguredAccounts();
const keepEmails = configuredAccounts.map((account) => account.email);

function assertResetSafety() {
  if (process.env.CONFIRM_RESET !== 'YES') {
    throw new Error('Refusing reset: set CONFIRM_RESET=YES');
  }
}

async function clearDataKeepUsers() {
  await prisma.favorite.deleteMany({});
  await prisma.savedSearch.deleteMany({});
  await prisma.apartmentImage.deleteMany({});
  await prisma.apartment.deleteMany({});
  await prisma.complex.deleteMany({});
  await prisma.broadcast.deleteMany({});
}

async function removeUnknownUsers() {
  await prisma.user.updateMany({
    where: {
      email: {
        notIn: keepEmails,
      },
    },
    data: {
      createdById: null,
      deactivatedById: null,
      deactivatedAt: null,
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        notIn: keepEmails,
      },
    },
  });
}

async function upsertConfiguredUsers() {
  for (const account of configuredAccounts) {
    const passwordHash = await bcrypt.hash(account.password, 10);

    await prisma.user.upsert({
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
        createdById: null,
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
}

async function runReset() {
  assertResetSafety();
  console.log('Resetting database to configured zero-state...');

  await clearDataKeepUsers();
  await removeUnknownUsers();
  await upsertConfiguredUsers();

  const apartmentsCount = await prisma.apartment.count();
  const complexesCount = await prisma.complex.count();
  const users = await prisma.user.findMany({
    orderBy: { role: 'asc' },
    select: { email: true, role: true, isActive: true },
  });

  console.log(`Apartments count: ${apartmentsCount}`);
  console.log(`Complexes count: ${complexesCount}`);
  console.log('Active accounts after reset:');
  users.forEach((user) => {
    console.log(`- ${user.email} (${user.role}) active=${user.isActive}`);
  });
}

runReset()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Reset failed:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
