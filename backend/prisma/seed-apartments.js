const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// Random generator functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomArrayElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBoolean() {
  return Math.random() > 0.5;
}

// Apartment titles in different languages
const apartmentTitles = [
  {
    uz: "Yangi qurilgan zamonaviy kvartira",
    ru: "Современная квартира в новостройке",
    en: "Modern apartment in new building"
  },
  {
    uz: "Markaziy joylashuvdagi kvartira",
    ru: "Квартира в центре города",
    en: "Apartment in city center"
  },
  {
    uz: "Oila uchun keng kvartira",
    ru: "Просторная квартира для семьи",
    en: "Spacious apartment for family"
  },
  {
    uz: "Yangi ta'mirlangan kvartira",
    ru: "Квартира с свежим ремонтом",
    en: "Recently renovated apartment"
  },
  {
    uz: "Panoramali ko'rinishli kvartira",
    ru: "Квартира с панорамным видом",
    en: "Apartment with panoramic view"
  },
  {
    uz: "Yangi qurilishdagi studio",
    ru: "Студия в новостройке",
    en: "Studio in new construction"
  },
  {
    uz: "Lyuks kvartira",
    ru: "Люксовая квартира",
    en: "Luxury apartment"
  },
  {
    uz: "Ekologik toza kvartira",
    ru: "Экологически чистая квартира",
    en: "Eco-friendly apartment"
  },
  {
    uz: "Kvartira yashil zonada",
    ru: "Квартира в зеленой зоне",
    en: "Apartment in green zone"
  },
  {
    uz: "Zamonaviy interyerli kvartira",
    ru: "Квартира с современным интерьером",
    en: "Apartment with modern interior"
  }
];

// Apartment descriptions
const apartmentDescriptions = [
  {
    uz: "Yangi qurilgan, barcha kommunikatsiyalar ulangan, bolalar maydonchasi bor",
    ru: "Новостройка, все коммуникации подключены, есть детская площадка",
    en: "New building, all utilities connected, has children's playground"
  },
  {
    uz: "Markazda, transport va infratuzilma rivojlangan, qulay joylashuv",
    ru: "В центре, развитая транспортная инфраструктура, удобное расположение",
    en: "In the center, developed transport infrastructure, convenient location"
  },
  {
    uz: "Keng xonalar, yorug'lik, yangi ta'mirlangan, o'qituvchilar uchun",
    ru: "Просторные комнаты, светлый, свежий ремонт, для преподавателей",
    en: "Spacious rooms, bright, fresh renovation, for teachers"
  },
  {
    uz: "Panoramali ko'rinish, qulay makon, zamonaviy jihozlangan",
    ru: "Панорамный вид, удобное пространство, современное оборудование",
    en: "Panoramic view, comfortable space, modern equipment"
  },
  {
    uz: "Ekologik toza hudud, yashil zonada, dam olish maskani yaqinida",
    ru: "Экологически чистый район, в зеленой зоне, рядом зона отдыха",
    en: "Ecologically clean area, in green zone, near recreation area"
  }
];

// Materials
const materials = [
  {
    uz: "G'isht, monolit",
    ru: "Кирпич, монолит",
    en: "Brick, monolithic"
  },
  {
    uz: "Panel",
    ru: "Панельный",
    en: "Panel"
  },
  {
    uz: "Monolit-g'isht",
    ru: "Монолитно-кирпичный",
    en: "Monolithic-brick"
  },
  {
    uz: "Zamonaviy qurilish materiallari",
    ru: "Современные строительные материалы",
    en: "Modern construction materials"
  }
];

// Infrastructure notes
const infrastructureNotes = [
  {
    uz: "Maktab, bog'cha, supermarket yaqinida",
    ru: "Школа, детский сад, супермаркет рядом",
    en: "School, kindergarten, supermarket nearby"
  },
  {
    uz: "Park, sport zal, kafe yaqinida",
    ru: "Парк, спортивный зал, кафе рядом",
    en: "Park, gym, cafe nearby"
  },
  {
    uz: "Metro bekati, avtobus bekatlari yaqinida",
    ru: "Станция метро, автобусные остановки рядом",
    en: "Metro station, bus stops nearby"
  },
  {
    uz: "Suv havzasi, fitnes markaz, restoranlar",
    ru: "Бассейн, фитнес центр, рестораны",
    en: "Swimming pool, fitness center, restaurants"
  }
];

// Cities and complexes data
const cities = ['Tashkent', 'Samarkand', 'Bukhara', 'Khiva', 'Andijan'];
const complexNames = [
  { uz: "Yangi Shahar", ru: "Новый Город", en: "New City" },
  { uz: "Olmazor City", ru: "Олмазор Сити", en: "Olmazor City" },
  { uz: "Chilonzor Hills", ru: "Чиланзар Хиллс", en: "Chilonzor Hills" },
  { uz: "Tashkent City", ru: "Ташкент Сити", en: "Tashkent City" },
  { uz: "Samarkand Darvoza", ru: "Самарканд Дарвоза", en: "Samarkand Darvoza" },
  { uz: "Bukhara Osiyo", ru: "Бухара Азия", en: "Bukhara Asia" },
  { uz: "Khiva Shoh", ru: "Хива Шох", en: "Khiva Shoh" },
  { uz: "Andijan Bog'i", ru: "Андижан Боги", en: "Andijan Garden" },
  { uz: "Navoiy Markaz", ru: "Навои Центр", en: "Navoiy Center" },
  { uz: "Fergana Vodiysi", ru: "Ферганская Долина", en: "Fergana Valley" }
];

// Image URLs for apartments
const imageUrls = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558036117-15e82a2c9a9a?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558036117-15e82a2c9a9a?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop'
];

async function main() {
  console.log('🌱 Starting apartment seed...');

  try {
    // Check if we have users and complexes
    const users = await prisma.user.findMany({
      where: { role: 'SELLER' },
      select: { id: true, email: true }
    });

    const complexes = await prisma.complex.findMany({
      select: { id: true, name: true }
    });

    if (users.length === 0) {
      console.log('❌ No SELLER users found. Creating seller user...');
      
      const hashedPassword = await bcrypt.hash('seller123', 10);
      const seller = await prisma.user.create({
        data: {
          email: 'seller@example.com',
          passwordHash: hashedPassword,
          firstName: 'Seller',
          lastName: 'User',
          fullName: 'Seller User',
          phone: '+998901112233',
          role: 'SELLER'
        }
      });
      users.push(seller);
      console.log('✅ Created seller user:', seller.email);
    }

    if (complexes.length === 0) {
      console.log('❌ No complexes found. Creating complexes...');
      
      for (let i = 0; i < 10; i++) {
        const city = cities[i % cities.length];
        const complexName = complexNames[i];
        
        const complex = await prisma.complex.create({
          data: {
            name: JSON.stringify(complexName),
            address: JSON.stringify({
              uz: `${city} shahri`,
              ru: `Город ${city}`,
              en: `${city} city`
            }),
            city: city,
            coverImage: imageUrls[i % imageUrls.length]
          }
        });
        complexes.push(complex);
      }
      console.log('✅ Created', complexes.length, 'complexes');
    }

    console.log('👤 Available sellers:', users.length);
    console.log('🏢 Available complexes:', complexes.length);

    // Create 50 random apartments
    const apartmentsToCreate = [];
    
    for (let i = 1; i <= 50; i++) {
      const seller = randomArrayElement(users);
      const complex = randomArrayElement(complexes);
      const title = randomArrayElement(apartmentTitles);
      const description = randomArrayElement(apartmentDescriptions);
      const material = randomArrayElement(materials);
      const infrastructureNote = randomArrayElement(infrastructureNotes);
      
      const rooms = randomInt(1, 5);
      const area = randomFloat(30, 150);
      const price = randomFloat(30000, 250000);
      const floor = randomInt(1, 25);
      const totalFloors = randomInt(5, 30);
      
      // Status: 80% active, 10% hidden, 10% sold
      const statusRand = Math.random();
      let status = 'active';
      if (statusRand > 0.9) status = 'sold';
      else if (statusRand > 0.8) status = 'hidden';
      
      // Create apartment ID: apt-001, apt-002, etc.
      const apartmentId = `apt-${String(i).padStart(3, '0')}`;
      
      apartmentsToCreate.push({
        id: apartmentId,
        complexId: complex.id,
        sellerId: seller.id,
        price: price,
        area: area,
        rooms: rooms,
        floor: floor,
        totalFloors: totalFloors,
        title: JSON.stringify(title),
        description: JSON.stringify(description),
        materials: JSON.stringify(material),
        infrastructureNote: JSON.stringify(infrastructureNote),
        status: status.toUpperCase(),
        isFeatured: randomBoolean(),
        isRecommended: i <= 10 // First 10 apartments are recommended
      });
    }

    console.log('Creating 50 apartments...');
    
    // Create apartments in batches of 10
    for (let i = 0; i < apartmentsToCreate.length; i += 10) {
      const batch = apartmentsToCreate.slice(i, i + 10);
      
      await Promise.all(
        batch.map(async (aptData) => {
          try {
            await prisma.apartment.create({
              data: aptData
            });
            console.log(`✅ Created ${aptData.id}: ${JSON.parse(aptData.title).en}`);
          } catch (error) {
            console.error(`❌ Error creating ${aptData.id}:`, error.message);
          }
        })
      );
      
      console.log(`Batch ${i/10 + 1}/5 completed`);
    }

    // Add images to apartments
    console.log('Adding images to apartments...');
    const allApartments = await prisma.apartment.findMany({
      select: { id: true }
    });

    for (const apartment of allApartments) {
      // Add 3-5 images per apartment
      const numImages = randomInt(3, 5);
      const images = [];
      
      for (let j = 0; j < numImages; j++) {
        images.push({
          apartmentId: apartment.id,
          url: imageUrls[(j + allApartments.indexOf(apartment)) % imageUrls.length],
          order: j
        });
      }
      
      try {
        await prisma.apartmentImage.createMany({
          data: images
        });
        console.log(`✅ Added ${numImages} images to ${apartment.id}`);
      } catch (error) {
        console.error(`❌ Error adding images to ${apartment.id}:`, error.message);
      }
    }

    // Create favorites for regular users
    console.log('Creating user favorites...');
    const regularUsers = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { id: true, email: true }
    });

    if (regularUsers.length > 0) {
      for (const user of regularUsers) {
        // Pick 3-5 random apartments to favorite
        const favoriteApartments = allApartments
          .sort(() => Math.random() - 0.5)
          .slice(0, randomInt(3, 5));
        
        for (const apt of favoriteApartments) {
          try {
            await prisma.favorite.create({
              data: {
                userId: user.id,
                apartmentId: apt.id
              }
            });
          } catch (error) {
            // Ignore duplicate favorites
          }
        }
        console.log(`✅ Created ${favoriteApartments.length} favorites for ${user.email}`);
      }
    }

    // Summary
    const totalApartments = await prisma.apartment.count();
    const totalImages = await prisma.apartmentImage.count();
    const totalFavorites = await prisma.favorite.count();
    
    console.log('\n=========================================');
    console.log('✅ SEED COMPLETED SUCCESSFULLY');
    console.log('=========================================');
    console.log(`🏢 Total complexes: ${complexes.length}`);
    console.log(`🏠 Total apartments: ${totalApartments}`);
    console.log(`🖼️  Total images: ${totalImages}`);
    console.log(`❤️  Total favorites: ${totalFavorites}`);
    console.log('=========================================');
    console.log('📱 Test Apartment IDs (for frontend testing):');
    console.log('- apt-001 (Active, Recommended)');
    console.log('- apt-002 (Active, Recommended)');
    console.log('- apt-003 (Active, Recommended)');
    console.log('- apt-010 (Active, Recommended)');
    console.log('- apt-025 (Active)');
    console.log('- apt-050 (Active)');
    console.log('=========================================');
    console.log('🔗 Test URLs:');
    console.log('- http://localhost:3000/api/apartments');
    console.log('- http://localhost:3000/api/apartments/apt-001');
    console.log('- http://localhost:3000/api/apartments/apt-002');
    console.log('=========================================');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();