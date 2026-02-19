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
  console.log('Starting fresh database seed (users, complexes, apartments, broadcasts)...');

  // Clear existing data (order matters for FKs)
  console.log('Clearing existing data...');
  await prisma.apartmentImage.deleteMany({});
  await prisma.favorite.deleteMany({});
  await prisma.savedSearch.deleteMany({});
  await prisma.apartment.deleteMany({});
  await prisma.complex.deleteMany({});
  await prisma.broadcast.deleteMany({});
  await prisma.user.deleteMany({});

  // Create core users with roles
  console.log('Creating users with roles...');
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
        isActive: true,
      },
    });
    createdUsers.push(user);
    console.log(`Created ${def.label}: ${def.email} (${def.role})`);
  }

  const seller = createdUsers.find((u) => u.role === 'SELLER');
  const owner = createdUsers.find((u) => u.role === 'OWNER_ADMIN');

  // Create 5 complexes with new fields
  console.log('Creating 5 complexes...');
  const complexDefinitions = [
    {
      name: { uz: 'Yangi Shahar', ru: '????? ?????', en: 'New City' },
      address: { uz: "Toshkent, Mirzo Ulug'bek tumani", ru: '???????, ????? ??????????? ?????', en: 'Tashkent, Mirzo Ulugbek district' },
      city: 'Tashkent',
      lat: 41.3111,
      lng: 69.2797,
    },
    {
      name: { uz: 'Olmazor City', ru: '??????? ????', en: 'Olmazor City' },
      address: { uz: 'Toshkent, Olmazor tumani', ru: '???????, ??????????? ?????', en: 'Tashkent, Olmazor district' },
      city: 'Tashkent',
      lat: 41.3442,
      lng: 69.2287,
    },
    {
      name: { uz: 'Chilonzor Hills', ru: '???????? ?????', en: 'Chilonzor Hills' },
      address: { uz: 'Toshkent, Chilonzor tumani', ru: '???????, ???????????? ?????', en: 'Tashkent, Chilonzor district' },
      city: 'Tashkent',
      lat: 41.2786,
      lng: 69.2127,
    },
    {
      name: { uz: 'Samarkand Darvoza', ru: '????????? ???????', en: 'Samarkand Darvoza' },
      address: { uz: 'Samarqand shahri', ru: '????? ?????????', en: 'Samarkand city' },
      city: 'Samarkand',
      lat: 39.6542,
      lng: 66.9597,
    },
    {
      name: { uz: 'Bukhara Osiyo', ru: '?????? ????', en: 'Bukhara Asia' },
      address: { uz: 'Buxoro shahri', ru: '????? ??????', en: 'Bukhara city' },
      city: 'Bukhara',
      lat: 39.7747,
      lng: 64.4286,
    },
  ];

  const bannerImages = [
    'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&auto=format&fit=crop',
  ];

  const createdComplexes = [];
  for (let i = 0; i < complexDefinitions.length; i++) {
    const def = complexDefinitions[i];
    const nearbyPlaces = JSON.stringify([
      { name: 'Metro', distanceMeters: 350, note: 'Blue line' },
      { name: 'Market', distanceMeters: 600 },
    ]);
    const amenities = JSON.stringify(['parking', 'gym', 'playground', 'cafe']);

    const complex = await prisma.complex.create({
      data: {
        name: JSON.stringify(def.name),
        address: JSON.stringify(def.address),
        city: def.city,
        title: def.name.en,
        description: 'Modern residential complex with family-friendly infrastructure.',
        locationText: def.address.en,
        locationLat: def.lat,
        locationLng: def.lng,
        bannerImageUrl: bannerImages[i],
        walkabilityRating: randomInt(6, 9),
        airQualityRating: randomInt(5, 9),
        nearbyNote: 'Shops, markets, parks, and public transport nearby.',
        nearbyPlaces,
        amenities,
        createdById: owner ? owner.id : null,

        // legacy fields for compatibility
        latitude: def.lat,
        longitude: def.lng,
        walkabilityScore: randomInt(6, 9),
        airQualityScore: randomInt(5, 9),
        nearbyInfrastructure: 'Schools, clinics, supermarkets within walking distance.',
      },
    });
    createdComplexes.push(complex);
    console.log(`Created complex: ${def.name.en} (${def.city})`);
  }

  // Create 5 apartments (one per complex)
  console.log('Creating 5 apartments...');
  const imageUrls = [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558036117-15e82a2c9a9a?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=800&auto=format&fit=crop',
  ];

  for (let i = 0; i < createdComplexes.length; i++) {
    const complex = createdComplexes[i];
    const rooms = randomInt(2, 4);
    const area = randomFloat(50, 120);
    const price = randomInt(60000, 180000);
    const floor = randomInt(2, 12);
    const totalFloors = randomInt(Math.max(floor + 2, 6), 20);

    const title = {
      uz: `${rooms} xonali zamonaviy kvartira`,
      ru: `${rooms}-????????? ??????????? ????????`,
      en: `${rooms}-room modern apartment`,
    };

    const description = {
      uz: 'Yorug?, zamonaviy va qulay kvartira. Yaqin atrofda metro va bozor mavjud.',
      ru: '???????, ??????????? ? ??????? ????????. ????? ????? ? ?????.',
      en: 'Bright, modern, and comfortable apartment. ????? and market nearby.',
    };

    const materials = {
      uz: 'G?isht va monolit',
      ru: '?????? ? ???????',
      en: 'Brick and ???????',
    };

    const infrastructureNote = {
      uz: 'Bog?cha, maktab, klinika yaqin.',
      ru: '??????, ?????, ??????? ?????.',
      en: 'Kindergarten, school, clinic nearby.',
    };

    const apartment = await prisma.apartment.create({
      data: {
        complexId: complex.id,
        sellerId: seller.id,
        price,
        area,
        rooms,
        floor,
        totalFloors,
        title: JSON.stringify(title),
        description: JSON.stringify(description),
        materials: JSON.stringify(materials),
        infrastructureNote: JSON.stringify(infrastructureNote),
        status: 'active',
      },
    });

    await prisma.apartmentImage.create({
      data: {
        apartmentId: apartment.id,
        url: imageUrls[i],
        order: 0,
      },
    });
  }

  // Create 5 broadcast messages
  console.log('Creating 5 broadcasts...');
  const broadcasts = [
    {
      title: 'Yangi loyihalar!',
      message: 'Yangi turar-joy komplekslari e?lon qilindi. Endi ko?proq tanlovlar mavjud.',
    },
    {
      title: 'Chegirma haftaligi',
      message: 'Bu hafta ayrim kvartiralarda 10% gacha chegirmalar mavjud.',
    },
    {
      title: 'Ta?mirlash xizmatlari',
      message: 'Premium ta?mirlash xizmatlari endi mavjud. Batafsil ma?lumot uchun admin bilan bog?laning.',
    },
    {
      title: 'Sotuvchi uchun yangilik',
      message: 'Sellerlar uchun yangi listing tahrirlash bo?limi qo?shildi.',
    },
    {
      title: 'Platforma yangilandi',
      message: 'Yangi funksiyalar va tezlik yaxshilanishlari kiritildi.',
    },
  ];

  for (const item of broadcasts) {
    await prisma.broadcast.create({
      data: {
        title: item.title,
        message: item.message,
        isActive: true,
        createdById: owner ? owner.id : null,
      },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
