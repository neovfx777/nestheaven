import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional, for development)
  await prisma.apartmentImage.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.complex.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create users with different roles
  const users = [
    {
      email: 'owner@nestheaven.com',
      password: 'OwnerPass123!',
      fullName: 'System Owner',
      role: UserRole.OWNER_ADMIN
    },
    {
      email: 'manager@nestheaven.com',
      password: 'ManagerPass123!',
      fullName: 'Manager Admin',
      role: UserRole.MANAGER_ADMIN
    },
    {
      email: 'admin@nestheaven.com',
      password: 'AdminPass123!',
      fullName: 'Regular Admin',
      role: UserRole.ADMIN
    },
    {
      email: 'seller@nestheaven.com',
      password: 'SellerPass123!',
      fullName: 'Property Seller',
      role: UserRole.SELLER
    },
    {
      email: 'user@nestheaven.com',
      password: 'UserPass123!',
      fullName: 'Regular User',
      role: UserRole.USER
    }
  ];

  console.log('👥 Creating users...');

  for (const userData of users) {
    const passwordHash = await hashPassword(userData.password);
    
    await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        fullName: userData.fullName,
        role: userData.role
      }
    });

    console.log(`✅ Created ${userData.role}: ${userData.email}`);
  }

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📋 Test credentials:');
  console.log('Owner: owner@nestheaven.com / OwnerPass123!');
  console.log('Manager: manager@nestheaven.com / ManagerPass123!');
  console.log('Admin: admin@nestheaven.com / AdminPass123!');
  console.log('Seller: seller@nestheaven.com / SellerPass123!');
  console.log('User: user@nestheaven.com / UserPass123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });