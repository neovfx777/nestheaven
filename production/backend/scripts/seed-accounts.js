/**
 * Script to seed hardcoded accounts:
 * - Seller account
 * - Owner Admin account
 * - Manager Admin account
 */

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ROLES = {
  USER: 'USER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
  MANAGER_ADMIN: 'MANAGER_ADMIN',
  OWNER_ADMIN: 'OWNER_ADMIN',
};

async function seedAccounts() {
  try {
    console.log('🌱 Seeding hardcoded accounts...');

    // Hash password for all accounts (using same password for convenience)
    const defaultPassword = 'Admin123!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // 1. Seller Account
    const sellerEmail = 'seller@nestheaven.com';
    const seller = await prisma.user.upsert({
      where: { email: sellerEmail },
      update: {
        email: sellerEmail,
        passwordHash,
        role: ROLES.SELLER,
        firstName: 'John',
        lastName: 'Seller',
        phone: '+998901234567',
        isActive: true,
      },
      create: {
        email: sellerEmail,
        passwordHash,
        role: ROLES.SELLER,
        firstName: 'John',
        lastName: 'Seller',
        phone: '+998901234567',
        isActive: true,
      },
    });
    console.log('✅ Seller account created/updated:', seller.email);

    // 2. Manager Admin Account
    const managerEmail = 'manager@nestheaven.com';
    const manager = await prisma.user.upsert({
      where: { email: managerEmail },
      update: {
        email: managerEmail,
        passwordHash,
        role: ROLES.MANAGER_ADMIN,
        firstName: 'Manager',
        lastName: 'Admin',
        phone: '+998901234568',
        isActive: true,
      },
      create: {
        email: managerEmail,
        passwordHash,
        role: ROLES.MANAGER_ADMIN,
        firstName: 'Manager',
        lastName: 'Admin',
        phone: '+998901234568',
        isActive: true,
      },
    });
    console.log('✅ Manager Admin account created/updated:', manager.email);

    // 3. Owner Admin Account
    const ownerEmail = 'owner@nestheaven.com';
    const owner = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {
        email: ownerEmail,
        passwordHash,
        role: ROLES.OWNER_ADMIN,
        firstName: 'Owner',
        lastName: 'Admin',
        phone: '+998901234569',
        isActive: true,
      },
      create: {
        email: ownerEmail,
        passwordHash,
        role: ROLES.OWNER_ADMIN,
        firstName: 'Owner',
        lastName: 'Admin',
        phone: '+998901234569',
        isActive: true,
      },
    });
    console.log('✅ Owner Admin account created/updated:', owner.email);

    console.log('\n📋 Account Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Seller Account:');
    console.log(`  Email: ${sellerEmail}`);
    console.log(`  Password: ${defaultPassword}`);
    console.log(`  Role: ${ROLES.SELLER}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Manager Admin Account:');
    console.log(`  Email: ${managerEmail}`);
    console.log(`  Password: ${defaultPassword}`);
    console.log(`  Role: ${ROLES.MANAGER_ADMIN}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Owner Admin Account:');
    console.log(`  Email: ${ownerEmail}`);
    console.log(`  Password: ${defaultPassword}`);
    console.log(`  Role: ${ROLES.OWNER_ADMIN}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n✅ All accounts seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding accounts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
seedAccounts()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed accounts:', error);
    process.exit(1);
  });
