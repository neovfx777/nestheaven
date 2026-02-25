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

function localized(uz, ru = uz, en = uz) {
  return JSON.stringify({ uz, ru, en });
}

function getFallbackAccounts() {
  return [
    {
      role: 'OWNER_ADMIN',
      email: (process.env.OWNER_ADMIN_EMAIL || 'owner@goodhome.uz').toLowerCase(),
      password: process.env.OWNER_ADMIN_PASSWORD || 'admin123',
      firstName: 'Owner',
      lastName: 'Admin',
      phone: '+998905555555',
    },
    {
      role: 'ADMIN',
      email: (process.env.ADMIN_EMAIL || 'admin@goodhome.uz').toLowerCase(),
      password: process.env.ADMIN_PASSWORD || 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+998903333333',
    },
    {
      role: 'MANAGER_ADMIN',
      email: (process.env.MANAGER_ADMIN_EMAIL || 'manager@goodhome.uz').toLowerCase(),
      password: process.env.MANAGER_ADMIN_PASSWORD || 'admin123',
      firstName: 'Manager',
      lastName: 'Admin',
      phone: '+998904444444',
    },
    {
      role: 'SELLER',
      email: (process.env.SELLER_EMAIL || 'seller@goodhome.uz').toLowerCase(),
      password: process.env.SELLER_PASSWORD || 'seller123',
      firstName: 'Primary',
      lastName: 'Seller',
      phone: '+998902222222',
    },
  ];
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

async function createSeedUsers() {
  let accounts;
  try {
    accounts = loadConfiguredAccounts();
  } catch (error) {
    console.warn('Configured account env vars missing, using fallback seed accounts.');
    accounts = getFallbackAccounts();
  }

  const createdUsers = [];
  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    const user = await prisma.user.create({
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
    createdUsers.push(user);
  }

  const findByRole = (role) => createdUsers.find((user) => user.role === role);
  return {
    users: createdUsers,
    owner: findByRole('OWNER_ADMIN') || createdUsers[0],
    seller: findByRole('SELLER') || createdUsers[0],
  };
}

async function createDemoComplexes({ ownerId, sellerId }) {
  const complexesPayload = [
    {
      key: 'chilonzor',
      city: 'Tashkent',
      titleUz: 'Chilonzor Family Residence',
      titleRu: 'Chilanzar Family Residence',
      titleEn: 'Chilanzar Family Residence',
      locationText: 'Chilonzor tumani, metro Novza yaqinida',
      lat: 41.2854,
      lng: 69.2036,
      walkability: 84,
      airQuality: 73,
      amenities: ['parking', 'security', 'playground', 'elevator'],
      nearbyPlaces: [
        { type: 'metro', name: 'Novza Metro', distanceMeters: 450, note: '5-6 min piyoda' },
        { type: 'school', name: 'School #90', distanceMeters: 800, note: 'Yaqin davlat maktabi' },
        { type: 'hospital', name: 'Chilonzor Family Clinic', distanceMeters: 1200, note: '24/7 qabul' },
      ],
    },
    {
      key: 'yunusobod',
      city: 'Tashkent',
      titleUz: 'Yunusobod Green Towers',
      titleRu: 'Yunusabad Green Towers',
      titleEn: 'Yunusabad Green Towers',
      locationText: 'Yunusobod tumani, bodomzor yo`li',
      lat: 41.3628,
      lng: 69.2877,
      walkability: 78,
      airQuality: 81,
      amenities: ['gym', 'parking', 'security', 'kids-zone'],
      nearbyPlaces: [
        { type: 'park', name: 'Yunusobod Eco Park', distanceMeters: 650, note: 'Toza havo hududi' },
        { type: 'mall', name: 'Mega Planet', distanceMeters: 1400, note: 'Savdo va food court' },
        { type: 'kindergarten', name: 'Kinder House', distanceMeters: 520, note: 'Xususiy bogcha' },
      ],
    },
    {
      key: 'sergeli',
      city: 'Tashkent',
      titleUz: 'Sergeli Riverside',
      titleRu: 'Sergeli Riverside',
      titleEn: 'Sergeli Riverside',
      locationText: 'Sergeli tumani, Yangi Sergeli massivi',
      lat: 41.2266,
      lng: 69.2163,
      walkability: 70,
      airQuality: 68,
      amenities: ['parking', 'yard', 'supermarket', 'security'],
      nearbyPlaces: [
        { type: 'metro', name: 'Sergeli Metro', distanceMeters: 900, note: '10-12 min piyoda' },
        { type: 'school', name: 'School #305', distanceMeters: 600, note: 'Yangi maktab binosi' },
        { type: 'mall', name: 'Sergeli Market', distanceMeters: 750, note: 'Kundalik xaridlar uchun' },
      ],
    },
  ];

  const created = [];

  for (const complex of complexesPayload) {
    const titleJson = localized(complex.titleUz, complex.titleRu, complex.titleEn);
    const descriptionJson = localized(
      `${complex.titleUz} - oilaviy yashash uchun qulay kompleks.`,
      `${complex.titleRu} - udobnyy kompleks dlya semeynoy zhizni.`,
      `${complex.titleEn} - a convenient complex for family living.`
    );
    const addressJson = localized(complex.locationText);

    const item = await prisma.complex.create({
      data: {
        name: titleJson,
        title: titleJson,
        description: descriptionJson,
        address: addressJson,
        city: complex.city,
        developer: 'NestHeaven Development',
        blockCount: 3,
        locationText: complex.locationText,
        locationLat: complex.lat,
        locationLng: complex.lng,
        latitude: complex.lat,
        longitude: complex.lng,
        walkabilityRating: complex.walkability,
        airQualityRating: complex.airQuality,
        walkabilityScore: complex.walkability,
        airQualityScore: complex.airQuality,
        amenities: JSON.stringify(complex.amenities),
        nearbyPlaces: JSON.stringify(complex.nearbyPlaces),
        allowedSellers: JSON.stringify([sellerId]),
        createdById: ownerId || null,
        bannerImageUrl: `https://picsum.photos/seed/nestheaven-complex-${complex.key}/1200/700`,
      },
    });

    created.push(item);
  }

  return created;
}

async function createDemoApartments({ sellerId, complexes }) {
  const apartmentsPayload = [
    { c: 0, rooms: 2, area: 62, floor: 4, totalFloors: 9, price: 78000 },
    { c: 0, rooms: 3, area: 86, floor: 6, totalFloors: 12, price: 109000 },
    { c: 0, rooms: 1, area: 45, floor: 2, totalFloors: 9, price: 61000 },
    { c: 1, rooms: 2, area: 68, floor: 8, totalFloors: 16, price: 99000 },
    { c: 1, rooms: 3, area: 94, floor: 11, totalFloors: 16, price: 139000 },
    { c: 1, rooms: 4, area: 121, floor: 5, totalFloors: 16, price: 178000 },
    { c: 2, rooms: 2, area: 64, floor: 3, totalFloors: 10, price: 73000 },
    { c: 2, rooms: 3, area: 88, floor: 7, totalFloors: 10, price: 97000 },
    { c: 2, rooms: 1, area: 41, floor: 1, totalFloors: 10, price: 52000 },
    { c: 0, rooms: 3, area: 101, floor: 9, totalFloors: 12, price: 148000 },
  ];

  const createdApartments = [];

  for (let index = 0; index < apartmentsPayload.length; index += 1) {
    const item = apartmentsPayload[index];
    const complex = complexes[item.c];
    const titleUz = `${item.rooms} xonali kvartira - ${complex.city}`;
    const titleRu = `${item.rooms}-komnatnaya kvartira - ${complex.city}`;
    const titleEn = `${item.rooms}-room apartment - ${complex.city}`;
    const descriptionUz = `${item.area} m2, ${item.floor}-qavat, tayyor yashash uchun.`;
    const descriptionRu = `${item.area} m2, ${item.floor}-etazh, gotova k zaseleniyu.`;
    const descriptionEn = `${item.area} sqm, floor ${item.floor}, ready to move in.`;

    const apartment = await prisma.apartment.create({
      data: {
        complexId: complex.id,
        sellerId,
        status: 'active',
        price: item.price,
        area: item.area,
        rooms: item.rooms,
        floor: item.floor,
        totalFloors: item.totalFloors,
        title: localized(titleUz, titleRu, titleEn),
        description: localized(descriptionUz, descriptionRu, descriptionEn),
        materials: localized('G`isht va monolit', 'Kirpich i monolit', 'Brick and monolith'),
        infrastructureNote: localized(
          'Yaqin atrofda maktab, bogcha va market mavjud',
          'Ryadom est shkola, detskiy sad i market',
          'Nearby there are school, kindergarten and market'
        ),
        constructionStatus: 'available',
      },
    });

    await prisma.apartmentImage.createMany({
      data: [
        {
          apartmentId: apartment.id,
          url: `https://picsum.photos/seed/nestheaven-apt-${index + 1}-a/1200/800`,
          order: 0,
        },
        {
          apartmentId: apartment.id,
          url: `https://picsum.photos/seed/nestheaven-apt-${index + 1}-b/1200/800`,
          order: 1,
        },
      ],
    });

    createdApartments.push(apartment);
  }

  return createdApartments;
}

async function createDemoBroadcast(ownerId) {
  await prisma.broadcast.create({
    data: {
      title: 'Demo Announcement',
      message:
        'Welcome to NestHeaven demo data. This database now includes sample complexes and apartments.',
      isActive: true,
      createdById: ownerId || null,
    },
  });
}

async function main() {
  assertSeedSafety();
  console.log('Starting configured demo seed...');

  await clearAllData();

  const { users, owner, seller } = await createSeedUsers();
  const complexes = await createDemoComplexes({
    ownerId: owner?.id || null,
    sellerId: seller.id,
  });
  const apartments = await createDemoApartments({
    sellerId: seller.id,
    complexes,
  });
  await createDemoBroadcast(owner?.id || null);

  console.log(
    `Seed completed: users=${users.length}, complexes=${complexes.length}, apartments=${apartments.length}, broadcasts=1`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
