const { prisma } = require('../../config/db');
const { ROLES } = require('../../utils/roles');
const { completeI18n, hasAnyContent } = require('../../utils/autoTranslateI18n');
const isDev = process.env.NODE_ENV !== 'production';

function debugLog(...args) {
  if (isDev) {
    console.log(...args);
  }
}

function getVisibleStatusesForRole(role) {
  if ([ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN].includes(role)) {
    return ['active', 'hidden', 'sold'];
  }
  return ['active', 'sold'];
}

function parseJsonMaybe(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

function formatComplexSummary(complex) {
  if (!complex) return null;

  const name = parseJsonMaybe(complex.name, { uz: '', ru: '', en: '' });
  const address = parseJsonMaybe(complex.address, null);
  const title =
    complex.title ||
    (typeof name === 'string'
      ? name
      : name?.en || name?.uz || name?.ru || '');
  const locationText =
    complex.locationText ||
    (typeof address === 'string'
      ? address
      : address?.en || address?.uz || address?.ru || '');

  const firstImageUrl = complex.images?.[0]?.url || null;

  // Parse nearbyPlaces if it's a JSON string
  let nearbyPlaces = null;
  if (complex.nearbyPlaces) {
    try {
      nearbyPlaces = typeof complex.nearbyPlaces === 'string'
        ? JSON.parse(complex.nearbyPlaces)
        : complex.nearbyPlaces;
    } catch (e) {
      nearbyPlaces = null;
    }
  }

  return {
    ...complex,
    name,
    address,
    title,
    locationText,
    locationLat: complex.locationLat ?? null,
    locationLng: complex.locationLng ?? null,
    nearbyPlaces,
    nearbyNote: complex.nearbyNote ?? null,
    coverImage: firstImageUrl,
  };
}

function getAddressText(complexSummary) {
  if (!complexSummary) return '';
  if (complexSummary.locationText) return complexSummary.locationText;
  const address = complexSummary.address;
  if (typeof address === 'string') return address;
  return address?.en || address?.uz || address?.ru || '';
}

// LIST funksiyasini soddalashtiramiz (500 xatosini bartaraf qilish uchun)
async function list(data, reqUser) {
  try {
    const {
      page = 1,
      limit = 20,
      complexId,
      minPrice,
      maxPrice,
      rooms,
      minRooms,
      maxRooms,
      minArea,
      maxArea,
      minFloor,
      maxFloor,
      status,
      sortBy,
      sortOrder,
      search,
    } = data.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 1000);
    const skip = (pageNum - 1) * limitNum;
    const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : status;

    debugLog('Apartments list called:', {
      page: pageNum,
      limit: limitNum,
      complexId,
      minPrice,
      maxPrice,
      rooms,
      minRooms,
      maxRooms,
      minArea,
      maxArea,
      minFloor,
      maxFloor,
      status: normalizedStatus,
      sortBy,
      sortOrder,
      search,
      userRole: reqUser?.role || 'anonymous'
    });

    const where = {};

    if (complexId) where.complexId = complexId;

    const minPriceNum = minPrice != null && minPrice !== '' ? Number(minPrice) : undefined;
    const maxPriceNum = maxPrice != null && maxPrice !== '' ? Number(maxPrice) : undefined;
    if (minPriceNum != null || maxPriceNum != null) {
      const low = minPriceNum != null && maxPriceNum != null ? Math.min(minPriceNum, maxPriceNum) : minPriceNum;
      const high = minPriceNum != null && maxPriceNum != null ? Math.max(minPriceNum, maxPriceNum) : maxPriceNum;
      where.price = {};
      if (low != null) where.price.gte = low;
      if (high != null) where.price.lte = high;
    }

    const exactRooms = rooms != null && rooms !== '' ? Number.parseInt(rooms, 10) : undefined;
    const minRoomsNum = minRooms != null && minRooms !== '' ? Number.parseInt(minRooms, 10) : undefined;
    const maxRoomsNum = maxRooms != null && maxRooms !== '' ? Number.parseInt(maxRooms, 10) : undefined;
    if (exactRooms != null && !Number.isNaN(exactRooms)) {
      where.rooms = exactRooms;
    } else if (minRoomsNum != null || maxRoomsNum != null) {
      const low = minRoomsNum != null && maxRoomsNum != null ? Math.min(minRoomsNum, maxRoomsNum) : minRoomsNum;
      const high = minRoomsNum != null && maxRoomsNum != null ? Math.max(minRoomsNum, maxRoomsNum) : maxRoomsNum;
      where.rooms = {};
      if (low != null) where.rooms.gte = low;
      if (high != null) where.rooms.lte = high;
    }

    const minAreaNum = minArea != null && minArea !== '' ? Number(minArea) : undefined;
    const maxAreaNum = maxArea != null && maxArea !== '' ? Number(maxArea) : undefined;
    if (minAreaNum != null || maxAreaNum != null) {
      const low = minAreaNum != null && maxAreaNum != null ? Math.min(minAreaNum, maxAreaNum) : minAreaNum;
      const high = minAreaNum != null && maxAreaNum != null ? Math.max(minAreaNum, maxAreaNum) : maxAreaNum;
      where.area = {};
      if (low != null) where.area.gte = low;
      if (high != null) where.area.lte = high;
    }

    const minFloorNum = minFloor != null && minFloor !== '' ? Number.parseInt(minFloor, 10) : undefined;
    const maxFloorNum = maxFloor != null && maxFloor !== '' ? Number.parseInt(maxFloor, 10) : undefined;
    if (minFloorNum != null || maxFloorNum != null) {
      const low = minFloorNum != null && maxFloorNum != null ? Math.min(minFloorNum, maxFloorNum) : minFloorNum;
      const high = minFloorNum != null && maxFloorNum != null ? Math.max(minFloorNum, maxFloorNum) : maxFloorNum;
      where.floor = {};
      if (low != null) where.floor.gte = low;
      if (high != null) where.floor.lte = high;
    }

    const canManageAllStatuses =
      reqUser &&
      [ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN].includes(reqUser.role);

    if (normalizedStatus) {
      if (canManageAllStatuses) {
        where.status = normalizedStatus;
      } else if (normalizedStatus === 'active' || normalizedStatus === 'sold') {
        where.status = normalizedStatus;
      } else {
        where.status = { in: ['active', 'sold'] };
      }
    } else if (reqUser) {
      where.status = { in: getVisibleStatusesForRole(reqUser.role) };
    } else {
      where.status = { in: ['active', 'sold'] };
    }

    const searchText = typeof search === 'string' ? search.trim() : '';
    if (searchText) {
      where.OR = [
        { title: { contains: searchText } },
        { description: { contains: searchText } },
        { materials: { contains: searchText } },
        { infrastructureNote: { contains: searchText } },
        { complex: { is: { name: { contains: searchText } } } },
        { complex: { is: { title: { contains: searchText } } } },
        { complex: { is: { city: { contains: searchText } } } },
        { complex: { is: { address: { contains: searchText } } } },
        { complex: { is: { locationText: { contains: searchText } } } },
      ];
    }

    const allowedSortFields = new Set(['price', 'area', 'rooms', 'createdAt', 'updatedAt']);
    const safeSortBy = allowedSortFields.has(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    debugLog('Where clause:', JSON.stringify(where, null, 2));

    const total = await prisma.apartment.count({ where });
    debugLog('Total apartments:', total);

    const items = await prisma.apartment.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { [safeSortBy]: safeSortOrder },
      include: {
        complex: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
          }
        },
        images: {
          orderBy: { order: 'asc' },
          take: 1
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
      },
    });

    debugLog('Found apartments:', items.length);

    const formattedApartments = items.map(apartment => {
      try {
        const title = typeof apartment.title === 'string'
          ? JSON.parse(apartment.title)
          : apartment.title || { uz: '', ru: '', en: '' };

        const description = apartment.description && typeof apartment.description === 'string'
          ? JSON.parse(apartment.description)
          : apartment.description;

        const complexSummary = formatComplexSummary(apartment.complex);

        return {
          ...apartment,
          title,
          description,
          address: getAddressText(complexSummary),
          complex: complexSummary,
          coverImage: apartment.images?.[0]?.url || null,
          titleUz: title.uz,
          titleRu: title.ru,
          titleEn: title.en,
        };
      } catch (error) {
        console.error('Error formatting apartment:', apartment.id, error);
        return {
          ...apartment,
          title: { uz: 'Error', ru: 'Error', en: 'Error' },
          address: 'Error parsing address',
          complex: apartment.complex,
          coverImage: null,
        };
      }
    });

    return {
      apartments: formattedApartments,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    };
  } catch (error) {
    console.error('Error in apartments service list:', error);
    throw error;
  }
}

// GET BY ID funksiyasini soddalashtiramiz
async function getById(id, reqUser) {
  try {
    debugLog('Getting apartment by ID:', id);

    const apartment = await prisma.apartment.findUnique({
      where: { id },
      include: {
        complex: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
          }
        },
        images: {
          orderBy: { order: 'asc' }
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
      },
    });

    if (!apartment) {
      const err = new Error(`Apartment with ID "${id}" not found`);
      err.statusCode = 404;
      throw err;
    }

    const visibleStatuses = getVisibleStatusesForRole(reqUser?.role || 'USER');
    if (!visibleStatuses.includes(apartment.status)) {
      const err = new Error('Apartment not found');
      err.statusCode = 404;
      throw err;
    }

    const title = typeof apartment.title === 'string'
      ? JSON.parse(apartment.title)
      : apartment.title || { uz: '', ru: '', en: '' };

    const description = apartment.description && typeof apartment.description === 'string'
      ? JSON.parse(apartment.description)
      : apartment.description;

    const materials = apartment.materials && typeof apartment.materials === 'string'
      ? JSON.parse(apartment.materials)
      : apartment.materials;

    const infrastructureNote = apartment.infrastructureNote && typeof apartment.infrastructureNote === 'string'
      ? JSON.parse(apartment.infrastructureNote)
      : apartment.infrastructureNote;

    const complexSummary = formatComplexSummary(apartment.complex);

    return {
      ...apartment,
      title,
      description,
      materials,
      infrastructureNote,
      complex: complexSummary,
      titleUz: title.uz,
      titleRu: title.ru,
      titleEn: title.en,
      address: getAddressText(complexSummary),
      seller: apartment.seller ? {
        ...apartment.seller,
        fullName: `${apartment.seller.firstName || ''} ${apartment.seller.lastName || ''}`.trim()
      } : null,
      contactInfo: apartment.seller ? {
        phone: apartment.seller.phone,
        email: apartment.seller.email,
        fullName: `${apartment.seller.firstName || ''} ${apartment.seller.lastName || ''}`.trim()
      } : null
    };
  } catch (error) {
    console.error('Error in getById:', error);
    throw error;
  }
}

// Seller o'z listlarini olish
async function getMyListings(options) {
  try {
    const {
      sellerId,
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;

    const where = {
      sellerId: sellerId
    };

    if (status) {
      where.status = status;
    }

    const total = await prisma.apartment.count({ where });
    const items = await prisma.apartment.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { [sortBy]: sortOrder },
      include: {
        complex: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
          }
        },
        images: {
          orderBy: { order: 'asc' },
          take: 1
        },
      },
    });

    const formattedApartments = items.map(apartment => {
      try {
        const title = typeof apartment.title === 'string'
          ? JSON.parse(apartment.title)
          : apartment.title || { uz: '', ru: '', en: '' };

        const complexSummary = formatComplexSummary(apartment.complex);

        return {
          ...apartment,
          title,
          address: getAddressText(complexSummary),
          complex: complexSummary,
          coverImage: apartment.images?.[0]?.url || null,
          titleUz: title.uz,
          titleRu: title.ru,
          titleEn: title.en,
        };
      } catch (error) {
        console.error('Error formatting apartment:', error);
        return apartment;
      }
    });

    return {
      apartments: formattedApartments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      }
    };
  } catch (error) {
    console.error('Error in getMyListings:', error);
    throw error;
  }
}

// CREATE apartment
async function create(data, reqUser) {
  try {
    const canCreateApartment = [ROLES.SELLER, ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN].includes(reqUser.role);
    if (!canCreateApartment) {
      const err = new Error('Only sellers and admins can create apartments');
      err.statusCode = 403;
      throw err;
    }

    let complexId = data.body.complexId ?? null;
    if (complexId) {
      const complex = await prisma.complex.findUnique({
        where: { id: complexId }
      });

      if (!complex) {
        const err = new Error('Complex not found');
        err.statusCode = 404;
        throw err;
      }
    }

    const title = await completeI18n(data.body.title, { fieldName: 'apartment.title' });
    if (!title || !hasAnyContent(title)) {
      const err = new Error('Title is required in at least one language');
      err.statusCode = 400;
      throw err;
    }

    const description = data.body.description
      ? await completeI18n(data.body.description, { fieldName: 'apartment.description' })
      : null;
    const materials = data.body.materials
      ? await completeI18n(data.body.materials, { fieldName: 'apartment.materials' })
      : null;
    const infrastructureNote = data.body.infrastructureNote
      ? await completeI18n(data.body.infrastructureNote, {
          fieldName: 'apartment.infrastructureNote',
        })
      : null;

    const constructionStatus = data.body.constructionStatus || 'available';
    const readyByYear = data.body.readyByYear != null ? parseInt(data.body.readyByYear) : null;
    const readyByMonth = data.body.readyByMonth != null ? parseInt(data.body.readyByMonth) : null;
    const renovationStatus = data.body.renovationStatus || null;

    const apartment = await prisma.apartment.create({
      data: {
        complexId,
        sellerId: reqUser.id,
        price: parseFloat(data.body.price),
        area: parseFloat(data.body.area),
        rooms: parseInt(data.body.rooms),
        floor: data.body.floor ? parseInt(data.body.floor) : null,
        totalFloors: data.body.totalFloors ? parseInt(data.body.totalFloors) : null,
        title: JSON.stringify(title),
        description: description ? JSON.stringify(description) : null,
        materials: materials ? JSON.stringify(materials) : null,
        infrastructureNote: infrastructureNote ? JSON.stringify(infrastructureNote) : null,
        status: 'active',
        constructionStatus: constructionStatus === 'built' ? 'built' : 'available',
        readyByYear: constructionStatus === 'built' ? readyByYear : null,
        readyByMonth: constructionStatus === 'built' ? readyByMonth : null,
        renovationStatus,
      },
      include: {
        complex: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
          }
        },
        images: true,
      },
    });

    return {
      ...apartment,
      title: title,
      description: description,
      materials: materials,
      infrastructureNote: infrastructureNote,
      complex: formatComplexSummary(apartment.complex),
    };
  } catch (error) {
    console.error('Error in create:', error);
    throw error;
  }
}

// UPDATE apartment
async function update(id, data, reqUser) {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id }
    });

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

    if (data.body.complexId !== undefined) {
      if (data.body.complexId === null) {
        updates.complexId = null;
      } else {
        const complex = await prisma.complex.findUnique({
          where: { id: data.body.complexId }
        });
        if (!complex) {
          const err = new Error('Complex not found');
          err.statusCode = 404;
          throw err;
        }
        updates.complexId = data.body.complexId;
      }
    }
    if (data.body.price !== undefined) updates.price = parseFloat(data.body.price);
    if (data.body.area !== undefined) updates.area = parseFloat(data.body.area);
    if (data.body.rooms !== undefined) updates.rooms = parseInt(data.body.rooms);
    if (data.body.floor !== undefined) updates.floor = data.body.floor !== null ? parseInt(data.body.floor) : null;
    if (data.body.totalFloors !== undefined) updates.totalFloors = data.body.totalFloors !== null ? parseInt(data.body.totalFloors) : null;

    if (data.body.title !== undefined) {
      const localizedTitle = await completeI18n(data.body.title, { fieldName: 'apartment.title' });
      if (!localizedTitle || !hasAnyContent(localizedTitle)) {
        const err = new Error('Title is required in at least one language');
        err.statusCode = 400;
        throw err;
      }
      updates.title = JSON.stringify(localizedTitle);
    }

    if (data.body.description !== undefined) {
      updates.description = data.body.description
        ? JSON.stringify(
            await completeI18n(data.body.description, {
              fieldName: 'apartment.description',
            })
          )
        : null;
    }

    if (data.body.materials !== undefined) {
      updates.materials = data.body.materials
        ? JSON.stringify(
            await completeI18n(data.body.materials, {
              fieldName: 'apartment.materials',
            })
          )
        : null;
    }

    if (data.body.infrastructureNote !== undefined) {
      updates.infrastructureNote = data.body.infrastructureNote
        ? JSON.stringify(
            await completeI18n(data.body.infrastructureNote, {
              fieldName: 'apartment.infrastructureNote',
            })
          )
        : null;
    }

    if (data.body.constructionStatus !== undefined) {
      updates.constructionStatus = data.body.constructionStatus || null;
      updates.readyByYear = data.body.constructionStatus === 'built' && data.body.readyByYear != null ? parseInt(data.body.readyByYear) : null;
      updates.readyByMonth = data.body.constructionStatus === 'built' && data.body.readyByMonth != null ? parseInt(data.body.readyByMonth) : null;
    } else if (data.body.readyByYear !== undefined || data.body.readyByMonth !== undefined) {
      if (data.body.readyByYear !== undefined) updates.readyByYear = data.body.readyByYear != null ? parseInt(data.body.readyByYear) : null;
      if (data.body.readyByMonth !== undefined) updates.readyByMonth = data.body.readyByMonth != null ? parseInt(data.body.readyByMonth) : null;
    }

    if (data.body.renovationStatus !== undefined) {
      updates.renovationStatus = data.body.renovationStatus || null;
    }

    const updated = await prisma.apartment.update({
      where: { id },
      data: updates,
      include: {
        complex: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
          }
        },
        images: true,
      },
    });

    const title = typeof updated.title === 'string'
      ? JSON.parse(updated.title)
      : updated.title || { uz: '', ru: '', en: '' };

    const description = updated.description && typeof updated.description === 'string'
      ? JSON.parse(updated.description)
      : updated.description;

    const materials = updated.materials && typeof updated.materials === 'string'
      ? JSON.parse(updated.materials)
      : updated.materials;

    const infrastructureNote = updated.infrastructureNote && typeof updated.infrastructureNote === 'string'
      ? JSON.parse(updated.infrastructureNote)
      : updated.infrastructureNote;

    return {
      ...updated,
      title: title,
      description: description,
      materials: materials,
      infrastructureNote: infrastructureNote,
      complex: formatComplexSummary(updated.complex),
    };
  } catch (error) {
    console.error('Error in update:', error);
    throw error;
  }
}

// DELETE apartment
async function remove(id, reqUser) {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id }
    });

    if (!apartment) {
      const err = new Error('Apartment not found');
      err.statusCode = 404;
      throw err;
    }

    const isOwner = apartment.sellerId === reqUser.id;
    const isOwnerAdmin = reqUser.role === 'OWNER_ADMIN';

    if (!isOwner && !isOwnerAdmin) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }

    await prisma.apartment.delete({ where: { id } });
    return { success: true, message: 'Apartment deleted successfully' };
  } catch (error) {
    console.error('Error in remove:', error);
    throw error;
  }
}

// MARK AS SOLD
async function markSold(id, reqUser) {
  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id }
    });

    if (!apartment) {
      const err = new Error('Apartment not found');
      err.statusCode = 404;
      throw err;
    }

    const isOwner = apartment.sellerId === reqUser.id;
    const isOwnerAdmin = reqUser.role === 'OWNER_ADMIN';

    if (!isOwner && !isOwnerAdmin) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }

    const updated = await prisma.apartment.update({
      where: { id },
      data: { status: 'sold' },
      include: {
        complex: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
          }
        },
        images: true,
      },
    });

    return updated;
  } catch (error) {
    console.error('Error in markSold:', error);
    throw error;
  }
}

// HIDE / UNHIDE
async function hideUnhide(id, data, reqUser) {
  try {
    if (![ROLES.ADMIN, ROLES.MANAGER_ADMIN, ROLES.OWNER_ADMIN].includes(reqUser.role)) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }

    const apartment = await prisma.apartment.findUnique({ where: { id } });
    if (!apartment) {
      const err = new Error('Apartment not found');
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.apartment.update({
      where: { id },
      data: { status: data.body.status },
      include: {
        complex: {
          include: {
            images: { orderBy: { order: 'asc' }, take: 1 },
          }
        },
        images: true,
      },
    });

    return updated;
  } catch (error) {
    console.error('Error in hideUnhide:', error);
    throw error;
  }
}

// Add images
async function addImages(apartmentId, urls, reqUser) {
  try {
    const apartment = await prisma.apartment.findUnique({ where: { id: apartmentId } });
    if (!apartment) {
      const err = new Error('Apartment not found');
      err.statusCode = 404;
      throw err;
    }

    const isOwner = apartment.sellerId === reqUser.id;
    const isOwnerAdmin = reqUser.role === 'OWNER_ADMIN';

    if (!isOwner && !isOwnerAdmin) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }

    const created = await prisma.apartmentImage.createMany({
      data: urls.map((url, idx) => ({
        apartmentId,
        url,
        order: idx,
      })),
    });

    return created;
  } catch (error) {
    console.error('Error in addImages:', error);
    throw error;
  }
}

module.exports = {
  list,
  getById,
  getMyListings,
  create,
  update,
  remove,
  markSold,
  hideUnhide,
  addImages,
};
