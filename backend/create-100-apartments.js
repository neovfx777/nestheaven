const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

// Sample data for diverse apartments
const cities = ['Tashkent', 'Samarkand', 'Bukhara', 'Khiva', 'Fergana', 'Namangan', 'Andijan', 'Nukus'];
const developers = [
  'NestHeaven Development', 'Golden City Builders', 'Silk Road Construction', 
  'Central Asia Homes', 'Bukhara Properties', 'Samarkand Real Estate',
  'Fergana Valley Developers', 'Tashkent Premium Homes'
];
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

const statuses = ['active', 'active', 'active', 'sold', 'hidden']; // More active apartments

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
    ru: `Современная ${rooms}-комнатная квартира. Площадь: ${area} м². ${baseDesc}`,
    en: `${baseDesc}. Area: ${area} m². ${rooms} bedrooms.`
  };
}

async function createSampleApartments() {
  try {
    console.log('🏗️  Creating 100 sample apartments...');
    
    // First, get or create complexes
    const existingComplexes = await prisma.complex.findMany();
    let complexesToUse = existingComplexes;
    
    if (existingComplexes.length < 5) {
      console.log('Creating additional complexes...');
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
    
    // Create 100 apartments
    const apartments = [];
    
    for (let i = 0; i < 100; i++) {
      const type = getRandomElement(apartmentTypes);
      const complex = getRandomElement(complexesToUse);
      const seller = getRandomElement(sellers);
      const status = getRandomElement(statuses);
      const isFeatured = Math.random() > 0.7; // 30% featured
      const isRecommended = Math.random() > 0.8; // 20% recommended
      
      const title = generateApartmentTitle(type.rooms, complex.city);
      const description = generateDescription(type.rooms, type.area);
      
      const price = getRandomInRange(type.priceRange[0], type.priceRange[1]);
      
      const apartment = {
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
          uz: 'G\'isht, beton, temir',
          ru: 'Кирпич, бетон, железо',
          en: 'Brick, concrete, iron'
        }),
        infrastructureNote: JSON.stringify({
          uz: 'Maktab, shifoxona, supermarket',
          ru: 'Школа, больница, супермаркет',
          en: 'School, hospital, supermarket'
        })
      };
      
      apartments.push(apartment);
    }
    
    // Insert all apartments in batches
    const batchSize = 20;
    for (let i = 0; i < apartments.length; i += batchSize) {
      const batch = apartments.slice(i, i + batchSize);
      
      // Create apartments first
      const createdApartments = await prisma.apartment.createMany({
        data: batch
      });
      
      // Then create images for each apartment
      createdApartments.forEach(async (apartment) => {
        const imageCount = getRandomInRange(3, 8);
        const images = Array.from({ length: imageCount }, (_, index) => ({
          id: randomUUID(),
          apartmentId: apartment.id,
          url: `https://images.unsplash.com/photo-${getRandomInRange(1560448204, 1560448304)}?w=800&h=600&fit=crop&auto=format`,
          order: index
        }));
        
        if (images.length > 0) {
          await prisma.apartmentImage.createMany({
            data: images
          });
        }
      });
      
      console.log(`✅ Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(apartments.length / batchSize)} with images`);
    }
    
    console.log(`🎉 Successfully created ${apartments.length} sample apartments!`);
    console.log('📊 Summary:');
    console.log(`   - Active: ${apartments.filter(a => a.status === 'active').length}`);
    console.log(`   - Sold: ${apartments.filter(a => a.status === 'sold').length}`);
    console.log(`   - Hidden: ${apartments.filter(a => a.status === 'hidden').length}`);
    console.log(`   - Featured: ${apartments.filter(a => a.isFeatured).length}`);
    console.log(`   - Recommended: ${apartments.filter(a => a.isRecommended).length}`);
    
  } catch (error) {
    console.error('❌ Error creating sample apartments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleApartments();
