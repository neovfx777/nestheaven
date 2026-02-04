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

// LIST funksiyasini soddalashtiramiz (500 xatosini bartaraf qilish uchun)
async function list(data, reqUser) {
  try {
    const { page = 1, limit = 20, complexId, minPrice, maxPrice, rooms, status } = data.query;
    const skip = (page - 1) * limit;

    console.log('List query params:', { page, limit, complexId, minPrice, maxPrice, rooms, status });

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

    // Avval count, keyin findMany
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

    // Format apartments (JSON string'larini object'ga aylantirish)
    const formattedApartments = items.map(apartment => {
      try {
        const title = typeof apartment.title === 'string' 
          ? JSON.parse(apartment.title) 
          : apartment.title || { uz: '', ru: '', en: '' };
        
        const description = apartment.description && typeof apartment.description === 'string'
          ? JSON.parse(apartment.description)
          : apartment.description;
        
        const address = apartment.complex?.address && typeof apartment.complex.address === 'string'
          ? JSON.parse(apartment.complex.address)
          : apartment.complex?.address;

        const complexName = apartment.complex?.name && typeof apartment.complex.name === 'string'
          ? JSON.parse(apartment.complex.name)
          : apartment.complex?.name || { uz: '', ru: '', en: '' };

        return {
          ...apartment,
          title,
          description,
          address: address?.en || address?.uz || address?.ru || '',
          complex: apartment.complex ? {
            ...apartment.complex,
            name: complexName,
            address: address
          } : null,
          coverImage: apartment.images?.[0]?.url || null,
          // Legacy fields for compatibility
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

    // Check visibility
    const visibleStatuses = getVisibleStatusesForRole(reqUser?.role || 'USER');
    if (!visibleStatuses.includes(apartment.status)) {
      const err = new Error('Apartment not found');
      err.statusCode = 404;
      throw err;
    }

    // Parse JSON fields
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
    
    const complexName = apartment.complex?.name && typeof apartment.complex.name === 'string'
      ? JSON.parse(apartment.complex.name)
      : apartment.complex?.name || { uz: '', ru: '', en: '' };
    
    const complexAddress = apartment.complex?.address && typeof apartment.complex.address === 'string'
      ? JSON.parse(apartment.complex.address)
      : apartment.complex?.address;

    return {
      ...apartment,
      title,
      description,
      materials,
      infrastructureNote,
      complex: apartment.complex ? {
        ...apartment.complex,
        name: complexName,
        address: complexAddress
      } : null,
      // Legacy fields for compatibility
      titleUz: title.uz,
      titleRu: title.ru,
      titleEn: title.en,
      address: complexAddress?.en || complexAddress?.uz || complexAddress?.ru || '',
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
          }
        },
        images: {
          orderBy: { order: 'asc' },
          take: 1
        },
      },
    });

    // Format apartments
    const formattedApartments = items.map(apartment => {
      try {
        const title = typeof apartment.title === 'string' 
          ? JSON.parse(apartment.title) 
          : apartment.title || { uz: '', ru: '', en: '' };
        
        const address = apartment.complex?.address && typeof apartment.complex.address === 'string'
          ? JSON.parse(apartment.complex.address)
          : apartment.complex?.address;

        return {
          ...apartment,
          title,
          address: address?.en || address?.uz || address?.ru || '',
          coverImage: apartment.images?.[0]?.url || null,
          // Legacy fields
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

    // Check if complex exists
    const complex = await prisma.complex.findUnique({ 
      where: { id: data.body.complexId } 
    });
    
    if (!complex) {
      const err = new Error('Complex not found');
      err.statusCode = 404;
      throw err;
    }

    const title = ensureI18n(data.body.title);
    const description = data.body.description ? ensureI18n(data.body.description) : null;
    const materials = data.body.materials ? ensureI18n(data.body.materials) : null;
    const infrastructureNote = data.body.infrastructureNote ? ensureI18n(data.body.infrastructureNote) : null;

    const apartment = await prisma.apartment.create({
      data: {
        complexId: data.body.complexId,
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
            city: true
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
    const isOwnerAdmin = reqUser.role === 'OWNER_ADMIN';

    if (!isOwner && !isOwnerAdmin) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }

    const updates = {};
    if (data.body.complexId !== undefined) updates.complexId = data.body.complexId;
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
            city: true
          }
        },
        images: true,
      },
    });

    // Parse JSON fields for response
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

    if (apartment.sellerId !== reqUser.id) {
      const err = new Error('You can only mark your own apartments as sold');
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
            city: true
          }
        },
        images: true,
      },
    });

    const title = typeof updated.title === 'string' 
      ? JSON.parse(updated.title) 
      : updated.title || { uz: '', ru: '', en: '' };

    return {
      ...updated,
      title: title,
    };
  } catch (error) {
    console.error('Error in markSold:', error);
    throw error;
  }
}

// HIDE/UNHIDE (admin only)
async function hideUnhide(id, data, reqUser) {
  try {
    const apartment = await prisma.apartment.findUnique({ 
      where: { id } 
    });
    
    if (!apartment) {
      const err = new Error('Apartment not found');
      err.statusCode = 404;
      throw err;
    }

    if (!['ADMIN', 'MANAGER_ADMIN', 'OWNER_ADMIN'].includes(reqUser.role)) {
      const err = new Error('Only admins can hide/unhide apartments');
      err.statusCode = 403;
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
            city: true
          }
        },
        images: true,
      },
    });

    const title = typeof updated.title === 'string' 
      ? JSON.parse(updated.title) 
      : updated.title || { uz: '', ru: '', en: '' };

    return {
      ...updated,
      title: title,
    };
  } catch (error) {
    console.error('Error in hideUnhide:', error);
    throw error;
  }
}

// ADD IMAGES
async function addImages(apartmentId, urls, reqUser) {
  try {
    const apartment = await prisma.apartment.findUnique({ 
      where: { id: apartmentId } 
    });
    
    if (!apartment) {
      const err = new Error('Apartment not found');
      err.statusCode = 404;
      throw err;
    }

    if (apartment.sellerId !== reqUser.id && reqUser.role !== 'OWNER_ADMIN') {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      throw err;
    }

    // Get max order
    const maxOrderResult = await prisma.apartmentImage.aggregate({
      where: { apartmentId },
      _max: { order: true },
    });
    
    let order = (maxOrderResult._max.order ?? -1) + 1;

    // Create images
    await prisma.apartmentImage.createMany({
      data: urls.map((url) => ({ 
        apartmentId, 
        url, 
        order: order++ 
      })),
    });

    const images = await prisma.apartmentImage.findMany({
      where: { apartmentId },
      orderBy: { order: 'asc' },
    });

    const title = typeof apartment.title === 'string' 
      ? JSON.parse(apartment.title) 
      : apartment.title || { uz: '', ru: '', en: '' };

    return {
      ...apartment,
      images: images,
      title: title,
    };
  } catch (error) {
    console.error('Error in addImages:', error);
    throw error;
  }
}

module.exports = {
  list,
  getMyListings,
  getById,
  create,
  update,
  remove,
  markSold,
  hideUnhide,
  addImages,
};