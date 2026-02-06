const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomArrayElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Data
const cities = ['Tashkent', 'Samarkand', 'Bukhara', 'Khiva', 'Andijan'];
const roles = ['USER', 'SELLER', 'ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN'];

const complexNames = [
  { uz: "Yangi Shahar", ru: "Новый Город", en: "New City" },
  { uz: "Olmazor City", ru: "Олмазор Сити", en: "Olmazor City" },
  { uz: "Chilonzor Hills", ru: "Чиланзар Хиллс", en: "Chilonzor Hills" },
  { uz: "Tashkent City", ru: "Ташкент Сити", en: "Tashkent City" },
  { uz: "Samarkand Darvoza", ru: "Самарканд Дарвоза", en: "Samarkand Darvoza" },
  { uz: "Bukhara Osiyo", ru: "Бухара Азия", en: "Bukhara Asia" },
  { uz: "Khiva Shoh", ru: "Хива Шох", en: "Khiva Shoh" },
  { uz: "Andijan Bog'i", ru: "Андижан Боги", en: "Andijan Garden" }
];

const apartmentTitles = [
  { uz: "Yangi qurilgan kvartira", ru: "Квартира в новостройке", en: "Apartment in new building" },
  { uz: "Markazdagi kvartira", ru: "Квартира в центре", en: "Apartment in center" },
  { uz: "Keng oilaviy kvartira", ru: "Просторная семейная квартира", en: "Spacious family apartment" },
  { uz: "Lyuks kvartira", ru: "Люксовая квартира", en: "Luxury apartment" },
  { uz: "Studio kvartira", ru: "Студия", en: "Studio apartment" },
  { uz: "Yangi ta'mirlangan", ru: "Свежий ремонт", en: "Fresh renovation" },
  { uz: "Panoramali ko'rinish", ru: "Панорамный вид", en: "Panoramic view" },
  { uz: "Yashil zonadagi kvartira", ru: "Квартира в зеленой зоне", en: "Apartment in green zone" }
];

const descriptions = [
  { uz: "Yangi qurilgan, barcha kommunikatsiyalar", ru: "Новостройка, все коммуникации", en: "New building, all utilities" },
  { uz: "Markazda, transport rivojlangan", ru: "В центре, развитый транспорт", en: "In center, developed transport" },
  { uz: "Keng xonalar, yorug'lik", ru: "Просторные комнаты, светлые", en: "Spacious rooms, bright" },
  { uz: "Yangi ta'mirlangan, zamonaviy", ru: "Свежий ремонт, современный", en: "Fresh renovation, modern" }
];

const materials = [
  { uz: "G'isht", ru: "Кирпич", en: "Brick" },
  { uz: "Panel", ru: "Панельный", en: "Panel" },
  { uz: "Monolit", ru: "Монолит", en: "Monolithic" }
];

const imageUrls = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558036117-15e82a2c9a9a?w=800&auto=format&fit=crop'
];

async function main() {
  console.log('��� Starting complete database seed...');
  
  try {
    // 1. CREATE USERS
    console.log('��� Creating users...');
    const createdUsers = [];
    
    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];
      const passwordHash = await bcrypt.hash('password123', 10);
      
      const userData = {
        email: `${role.toLowerCase()}@example.com`,
        passwordHash: passwordHash,
        firstName: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase(),
        lastName: 'User',
        phone: `+99890123456${i}`,
        role: role
      };
      
      const user = await prisma.user.create({
        data: userData
      });
      
      createdUsers.push(user);
      console.log(`✅ Created ${role}: ${user.email}`);
    }
    
    // 2. CREATE COMPLEXES
    console.log('��� Creating complexes...');
    const createdComplexes = [];
    
    for (let i = 0; i < 8; i++) {
      const city = cities[i % cities.length];
      const complexName = complexNames[i];
      
      const complex = await prisma.complex.create({
        data: {
          name: JSON.stringify(complexName),
          address: JSON.stringify({
            uz: `${city} shahri, asosiy ko'cha`,
            ru: `Город ${city}, главная улица`,
            en: `${city} city, main street`
          }),
          city: city
          // coverImage removed as it doesn't exist in schema
        }
      });
      
      createdComplexes.push(complex);
      console.log(`✅ Created complex: ${complexName.en} in ${city}`);
    }
    
    // 3. CREATE APARTMENTS (50 ta)
    console.log('��� Creating 50 apartments...');
    const seller = createdUsers.find(u => u.role === 'SELLER');
    
    for (let i = 1; i <= 50; i++) {
      const complex = randomArrayElement(createdComplexes);
      const title = randomArrayElement(apartmentTitles);
      const description = randomArrayElement(descriptions);
      const material = randomArrayElement(materials);
      
      // Random properties
      const rooms = randomInt(1, 5);
      const area = randomFloat(30, 150);
      const price = area * randomFloat(800, 2000); // Price based on area
      const floor = randomInt(1, 25);
      const totalFloors = floor + randomInt(2, 10);
      
      // Status: 80% active, 10% hidden, 10% sold
      const rand = Math.random();
      let status = 'active'; // Note: lowercase in schema
      if (rand > 0.9) status = 'sold';
      else if (rand > 0.8) status = 'hidden';
      
      const apartmentId = `apt-${String(i).padStart(3, '0')}`;
      
      try {
        const apartment = await prisma.apartment.create({
          data: {
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
            status: status
          }
        });
        
        console.log(`✅ Created ${apartmentId}: ${title.en} (${status})`);
        
        // 4. ADD IMAGES (3-5 images per apartment)
        const numImages = randomInt(3, 5);
        for (let j = 0; j < numImages; j++) {
          await prisma.apartmentImage.create({
            data: {
              apartmentId: apartmentId,
              url: imageUrls[(i + j) % imageUrls.length],
              order: j
            }
          });
        }
        
      } catch (error) {
        console.error(`❌ Error creating ${apartmentId}:`, error.message);
      }
    }
    
    // 5. CREATE FAVORITES
    console.log('❤️ Creating favorites...');
    const regularUser = createdUsers.find(u => u.role === 'USER');
    const allApartments = await prisma.apartment.findMany({
      where: { status: 'active' },
      take: 20
    });
    
    if (regularUser && allApartments.length > 0) {
      // User favorites 5 random apartments
      const favoriteApartments = allApartments
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      
      for (const apt of favoriteApartments) {
        try {
          await prisma.favorite.create({
            data: {
              userId: regularUser.id,
              apartmentId: apt.id
            }
          });
        } catch (error) {
          // Ignore duplicates
        }
      }
      console.log(`✅ Created 5 favorites for ${regularUser.email}`);
    }
    
    // SUMMARY
    console.log('\n=========================================');
    console.log('✅ SEED COMPLETED SUCCESSFULLY!');
    console.log('=========================================');
    
    const totalApartments = await prisma.apartment.count();
    const totalComplexes = await prisma.complex.count();
    const totalUsers = await prisma.user.count();
    const totalImages = await prisma.apartmentImage.count();
    const totalFavorites = await prisma.favorite.count();
    
    console.log(`��� Users: ${totalUsers}`);
    console.log(`��� Complexes: ${totalComplexes}`);
    console.log(`��� Apartments: ${totalApartments}`);
    console.log(`���️  Images: ${totalImages}`);
    console.log(`❤️  Favorites: ${totalFavorites}`);
    console.log('=========================================');
    console.log('��� Test Credentials:');
    console.log('USER: user@example.com / password123');
    console.log('SELLER: seller@example.com / password123');
    console.log('ADMIN: admin@example.com / password123');
    console.log('MANAGER: manager@example.com / password123');
    console.log('OWNER: owner@example.com / password123');
    console.log('=========================================');
    console.log('��� Test URLs:');
    console.log('GET /api/apartments');
    console.log('GET /api/apartments/apt-001');
    console.log('GET /api/apartments/apt-002');
    console.log('GET /api/apartments?page=1&limit=6');
    console.log('=========================================');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
