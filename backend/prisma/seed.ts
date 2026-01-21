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
  console.log('🏢 Creating test apartments...');
}

main()
const complexes = await Promise.all([
  prisma.complex.create({
    data: {
      name: 'Sky Garden Residence',
      coverImage: '/uploads/complexes/sky-garden.jpg'
    }
  }),
  prisma.complex.create({
    data: {
      name: 'River View Towers',
      coverImage: '/uploads/complexes/river-view.jpg'
    }
  })
]);

const seller = await prisma.user.findUnique({
  where: { email: 'seller@nestheaven.com' }
});

if (seller) {
  // Create apartments with different statuses
  await prisma.apartment.createMany({
    data: [
      {
        titleUz: 'Yangi 3 xonali kvartira',
        titleRu: 'Новая 3-комнатная квартира',
        titleEn: 'New 3-bedroom apartment',
        descriptionUz: 'Zamonaviy loyiha, markaziy joylashuv',
        descriptionRu: 'Современный проект, центральное расположение',
        descriptionEn: 'Modern project, central location',
        price: 150000,
        rooms: 3,
        area: 85,
        floor: 5,
        address: 'Toshkent shahar, Yunusobod tumani',
        developerName: 'UzRoyal Development',
        complexId: complexes[0].id,
        sellerId: seller.id,
        status: 'ACTIVE',
        contactPhone: '+998901234567',
      },
      {
        titleUz: '4 xonali premium kvartira',
        titleRu: '4-комнатная премиум квартира',
        titleEn: '4-bedroom premium apartment',
        descriptionUz: 'Premium segment, katta maydon',
        descriptionRu: 'Премиум сегмент, большая площадь',
        descriptionEn: 'Premium segment, large area',
        price: 250000,
        rooms: 4,
        area: 120,
        floor: 12,
        address: 'Toshkent shahar, Mirzo Ulugbek tumani',
        developerName: 'Grand City Builders',
        complexId: complexes[1].id,
        sellerId: seller.id,
        status: 'ACTIVE',
        contactPhone: '+998901234568',
      },
      {
        titleUz: '2 xonali arzon kvartira',
        titleRu: '2-комнатная недорогая квартира',
        titleEn: '2-bedroom affordable apartment',
        descriptionUz: 'Iqtisodiy variant, yangi uy',
        descriptionRu: 'Экономичный вариант, новый дом',
        descriptionEn: 'Economical option, new building',
        price: 85000,
        rooms: 2,
        area: 55,
        floor: 3,
        address: 'Toshkent shahar, Chilanzar tumani',
        developerName: 'Green Valley Construction',
        sellerId: seller.id,
        status: 'HIDDEN',
        contactPhone: '+998901234569',
      }
    ]
  });

  console.log('✅ Created test apartments with different statuses');
}
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });