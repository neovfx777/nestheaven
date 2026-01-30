const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Check if any admin users exist
  const existingAdmin = await prisma.user.findFirst({
    where: { 
      role: { in: ['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN'] }
    },
  });

  if (existingAdmin) {
    console.log('Admin users already exist, skipping seed.');
    return;
  }

  // Create admin users
  const adminUsers = [
    {
      email: 'admin@nestheaven.uz',
      password: 'Admin123!',
      role: 'ADMIN',
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+998901234567'
    },
    {
      email: 'manager@nestheaven.uz',
      password: 'Manager123!',
      role: 'MANAGER_ADMIN',
      firstName: 'Manager',
      lastName: 'Admin',
      phone: '+998902345678'
    },
    {
      email: 'owner@nestheaven.uz',
      password: 'Owner123!',
      role: 'OWNER_ADMIN',
      firstName: 'Owner',
      lastName: 'Admin',
      phone: '+998903456789'
    }
  ];

  for (const adminUser of adminUsers) {
    const passwordHash = await bcrypt.hash(adminUser.password, 10);
    
    const user = await prisma.user.create({
      data: {
        email: adminUser.email.toLowerCase(),
        passwordHash,
        role: adminUser.role,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        phone: adminUser.phone,
      },
    });

    console.log(`Created ${adminUser.role}:`, user.email);
  }

  // Create a default complex
  const existingComplex = await prisma.complex.findFirst();
  if (!existingComplex) {
    const complex = await prisma.complex.create({
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
    
    console.log('Created default complex:', complex.name);
  }

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
