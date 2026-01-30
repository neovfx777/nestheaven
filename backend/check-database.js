const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== DATABASE CHECK ===');
    
    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        createdAt: true
      }
    });
    console.log(`\n👥 USERS (${users.length}):`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.firstName || 'No name'}`);
    });

    // Check apartments
    const apartments = await prisma.apartment.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        price: true,
        createdAt: true
      },
      take: 10
    });
    console.log(`\n🏠 APARTMENTS (showing first ${apartments.length}):`);
    apartments.forEach(apt => {
      console.log(`  - ${apt.title?.en || 'No title'} - $${apt.price} - ${apt.status}`);
    });

    // Check complexes
    const complexes = await prisma.complex.findMany({
      select: {
        id: true,
        name: true,
        city: true
      }
    });
    console.log(`\n🏢 COMPLEXES (${complexes.length}):`);
    complexes.forEach(complex => {
      console.log(`  - ${complex.name?.en || 'No name'} - ${complex.city}`);
    });

    // Check favorites
    const favorites = await prisma.favorite.findMany({
      select: {
        id: true,
        userId: true,
        apartmentId: true,
        createdAt: true
      }
    });
    console.log(`\n❤️ FAVORITES (${favorites.length}):`);
    favorites.forEach(fav => {
      console.log(`  - User ${fav.userId} -> Apartment ${fav.apartmentId}`);
    });

    console.log('\n=== DATABASE CHECK COMPLETE ===');
    
  } catch (error) {
    console.error('Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
