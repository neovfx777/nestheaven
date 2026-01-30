const { prisma } = require('../../config/db');
const { ROLES } = require('../../utils/roles');

async function getStats(data, reqUser) {
  if (![ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN].includes(reqUser.role)) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
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
  ] = await Promise.all([
    prisma.apartment.count({ where }),
    prisma.apartment.count({ where: { ...where, status: 'active' } }),
    prisma.apartment.count({ where: { ...where, status: 'sold' } }),
    prisma.apartment.count({ where: { ...where, status: 'hidden' } }),
    prisma.complex.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'SELLER' } }),
  ]);

  return {
    apartments: {
      total: totalApartments,
      active: activeApartments,
      sold: soldApartments,
      hidden: hiddenApartments,
    },
    complexes: { total: totalComplexes },
    users: {
      total: totalUsers,
      sellers: totalSellers,
    },
  };
}

module.exports = { getStats };
