const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

async function main() {
  console.log('🌱 Starting fresh database seed (users, complexes, apartments)...');

  // 1) CLEAR EXISTING DATA (order matters because of FKs)
  console.log('🧹 Clearing existing data...');
  await prisma.apartmentImage.deleteMany({});
  await prisma.favorite.deleteMany({});      // mapped model for favorites
  await prisma.savedSearch.deleteMany({});
  await prisma.apartment.deleteMany({});
  await prisma.complex.deleteMany({});
  await prisma.user.deleteMany({});

  // 2) CREATE CORE USERS WITH ROLES
  console.log('👤 Creating users with roles...');
  const userDefinitions = [
    {
      email: 'user@nestheaven.uz',
      password: 'User123!',
      role: 'USER',
      firstName: 'Regular',
      lastName: 'User',
      phone: '+998901111111',
      label: 'Regular User',
    },
    {
      email: 'seller@nestheaven.uz',
      password: 'Seller123!',
      role: 'SELLER',
      firstName: 'Primary',
      lastName: 'Seller',
      phone: '+998902222222',
      label: 'Seller',
    },
    {
      email: 'admin@nestheaven.uz',
      password: 'Admin123!',
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+998903333333',
      label: 'Admin',
    },
    {
      email: 'manager@nestheaven.uz',
      password: 'Manager123!',
      role: 'MANAGER_ADMIN',
      firstName: 'Manager',
      lastName: 'Admin',
      phone: '+998904444444',
      label: 'Manager Admin',
    },
    {
      email: 'owner@nestheaven.uz',
      password: 'Owner123!',
      role: 'OWNER_ADMIN',
      firstName: 'Owner',
      lastName: 'Admin',
      phone: '+998905555555',
      label: 'Owner Admin',
    },
  ];

  const createdUsers = [];
  for (const def of userDefinitions) {
    const passwordHash = await bcrypt.hash(def.password, 10);
    const user = await prisma.user.create({
      data: {
        email: def.email.toLowerCase(),
        passwordHash,
        role: def.role,
        firstName: def.firstName,
        lastName: def.lastName,
        phone: def.phone,
      },
    });
    createdUsers.push(user);
    console.log(`✅ Created ${def.label}: ${def.email} (${def.role})`);
  }

  const seller = createdUsers.find((u) => u.role === 'SELLER');

  // 3) CREATE 5 COMPLEXES
  console.log('🏢 Creating 5 complexes...');
  const complexDefinitions = [
    {
      name: {
        uz: 'Yangi Shahar',
        ru: 'Новый Город',
        en: 'New City',
      },
      address: {
        uz: "Toshkent, Mirzo Ulug'bek tumani",
        ru: 'Ташкент, Мирзо Улугбекский район',
        en: 'Tashkent, Mirzo Ulugbek district',
      },
      city: 'Tashkent',
    },
    {
      name: {
        uz: 'Olmazor City',
        ru: 'Олмазор Сити',
        en: 'Olmazor City',
      },
      address: {
        uz: 'Toshkent, Olmazor tumani',
        ru: 'Ташкент, Олмазорский район',
        en: 'Tashkent, Olmazor district',
      },
      city: 'Tashkent',
    },
    {
      name: {
        uz: 'Chilonzor Hills',
        ru: 'Чиланзар Хиллс',
        en: 'Chilonzor Hills',
      },
      address: {
        uz: 'Toshkent, Chilonzor tumani',
        ru: 'Ташкент, Чиланзарский район',
        en: 'Tashkent, Chilonzor district',
      },
      city: 'Tashkent',
    },
    {
      name: {
        uz: 'Samarkand Darvoza',
        ru: 'Самарканд Дарвоза',
        en: 'Samarkand Darvoza',
      },
      address: {
        uz: 'Samarqand shahri',
        ru: 'Город Самарканд',
        en: 'Samarkand city',
      },
      city: 'Samarkand',
    },
    {
      name: {
        uz: 'Bukhara Osiyo',
        ru: 'Бухара Азия',
        en: 'Bukhara Asia',
      },
      address: {
        uz: 'Buxoro shahri',
        ru: 'Город Бухара',
        en: 'Bukhara city',
      },
      city: 'Bukhara',
    },
  ];

  const createdComplexes = [];
  for (const def of complexDefinitions) {
    const complex = await prisma.complex.create({
      data: {
        name: JSON.stringify(def.name),
        address: JSON.stringify(def.address),
        city: def.city,
      },
    });
    createdComplexes.push(complex);
    console.log(`✅ Created complex: ${def.name.en} (${def.city})`);
  }

  // 4) CREATE ≥ 20 APARTMENTS (we'll create 30 across complexes)
  console.log('🏠 Creating 30 apartments...');
  const imageUrls = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558036117-15e82a2c9a9a?w=800&auto=format&fit=crop',
  ];

  const apartments = [];
  for (let i = 1; i <= 30; i++) {
    const complex = createdComplexes[(i - 1) % createdComplexes.length];
    const rooms = randomInt(1, 5);
    const area = randomFloat(35, 150);
    const price = randomInt(40000, 250000);
    const floor = randomInt(1, 20);
    const totalFloors = randomInt(Math.max(floor + 2, 5), 25);

    const title = {
      uz: `${rooms} xonali zamonaviy kvartira`,
      ru: `${rooms}-комнатная современная квартира`,
      en: `${rooms}-room modern apartment`,
    };
    const description = {
      uz: "Yangi qurilgan, barcha qulayliklar bilan jihozlangan.",
      ru: 'Новостройка, со всеми удобствами.',
      en: 'Newly built, fully equipped with all amenities.',
    };

    // Status: mostly ACTIVE, some HIDDEN, some SOLD
    const rand = Math.random();
    let status = 'active';
    if (rand > 0.9) status = 'sold';
    else if (rand > 0.8) status = 'hidden';

    apartments.push({
      id: `apt-${String(i).padStart(3, '0')}`,
      complexId: complex.id,
      sellerId: seller.id,
      price,
      area,
      rooms,
      floor,
      totalFloors,
      title: JSON.stringify(title),
      description: JSON.stringify(description),
      status,
    });
  }

  const createdApartments = [];
  for (const apt of apartments) {
    const created = await prisma.apartment.create({ data: apt });
    createdApartments.push(created);
    console.log(`✅ Apartment ${created.id} created (${created.rooms} rooms, ${created.area} m²)`);

    // Add 3 images for each
    const images = imageUrls.slice(0, 3).map((url, idx) => ({
      apartmentId: created.id,
      url,
      order: idx,
    }));
    await prisma.apartmentImage.createMany({ data: images });
  }

  console.log('✅ Seed completed successfully!');
  console.log('=========================================');
  console.log(`Users: ${createdUsers.length}`);
  console.log(`Complexes: ${createdComplexes.length}`);
  console.log(`Apartments: ${createdApartments.length}`);
  console.log('=========================================');
  console.log('🔐 Login credentials:');
  console.log('- OWNER_ADMIN: owner@nestheaven.uz / Owner123!');
  console.log('- ADMIN      : admin@nestheaven.uz / Admin123!');
  console.log('- MANAGER    : manager@nestheaven.uz / Manager123!');
  console.log('- SELLER     : seller@nestheaven.uz / Seller123!');
  console.log('- USER       : user@nestheaven.uz / User123!');
  console.log('=========================================');
  console.log('📌 Example apartment IDs:');
  createdApartments.slice(0, 10).forEach((apt) => console.log(`- ${apt.id}`));
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });