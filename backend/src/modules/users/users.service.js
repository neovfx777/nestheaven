const { prisma } = require('../../config/db');
const { ROLES } = require('../../utils/roles');

function getVisibleStatusesForRole(role) {
  if ([ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN].includes(role)) {
    return ['active', 'hidden', 'sold'];
  }
  return ['active', 'sold'];
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
  });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
}

async function updateProfile(userId, data) {
  const updates = {};
  if (data.body.firstName !== undefined) updates.firstName = data.body.firstName;
  if (data.body.lastName !== undefined) updates.lastName = data.body.lastName;
  if (data.body.phone !== undefined) updates.phone = data.body.phone;

  return prisma.user.update({
    where: { id: userId },
    data: updates,
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      createdAt: true,
    },
  });
}

async function getFavorites(userId) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      apartment: {
        include: {
          complex: { select: { id: true, name: true, city: true } },
          images: { orderBy: { order: 'asc' }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const visibleStatuses = getVisibleStatusesForRole('USER');
  return favorites.filter((f) => visibleStatuses.includes(f.apartment.status));
}

async function addFavorite(userId, apartmentId) {
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
  });
  if (!apartment) {
    const err = new Error('Apartment not found');
    err.statusCode = 404;
    throw err;
  }
  if (!getVisibleStatusesForRole('USER').includes(apartment.status)) {
    const err = new Error('Apartment not found');
    err.statusCode = 404;
    throw err;
  }

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_apartmentId: { userId, apartmentId },
    },
    create: { userId, apartmentId },
    update: {},
    include: {
      apartment: {
        include: {
          complex: { select: { id: true, name: true, city: true } },
          images: { orderBy: { order: 'asc' }, take: 1 },
        },
      },
    },
  });
  return favorite;
}

async function removeFavorite(userId, apartmentId) {
  await prisma.favorite.deleteMany({
    where: { userId, apartmentId },
  });
  return { success: true };
}

async function getSavedSearches(userId) {
  return prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

async function createSavedSearch(userId, data) {
  return prisma.savedSearch.create({
    data: {
      userId,
      name: data.body.name,
      filters: JSON.stringify(data.body.filters || {}),
    },
  });
}

async function deleteSavedSearch(userId, id) {
  const search = await prisma.savedSearch.findFirst({
    where: { id, userId },
  });
  if (!search) {
    const err = new Error('Saved search not found');
    err.statusCode = 404;
    throw err;
  }
  await prisma.savedSearch.delete({ where: { id } });
  return { success: true };
}

module.exports = {
  getProfile,
  updateProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
};
