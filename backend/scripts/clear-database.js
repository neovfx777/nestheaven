/**
 * Script to completely clear the database
 * Removes all listings, complexes, and users
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    console.log('🗑️  Starting database cleanup...');

    // Delete in order to respect foreign key constraints
    console.log('Deleting favorites...');
    await prisma.favorite.deleteMany({});

    console.log('Deleting saved searches...');
    await prisma.savedSearch.deleteMany({});

    console.log('Deleting apartment images...');
    await prisma.apartmentImage.deleteMany({});

    console.log('Deleting apartments...');
    await prisma.apartment.deleteMany({});

    console.log('Deleting complexes...');
    await prisma.complex.deleteMany({});

    console.log('Deleting broadcasts...');
    await prisma.broadcast.deleteMany({});

    console.log('Deleting users...');
    await prisma.user.deleteMany({});

    console.log('✅ Database cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearDatabase()
  .then(() => {
    console.log('✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to clear database:', error);
    process.exit(1);
  });
