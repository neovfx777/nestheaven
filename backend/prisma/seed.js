require('../src/config/loadEnv');

const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { loadConfiguredAccounts } = require('../scripts/lib/account-config');
const env = require('../src/config/env');

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

function buildLongApartmentDescription({ title, city, complexTitle, priceText, rooms, area, floor, totalFloors }) {
  const uzLines = [
    `1) E'lon: ${title}`,
    `2) Shahar: ${city}`,
    `3) Kompleks: ${complexTitle}`,
    `4) Xonalar soni: ${rooms}`,
    `5) Maydon: ${area} m²`,
    `6) Qavat: ${floor} / ${totalFloors}`,
    `7) Narx: ${priceText}`,
    `8) Holati: tayyor yashash uchun`,
    `9) Hujjatlar: tartibda (shartnoma asosida)`,
    `10) To'lov: naqd / bank o'tkazmasi / ipoteka (bank shartlari bo'yicha)`,
    `11) Boshlang'ich badal: bank talablariga ko'ra`,
    `12) Kredit muddati: bank shartlariga ko'ra (20 yilgacha bo'lishi mumkin)`,
    `13) Ta'mir holati: toza va ozoda`,
    `14) Reja: qulay joylashuv`,
    `15) Oshxona: alohida yoki studiya (variantga ko'ra)`,
    `16) Sanuzel: 1 ta (variantga ko'ra)`,
    `17) Balkon: mavjud bo'lishi mumkin`,
    `18) Lift: mavjud (qavatlar soniga qarab)`,
    `19) Parkovka: mavjud`,
    `20) Hovli: yopiq / ochiq (kompleksga qarab)`,
    `21) Bolalar maydonchasi: mavjud`,
    `22) Xavfsizlik: 24/7 (kompleksga qarab)`,
    `23) Videokuzatuv: mavjud bo'lishi mumkin`,
    `24) Kirish yo'li: asfalt va qulay`,
    `25) Transport: jamoat transporti yaqin`,
    `26) Metro: yaqin hududda (agar mavjud bo'lsa)`,
    `27) Maktab: yaqin atrofda`,
    `28) Bog'cha: yaqin atrofda`,
    `29) Market: piyoda masofada`,
    `30) Dorixona: yaqin atrofda`,
    `31) Poliklinika: yaqin hududda`,
    `32) Savdo markazi: yaqin hududda`,
    `33) Park: dam olish uchun joylar mavjud`,
    `34) Internet: ulash imkoniyati bor`,
    `35) Kommunal: hisoblagichlar (gaz/suv/elektr)`,
    `36) Isitish: markaziy yoki individual (variantga ko'ra)`,
    `37) Konditsioner: o'rnatish mumkin`,
    `38) Mebel: kelishuv asosida`,
    `39) Texnika: kelishuv asosida`,
    `40) Qo'shimcha xarajatlar: notarial / rasmiylashtirish (kerak bo'lsa)`,
    `41) Ko'rish: oldindan kelishib`,
    `42) Kalitlar: tez topshirish mumkin`,
    `43) Qo'shnilar: tinch hudud`,
    `44) Shovqin darajasi: o'rtacha`,
    `45) Quyosh tushishi: yaxshi (variantga ko'ra)`,
    `46) Derazalar: sifatli ramalar (variantga ko'ra)`,
    `47) Xavfsiz bitim: shartnoma va to'lov hujjatlari bilan`,
    `48) Kelishuv: narx va shartlar bo'yicha`,
    `49) Aloqa: qo'ng'iroq yoki chat orqali yozing`,
    `50) Eslatma: ma'lumotlar demo bo'lishi mumkin, aniq tafsilotlar uchun bog'laning`,
  ];

  const ruLines = [
    `1) Объявление: ${title}`,
    `2) Город: ${city}`,
    `3) ЖК: ${complexTitle}`,
    `4) Комнат: ${rooms}`,
    `5) Площадь: ${area} м²`,
    `6) Этаж: ${floor} / ${totalFloors}`,
    `7) Цена: ${priceText}`,
    `8) Состояние: готово к проживанию`,
    `9) Документы: в порядке (по договору)`,
    `10) Оплата: наличные / перевод / ипотека (по условиям банка)`,
    `11) Первоначальный взнос: по требованиям банка`,
    `12) Срок кредита: по условиям банка (возможен до 20 лет)`,
    `13) Ремонт: аккуратно и чисто`,
    `14) Планировка: удобная`,
    `15) Кухня: отдельная или студия (по варианту)`,
    `16) Санузел: 1 (по варианту)`,
    `17) Балкон: может быть`,
    `18) Лифт: есть (зависит от этажности)`,
    `19) Парковка: есть`,
    `20) Двор: закрытый / открытый (в зависимости от ЖК)`,
    `21) Детская площадка: есть`,
    `22) Охрана: 24/7 (в зависимости от ЖК)`,
    `23) Видеонаблюдение: возможно есть`,
    `24) Подъездные пути: удобные`,
    `25) Транспорт: рядом остановки`,
    `26) Метро: поблизости (если есть)`,
    `27) Школа: рядом`,
    `28) Детсад: рядом`,
    `29) Магазины: пешая доступность`,
    `30) Аптека: рядом`,
    `31) Поликлиника: поблизости`,
    `32) ТЦ: поблизости`,
    `33) Парк: есть места для прогулок`,
    `34) Интернет: можно подключить`,
    `35) Коммунальные: счетчики (газ/вода/свет)`,
    `36) Отопление: центральное или индивидуальное (по варианту)`,
    `37) Кондиционер: можно установить`,
    `38) Мебель: по договоренности`,
    `39) Техника: по договоренности`,
    `40) Доп. расходы: нотариус/оформление (если требуется)`,
    `41) Просмотр: по предварительной договоренности`,
    `42) Ключи: возможно быстрое заселение`,
    `43) Соседи: спокойный район`,
    `44) Уровень шума: средний`,
    `45) Инсоляция: хорошая (по варианту)`,
    `46) Окна: качественные рамы (по варианту)`,
    `47) Безопасная сделка: договор и подтверждение оплаты`,
    `48) Условия: цена и детали обсуждаются`,
    `49) Связь: звонок или чат`,
    `50) Примечание: данные могут быть демо, уточняйте детали`,
  ];

  const enLines = [
    `1) Listing: ${title}`,
    `2) City: ${city}`,
    `3) Complex: ${complexTitle}`,
    `4) Rooms: ${rooms}`,
    `5) Area: ${area} m²`,
    `6) Floor: ${floor} / ${totalFloors}`,
    `7) Price: ${priceText}`,
    `8) Condition: ready to move in`,
    `9) Documents: available (contract-based)`,
    `10) Payment: cash / bank transfer / mortgage (bank terms apply)`,
    `11) Down payment: per bank requirements`,
    `12) Loan term: per bank terms (up to 20 years possible)`,
    `13) Renovation: clean and tidy`,
    `14) Layout: practical and comfortable`,
    `15) Kitchen: separate or studio (depends on unit)`,
    `16) Bathroom: 1 (depends on unit)`,
    `17) Balcony: may be available`,
    `18) Elevator: available (depends on building)`,
    `19) Parking: available`,
    `20) Yard: gated / open (depends on complex)`,
    `21) Kids playground: available`,
    `22) Security: 24/7 (depends on complex)`,
    `23) CCTV: may be available`,
    `24) Access roads: convenient`,
    `25) Transport: public transit nearby`,
    `26) Metro: nearby (if applicable)`,
    `27) School: nearby`,
    `28) Kindergarten: nearby`,
    `29) Grocery: walking distance`,
    `30) Pharmacy: nearby`,
    `31) Clinic: nearby`,
    `32) Mall: nearby`,
    `33) Park: walking areas available`,
    `34) Internet: connection available`,
    `35) Utilities: meters (gas/water/electricity)`,
    `36) Heating: central or individual (depends on unit)`,
    `37) AC: can be installed`,
    `38) Furniture: negotiable`,
    `39) Appliances: negotiable`,
    `40) Extra costs: notary/registration (if required)`,
    `41) Viewing: by appointment`,
    `42) Keys: quick handover possible`,
    `43) Neighbors: calm area`,
    `44) Noise level: moderate`,
    `45) Sunlight: good (depends on unit)`,
    `46) Windows: quality frames (depends on unit)`,
    `47) Safe deal: contract + payment proof`,
    `48) Terms: price and details negotiable`,
    `49) Contact: call or message in chat`,
    `50) Note: data may be demo; contact us for exact details`,
  ];

  return {
    uz: uzLines.join('\n'),
    ru: ruLines.join('\n'),
    en: enLines.join('\n'),
  };
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function prepareSeedImages() {
  const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
  const seedDir = path.join(uploadRoot, 'seed');
  ensureDir(seedDir);

  const sourceDir = path.resolve(__dirname, '..', '..', 'public', 'images');
  if (!fs.existsSync(sourceDir)) {
    console.warn('Seed image source directory not found:', sourceDir);
    return [];
  }

  const sources = fs
    .readdirSync(sourceDir)
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (sources.length === 0) {
    console.warn('No seed images found in:', sourceDir);
    return [];
  }

  for (const file of sources) {
    const src = path.join(sourceDir, file);
    const dst = path.join(seedDir, file);
    if (!fs.existsSync(dst)) {
      fs.copyFileSync(src, dst);
    }
  }

  return sources.map((file) => `/api/uploads/seed/${file}`);
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
      role: 'USER',
      email: (process.env.DEMO_USER_EMAIL || 'user@goodhome.uz').toLowerCase(),
      password: process.env.DEMO_USER_PASSWORD || 'user123',
      firstName: 'Demo',
      lastName: 'User',
      phone: '+998901111111',
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
  await prisma.conversationMessage.deleteMany({});
  await prisma.conversation.deleteMany({});
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

  const demoUserAccount = {
    role: 'USER',
    email: (process.env.DEMO_USER_EMAIL || 'user@goodhome.uz').toLowerCase(),
    password: process.env.DEMO_USER_PASSWORD || 'user123',
    firstName: 'Demo',
    lastName: 'User',
    phone: '+998901111111',
  };

  if (!accounts.some((account) => account.role === 'USER')) {
    const ownerIndex = accounts.findIndex((account) => account.role === 'OWNER_ADMIN');
    const insertIndex = ownerIndex >= 0 ? ownerIndex + 1 : 0;
    accounts.splice(insertIndex, 0, demoUserAccount);
  }

  const createdUsers = [];
  let ownerId = null;
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
        createdBy:
          account.role === 'OWNER_ADMIN' || !ownerId
            ? undefined
            : {
                connect: { id: ownerId },
              },
      },
    });

    if (account.role === 'OWNER_ADMIN') {
      ownerId = user.id;
    }
    createdUsers.push(user);
  }

  const findByRole = (role) => createdUsers.find((user) => user.role === role);
  return {
    users: createdUsers,
    owner: findByRole('OWNER_ADMIN') || createdUsers[0],
    seller: findByRole('SELLER') || createdUsers[0],
    demoUser: findByRole('USER') || createdUsers[0],
    demoUserCredentials: {
      email: demoUserAccount.email,
      password: demoUserAccount.password,
    },
  };
}

async function createDemoComplexes({ ownerId, sellerId, seedImages }) {
  const imagePool = Array.isArray(seedImages) ? seedImages.filter(Boolean) : [];
  let imageCursor = 0;
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
        createdBy: ownerId ? { connect: { id: ownerId } } : undefined,
        images: {
          create: [
            {
              url:
                imagePool.length > 0
                  ? imagePool[imageCursor % imagePool.length]
                  : `https://picsum.photos/seed/nestheaven-complex-${complex.key}-a/1200/700`,
              order: 0,
            },
            {
              url:
                imagePool.length > 0
                  ? imagePool[(imageCursor + 1) % imagePool.length]
                  : `https://picsum.photos/seed/nestheaven-complex-${complex.key}-b/1200/700`,
              order: 1,
            },
          ],
        },
      },
    });
    imageCursor += 2;

    created.push(item);
  }

  return created;
}

async function createDemoApartments({ sellerId, complexes, seedImages }) {
  const imagePool = Array.isArray(seedImages) ? seedImages.filter(Boolean) : [];
  let imageCursor = 0;
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
    const priceText = `${item.price.toLocaleString('en-US')} UZS`;
    const longDescription = buildLongApartmentDescription({
      title: titleUz,
      city: complex.city,
      complexTitle: complex.titleUz || complex.titleRu || complex.titleEn || complex.city,
      priceText,
      rooms: item.rooms,
      area: item.area,
      floor: item.floor,
      totalFloors: item.totalFloors,
    });

    const apartment = await prisma.apartment.create({
      data: {
        complex: { connect: { id: complex.id } },
        seller: { connect: { id: sellerId } },
        realtor: { connect: { id: sellerId } },
        status: 'active',
        price: item.price,
        area: item.area,
        rooms: item.rooms,
        floor: item.floor,
        totalFloors: item.totalFloors,
        title: localized(titleUz, titleRu, titleEn),
        description: localized(longDescription.uz, longDescription.ru, longDescription.en),
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
          url:
            imagePool.length > 0
              ? imagePool[imageCursor % imagePool.length]
              : `https://picsum.photos/seed/nestheaven-apt-${index + 1}-a/1200/800`,
          order: 0,
        },
        {
          apartmentId: apartment.id,
          url:
            imagePool.length > 0
              ? imagePool[(imageCursor + 1) % imagePool.length]
              : `https://picsum.photos/seed/nestheaven-apt-${index + 1}-b/1200/800`,
          order: 1,
        },
      ],
    });
    imageCursor += 2;

    createdApartments.push(apartment);
  }

  return createdApartments;
}

async function createDemoConversations({ apartments, userId, realtorId, messages }) {
  if (!apartments?.length) return [];

  const targetApartment = apartments[0];
  const conversation = await prisma.conversation.create({
    data: {
      apartment: { connect: { id: targetApartment.id } },
      user: { connect: { id: userId } },
      realtor: { connect: { id: realtorId } },
    },
  });

  const now = Date.now();

  const defaultMessages = [
    { senderId: userId, body: 'Assalomu alaykum! Shu kvartira hali sotuvdami?' },
    { senderId: realtorId, body: 'Va alaykum assalom! Ha, sotuvda. Qaysi vaqt kelib ko‘rasiz?' },
    { senderId: userId, body: 'Bugun kechqurun 19:00 atrofida bo‘ladimi?' },
  ];

  const sourceMessages = Array.isArray(messages) && messages.length ? messages : defaultMessages;
  const payload = sourceMessages.map((message, index) => ({
    conversationId: conversation.id,
    senderId: message.senderId,
    body: message.body,
    createdAt: message.createdAt || new Date(now - 1000 * 60 * (sourceMessages.length - index)),
  }));

  await prisma.conversationMessage.createMany({ data: payload });

  const lastCreatedAt = payload.at(-1)?.createdAt || new Date(now);
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: lastCreatedAt },
  });

  return [conversation];
}

async function createDemoBroadcast(ownerId) {
  await prisma.broadcast.create({
    data: {
      title: 'Demo Announcement',
      message:
        'Welcome to NestHeaven demo data. This database now includes sample complexes and apartments.',
      isActive: true,
      createdBy: ownerId ? { connect: { id: ownerId } } : undefined,
    },
  });
}

async function main() {
  assertSeedSafety();
  console.log('Starting configured demo seed...');

  await clearAllData();

  const seedImages = prepareSeedImages();
  const { users, owner, seller, demoUser, demoUserCredentials } = await createSeedUsers();
  const complexes = await createDemoComplexes({
    ownerId: owner?.id || null,
    sellerId: seller.id,
    seedImages,
  });
  const apartments = await createDemoApartments({
    sellerId: seller.id,
    complexes,
    seedImages,
  });
  const demoUserConversations = await createDemoConversations({
    apartments,
    userId: demoUser.id,
    realtorId: seller.id,
  });
  const ownerConversations = await createDemoConversations({
    apartments,
    userId: owner.id,
    realtorId: seller.id,
    messages: [
      { senderId: seller.id, body: 'Hello! Do you want details for unit #7771?' },
      { senderId: owner.id, body: 'Yes please. How much is it, and is installment available?' },
      {
        senderId: seller.id,
        body: 'Price is $148,000. Installment is available for 12 months. We can schedule a viewing today.',
      },
    ],
  });
  const conversations = [...demoUserConversations, ...ownerConversations];
  await createDemoBroadcast(owner?.id || null);

  console.log(
    `Seed completed: users=${users.length}, complexes=${complexes.length}, apartments=${apartments.length}, conversations=${conversations.length}, broadcasts=1`
  );
  console.log(`Demo USER credentials: ${demoUserCredentials.email} / ${demoUserCredentials.password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
