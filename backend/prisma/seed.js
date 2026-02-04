const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting full database seed...');

  // Clear existing data (optional - comment out if you don't want to lose existing data)
  console.log('Clearing existing data...');
  await prisma.apartmentImage.deleteMany({});
  await prisma.apartment.deleteMany({});
  await prisma.complex.deleteMany({});
  await prisma.userFavorite.deleteMany({});
  await prisma.savedSearch.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Creating users...');
  
  // Create users with different roles
  const users = [
    {
      email: 'user@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+998901234567',
      role: 'USER'
    },
    {
      email: 'seller@example.com',
      password: 'password123',
      firstName: 'Alice',
      lastName: 'Smith',
      phone: '+998902345678',
      role: 'SELLER'
    },
    {
      email: 'admin@example.com',
      password: 'password123',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+998903456789',
      role: 'ADMIN'
    },
    {
      email: 'manager@example.com',
      password: 'password123',
      firstName: 'Manager',
      lastName: 'Admin',
      phone: '+998904567890',
      role: 'MANAGER_ADMIN'
    },
    {
      email: 'owner@example.com',
      password: 'password123',
      firstName: 'Owner',
      lastName: 'Admin',
      phone: '+998905678901',
      role: 'OWNER_ADMIN'
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
        fullName: `${userData.firstName} ${userData.lastName}`
      }
    });
    createdUsers.push(user);
    console.log(`Created ${user.role}: ${user.email}`);
  }

  console.log('Creating complexes...');
  
  // Create complexes
  const complexes = [
    {
      name: JSON.stringify({
        uz: "Yangi Shahar",
        ru: "Новый Город", 
        en: "New City"
      }),
      address: JSON.stringify({
        uz: "Toshkent, Mirzo Ulug'bek tumani",
        ru: "Ташкент, Мирзо Улугбекский район",
        en: "Tashkent, Mirzo Ulugbek district"
      }),
      city: "Tashkent",
      coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop"
    },
    {
      name: JSON.stringify({
        uz: "Olmazor City",
        ru: "Олмазор Сити", 
        en: "Olmazor City"
      }),
      address: JSON.stringify({
        uz: "Toshkent, Olmazor tumani",
        ru: "Ташкент, Олмазорский район",
        en: "Tashkent, Olmazor district"
      }),
      city: "Tashkent",
      coverImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop"
    },
    {
      name: JSON.stringify({
        uz: "Chilonzor Hills",
        ru: "Чиланзар Хиллс", 
        en: "Chilonzor Hills"
      }),
      address: JSON.stringify({
        uz: "Toshkent, Chilonzor tumani",
        ru: "Ташкент, Чиланзарский район",
        en: "Tashkent, Chilonzor district"
      }),
      city: "Tashkent",
      coverImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop"
    },
    {
      name: JSON.stringify({
        uz: "Tashkent City",
        ru: "Ташкент Сити", 
        en: "Tashkent City"
      }),
      address: JSON.stringify({
        uz: "Toshkent markazi",
        ru: "Центр Ташкента",
        en: "Tashkent center"
      }),
      city: "Tashkent",
      coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop"
    },
    {
      name: JSON.stringify({
        uz: "Samarkand Darvoza",
        ru: "Самарканд Дарвоза", 
        en: "Samarkand Darvoza"
      }),
      address: JSON.stringify({
        uz: "Samarqand shahri",
        ru: "Город Самарканд",
        en: "Samarkand city"
      }),
      city: "Samarkand",
      coverImage: "https://images.unsplash.com/photo-1558036117-15e82a2c9a9a?w=800&auto=format&fit=crop"
    }
  ];

  const createdComplexes = [];
  for (const complexData of complexes) {
    const complex = await prisma.complex.create({
      data: complexData
    });
    createdComplexes.push(complex);
    console.log(`Created complex: ${JSON.parse(complexData.name).en}`);
  }

  console.log('Creating apartments...');
  
  // Create apartments - with specific IDs like apt-001, apt-002, etc.
  const apartments = [
    // Complex 1 apartments
    {
      id: 'apt-001',
      complexId: createdComplexes[0].id,
      sellerId: createdUsers[1].id, // seller@example.com
      price: 120000,
      area: 85,
      rooms: 3,
      floor: 5,
      totalFloors: 12,
      title: JSON.stringify({
        uz: "Yangi qurilgan 3 xonali uy",
        ru: "Новостройка 3 комнатная квартира",
        en: "Newly built 3-room apartment"
      }),
      description: JSON.stringify({
        uz: "Yangi qurilgan, markaziy joylashuv, barcha kommunikatsiyalar",
        ru: "Новостройка, центральное расположение, все коммуникации",
        en: "Newly built, central location, all utilities"
      }),
      materials: JSON.stringify({
        uz: "G'isht, monolit",
        ru: "Кирпич, монолит",
        en: "Brick, monolithic"
      }),
      infrastructureNote: JSON.stringify({
        uz: "Maktab, bog'cha, supermarket yaqinida",
        ru: "Школа, детский сад, супермаркет рядом",
        en: "School, kindergarten, supermarket nearby"
      }),
      status: 'ACTIVE'
    },
    {
      id: 'apt-002', // THIS IS THE ID FRONTEND IS TRYING TO ACCESS
      complexId: createdComplexes[1].id,
      sellerId: createdUsers[1].id, // seller@example.com
      price: 95000,
      area: 65,
      rooms: 2,
      floor: 3,
      totalFloors: 9,
      title: JSON.stringify({
        uz: "2 xonali yangi kvartira",
        ru: "2 комнатная новая квартира",
        en: "2-room new apartment"
      }),
      description: JSON.stringify({
        uz: "Yangi ta'mirlangan, bolalar maydonchasi bor",
        ru: "Новый ремонт, есть детская площадка",
        en: "New renovation, has children's playground"
      }),
      materials: JSON.stringify({
        uz: "Panel",
        ru: "Панельный",
        en: "Panel"
      }),
      infrastructureNote: JSON.stringify({
        uz: "Park, sport zal, kafe yaqinida",
        ru: "Парк, спортивный зал, кафе рядом",
        en: "Park, gym, cafe nearby"
      }),
      status: 'ACTIVE'
    },
    {
      id: 'apt-003',
      complexId: createdComplexes[2].id,
      sellerId: createdUsers[1].id,
      price: 180000,
      area: 120,
      rooms: 4,
      floor: 8,
      totalFloors: 16,
      title: JSON.stringify({
        uz: "Katta oilaviy kvartira",
        ru: "Большая семейная квартира",
        en: "Large family apartment"
      }),
      description: JSON.stringify({
        uz: "Panoramali ko'rinish, 2 hammom, 2 balkon",
        ru: "Панорамный вид, 2 ванные, 2 балкона",
        en: "Panoramic view, 2 bathrooms, 2 balconies"
      }),
      materials: JSON.stringify({
        uz: "Monolit-g'isht",
        ru: "Монолитно-кирпичный",
        en: "Monolithic-brick"
      }),
      status: 'ACTIVE'
    },
    {
      id: 'apt-004',
      complexId: createdComplexes[3].id,
      sellerId: createdUsers[1].id,
      price: 200000,
      area: 95,
      rooms: 3,
      floor: 12,
      totalFloors: 25,
      title: JSON.stringify({
        uz: "Biznes klass kvartira",
        ru: "Квартира бизнес класса",
        en: "Business class apartment"
      }),
      description: JSON.stringify({
        uz: "Biznes markazda, konfor va xavfsizlik",
        ru: "В бизнес центре, комфорт и безопасность",
        en: "In business center, comfort and security"
      }),
      status: 'SOLD'
    },
    {
      id: 'apt-005',
      complexId: createdComplexes[4].id,
      sellerId: createdUsers[1].id,
      price: 75000,
      area: 55,
      rooms: 1,
      floor: 2,
      totalFloors: 5,
      title: JSON.stringify({
        uz: "1 xonali studio",
        ru: "1 комнатная студия",
        en: "1-room studio"
      }),
      description: JSON.stringify({
        uz: "Studiya tipidagi kvartira, markazda",
        ru: "Студия, в центре",
        en: "Studio type apartment, in the center"
      }),
      status: 'ACTIVE'
    }
  ];

  const createdApartments = [];
  for (const apartmentData of apartments) {
    const apartment = await prisma.apartment.create({
      data: apartmentData
    });
    createdApartments.push(apartment);
    console.log(`Created apartment: ${apartment.id} - ${JSON.parse(apartmentData.title).en}`);
  }

  console.log('Creating apartment images...');
  
  // Add images to apartments
  const images = [];
  const imageUrls = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558036117-15e82a2c9a9a?w=800&auto=format&fit=crop'
  ];

  for (const apartment of createdApartments) {
    for (let i = 0; i < 3; i++) {
      images.push({
        apartmentId: apartment.id,
        url: imageUrls[i % imageUrls.length],
        order: i
      });
    }
  }

  if (images.length > 0) {
    await prisma.apartmentImage.createMany({
      data: images
    });
    console.log(`Created ${images.length} apartment images`);
  }

  // Create some favorites for the regular user
  console.log('Creating user favorites...');
  const regularUser = createdUsers[0];
  
  if (createdApartments.length >= 2) {
    const favorites = [
      {
        userId: regularUser.id,
        apartmentId: createdApartments[0].id
      },
      {
        userId: regularUser.id,
        apartmentId: createdApartments[1].id
      }
    ];

    for (const favoriteData of favorites) {
      await prisma.userFavorite.create({
        data: favoriteData
      });
    }
    console.log('Created 2 favorites for regular user');
  }

  console.log('Database seed completed successfully!');
  console.log('=========================================');
  console.log('Created:');
  console.log(`- ${createdUsers.length} users`);
  console.log(`- ${createdComplexes.length} complexes`);
  console.log(`- ${createdApartments.length} apartments (including apt-002)`);
  console.log(`- ${images.length} apartment images`);
  console.log('=========================================');
  console.log('Test credentials:');
  console.log('User: user@example.com / password123');
  console.log('Seller: seller@example.com / password123');
  console.log('Admin: admin@example.com / password123');
  console.log('Manager: manager@example.com / password123');
  console.log('Owner: owner@example.com / password123');
  console.log('=========================================');
  console.log('Apartment IDs available:');
  createdApartments.forEach(apt => {
    console.log(`- ${apt.id} (${JSON.parse(apt.title).en})`);
  });
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });