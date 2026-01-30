const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSampleData() {
  try {
    console.log('Adding sample data...');

    // Check if complex exists
    let complex = await prisma.complex.findFirst();
    
    if (!complex) {
      complex = await prisma.complex.create({
        data: {
          name: JSON.stringify({
            uz: "NestHeaven Premium Complex",
            ru: "NestHeaven Premium Complex", 
            en: "NestHeaven Premium Complex"
          }),
          address: JSON.stringify({
            uz: "Toshkent, O'zbekiston",
            ru: "Ташкент, Узбекистан",
            en: "Tashkent, Uzbekistan"
          }),
          city: "Tashkent"
        }
      });
      console.log('Created default complex');
    }

    // Add sample apartments
    const sampleApartments = [
      {
        title: JSON.stringify({
          uz: "Luxury 2 xonali kvartira",
          ru: "Роскошная 2-комнатная квартира",
          en: "Luxury 2 bedroom apartment"
        }),
        description: JSON.stringify({
          uz: "Bemor markazida joylashgan hashamatli 2 xonali kvartira",
          ru: "Роскошная 2-комнатная квартира в центре города",
          en: "Luxury 2 bedroom apartment in city center"
        }),
        price: 150000,
        area: 85,
        rooms: 2,
        floor: 5,
        totalFloors: 9,
        status: 'active',
        complexId: complex.id,
        sellerId: 'admin-user-id' // You'll need to replace this with actual admin user ID
      },
      {
        title: JSON.stringify({
          uz: "3 xonali oilavi uyi",
          ru: "3-комнатная семейная квартира",
          en: "3 bedroom family apartment"
        }),
        description: JSON.stringify({
          uz: "Oilavi uchun qulay 3 xonali kvartira",
          ru: "Удобная 3-комнатная квартира для семьи",
          en: "Convenient 3 bedroom apartment for family"
        }),
        price: 200000,
        area: 120,
        rooms: 3,
        floor: 3,
        totalFloors: 9,
        status: 'active',
        complexId: complex.id,
        sellerId: 'admin-user-id'
      },
      {
        title: JSON.stringify({
          uz: "1 xonali studiya",
          ru: "1-комнатная студия",
          en: "1 bedroom studio"
        }),
        description: JSON.stringify({
          uz: "Kichik oilavi uchun studiya kvartira",
          ru: "Студия для небольшой семьи",
          en: "Studio apartment for small family"
        }),
        price: 80000,
        area: 45,
        rooms: 1,
        floor: 2,
        totalFloors: 9,
        status: 'sold',
        complexId: complex.id,
        sellerId: 'admin-user-id'
      }
    ];

    // Get the first admin user to use as seller
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.log('No admin user found. Please run seed first.');
      return;
    }

    // Add sample apartments
    for (const aptData of sampleApartments) {
      const apartment = await prisma.apartment.create({
        data: {
          ...aptData,
          sellerId: adminUser.id
        }
      });
      console.log(`Created apartment: ${apartment.id}`);
    }

    console.log('Sample data added successfully!');
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleData();
