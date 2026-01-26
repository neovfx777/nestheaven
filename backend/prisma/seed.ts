import { PrismaClient, UserRole, ApartmentStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data (in correct order due to foreign keys)
    console.log('🧹 Clearing existing data...');
    await prisma.userFavorite.deleteMany();
    await prisma.savedSearch.deleteMany();
    await prisma.apartmentStatusLog.deleteMany();
    await prisma.apartmentImage.deleteMany();
    await prisma.apartment.deleteMany();
    await prisma.complex.deleteMany();
    await prisma.user.deleteMany();

    console.log('👥 Creating users...');

    // Create users with different roles
    const passwordHash = await hashPassword('password123');

    const ownerAdmin = await prisma.user.create({
      data: {
        email: 'owner@nestheaven.com',
        password: passwordHash,
        name: 'System Owner',
        role: UserRole.OWNER_ADMIN,
        phone: '+998901234500',
        emailVerified: true,
      },
    });

    const managerAdmin = await prisma.user.create({
      data: {
        email: 'manager@nestheaven.com',
        password: passwordHash,
        name: 'Manager Admin',
        role: UserRole.MANAGER_ADMIN,
        phone: '+998901234501',
        emailVerified: true,
      },
    });

    const admin = await prisma.user.create({
      data: {
        email: 'admin@nestheaven.com',
        password: passwordHash,
        name: 'Regular Admin',
        role: UserRole.ADMIN,
        phone: '+998901234502',
        emailVerified: true,
      },
    });

    const seller = await prisma.user.create({
      data: {
        email: 'seller@nestheaven.com',
        password: passwordHash,
        name: 'Property Seller',
        role: UserRole.SELLER,
        phone: '+998901234503',
        emailVerified: true,
      },
    });

    const user = await prisma.user.create({
      data: {
        email: 'user@nestheaven.com',
        password: passwordHash,
        name: 'Regular User',
        role: UserRole.USER,
        phone: '+998901234504',
        emailVerified: true,
      },
    });

    console.log('✅ Users created');

    console.log('🏢 Creating complexes...');

    // Create complexes
    const complexes = await Promise.all([
      prisma.complex.create({
        data: {
          name: 'Sky Garden Residence',
          image: 'sky-garden.jpg',
          description: 'Luxury residential complex with garden views',
        },
      }),
      prisma.complex.create({
        data: {
          name: 'River View Towers',
          image: 'river-view.jpg',
          description: 'Modern towers with panoramic river views',
        },
      }),
      prisma.complex.create({
        data: {
          name: 'Green Valley Complex',
          description: 'Eco-friendly complex in green surroundings',
        },
      }),
    ]);

    console.log('✅ Complexes created');

    console.log('🏠 Creating apartments...');

    // Create apartments
    const apartments = [
      {
        complexId: complexes[0].id,
        sellerId: seller.id,
        status: ApartmentStatus.ACTIVE,
        title: { uz: 'Yangi 3 xonali kvartira', ru: 'Новая 3-комнатная квартира', en: 'New 3-bedroom apartment' },
        description: { uz: 'Zamonaviy loyiha, markaziy joylashuv', ru: 'Современный проект, центральное расположение', en: 'Modern project, central location' },
        price: 150000,
        rooms: 3,
        area: 85.5,
        floor: 5,
        developer: 'UzRoyal Development',
        address: 'Toshkent shahar, Yunusobod tumani',
        lat: 41.3588,
        lng: 69.2875,
        materials: { uz: 'Yuqori sifatli materiallar', ru: 'Высококачественные материалы', en: 'High-quality materials' },
        infrastructure: {
          parking: true,
          gym: true,
          pool: false,
          playground: true,
          security: true,
          elevator: true,
        },
        airQualityIndex: 82,
        airQualitySource: 'Local monitoring',
        investmentGrowthPercent: 12.5,
        contactPhone: '+998901234567',
        contactTelegram: '@uzroyal',
        contactWhatsapp: '+998901234567',
        contactEmail: 'sales@uzroyal.uz',
        installmentOptions: [
          {
            bankName: 'Kapital Bank',
            years: 20,
            interest: 14,
            downPayment: 30,
          },
        ],
        views: 150,
        favoritesCount: 8,
      },
      {
        complexId: complexes[1].id,
        sellerId: seller.id,
        status: ApartmentStatus.ACTIVE,
        title: { uz: '4 xonali premium kvartira', ru: '4-комнатная премиум квартира', en: '4-bedroom premium apartment' },
        description: { uz: 'Premium segment, katta maydon', ru: 'Премиум сегмент, большая площадь', en: 'Premium segment, large area' },
        price: 250000,
        rooms: 4,
        area: 120.0,
        floor: 12,
        developer: 'Grand City Builders',
        address: 'Toshkent shahar, Mirzo Ulugbek tumani',
        lat: 41.3425,
        lng: 69.2698,
        materials: { uz: 'Import materiallar', ru: 'Импортные материалы', en: 'Imported materials' },
        infrastructure: {
          parking: true,
          gym: true,
          pool: true,
          playground: true,
          security: true,
          elevator: true,
          concierge: true,
        },
        airQualityIndex: 88,
        airQualitySource: 'Local monitoring',
        investmentGrowthPercent: 18.2,
        contactPhone: '+998901234568',
        contactTelegram: '@grandcity',
        contactWhatsapp: '+998901234568',
        contactEmail: 'info@grandcity.uz',
        installmentOptions: [
          {
            bankName: 'Ipak Yuli Bank',
            years: 15,
            interest: 12,
            downPayment: 25,
          },
          {
            bankName: 'Hamkor Bank',
            years: 20,
            interest: 13.5,
            downPayment: 20,
          },
        ],
        views: 210,
        favoritesCount: 15,
      },
      {
        sellerId: seller.id,
        status: ApartmentStatus.SOLD,
        title: { uz: '2 xonali arzon kvartira', ru: '2-комнатная недорогая квартира', en: '2-bedroom affordable apartment' },
        description: { uz: 'Iqtisodiy variant, yangi uy', ru: 'Экономичный вариант, новый дом', en: 'Economical option, new building' },
        price: 85000,
        rooms: 2,
        area: 55.0,
        floor: 3,
        developer: 'Green Valley Construction',
        address: 'Toshkent shahar, Chilanzar tumani',
        lat: 41.2893,
        lng: 69.2305,
        materials: { uz: 'Standart materiallar', ru: 'Стандартные материалы', en: 'Standard materials' },
        infrastructure: {
          parking: false,
          gym: false,
          pool: false,
          playground: true,
          security: true,
          elevator: true,
        },
        contactPhone: '+998901234569',
        views: 95,
        favoritesCount: 3,
      },
    ];

    for (const aptData of apartments) {
      const apartment = await prisma.apartment.create({
        data: aptData,
      });

      // Add images for apartments
      await prisma.apartmentImage.createMany({
        data: [
          {
            apartmentId: apartment.id,
            url: 'apartment-living-room.jpg',
            order: 1,
          },
          {
            apartmentId: apartment.id,
            url: 'apartment-bedroom.jpg',
            order: 2,
          },
          {
            apartmentId: apartment.id,
            url: 'apartment-kitchen.jpg',
            order: 3,
          },
        ],
      });

      // Add status log for sold apartment
      if (apartment.status === ApartmentStatus.SOLD) {
        await prisma.apartmentStatusLog.create({
          data: {
            apartmentId: apartment.id,
            fromStatus: ApartmentStatus.ACTIVE,
            toStatus: ApartmentStatus.SOLD,
            changedById: seller.id,
            reason: 'Sold to client',
          },
        });
      }

      // Add some favorites
      await prisma.userFavorite.create({
        data: {
          userId: user.id,
          apartmentId: apartment.id,
        },
      });
    }

    console.log('✅ Apartments created with images and favorites');

    // Create saved searches
    await prisma.savedSearch.create({
      data: {
        userId: user.id,
        name: '3 xonali kvartiralar',
        filters: {
          rooms: 3,
          minPrice: 100000,
          maxPrice: 200000,
          status: 'ACTIVE',
        },
        notify: true,
      },
    });

    await prisma.savedSearch.create({
      data: {
        userId: user.id,
        name: 'Yangi uylar',
        filters: {
          minPrice: 50000,
          maxPrice: 300000,
          status: 'ACTIVE',
          developer: 'UzRoyal Development',
        },
        notify: false,
      },
    });

    console.log('✅ Saved searches created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Owner Admin:   owner@nestheaven.com / password123');
    console.log('Manager Admin: manager@nestheaven.com / password123');
    console.log('Admin:         admin@nestheaven.com / password123');
    console.log('Seller:        seller@nestheaven.com / password123');
    console.log('User:          user@nestheaven.com / password123');
    console.log('==============================');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });