const { prisma } = require('./src/config/db');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test users
    const totalUsers = await prisma.user.count();
    console.log('Total users:', totalUsers);
    
    const adminUsers = await prisma.user.findMany({ 
      where: { role: { in: ['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN'] } },
      select: { id: true, email: true, role: true, createdAt: true }
    });
    console.log('Admin users:', adminUsers);
    
    // Test apartments
    const totalApartments = await prisma.apartment.count();
    console.log('Total apartments:', totalApartments);
    
    const activeApartments = await prisma.apartment.count({ where: { status: 'active' } });
    console.log('Active apartments:', activeApartments);
    
    // Test complexes
    const totalComplexes = await prisma.complex.count();
    console.log('Total complexes:', totalComplexes);
    
    console.log('Database test completed successfully!');
  } catch (error) {
    console.error('Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
