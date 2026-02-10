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

  const bannerImageUrl = complex.bannerImageUrl || null;

  return {
    ...complex,
    name,
    address,
    title,
    locationText,
    bannerImageUrl,
    walkabilityRating: complex.walkabilityRating ?? complex.walkabilityScore ?? null,
    airQualityRating: complex.airQualityRating ?? complex.airQualityScore ?? null,
    coverImage: bannerImageUrl,
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
    const { page = 1, limit = 20, complexId, minPrice, maxPrice, rooms, status } = data.query;
    const skip = (page - 1) * limit;

    console.log('Apartments list called:', {
      page, limit, complexId, minPrice, maxPrice, rooms, status,
      userRole: reqUser?.role || 'anonymous'
    });

    const where = {};

    if (complexId) where.complexId = complexId;
    if (minPrice != null) where.price = { gte: parseFloat(minPrice) };
    if (maxPrice != null) where.price = { lte: parseFloat(maxPrice) };
    if (rooms != null) where.rooms = parseInt(rooms);

    if (status) {
      where.status = status;
    } else if (reqUser) {
      where.status = { in: getVisibleStatusesForRole(reqUser.role) };
    } else {
      where.status = { in: ['active', 'sold'] };
    }

    console.log('Where clause:', JSON.stringify(where, null, 2));

    const total = await prisma.apartment.count({ where });
    console.log('Total apartments:', total);

    const items = await prisma.apartment.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        complex: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            title: true,
            locationText: true,
            bannerImageUrl: true,
            walkabilityRating: true,
            airQualityRating: true,
            walkabilityScore: true,
            airQualityScore: true,
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

    console.log('Found apartments:', items.length);

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
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
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
    console.log('Getting apartment by ID:', id);

    const apartment = await prisma.apartment.findUnique({
      where: { id },
      include: {
        complex: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            title: true,
            locationText: true,
            bannerImageUrl: true,
            walkabilityRating: true,
            airQualityRating: true,
            walkabilityScore: true,
            airQualityScore: true,
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
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            title: true,
            locationText: true,
            bannerImageUrl: true,
            walkabilityRating: true,
            airQualityRating: true,
            walkabilityScore: true,
            airQualityScore: true,
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
    if (reqUser.role !== 'SELLER' && reqUser.role !== 'OWNER_ADMIN') {
      const err = new Error('Only sellers can create apartments');
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

    const title = ensureI18n(data.body.title);
    const description = data.body.description ? ensureI18n(data.body.description) : null;
    const materials = data.body.materials ? ensureI18n(data.body.materials) : null;
    const infrastructureNote = data.body.infrastructureNote ? ensureI18n(data.body.infrastructureNote) : null;

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
        status: 'active'
      },
      include: {
        complex: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            title: true,
            locationText: true,
            bannerImageUrl: true,
            walkabilityRating: true,
            airQualityRating: true,
            walkabilityScore: true,
            airQualityScore: true,
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
      updates.title = JSON.stringify(ensureI18n(data.body.title));
    }

    if (data.body.description !== undefined) {
      updates.description = data.body.description ? JSON.stringify(ensureI18n(data.body.description)) : null;
    }

    if (data.body.materials !== undefined) {
      updates.materials = data.body.materials ? JSON.stringify(ensureI18n(data.body.materials)) : null;
    }

    if (data.body.infrastructureNote !== undefined) {
      updates.infrastructureNote = data.body.infrastructureNote ? JSON.stringify(ensureI18n(data.body.infrastructureNote)) : null;
    }

    const updated = await prisma.apartment.update({
      where: { id },
      data: updates,
      include: {
        complex: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            title: true,
            locationText: true,
            bannerImageUrl: true,
            walkabilityRating: true,
            airQualityRating: true,
            walkabilityScore: true,
            airQualityScore: true,
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
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            title: true,
            locationText: true,
            bannerImageUrl: true,
            walkabilityRating: true,
            airQualityRating: true,
            walkabilityScore: true,
            airQualityScore: true,
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
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
            title: true,
            locationText: true,
            bannerImageUrl: true,
            walkabilityRating: true,
            airQualityRating: true,
            walkabilityScore: true,
            airQualityScore: true,
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
