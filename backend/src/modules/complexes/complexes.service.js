const { prisma } = require('../../config/db');
const { deleteFileByUrl, removeComplexDirIfEmpty } = require('../../middleware/upload');

function getFile(files, ...names) {
  for (const name of names) {
    const file = files?.[name]?.[0];
    if (file) return file;
  }
  return null;
}

function buildUrl(complexId, file, baseUrl) {
  const relative = `/uploads/complexes/${complexId}/${file.filename}`;
  if (!baseUrl) return relative;
  return `${baseUrl}${relative}`;
}

function parseJsonMaybe(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

function normalizeNearbyPlaces(places) {
  if (!Array.isArray(places)) return [];
  return places
    .map((place) => {
      const distanceMeters =
        place.distanceMeters != null
          ? Number(place.distanceMeters)
          : place.distanceKm != null
          ? Math.round(Number(place.distanceKm) * 1000)
          : null;
      if (distanceMeters == null || !place.name || !place.type) return null;
      return {
        type: String(place.type),
        name: String(place.name),
        distanceMeters,
        note: place.note ? String(place.note) : null,
      };
    })
    .filter(Boolean);
}

function normalizeAmenities(amenities) {
  if (!Array.isArray(amenities)) return [];
  return amenities.map((item) => String(item)).filter(Boolean);
}

function formatComplex(complex) {
  const title = parseJsonMaybe(complex.title, { uz: '', ru: '', en: '' });
  const description = parseJsonMaybe(complex.description, null);
  const amenities = parseJsonMaybe(complex.amenities, []);
  const nearby = parseJsonMaybe(complex.nearby, []);
  const location = parseJsonMaybe(complex.location, {
    lat: 41.3111,
    lng: 69.2797,
    address: { uz: '', ru: '', en: '' },
  });
  const permissions = parseJsonMaybe(complex.permissions, null);
  const allowedSellers = parseJsonMaybe(complex.allowedSellers, []);

  return {
    id: complex.id,
    title,
    description,
    developer: complex.developer,
    city: complex.city,
    blockCount: complex.blockCount || 1,
    amenities,
    nearby,
    location,
    walkability: complex.walkability,
    airQuality: complex.airQuality,
    bannerImage: complex.bannerImage,
    permissions,
    allowedSellers,
    createdAt: complex.createdAt,
    updatedAt: complex.updatedAt,
    createdById: complex.createdById,
    _count: complex._count,
  };
}

async function list(data) {
  try {
    const { page = 1, limit = 20, search, city } = data.query || {};
    const skip = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { developer: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) {
      where.city = city;
    }

    const total = await prisma.complex.count({ where });
    const complexes = await prisma.complex.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: { select: { apartments: true } },
      },
    });

    return {
      items: complexes.map(formatComplex),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch (error) {
    console.error('Error in complexes.list:', error);
    throw error;
  }
}

async function getById(id) {
  try {
    const complex = await prisma.complex.findUnique({
      where: { id },
      include: {
        apartments: { select: { id: true, status: true } },
        _count: { select: { apartments: true } },
      },
    });
    
    if (!complex) {
      const err = new Error('Complex not found');
      err.statusCode = 404;
      throw err;
    }

    const formatted = formatComplex(complex);
    return {
      ...formatted,
      apartments: complex.apartments,
    };
  } catch (error) {
    console.error('Error in complexes.getById:', error);
    throw error;
  }
}

async function create(data, reqUser, baseUrl) {
  try {
    const body = data.body;
    const files = data.files || {};
    const complexId = data.meta?.complexId;

    if (!complexId) {
      const err = new Error('Complex ID is missing');
      err.statusCode = 400;
      throw err;
    }

    const bannerFile = getFile(files, 'banner');
    const permission1File = getFile(files, 'permission1', 'permission_1');
    const permission2File = getFile(files, 'permission2', 'permission_2');
    const permission3File = getFile(files, 'permission3', 'permission_3');

    const bannerImageUrl = bannerFile ? buildUrl(complexId, bannerFile, baseUrl) : null;
    const permission1Url = permission1File ? buildUrl(complexId, permission1File, baseUrl) : null;
    const permission2Url = permission2File ? buildUrl(complexId, permission2File, baseUrl) : null;
    const permission3Url = permission3File ? buildUrl(complexId, permission3File, baseUrl) : null;

    // Build permissions JSON
    let permissionsJson = null;
    if (permission1Url && permission2Url && permission3Url) {
      permissionsJson = JSON.stringify({
        permission1: permission1Url,
        permission2: permission2Url,
        permission3: permission3Url,
      });
    }

    // Handle title - can be JSON string or object
    let titleJson;
    if (typeof body.title === 'string') {
      try {
        const parsed = JSON.parse(body.title);
        titleJson = JSON.stringify(parsed);
      } catch {
        // Old format: plain string
        titleJson = JSON.stringify({ uz: body.title, ru: body.title, en: body.title });
      }
    } else {
      titleJson = JSON.stringify(body.title || { uz: '', ru: '', en: '' });
    }

    // Handle description
    let descriptionJson = null;
    if (body.description) {
      if (typeof body.description === 'string') {
        try {
          const parsed = JSON.parse(body.description);
          descriptionJson = JSON.stringify(parsed);
        } catch {
          descriptionJson = JSON.stringify({ uz: body.description, ru: body.description, en: body.description });
        }
      } else {
        descriptionJson = JSON.stringify(body.description);
      }
    }

    // Handle location - can be JSON string or object, or use old format
    let locationJson;
    if (body.location) {
      if (typeof body.location === 'string') {
        try {
          const parsed = JSON.parse(body.location);
          locationJson = JSON.stringify(parsed);
        } catch {
          locationJson = JSON.stringify({
            lat: body.locationLat || 41.3111,
            lng: body.locationLng || 69.2797,
            address: { uz: body.locationText || '', ru: body.locationText || '', en: body.locationText || '' },
          });
        }
      } else {
        locationJson = JSON.stringify(body.location);
      }
    } else if (body.locationLat && body.locationLng) {
      // Old format
      locationJson = JSON.stringify({
        lat: body.locationLat,
        lng: body.locationLng,
        address: {
          uz: body.locationText || '',
          ru: body.locationText || '',
          en: body.locationText || '',
        },
      });
    } else {
      locationJson = JSON.stringify({
        lat: 41.3111,
        lng: 69.2797,
        address: { uz: '', ru: '', en: '' },
      });
    }
    
    let amenitiesJson = null;
    if (body.amenities) {
      let amenitiesData = body.amenities;
      if (typeof amenitiesData === 'string') {
        try {
          amenitiesData = JSON.parse(amenitiesData);
        } catch {
          amenitiesData = [];
        }
      }
      const normalizedAmenities = normalizeAmenities(amenitiesData);
      if (normalizedAmenities.length > 0) {
        amenitiesJson = JSON.stringify(normalizedAmenities);
      }
    }

    let nearbyJson = null;
    if (body.nearby || body.nearbyPlaces) {
      const nearbyData = body.nearby || body.nearbyPlaces;
      let parsedNearby = nearbyData;
      if (typeof nearbyData === 'string') {
        try {
          parsedNearby = JSON.parse(nearbyData);
        } catch {
          parsedNearby = [];
        }
      }
      const normalizedNearby = normalizeNearbyPlaces(parsedNearby);
      if (normalizedNearby.length > 0) {
        nearbyJson = JSON.stringify(normalizedNearby);
      }
    }

    let allowedSellersJson = null;
    if (body.allowedSellers) {
      let sellersArray = body.allowedSellers;
      if (typeof sellersArray === 'string') {
        try {
          sellersArray = JSON.parse(sellersArray);
        } catch {
          sellersArray = [];
        }
      }
      if (Array.isArray(sellersArray) && sellersArray.length > 0) {
        allowedSellersJson = JSON.stringify(sellersArray);
      }
    }

    const created = await prisma.complex.create({
      data: {
        id: complexId,
        title: titleJson,
        description: descriptionJson,
        developer: body.developer || '',
        city: body.city || '',
        blockCount: body.blockCount ? parseInt(body.blockCount) : 1,
        amenities: amenitiesJson,
        nearby: nearbyJson,
        location: locationJson,
        walkability: body.walkability ?? body.walkabilityRating ?? null,
        airQuality: body.airQuality ?? body.airQualityRating ?? null,
        bannerImage: bannerImageUrl,
        permissions: permissionsJson,
        allowedSellers: allowedSellersJson,
        createdById: reqUser?.id ?? null,

        // Legacy fields for compatibility
        name: titleJson,
        address: locationJson,
        latitude: typeof locationJson === 'string' ? JSON.parse(locationJson).lat : null,
        longitude: typeof locationJson === 'string' ? JSON.parse(locationJson).lng : null,
        walkabilityScore: body.walkability ?? body.walkabilityRating ?? null,
        airQualityScore: body.airQuality ?? body.airQualityRating ?? null,
        walkabilityRating: body.walkability ?? body.walkabilityRating ?? null,
        airQualityRating: body.airQuality ?? body.airQualityRating ?? null,
        locationLat: typeof locationJson === 'string' ? JSON.parse(locationJson).lat : null,
        locationLng: typeof locationJson === 'string' ? JSON.parse(locationJson).lng : null,
        locationText: typeof locationJson === 'string' ? JSON.parse(locationJson).address?.uz : null,
        nearbyPlaces: nearbyJson,
        bannerImageUrl: bannerImageUrl,
        permission1Url: permission1Url,
        permission2Url: permission2Url,
        permission3Url: permission3Url,
      },
      include: {
        _count: { select: { apartments: true } },
      },
    });

    return formatComplex(created);
  } catch (error) {
    console.error('Error in complexes.create:', error);
    throw error;
  }
}

async function update(id, data, reqUser, baseUrl) {
  try {
    const existing = await prisma.complex.findUnique({ where: { id } });
    if (!existing) {
      const err = new Error('Complex not found');
      err.statusCode = 404;
      throw err;
    }

    const body = data.body;
    const files = data.files || {};
    const updates = {};

    if (body.title !== undefined) {
      updates.title = JSON.stringify(body.title);
    }
    if (body.description !== undefined) {
      updates.description = body.description ? JSON.stringify(body.description) : null;
    }
    if (body.developer !== undefined) updates.developer = body.developer;
    if (body.city !== undefined) updates.city = body.city;
    if (body.blockCount !== undefined) updates.blockCount = parseInt(body.blockCount);
    
    if (body.amenities !== undefined) {
      updates.amenities = body.amenities && Array.isArray(body.amenities) && body.amenities.length > 0
        ? JSON.stringify(normalizeAmenities(body.amenities))
        : null;
    }
    
    if (body.nearby !== undefined) {
      updates.nearby = body.nearby && Array.isArray(body.nearby) && body.nearby.length > 0
        ? JSON.stringify(normalizeNearbyPlaces(body.nearby))
        : null;
    }
    
    if (body.location !== undefined) {
      updates.location = JSON.stringify(body.location);
    }
    
    if (body.walkability !== undefined) updates.walkability = body.walkability ? parseInt(body.walkability) : null;
    if (body.airQuality !== undefined) updates.airQuality = body.airQuality ? parseInt(body.airQuality) : null;
    
    if (body.allowedSellers !== undefined) {
      updates.allowedSellers = body.allowedSellers && Array.isArray(body.allowedSellers) && body.allowedSellers.length > 0
        ? JSON.stringify(body.allowedSellers)
        : null;
    }

    // Handle file uploads
    const bannerFile = getFile(files, 'banner');
    const permission1File = getFile(files, 'permission1', 'permission_1');
    const permission2File = getFile(files, 'permission2', 'permission_2');
    const permission3File = getFile(files, 'permission3', 'permission_3');

    if (bannerFile) {
      if (existing.bannerImage) {
        deleteFileByUrl(existing.bannerImage);
      }
      updates.bannerImage = buildUrl(id, bannerFile, baseUrl);
    }

    // Handle permissions
    const existingPermissions = parseJsonMaybe(existing.permissions, {});
    
    if (permission1File || permission2File || permission3File) {
      const nextPermission1 = permission1File 
        ? buildUrl(id, permission1File, baseUrl) 
        : (existingPermissions.permission1 || null);
      const nextPermission2 = permission2File 
        ? buildUrl(id, permission2File, baseUrl) 
        : (existingPermissions.permission2 || null);
      const nextPermission3 = permission3File 
        ? buildUrl(id, permission3File, baseUrl) 
        : (existingPermissions.permission3 || null);

      if (nextPermission1 && nextPermission2 && nextPermission3) {
        // Delete old files if replaced
        if (permission1File && existingPermissions.permission1) {
          deleteFileByUrl(existingPermissions.permission1);
        }
        if (permission2File && existingPermissions.permission2) {
          deleteFileByUrl(existingPermissions.permission2);
        }
        if (permission3File && existingPermissions.permission3) {
          deleteFileByUrl(existingPermissions.permission3);
        }

        updates.permissions = JSON.stringify({
          permission1: nextPermission1,
          permission2: nextPermission2,
          permission3: nextPermission3,
        });
      }
    }

    const updated = await prisma.complex.update({
      where: { id },
      data: updates,
      include: {
        _count: { select: { apartments: true } },
      },
    });

    return formatComplex(updated);
  } catch (error) {
    console.error('Error in complexes.update:', error);
    throw error;
  }
}

async function remove(id, reqUser) {
  try {
    const existing = await prisma.complex.findUnique({
      where: { id },
      include: { _count: { select: { apartments: true } } },
    });
    
    if (!existing) {
      const err = new Error('Complex not found');
      err.statusCode = 404;
      throw err;
    }

    if (existing._count.apartments > 0) {
      const err = new Error(
        'Cannot delete complex with existing apartments. Unlink or move apartments first.'
      );
      err.statusCode = 400;
      throw err;
    }

    // Delete files
    if (existing.bannerImage) {
      deleteFileByUrl(existing.bannerImage);
    }
    
    const permissions = parseJsonMaybe(existing.permissions, {});
    if (permissions.permission1) deleteFileByUrl(permissions.permission1);
    if (permissions.permission2) deleteFileByUrl(permissions.permission2);
    if (permissions.permission3) deleteFileByUrl(permissions.permission3);
    
    removeComplexDirIfEmpty(existing.id);

    await prisma.complex.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error('Error in complexes.remove:', error);
    throw error;
  }
}

async function getForSeller(data, reqUser) {
  try {
    if (!reqUser || reqUser.role !== 'SELLER') {
      const err = new Error('Access denied. Seller role required.');
      err.statusCode = 403;
      throw err;
    }

    const { page = 1, limit = 20, search, city } = data.query || {};
    const skip = (page - 1) * limit;

    // Get all complexes first (since JSON filtering is complex in Prisma)
    const allComplexes = await prisma.complex.findMany({
      include: {
        _count: { select: { apartments: true } },
      },
    });

    // Filter complexes where seller is in allowedSellers
    let filtered = allComplexes.filter((complex) => {
      // If allowedSellers is null/empty, complex is accessible to all sellers
      if (!complex.allowedSellers) return true;
      
      try {
        const allowed = JSON.parse(complex.allowedSellers);
        return Array.isArray(allowed) && allowed.includes(reqUser.id);
      } catch {
        return false;
      }
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((complex) => {
        const title = complex.title ? complex.title.toLowerCase() : '';
        const developer = complex.developer ? complex.developer.toLowerCase() : '';
        return title.includes(searchLower) || developer.includes(searchLower);
      });
    }

    // Apply city filter
    if (city) {
      filtered = filtered.filter((complex) => complex.city === city);
    }

    // Sort by createdAt desc
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Paginate
    const paginated = filtered.slice(skip, skip + limit);

    return {
      items: paginated.map(formatComplex),
      pagination: {
        total: filtered.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(filtered.length / limit) || 1,
      },
    };
  } catch (error) {
    console.error('Error in complexes.getForSeller:', error);
    throw error;
  }
}

module.exports = { list, getById, create, update, remove, getForSeller };