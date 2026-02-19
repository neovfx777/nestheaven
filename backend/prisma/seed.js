const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();


async function main() {
  console.log('Starting fresh database seed (users and broadcasts only)...');

  // Clear existing data (order matters for FKs)
  console.log('Clearing existing data...');
  await prisma.broadcast.deleteMany({});
  await prisma.user.deleteMany({});

  // Create core users with roles
  console.log('Creating users with roles...');
  const userDefinitions = [
    {
      email: 'user@nestheaven.uz',
      password: 'User123!',
      role: 'USER',
      firstName: 'Regular',
      lastName: 'User',
      phone: '+998901111111',
      label: 'Regular User',
    },
    {
      email: 'seller@nestheaven.uz',
      password: 'Seller123!',
      role: 'SELLER',
      firstName: 'Primary',
      lastName: 'Seller',
      phone: '+998902222222',
      label: 'Seller',
    },
    {
      email: 'admin@nestheaven.uz',
      password: 'Admin123!',
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+998903333333',
      label: 'Admin',
    },
    {
      email: 'manager@nestheaven.uz',
      password: 'Manager123!',
      role: 'MANAGER_ADMIN',
      firstName: 'Manager',
      lastName: 'Admin',
      phone: '+998904444444',
      label: 'Manager Admin',
    },
    {
      email: 'owner@nestheaven.uz',
      password: 'Owner123!',
      role: 'OWNER_ADMIN',
      firstName: 'Owner',
      lastName: 'Admin',
      phone: '+998905555555',
      label: 'Owner Admin',
    },
  ];

  const createdUsers = [];
  for (const def of userDefinitions) {
    const passwordHash = await bcrypt.hash(def.password, 10);
    const user = await prisma.user.create({
      data: {
        email: def.email.toLowerCase(),
        passwordHash,
        role: def.role,
        firstName: def.firstName,
        lastName: def.lastName,
        phone: def.phone,
        isActive: true,
      },
    });
    createdUsers.push(user);
    console.log(`Created ${def.label}: ${def.email} (${def.role})`);
  }

  const owner = createdUsers.find((u) => u.role === 'OWNER_ADMIN');

  // Create 5 broadcast messages
  console.log('Creating 5 broadcasts...');
  const broadcasts = [
    {
      title: 'Yangi loyihalar!',
      message: 'Yangi turar-joy komplekslari e?lon qilindi. Endi ko?proq tanlovlar mavjud.',
    },
    {
      title: 'Chegirma haftaligi',
      message: 'Bu hafta ayrim kvartiralarda 10% gacha chegirmalar mavjud.',
    },
    {
      title: 'Ta?mirlash xizmatlari',
      message: 'Premium ta?mirlash xizmatlari endi mavjud. Batafsil ma?lumot uchun admin bilan bog?laning.',
    },
    {
      title: 'Sotuvchi uchun yangilik',
      message: 'Sellerlar uchun yangi listing tahrirlash bo?limi qo?shildi.',
    },
    {
      title: 'Platforma yangilandi',
      message: 'Yangi funksiyalar va tezlik yaxshilanishlari kiritildi.',
    },
  ];

  for (const item of broadcasts) {
    await prisma.broadcast.create({
      data: {
        title: item.title,
        message: item.message,
        isActive: true,
        createdById: owner ? owner.id : null,
      },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
