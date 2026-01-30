const { prisma } = require('../../config/db');
const { ROLES } = require('../../utils/roles');

function ensureI18n(val) {
  if (typeof val === 'string') return { uz: val, ru: val, en: val };
  return val;
}

function getVisibleStatusesForRole(role) {
  if ([ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN].includes(role)) {
    return ['active', 'hidden', 'sold'];
  }
  return ['active', 'sold'];
}

async function list(data, reqUser) {
  const { page, limit, complexId, minPrice, maxPrice, rooms, status, lang } = data.query;
  const skip = (page - 1) * limit;

  const where = {};
  if (complexId) where.complexId = complexId;
  if (minPrice != null) where.price = { ...where.price, gte: minPrice };
  if (maxPrice != null) where.price = { ...where.price, lte: maxPrice };
  if (rooms != null) where.rooms = rooms;

  if (status) {
    where.status = status;
  } else if (reqUser) {
    where.status = { in: getVisibleStatusesForRole(reqUser.role) };
  } else {
    where.status = { in: ['active', 'sold'] };
  }

  const [items, total] = await Promise.all([
    prisma.apartment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        complex: { select: { id: true, name: true, city: true, address: true } },
        images: { orderBy: { order: 'asc' }, take: 1 },
      },
    }),
    prisma.apartment.count({ where }),
  ]);

  return {
    apartments: items,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  };
}

async function getById(id, reqUser) {
  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: {
      complex: true,
      images: { orderBy: { order: 'asc' } },
      seller: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
  });

  if (!apartment) {
    const err = new Error('Apartment not found');
    err.statusCode = 404;
    throw err;
  }

  const visible = getVisibleStatusesForRole(reqUser?.role || 'USER').includes(apartment.status);
  if (!visible) {
    const err = new Error('Apartment not found');
    err.statusCode = 404;
    throw err;
  }

  return apartment;
}

async function create(data, reqUser) {
  if (reqUser.role !== ROLES.SELLER && reqUser.role !== ROLES.OWNER_ADMIN) {
    const err = new Error('Only sellers can create apartments');
    err.statusCode = 403;
    throw err;
  }

  const complex = await prisma.complex.findUnique({ where: { id: data.body.complexId } });
  if (!complex) {
    const err = new Error('Complex not found');
    err.statusCode = 404;
    throw err;
  }

  const title = ensureI18n(data.body.title);
  const description = data.body.description ? ensureI18n(data.body.description) : null;
  const materials = data.body.materials ? ensureI18n(data.body.materials) : null;
  const infrastructureNote = data.body.infrastructureNote ? ensureI18n(data.body.infrastructureNote) : null;

  return prisma.apartment.create({
    data: {
      complexId: data.body.complexId,
      sellerId: reqUser.id,
      price: data.body.price,
      area: data.body.area,
      rooms: data.body.rooms,
      floor: data.body.floor,
      totalFloors: data.body.totalFloors,
      title: JSON.stringify(title),
      description: description ? JSON.stringify(description) : null,
      materials: materials ? JSON.stringify(materials) : null,
      infrastructureNote: infrastructureNote ? JSON.stringify(infrastructureNote) : null,
    },
    include: {
      complex: { select: { id: true, name: true, city: true } },
      images: true,
    },
  });
}

async function update(id, data, reqUser) {
  const apartment = await prisma.apartment.findUnique({ where: { id } });
  if (!apartment) {
    const err = new Error('Apartment not found');
    err.statusCode = 404;
    throw err;
  }

  const isOwner = apartment.sellerId === reqUser.id;
  const isOwnerAdmin = reqUser.role === ROLES.OWNER_ADMIN;

  if (!isOwner && !isOwnerAdmin) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  const updates = {};
  if (data.body.complexId !== undefined) updates.complexId = data.body.complexId;
  if (data.body.price !== undefined) updates.price = data.body.price;
  if (data.body.area !== undefined) updates.area = data.body.area;
  if (data.body.rooms !== undefined) updates.rooms = data.body.rooms;
  if (data.body.floor !== undefined) updates.floor = data.body.floor;
  if (data.body.totalFloors !== undefined) updates.totalFloors = data.body.totalFloors;
  if (data.body.title !== undefined) updates.title = JSON.stringify(ensureI18n(data.body.title));
  if (data.body.description !== undefined) updates.description = data.body.description ? JSON.stringify(ensureI18n(data.body.description)) : null;
  if (data.body.materials !== undefined) updates.materials = data.body.materials ? JSON.stringify(ensureI18n(data.body.materials)) : null;
  if (data.body.infrastructureNote !== undefined) updates.infrastructureNote = data.body.infrastructureNote ? JSON.stringify(ensureI18n(data.body.infrastructureNote)) : null;

  return prisma.apartment.update({
    where: { id },
    data: updates,
    include: {
      complex: { select: { id: true, name: true, city: true } },
      images: true,
    },
  });
}

async function remove(id, reqUser) {
  const apartment = await prisma.apartment.findUnique({ where: { id } });
  if (!apartment) {
    const err = new Error('Apartment not found');
    err.statusCode = 404;
    throw err;
  }

  const isOwner = apartment.sellerId === reqUser.id;
  const isOwnerAdmin = reqUser.role === ROLES.OWNER_ADMIN;

  if (!isOwner && !isOwnerAdmin) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  await prisma.apartment.delete({ where: { id } });
  return { success: true };
}

async function markSold(id, reqUser) {
  const apartment = await prisma.apartment.findUnique({ where: { id } });
  if (!apartment) {
    const err = new Error('Apartment not found');
    err.statusCode = 404;
    throw err;
  }

  if (apartment.sellerId !== reqUser.id) {
    const err = new Error('You can only mark your own apartments as sold');
    err.statusCode = 403;
    throw err;
  }

  return prisma.apartment.update({
    where: { id },
    data: { status: 'sold' },
    include: {
      complex: { select: { id: true, name: true, city: true } },
      images: true,
    },
  });
}

async function hideUnhide(id, data, reqUser) {
  const apartment = await prisma.apartment.findUnique({ where: { id } });
  if (!apartment) {
    const err = new Error('Apartment not found');
    err.statusCode = 404;
    throw err;
  }

  if (![ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN].includes(reqUser.role)) {
    const err = new Error('Only admins can hide/unhide apartments');
    err.statusCode = 403;
    throw err;
  }

  return prisma.apartment.update({
    where: { id },
    data: { status: data.body.status },
    include: {
      complex: { select: { id: true, name: true, city: true } },
      images: true,
    },
  });
}

async function addImages(apartmentId, urls, reqUser) {
  const apartment = await prisma.apartment.findUnique({ where: { id: apartmentId } });
  if (!apartment) {
    const err = new Error('Apartment not found');
    err.statusCode = 404;
    throw err;
  }

  if (apartment.sellerId !== reqUser.id && reqUser.role !== ROLES.OWNER_ADMIN) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  const maxOrder = await prisma.apartmentImage.aggregate({
    where: { apartmentId },
    _max: { order: true },
  });
  let order = (maxOrder._max.order ?? -1) + 1;

  const created = await prisma.apartmentImage.createMany({
    data: urls.map((url) => ({ apartmentId, url, order: order++ })),
  });

  return prisma.apartmentImage.findMany({
    where: { apartmentId },
    orderBy: { order: 'asc' },
  });
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  markSold,
  hideUnhide,
  addImages,
};
