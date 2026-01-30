const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

// Sample data for diverse apartments
const cities = ['Tashkent', 'Samarkand', 'Bukhara', 'Khiva', 'Fergana', 'Namangan', 'Andijan', 'Nukus'];
const complexes = [
  'Golden Heights', 'Silk Road Gardens', 'Central Park Residences',
  'Bukhara Palace', 'Samarkand Towers', 'Fergana Valley Homes',
  'Andijan Gardens', 'Nukus Oasis', 'Tashkent City Center',
  'Chilanzar Heights', 'Yunusabad Gardens', 'Mirabad Residences'
];

const apartmentTypes = [
  { rooms: 1, area: 35, priceRange: [25000, 45000] },
  { rooms: 2, area: 55, priceRange: [40000, 70000] },
  { rooms: 3, area: 80, priceRange: [60000, 120000] },
  { rooms: 4, area: 110, priceRange: [90000, 180000] },
  { rooms: 5, area: 150, priceRange: [130000, 250000] }
];

const statuses = ['active', 'active', 'active', 'sold', 'hidden'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateApartmentTitle(rooms, city) {
  const adjectives = ['Modern', 'Luxury', 'Cozy', 'Spacious', 'Elegant', 'Stylish', 'Comfortable', 'Premium'];
  const nouns = ['Apartment', 'Flat', 'Home', 'Residence', 'Suite'];
  const adjective = getRandomElement(adjectives);
  const noun = getRandomElement(nouns);
  
  return {
    uz: `${rooms} xonali ${adjective.toLowerCase()} ${noun.toLowerCase()}`,
    ru: `${rooms} комнатная ${adjective.toLowerCase()} ${noun.toLowerCase()}`,
    en: `${rooms} Bedroom ${adjective} ${noun}`
  };
}

function generateDescription(rooms, area) {
  const descriptions = [
    `Beautiful ${rooms}-bedroom apartment with modern amenities`,
    `Spacious ${rooms}-bedroom home perfect for families`,
    `Modern ${rooms}-bedroom residence in prime location`,
    `Elegant ${rooms}-bedroom apartment with great views`,
    `Comfortable ${rooms}-bedroom home with excellent facilities`
  ];
  
  const baseDesc = getRandomElement(descriptions);
  
  return {
    uz: `Zamonaviy ${rooms} xonali kvartira. Maydon: ${area} m². ${baseDesc}`,
    ru: `Современная ${rooms}-комнатная квартира. Площадь: ${area} m². ${baseDesc}`,
    en: `${baseDesc}. Area: ${area} m². ${rooms} bedrooms.`
  };
}

async function createSampleApartments() {
  try {
    console.log('🏗️  Creating 100 sample apartments...');
    
    // First, get or create complexes
    const existingComplexes = await prisma.complex.findMany();
    let complexesToUse = existingComplexes;
    
    if (existingComplexes.length < complexes.length) {
      console.log(`Creating ${complexes.length - existingComplexes.length} additional complexes...`);
      for (let i = existingComplexes.length; i < complexes.length; i++) {
        const complexName = complexes[i];
        const city = getRandomElement(cities);
        
        const complex = await prisma.complex.create({
          data: {
            id: randomUUID(),
            name: JSON.stringify({
              uz: complexName,
              ru: complexName,
              en: complexName
            }),
            address: JSON.stringify({
              uz: `${city} shahar, ${complexName}`,
              ru: `${city} город, ${complexName}`,
              en: `${city} city, ${complexName}`
            }),
            city
          }
        });
        complexesToUse.push(complex);
      }
    }
    
    // Get existing users to assign as sellers
    const sellers = await prisma.user.findMany({
      where: { role: 'SELLER' }
    });
    
    if (sellers.length === 0) {
      console.log('No sellers found. Creating a default seller...');
      const seller = await prisma.user.create({
        data: {
          id: randomUUID(),
          email: 'seller@sample.com',
          passwordHash: '$2b$10$placeholder', // This would be properly hashed in real app
          role: 'SELLER',
          firstName: 'Sample',
          lastName: 'Seller',
          phone: '+998901234567'
        }
      });
      sellers.push(seller);
    }
    
    // Create apartments one by one to handle images
    const createdApartments = [];
    
    for (let i = 0; i < 100; i++) {
      const type = getRandomElement(apartmentTypes);
      const complex = getRandomElement(complexesToUse);
      const seller = getRandomElement(sellers);
      const status = getRandomElement(statuses);
      
      const title = generateApartmentTitle(type.rooms, complex.city);
      const description = generateDescription(type.rooms, type.area);
      
      const price = getRandomInRange(type.priceRange[0], type.priceRange[1]);
      
      // Create apartment - ONLY fields that exist in schema
      const apartment = await prisma.apartment.create({
        data: {
          id: randomUUID(),
          title: JSON.stringify(title),
          description: JSON.stringify(description),
          price,
          rooms: type.rooms,
          area: type.area,
          floor: getRandomInRange(1, 15),
          totalFloors: getRandomInRange(5, 20),
          status,
          complexId: complex.id,
          sellerId: seller.id,
          materials: JSON.stringify({
            uz: "G'isht, beton, temir",
            ru: 'Кирпич, бетон, железо',
            en: 'Brick, concrete, iron'
          }),
          infrastructureNote: JSON.stringify({
            uz: 'Maktab, shifoxona, supermarket',
            ru: 'Школа, больница, супермаркет',
            en: 'School, hospital, supermarket'
          })
        }
      });
      
      createdApartments.push(apartment);
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Created ${i + 1} apartments...`);
      }
    }
    
    console.log(`🎉 Successfully created ${createdApartments.length} sample apartments!`);
    
    // Now update all apartments with local images
    console.log('🖼️  Adding local images to all apartments...');
    
    // Local image files
    const localImages = [
      'uyga-1.jpg',
      'uyga-2.jpg',
      'uyga-3.jpg',
      'uyga-4.jpg',
      'uyga-5.jpg',
      'uyga-6.jpg',
      'uyga-7.jpg',
      'uyga-8.jpg',
      'uyga-9.jpg',
      'uyga-10.jpg'
    ];
    
    // Get all apartments from database
    const allApartments = await prisma.apartment.findMany();
    
    for (const apartment of allApartments) {
      // Delete existing images
      await prisma.apartmentImage.deleteMany({
        where: { apartmentId: apartment.id }
      });
      
      // Create new local images
      const imageCount = getRandomInRange(3, 8);
      const images = [];
      
      for (let i = 0; i < imageCount; i++) {
        const randomImage = localImages[Math.floor(Math.random() * localImages.length)];
        images.push({
          id: randomUUID(),
          apartmentId: apartment.id,
          url: `C:\\Users\\f1n\\Desktop\\nestheaven\\public\\images\\${randomImage}`,
          order: i
        });
      }
      
      if (images.length > 0) {
        await prisma.apartmentImage.createMany({
          data: images
        });
      }
    }
    
    console.log(`✅ Added local images to ${allApartments.length} apartments`);
    
    // Statistics
    const activeCount = createdApartments.filter(a => a.status === 'active').length;
    const soldCount = createdApartments.filter(a => a.status === 'sold').length;
    const hiddenCount = createdApartments.filter(a => a.status === 'hidden').length;
    
    console.log('📊 Summary:');
    console.log(`   - Active: ${activeCount}`);
    console.log(`   - Sold: ${soldCount}`);
    console.log(`   - Hidden: ${hiddenCount}`);
    
  } catch (error) {
    console.error('❌ Error creating sample apartments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSampleApartments();