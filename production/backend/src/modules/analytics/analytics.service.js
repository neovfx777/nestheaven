const { prisma } = require('../../config/db');
const { ROLES } = require('../../utils/roles');

async function getStats(data, reqUser) {
  // Allow all authenticated users to see basic stats
  // Only restrict sensitive admin data if needed in future
  if (!reqUser) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }

  const where = {};
  if (data.query.from || data.query.to) {
    where.createdAt = {};
    if (data.query.from) {
      const fromDate = new Date(data.query.from);
      if (!isNaN(fromDate.getTime())) where.createdAt.gte = fromDate;
    }
    if (data.query.to) {
      const toDate = new Date(data.query.to);
      if (!isNaN(toDate.getTime())) where.createdAt.lte = toDate;
    }
  }

  const [
    totalApartments,
    activeApartments,
    soldApartments,
    hiddenApartments,
    totalComplexes,
    totalUsers,
    totalSellers,
    totalAdmins,
  ] = await Promise.all([
    prisma.apartment.count({ where }),
    prisma.apartment.count({ where: { ...where, status: 'active' } }),
    prisma.apartment.count({ where: { ...where, status: 'sold' } }),
    prisma.apartment.count({ where: { ...where, status: 'hidden' } }),
    prisma.complex.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'SELLER' } }),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN'] } } }),
  ]);

  // Get all users count for debugging
  const allUsers = await prisma.user.count();

  console.log('Analytics Debug:', {
    allUsers,
    totalUsers,
    totalSellers,
    totalAdmins,
    totalApartments,
    activeApartments,
    soldApartments,
    hiddenApartments,
    totalComplexes
  });

  return {
    apartments: {
      total: totalApartments,
      active: activeApartments,
      sold: soldApartments,
      hidden: hiddenApartments,
    },
    complexes: { total: totalComplexes },
    users: {
      total: allUsers, // Total all users
      regularUsers: totalUsers, // Users with USER role
      sellers: totalSellers,
      admins: totalAdmins,
    },
  };
}

module.exports = { getStats };
